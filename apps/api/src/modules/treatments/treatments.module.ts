import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RisksModule } from '../risks/risks.module';
import { Treatment } from './treatment.entity';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Treatment]), RisksModule],
  controllers: [TreatmentsController],
  providers: [TreatmentsService]
})
export class TreatmentsModule {}
