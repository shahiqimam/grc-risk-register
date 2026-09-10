import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Asset } from '../modules/assets/asset.entity';
import { Control } from '../modules/controls/control.entity';
import { RiskAsset } from '../modules/risks/risk-asset.entity';
import { RiskControl } from '../modules/risks/risk-control.entity';
import { RiskHistory } from '../modules/risks/risk-history.entity';
import { Risk } from '../modules/risks/risk.entity';
import { Treatment } from '../modules/treatments/treatment.entity';
import { User } from '../modules/users/user.entity';

export const entities = [User, Asset, Control, Risk, RiskAsset, RiskControl, Treatment, RiskHistory];

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'grc_user',
  password: process.env.DATABASE_PASSWORD ?? 'change_me',
  database: process.env.DATABASE_NAME ?? 'grc_risk_register',
  entities,
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production'
};
