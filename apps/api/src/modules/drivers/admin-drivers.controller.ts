import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
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

  @Get('available')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List available drivers' })
  async findAvailable(@Query('zoneId') zoneId?: string) {
    return this.driversService.findAvailable(zoneId);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get driver profile' })
  async getDriver(@Param('id') id: string) {
    return this.driversService.getProfile(id);
  }
}
