import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1723330000000 implements MigrationInterface {
  name = 'InitialSchema1723330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'RISK_MANAGER', 'VIEWER')`);
    await queryRunner.query(`CREATE TYPE "asset_type_enum" AS ENUM ('APPLICATION', 'DATABASE', 'SERVER', 'ENDPOINT', 'NETWORK', 'DATA', 'BUSINESS_PROCESS', 'OTHER')`);
    await queryRunner.query(`CREATE TYPE "asset_criticality_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`);
    await queryRunner.query(`CREATE TYPE "asset_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'RETIRED')`);
    await queryRunner.query(`CREATE TYPE "control_status_enum" AS ENUM ('PLANNED', 'IMPLEMENTED', 'PARTIAL', 'NOT_IMPLEMENTED')`);
    await queryRunner.query(`CREATE TYPE "risk_category_enum" AS ENUM ('CYBERSECURITY', 'OPERATIONAL', 'THIRD_PARTY', 'COMPLIANCE', 'PRIVACY', 'BUSINESS_CONTINUITY', 'FINANCIAL', 'OTHER')`);
    await queryRunner.query(`CREATE TYPE "risk_status_enum" AS ENUM ('OPEN', 'UNDER_TREATMENT', 'ACCEPTED', 'CLOSED')`);
    await queryRunner.query(`CREATE TYPE "risk_rating_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'CRITICAL')`);
    await queryRunner.query(`CREATE TYPE "risk_history_event_type_enum" AS ENUM ('RISK_CREATED', 'RISK_UPDATED', 'ASSET_LINKED', 'ASSET_UNLINKED', 'CONTROL_LINKED', 'CONTROL_UNLINKED', 'TREATMENT_CREATED', 'STATUS_CHANGED', 'RISK_RECALCULATED')`);
    await queryRunner.query(`CREATE TYPE "treatment_strategy_enum" AS ENUM ('MITIGATE', 'AVOID', 'TRANSFER', 'ACCEPT')`);
    await queryRunner.query(`CREATE TYPE "treatment_status_enum" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(120) NOT NULL,
        "email" varchar(255) NOT NULL UNIQUE,
        "password_hash" varchar(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'VIEWER',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users" ("email")`);

    await queryRunner.query(`
      CREATE TABLE "assets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(160) NOT NULL,
        "description" text,
        "asset_type" "asset_type_enum" NOT NULL,
        "criticality" "asset_criticality_enum" NOT NULL,
        "owner" varchar(120) NOT NULL,
        "status" "asset_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_assets_name" ON "assets" ("name")`);

    await queryRunner.query(`
      CREATE TABLE "controls" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "control_code" varchar(30) NOT NULL UNIQUE,
        "title" varchar(160) NOT NULL,
        "description" text,
        "category" varchar(80) NOT NULL,
        "effectiveness" integer NOT NULL CHECK ("effectiveness" >= 0 AND "effectiveness" <= 100),
        "status" "control_status_enum" NOT NULL DEFAULT 'PLANNED',
        "owner" varchar(120) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_controls_code" ON "controls" ("control_code")`);
    await queryRunner.query(`CREATE INDEX "idx_controls_category" ON "controls" ("category")`);

    await queryRunner.query(`
      CREATE TABLE "risks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "risk_code" varchar(30) NOT NULL UNIQUE,
        "title" varchar(180) NOT NULL,
        "description" text NOT NULL,
        "category" "risk_category_enum" NOT NULL,
        "likelihood" integer NOT NULL CHECK ("likelihood" >= 1 AND "likelihood" <= 5),
        "impact" integer NOT NULL CHECK ("impact" >= 1 AND "impact" <= 5),
        "inherent_risk_score" integer NOT NULL,
        "inherent_risk_rating" "risk_rating_enum" NOT NULL,
        "residual_risk_score" integer NOT NULL,
        "residual_risk_rating" "risk_rating_enum" NOT NULL,
        "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "status" "risk_status_enum" NOT NULL DEFAULT 'OPEN',
        "review_date" date NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_risks_code" ON "risks" ("risk_code")`);
    await queryRunner.query(`CREATE INDEX "idx_risks_category" ON "risks" ("category")`);
    await queryRunner.query(`CREATE INDEX "idx_risks_status" ON "risks" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_risks_owner" ON "risks" ("owner_id")`);
    await queryRunner.query(`CREATE INDEX "idx_risks_review_date" ON "risks" ("review_date")`);
    await queryRunner.query(`CREATE INDEX "idx_risks_residual_rating" ON "risks" ("residual_risk_rating")`);

    await queryRunner.query(`
      CREATE TABLE "risk_assets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "risk_id" uuid NOT NULL REFERENCES "risks"("id") ON DELETE CASCADE,
        "asset_id" uuid NOT NULL REFERENCES "assets"("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_risk_assets_risk_asset" UNIQUE ("risk_id", "asset_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "risk_controls" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "risk_id" uuid NOT NULL REFERENCES "risks"("id") ON DELETE CASCADE,
        "control_id" uuid NOT NULL REFERENCES "controls"("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_risk_controls_risk_control" UNIQUE ("risk_id", "control_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "treatments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "risk_id" uuid NOT NULL REFERENCES "risks"("id") ON DELETE CASCADE,
        "strategy" "treatment_strategy_enum" NOT NULL,
        "description" text NOT NULL,
        "owner" varchar(120) NOT NULL,
        "target_date" date NOT NULL,
        "status" "treatment_status_enum" NOT NULL DEFAULT 'PLANNED',
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "risk_history" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "risk_id" uuid NOT NULL REFERENCES "risks"("id") ON DELETE CASCADE,
        "changed_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "event_type" "risk_history_event_type_enum" NOT NULL,
        "summary" varchar(240) NOT NULL,
        "before_state" jsonb,
        "after_state" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "risk_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "treatments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "risk_controls"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "risk_assets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "risks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "controls"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "treatment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "treatment_strategy_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_history_event_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_rating_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "control_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "asset_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "asset_criticality_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "asset_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
