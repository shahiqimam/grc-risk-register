import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './typeorm.config';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'grc_user',
  password: process.env.DATABASE_PASSWORD ?? 'change_me',
  database: process.env.DATABASE_NAME ?? 'grc_risk_register',
  entities,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false
});
