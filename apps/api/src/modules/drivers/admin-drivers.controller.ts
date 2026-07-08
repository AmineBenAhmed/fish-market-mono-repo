import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { AdminCreateDriverDto } from './dto/admin-create-driver.dto';
import { AdminUpdateDriverDto } from './dto/admin-update-driver.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DriversService } from './drivers.service';

@ApiTags('Admin Drivers')
@ApiBearerAuth()
@Controller('admin/drivers')
export class AdminDriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all drivers with pagination and filters' })
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.driversService.findAll({
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new driver' })
  async create(@Body() dto: AdminCreateDriverDto) {
    return this.driversService.adminCreate(dto);
  }

  @Get('available')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List available drivers' })
  async findAvailable(@Query('zoneId') zoneId?: string) {
    return this.driversService.findAvailable(zoneId);
  }

  @Get(':id/audit-logs')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get driver audit logs' })
  async getAuditLogs(@Param('id') id: string) {
    return this.driversService.getAuditLogs(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update driver online/offline status' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('status') status: 'ONLINE' | 'OFFLINE',
  ) {
    return this.driversService.adminUpdateStatus(id, status, user.sub);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update driver profile' })
  async updateDriver(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AdminUpdateDriverDto,
  ) {
    return this.driversService.adminUpdateProfile(id, dto, user.sub);
  }

  @Patch(':id/password')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Reset driver password' })
  async resetPassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    await this.driversService.adminChangePassword(id, dto.newPassword);
    return { message: 'Senha redefinida com sucesso' };
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get driver profile' })
  async getDriver(@Param('id') id: string) {
    return this.driversService.getProfile(id);
  }
}
