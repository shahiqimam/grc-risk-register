import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, ILike, In, Repository } from 'typeorm';
import { Asset } from '../assets/asset.entity';
import { Control } from '../controls/control.entity';
import { User } from '../users/user.entity';
import { CreateRiskDto } from './dto/create-risk.dto';
import { RiskQueryDto } from './dto/risk-query.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { RiskAsset } from './risk-asset.entity';
import { RiskControl } from './risk-control.entity';
import { RiskHistory } from './risk-history.entity';
import { Risk } from './risk.entity';
import { RiskHistoryEventType } from './risk.enums';
import { RiskScoringService } from './risk-scoring.service';

@Injectable()
export class RisksService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly scoringService: RiskScoringService,
    @InjectRepository(Risk) private readonly risksRepository: Repository<Risk>,
    @InjectRepository(RiskAsset) private readonly riskAssetsRepository: Repository<RiskAsset>,
    @InjectRepository(RiskControl) private readonly riskControlsRepository: Repository<RiskControl>,
    @InjectRepository(RiskHistory) private readonly historyRepository: Repository<RiskHistory>,
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    @InjectRepository(Control) private readonly controlsRepository: Repository<Control>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {}

  async create(dto: CreateRiskDto, changedById?: string) {
    const owner = await this.usersRepository.findOne({ where: { id: dto.ownerId } });
    if (!owner) throw new NotFoundException('Risk owner not found');

    return this.dataSource.transaction(async (manager) => {
      const controls = dto.linkedControls?.length ? await manager.findBy(Control, { id: In(dto.linkedControls) }) : [];
      if ((dto.linkedControls?.length ?? 0) !== controls.length) {
        throw new NotFoundException('Linked control not found');
      }
      const score = this.scoringService.calculate(
        dto.likelihood,
        dto.impact,
        controls.map((control) => control.effectiveness)
      );
      const risk = manager.create(Risk, {
        riskCode: await this.nextRiskCode(manager),
        title: dto.title,
        description: dto.description,
        category: dto.category,
        likelihood: dto.likelihood,
        impact: dto.impact,
        ownerId: dto.ownerId,
        status: dto.status,
        reviewDate: dto.reviewDate,
        ...score
      });
      const saved = await manager.save(risk);

      for (const assetId of dto.linkedAssets ?? []) {
        const asset = await manager.findOne(Asset, { where: { id: assetId } });
        if (!asset) throw new NotFoundException('Linked asset not found');
        await manager.save(manager.create(RiskAsset, { risk: saved, asset }));
      }

      for (const control of controls) {
        await manager.save(manager.create(RiskControl, { risk: saved, control }));
      }

      await manager.save(
        manager.create(RiskHistory, {
          riskId: saved.id,
          changedById: changedById ?? null,
          eventType: RiskHistoryEventType.RISK_CREATED,
          summary: `Risk ${saved.riskCode} created`,
          beforeState: null,
          afterState: this.historyState(saved)
        })
      );

      return this.findOne(saved.id);
    });
  }

  async findAll(query: RiskQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.owner) where.ownerId = query.owner;
    if (query.inherentRating) where.inherentRiskRating = query.inherentRating;
    if (query.residualRating) where.residualRiskRating = query.residualRating;
    if (query.search) where.title = ILike(`%${query.search}%`);

    const qb = this.risksRepository
      .createQueryBuilder('risk')
      .leftJoinAndSelect('risk.owner', 'owner')
      .leftJoinAndSelect('risk.assetLinks', 'assetLinks')
      .leftJoinAndSelect('assetLinks.asset', 'asset')
      .leftJoinAndSelect('risk.controlLinks', 'controlLinks')
      .leftJoinAndSelect('controlLinks.control', 'control');

    Object.entries(where).forEach(([key, value]) => {
      if (key === 'title') {
        qb.andWhere('(risk.title ILIKE :search OR risk.riskCode ILIKE :search)', { search: `%${query.search}%` });
        return;
      }
      qb.andWhere(`risk.${key} = :${key}`, { [key]: value });
    });
    if (query.reviewDue === 'true') {
      qb.andWhere('risk.reviewDate <= CURRENT_DATE');
    }
    if (query.assetId) {
      qb.andWhere('asset.id = :assetId', { assetId: query.assetId });
    }
    if (query.controlId) {
      qb.andWhere('control.id = :controlId', { controlId: query.controlId });
    }

    qb.orderBy(`risk.${query.sortBy}`, query.order.toUpperCase() as 'ASC' | 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    };
  }

  async findOne(id: string) {
    const risk = await this.risksRepository.findOne({
      where: { id },
      relations: ['assetLinks', 'assetLinks.asset', 'controlLinks', 'controlLinks.control', 'treatments', 'history']
    });
    if (!risk) throw new NotFoundException('Risk not found');
    return risk;
  }

  async update(id: string, dto: UpdateRiskDto, changedById?: string) {
    const risk = await this.findOne(id);
    const beforeState = this.historyState(risk);
    const { linkedAssets, linkedControls, ...riskFields } = dto;
    Object.assign(risk, riskFields);
    await this.applyScores(risk);
    const saved = await this.risksRepository.save(risk);
    if (linkedAssets) {
      await this.syncAssetLinks(saved, linkedAssets);
    }
    if (linkedControls) {
      await this.syncControlLinks(saved, linkedControls);
      await this.recalculateRisk(saved.id, changedById);
    }
    await this.recordHistory(saved.id, changedById, RiskHistoryEventType.RISK_UPDATED, `Risk ${saved.riskCode} updated`, beforeState, this.historyState(saved));
    return this.findOne(saved.id);
  }

  async remove(id: string) {
    const risk = await this.findOne(id);
    await this.risksRepository.remove(risk);
    return { deleted: true };
  }

  async linkAsset(riskId: string, assetId: string, changedById?: string) {
    const risk = await this.findOne(riskId);
    const asset = await this.assetsRepository.findOne({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');
    const exists = await this.riskAssetsRepository.findOne({ where: { risk: { id: riskId }, asset: { id: assetId } } });
    if (exists) throw new ConflictException('Asset is already linked to this risk');
    await this.riskAssetsRepository.save(this.riskAssetsRepository.create({ risk, asset }));
    await this.recordHistory(riskId, changedById, RiskHistoryEventType.ASSET_LINKED, `Asset ${asset.name} linked`, null, { assetId });
    return this.findOne(riskId);
  }

  async unlinkAsset(riskId: string, assetId: string, changedById?: string) {
    const link = await this.riskAssetsRepository.findOne({ where: { risk: { id: riskId }, asset: { id: assetId } } });
    if (!link) throw new NotFoundException('Risk asset link not found');
    await this.riskAssetsRepository.remove(link);
    await this.recordHistory(riskId, changedById, RiskHistoryEventType.ASSET_UNLINKED, 'Asset unlinked', { assetId }, null);
    return this.findOne(riskId);
  }

  async linkControl(riskId: string, controlId: string, changedById?: string) {
    const risk = await this.findOne(riskId);
    const control = await this.controlsRepository.findOne({ where: { id: controlId } });
    if (!control) throw new NotFoundException('Control not found');
    const exists = await this.riskControlsRepository.findOne({ where: { risk: { id: riskId }, control: { id: controlId } } });
    if (exists) throw new ConflictException('Control is already linked to this risk');
    await this.riskControlsRepository.save(this.riskControlsRepository.create({ risk, control }));
    await this.recalculateRisk(riskId, changedById);
    await this.recordHistory(riskId, changedById, RiskHistoryEventType.CONTROL_LINKED, `Control ${control.controlCode} linked`, null, { controlId });
    return this.findOne(riskId);
  }

  async unlinkControl(riskId: string, controlId: string, changedById?: string) {
    const link = await this.riskControlsRepository.findOne({ where: { risk: { id: riskId }, control: { id: controlId } } });
    if (!link) throw new NotFoundException('Risk control link not found');
    await this.riskControlsRepository.remove(link);
    await this.recalculateRisk(riskId, changedById);
    await this.recordHistory(riskId, changedById, RiskHistoryEventType.CONTROL_UNLINKED, 'Control unlinked', { controlId }, null);
    return this.findOne(riskId);
  }

  async recalculateRisk(id: string, changedById?: string) {
    const risk = await this.findOne(id);
    const beforeState = this.historyState(risk);
    await this.applyScores(risk);
    const saved = await this.risksRepository.save(risk);
    await this.recordHistory(id, changedById, RiskHistoryEventType.RISK_RECALCULATED, `Risk ${saved.riskCode} recalculated`, beforeState, this.historyState(saved));
    return saved;
  }

  async history(id: string) {
    await this.findOne(id);
    return this.historyRepository.find({ where: { riskId: id }, order: { createdAt: 'DESC' } });
  }

  async exportCsv(query: RiskQueryDto) {
    const result = await this.findAll({ ...query, page: 1, limit: 10000 });
    const rows = result.items.map((risk) => [
      risk.riskCode,
      risk.title,
      risk.category,
      risk.owner?.name ?? '',
      risk.likelihood,
      risk.impact,
      risk.inherentRiskScore,
      risk.inherentRiskRating,
      risk.residualRiskScore,
      risk.residualRiskRating,
      risk.status,
      risk.reviewDate
    ]);
    return [
      'risk_code,title,category,owner,likelihood,impact,inherent_score,inherent_rating,residual_score,residual_rating,status,review_date',
      ...rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    ].join('\n');
  }

  private async applyScores(risk: Risk) {
    const controls = risk.controlLinks?.map((link) => link.control.effectiveness) ?? [];
    Object.assign(risk, this.scoringService.calculate(risk.likelihood, risk.impact, controls));
  }

  private async syncAssetLinks(risk: Risk, assetIds: string[]) {
    await this.riskAssetsRepository.delete({ risk: { id: risk.id } });
    if (!assetIds.length) return;
    const assets = await this.assetsRepository.findBy({ id: In(assetIds) });
    if (assets.length !== assetIds.length) throw new NotFoundException('Linked asset not found');
    await this.riskAssetsRepository.save(assets.map((asset) => this.riskAssetsRepository.create({ risk, asset })));
  }

  private async syncControlLinks(risk: Risk, controlIds: string[]) {
    await this.riskControlsRepository.delete({ risk: { id: risk.id } });
    if (!controlIds.length) return;
    const controls = await this.controlsRepository.findBy({ id: In(controlIds) });
    if (controls.length !== controlIds.length) throw new NotFoundException('Linked control not found');
    await this.riskControlsRepository.save(controls.map((control) => this.riskControlsRepository.create({ risk, control })));
  }

  private async nextRiskCode(manager: EntityManager = this.dataSource.manager) {
    const last = await manager
      .getRepository(Risk)
      .createQueryBuilder('risk')
      .orderBy('risk.riskCode', 'DESC')
      .getOne();
    const next = last ? Number(last.riskCode.replace('RISK-', '')) + 1 : 1;
    return `RISK-${String(next).padStart(3, '0')}`;
  }

  recordHistory(
    riskId: string,
    changedById: string | undefined,
    eventType: RiskHistoryEventType,
    summary: string,
    beforeState: Record<string, unknown> | null,
    afterState: Record<string, unknown> | null
  ) {
    return this.historyRepository.save(
      this.historyRepository.create({ riskId, changedById: changedById ?? null, eventType, summary, beforeState, afterState })
    );
  }

  private historyState(risk: Risk): Record<string, unknown> {
    return {
      title: risk.title,
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      inherentRiskScore: risk.inherentRiskScore,
      residualRiskScore: risk.residualRiskScore,
      status: risk.status,
      reviewDate: risk.reviewDate
    };
  }
}
