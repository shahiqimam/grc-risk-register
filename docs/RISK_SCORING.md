# Risk Scoring

This project uses a simplified educational model.

## Inherent Risk

```text
inherentRisk = likelihood * impact
```

Likelihood and impact both range from 1 to 5.

## Rating Bands

```text
1-4   = LOW
5-9   = MEDIUM
10-14 = HIGH
15-19 = VERY_HIGH
20-25 = CRITICAL
```

## Residual Risk

If controls are linked, the API averages their effectiveness percentages:

```text
averageControlEffectiveness = sum(effectiveness values) / number of linked controls
residualRisk = round(inherentRisk * (1 - averageControlEffectiveness / 100))
```

Residual risk cannot go below 1. If no controls are linked, residual risk equals inherent risk.

## Worked Example

```text
Likelihood = 4
Impact = 5

Inherent = 4 * 5 = 20
Rating = CRITICAL

Linked control effectiveness:
70%
50%

Average effectiveness = 60%

Residual =
20 * (1 - 0.60)
= 8

Residual rating = MEDIUM
```

This formula is intentionally compact and explainable. It should not be treated as professional risk, compliance, legal, or security advice.
