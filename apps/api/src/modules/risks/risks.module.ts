import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../assets/asset.entity';
import { Control } from '../controls/control.entity';
import { User } from '../users/user.entity';
import { RiskAsset } from './risk-asset.entity';
import { RiskControl } from './risk-control.entity';
import { RiskHistory } from './risk-history.entity';
import { Risk } from './risk.entity';
import { RiskScoringService } from './risk-scoring.service';
import { RisksController } from './risks.controller';
import { RisksService } from './risks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Risk, RiskAsset, RiskControl, RiskHistory, Asset, Control, User])],
  controllers: [RisksController],
  providers: [RisksService, RiskScoringService],
  exports: [RisksService, RiskScoringService]
})
export class RisksModule {}
