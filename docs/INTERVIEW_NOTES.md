# Interview Notes

Each concept should be explained at three depths: simple answer, technical answer, and how this project uses it. Use the likely interview question to practice speaking clearly.

## Full-Stack Concepts

Frontend: the part users see and interact with. Technically, this is the Next.js React app in `apps/web`. Likely question: how does the UI communicate with the API?

Backend: the server-side application that validates requests, enforces rules, and reads or writes data. This project uses NestJS in `apps/api`. Likely question: why should scoring be done on the backend?

REST API: a set of HTTP endpoints using resources and JSON. This project exposes `/api/v1` endpoints for auth, risks, assets, controls, treatments, users, dashboard, and export.

TypeScript: JavaScript with static types. Both apps use it to make DTOs, entities, services, and components easier to maintain.

## Backend Concepts

Controller: receives HTTP requests and delegates work. Service: owns business logic. DTO: validates request shape. Entity: maps a TypeScript class to a database table. Repository: TypeORM's data access abstraction.

Dependency injection lets NestJS provide services and repositories to classes that need them.

Authentication proves who the user is. Authorization decides what they can do. JWT carries the user id and role. RBAC maps roles to allowed actions.

Validation rejects malformed input before it reaches business logic. Migrations define repeatable schema changes.

## Database

Primary keys uniquely identify rows. Foreign keys connect related rows. Unique constraints prevent duplicates. Indexes speed up common filters. Many-to-many relationships use link tables. JSONB stores risk history snapshots. Transactions keep multi-step writes consistent.

## Docker

An image is a packaged application. A container is a running image. A Dockerfile defines an image. Docker Compose starts multiple services together. A volume persists PostgreSQL data. A network lets containers reach each other by service name. Port mapping exposes container ports to the host.

Containers use `postgres` instead of `localhost` because `localhost` inside the API container means the API container itself, not the database container.

## GRC

Risk is the possibility of harm from a threat or event. Inherent risk is risk before controls. Residual risk is risk after controls. A control is a safeguard. An asset is something valuable. A risk owner is accountable for tracking the risk. Treatment strategies include mitigate, avoid, transfer, and accept.

Control effectiveness affects residual risk in this project by reducing the inherent score through an average effectiveness calculation.
