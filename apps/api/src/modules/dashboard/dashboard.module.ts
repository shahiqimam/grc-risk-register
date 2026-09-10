import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Risk } from '../risks/risk.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Risk])],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
