import { ConflictException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { RiskControl } from '../risks/risk-control.entity';
import { RisksService } from '../risks/risks.service';
import { Control } from './control.entity';
import { CreateControlDto } from './dto/create-control.dto';
import { UpdateControlDto } from './dto/update-control.dto';

@Injectable()
export class ControlsService {
  constructor(
    @InjectRepository(Control) private readonly controlsRepository: Repository<Control>,
    @InjectRepository(RiskControl) private readonly riskControlsRepository: Repository<RiskControl>,
    @Inject(forwardRef(() => RisksService))
    private readonly risksService: RisksService
  ) {}

  create(dto: CreateControlDto) {
    return this.controlsRepository.save(this.controlsRepository.create(dto));
  }

  findAll(search?: string) {
    return this.controlsRepository.find({
      where: search ? [{ title: ILike(`%${search}%`) }, { controlCode: ILike(`%${search}%`) }] : undefined,
      order: { controlCode: 'ASC' }
    });
  }

  async findOne(id: string) {
    const control = await this.controlsRepository.findOne({ where: { id } });
    if (!control) {
      throw new NotFoundException('Control not found');
    }
    return control;
  }

  async update(id: string, dto: UpdateControlDto) {
    const control = await this.findOne(id);
    const effectivenessChanged = dto.effectiveness !== undefined && dto.effectiveness !== control.effectiveness;
    Object.assign(control, dto);
    const saved = await this.controlsRepository.save(control);

    if (effectivenessChanged) {
      const links = await this.riskControlsRepository.find({ where: { control: { id } }, relations: ['risk'] });
      await Promise.all(links.map((link) => this.risksService.recalculateRisk(link.risk.id)));
    }

    return saved;
  }

  async remove(id: string) {
    const control = await this.findOne(id);
    const links = await this.riskControlsRepository.count({ where: { control: { id } } });
    if (links > 0) {
      throw new ConflictException('Control is linked to one or more risks');
    }
    await this.controlsRepository.remove(control);
    return { deleted: true };
  }
}
