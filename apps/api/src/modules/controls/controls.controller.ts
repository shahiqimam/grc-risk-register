import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { ControlsService } from './controls.service';
import { CreateControlDto } from './dto/create-control.dto';
import { UpdateControlDto } from './dto/update-control.dto';

@ApiTags('controls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('controls')
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  create(@Body() dto: CreateControlDto) {
    return this.controlsService.create(dto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.controlsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controlsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RISK_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateControlDto) {
    return this.controlsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.controlsService.remove(id);
  }
}
