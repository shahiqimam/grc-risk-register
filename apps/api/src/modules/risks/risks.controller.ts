import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUser } from '../auth/jwt.strategy';
import { UserRole } from '../users/user-role.enum';
import { CreateRiskDto } from './dto/create-risk.dto';
import { RiskQueryDto } from './dto/risk-query.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { RisksService } from './risks.service';

@ApiTags('risks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  create(@Body() dto: CreateRiskDto, @Req() req: { user: JwtUser }) {
    return this.risksService.create(dto, req.user.sub);
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="risk-register.csv"')
  exportCsv(@Query() query: RiskQueryDto) {
    return this.risksService.exportCsv(query);
  }

  @Get()
  findAll(@Query() query: RiskQueryDto) {
    return this.risksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.risksService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateRiskDto, @Req() req: { user: JwtUser }) {
    return this.risksService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.risksService.remove(id);
  }

  @Post(':id/assets/:assetId')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  linkAsset(@Param('id') id: string, @Param('assetId') assetId: string, @Req() req: { user: JwtUser }) {
    return this.risksService.linkAsset(id, assetId, req.user.sub);
  }

  @Delete(':id/assets/:assetId')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  unlinkAsset(@Param('id') id: string, @Param('assetId') assetId: string, @Req() req: { user: JwtUser }) {
    return this.risksService.unlinkAsset(id, assetId, req.user.sub);
  }

  @Post(':id/controls/:controlId')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  linkControl(@Param('id') id: string, @Param('controlId') controlId: string, @Req() req: { user: JwtUser }) {
    return this.risksService.linkControl(id, controlId, req.user.sub);
  }

  @Delete(':id/controls/:controlId')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  unlinkControl(@Param('id') id: string, @Param('controlId') controlId: string, @Req() req: { user: JwtUser }) {
    return this.risksService.unlinkControl(id, controlId, req.user.sub);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.risksService.history(id);
  }
}
