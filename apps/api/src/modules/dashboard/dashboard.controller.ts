import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('heatmap')
  heatmap() {
    return this.dashboardService.heatmap();
  }

  @Get('category-breakdown')
  categoryBreakdown() {
    return this.dashboardService.breakdown('category');
  }

  @Get('status-breakdown')
  statusBreakdown() {
    return this.dashboardService.breakdown('status');
  }

  @Get('residual-rating-breakdown')
  residualRatingBreakdown() {
    return this.dashboardService.breakdown('residualRiskRating');
  }

  @Get('inherent-vs-residual')
  inherentVsResidual() {
    return this.dashboardService.inherentVsResidual();
  }
}
