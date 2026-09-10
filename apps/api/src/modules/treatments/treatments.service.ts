import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskHistoryEventType } from '../risks/risk.enums';
import { RisksService } from '../risks/risks.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { Treatment } from './treatment.entity';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment) private readonly treatmentsRepository: Repository<Treatment>,
    private readonly risksService: RisksService
  ) {}

  async create(riskId: string, dto: CreateTreatmentDto, changedById?: string) {
    await this.risksService.findOne(riskId);
    const treatment = await this.treatmentsRepository.save(this.treatmentsRepository.create({ ...dto, riskId }));
    await this.risksService.recordHistory(
      riskId,
      changedById,
      RiskHistoryEventType.TREATMENT_CREATED,
      `Treatment ${treatment.strategy} created`,
      null,
      { treatmentId: treatment.id }
    );
    return treatment;
  }

  async findForRisk(riskId: string) {
    await this.risksService.findOne(riskId);
    return this.treatmentsRepository.find({ where: { riskId }, order: { targetDate: 'ASC' } });
  }

  async update(id: string, dto: UpdateTreatmentDto) {
    const treatment = await this.findOne(id);
    Object.assign(treatment, dto);
    return this.treatmentsRepository.save(treatment);
  }

  async remove(id: string) {
    const treatment = await this.findOne(id);
    await this.treatmentsRepository.remove(treatment);
    return { deleted: true };
  }

  private async findOne(id: string) {
    const treatment = await this.treatmentsRepository.findOne({ where: { id } });
    if (!treatment) throw new NotFoundException('Treatment not found');
    return treatment;
  }
}
