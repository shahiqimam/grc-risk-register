import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ControlsModule } from './modules/controls/controls.module';
import { RisksModule } from './modules/risks/risks.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    AssetsModule,
    ControlsModule,
    RisksModule,
    TreatmentsModule,
    DashboardModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
