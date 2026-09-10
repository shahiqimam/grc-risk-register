import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk } from '../risks/risk.entity';
import { RiskRating, RiskStatus } from '../risks/risk.enums';

@Injectable()
export class DashboardService {
  constructor(@InjectRepository(Risk) private readonly risksRepository: Repository<Risk>) {}

  async summary() {
    const risks = await this.risksRepository.find();
    const today = new Date().toISOString().slice(0, 10);
    const totalResidual = risks.reduce((sum, risk) => sum + risk.residualRiskScore, 0);
    return {
      totalRisks: risks.length,
      criticalResidualRisks: risks.filter((risk) => risk.residualRiskRating === RiskRating.CRITICAL).length,
      highResidualRisks: risks.filter((risk) => risk.residualRiskRating === RiskRating.HIGH).length,
      openRisks: risks.filter((risk) => risk.status === RiskStatus.OPEN).length,
      overdueReviews: risks.filter((risk) => risk.reviewDate < today && risk.status !== RiskStatus.CLOSED).length,
      averageResidualScore: risks.length ? Number((totalResidual / risks.length).toFixed(1)) : 0
    };
  }

  async heatmap() {
    const risks = await this.risksRepository.find();
    const cells = Array.from({ length: 5 }, (_, impactIndex) =>
      Array.from({ length: 5 }, (_, likelihoodIndex) => ({
        impact: impactIndex + 1,
        likelihood: likelihoodIndex + 1,
        count: risks.filter((risk) => risk.impact === impactIndex + 1 && risk.likelihood === likelihoodIndex + 1).length
      }))
    );
    return { model: 'inherent_likelihood_impact', cells };
  }

  breakdown(field: 'category' | 'status' | 'residualRiskRating') {
    return this.risksRepository
      .createQueryBuilder('risk')
      .select(`risk.${field}`, 'name')
      .addSelect('COUNT(*)', 'value')
      .groupBy(`risk.${field}`)
      .orderBy(`risk.${field}`, 'ASC')
      .getRawMany<{ name: string; value: string }>()
      .then((rows) => rows.map((row) => ({ name: row.name, value: Number(row.value) })));
  }
}
