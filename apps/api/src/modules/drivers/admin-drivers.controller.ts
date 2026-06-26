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
