import { Injectable } from '@nestjs/common';
import { RiskRating } from './risk.enums';

export interface RiskScoreResult {
  inherentRiskScore: number;
  inherentRiskRating: RiskRating;
  residualRiskScore: number;
  residualRiskRating: RiskRating;
  averageControlEffectiveness: number;
}

@Injectable()
export class RiskScoringService {
  calculate(likelihood: number, impact: number, controlEffectiveness: number[] = []): RiskScoreResult {
    const inherentRiskScore = likelihood * impact;
    const inherentRiskRating = this.ratingForScore(inherentRiskScore);
    const averageControlEffectiveness = this.averageEffectiveness(controlEffectiveness);
    const residualRiskScore = controlEffectiveness.length
      ? Math.max(1, Math.round(inherentRiskScore * (1 - averageControlEffectiveness / 100)))
      : inherentRiskScore;

    return {
      inherentRiskScore,
      inherentRiskRating,
      residualRiskScore,
      residualRiskRating: this.ratingForScore(residualRiskScore),
      averageControlEffectiveness
    };
  }

  ratingForScore(score: number): RiskRating {
    if (score <= 4) return RiskRating.LOW;
    if (score <= 9) return RiskRating.MEDIUM;
    if (score <= 14) return RiskRating.HIGH;
    if (score <= 19) return RiskRating.VERY_HIGH;
    return RiskRating.CRITICAL;
  }

  private averageEffectiveness(values: number[]): number {
    if (!values.length) {
      return 0;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}
