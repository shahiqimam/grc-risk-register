# Design Decisions

## Next.js

Next.js gives the frontend a conventional React structure, routing, and production build path without requiring a separate custom bundler.

## NestJS

NestJS fits the API because controllers, services, guards, DTOs, and dependency injection make the backend easy to explain in interviews.

## PostgreSQL

Risk data is relational: risks have owners, assets, controls, treatments, and history. PostgreSQL gives strong constraints, indexing, and JSONB for history snapshots.

## Relational Many-to-Many Links

Risks can affect multiple assets and be mitigated by multiple controls. Explicit linking entities make uniqueness rules and future link metadata straightforward.

## Backend-Owned Risk Scoring

The browser can preview scoring for usability, but the API is the source of truth. This avoids inconsistent results and protects integrity when requests come from outside the web UI.

## Simplified Residual Scoring

Residual score is calculated from inherent score and average linked-control effectiveness. It is intentionally educational and does not claim to be an industry standard.

## Frontend and Backend Validation

Frontend validation improves usability. Backend validation enforces trust boundaries and protects the database.

## Server-Side RBAC

Role-based UI helps users avoid unavailable actions, but authorization is enforced by NestJS guards because client-side restrictions can be bypassed.

## Migrations

Migrations make schema changes reviewable and repeatable. Production synchronize is disabled.

## Docker Compose

Docker Compose is enough for a portfolio project with three services: web, API, and PostgreSQL. Kubernetes or message queues would add complexity without improving the core demonstration.
