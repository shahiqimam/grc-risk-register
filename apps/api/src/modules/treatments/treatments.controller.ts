import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUser } from '../auth/jwt.strategy';
import { UserRole } from '../users/user-role.enum';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentsService } from './treatments.service';

@ApiTags('treatments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post('risks/:riskId/treatments')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  create(@Param('riskId') riskId: string, @Body() dto: CreateTreatmentDto, @Req() req: { user: JwtUser }) {
    return this.treatmentsService.create(riskId, dto, req.user.sub);
  }

  @Get('risks/:riskId/treatments')
  findForRisk(@Param('riskId') riskId: string) {
    return this.treatmentsService.findForRisk(riskId);
  }

  @Patch('treatments/:id')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateTreatmentDto) {
    return this.treatmentsService.update(id, dto);
  }

  @Delete('treatments/:id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.treatmentsService.remove(id);
  }
}
