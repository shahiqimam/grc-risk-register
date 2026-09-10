import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskControl } from '../risks/risk-control.entity';
import { RisksModule } from '../risks/risks.module';
import { Control } from './control.entity';
import { ControlsController } from './controls.controller';
import { ControlsService } from './controls.service';

@Module({
  imports: [TypeOrmModule.forFeature([Control, RiskControl]), forwardRef(() => RisksModule)],
  controllers: [ControlsController],
  providers: [ControlsService],
  exports: [ControlsService]
})
export class ControlsModule {}
