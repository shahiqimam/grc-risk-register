# Request Lifecycle

Example request:

```http
POST /api/v1/risks
```

1. Browser submits the create-risk form.
2. The Next.js client validates form input for quick feedback.
3. The frontend sends a JSON request with a JWT bearer token.
4. `JwtAuthGuard` verifies the token.
5. `RolesGuard` checks whether the user can mutate risk records.
6. NestJS `ValidationPipe` validates `CreateRiskDto`.
7. `RisksController` receives the request.
8. `RisksService` checks the owner and linked records.
9. `RiskScoringService` calculates inherent and residual risk.
10. TypeORM saves the risk and link rows in PostgreSQL.
11. `RiskHistory` records a readable history event.
12. The API returns a risk response.
13. React Query refreshes affected data.
14. The UI updates the register, dashboard, and detail views.

## Repository References

- API bootstrap: `apps/api/src/main.ts`
- Risk controller: `apps/api/src/modules/risks/risks.controller.ts`
- Risk service: `apps/api/src/modules/risks/risks.service.ts`
- Scoring service: `apps/api/src/modules/risks/risk-scoring.service.ts`
- Risk entity: `apps/api/src/modules/risks/risk.entity.ts`
- Create risk form: `apps/web/components/risk-form.tsx`
