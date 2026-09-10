import { RiskRating } from './risk.enums';
import { RiskScoringService } from './risk-scoring.service';

describe('RiskScoringService', () => {
  const service = new RiskScoringService();

  it('keeps residual equal to inherent when no controls are linked', () => {
    const result = service.calculate(4, 5);

    expect(result.inherentRiskScore).toBe(20);
    expect(result.residualRiskScore).toBe(20);
    expect(result.residualRiskRating).toBe(RiskRating.CRITICAL);
  });

  it('uses average control effectiveness to reduce residual risk', () => {
    const result = service.calculate(4, 5, [70, 30]);

    expect(result.averageControlEffectiveness).toBe(50);
    expect(result.residualRiskScore).toBe(10);
    expect(result.residualRiskRating).toBe(RiskRating.HIGH);
  });

  it('does not allow 100 percent effectiveness to reduce residual below 1', () => {
    const result = service.calculate(1, 1, [100]);

    expect(result.residualRiskScore).toBe(1);
    expect(result.residualRiskRating).toBe(RiskRating.LOW);
  });

  it.each([
    [1, RiskRating.LOW],
    [4, RiskRating.LOW],
    [5, RiskRating.MEDIUM],
    [9, RiskRating.MEDIUM],
    [10, RiskRating.HIGH],
    [14, RiskRating.HIGH],
    [15, RiskRating.VERY_HIGH],
    [19, RiskRating.VERY_HIGH],
    [20, RiskRating.CRITICAL],
    [25, RiskRating.CRITICAL]
  ])('maps score %i to %s', (score, rating) => {
    expect(service.ratingForScore(score)).toBe(rating);
  });
});
