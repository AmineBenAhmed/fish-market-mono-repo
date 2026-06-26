import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { DeliveryZoneService } from './delivery-zone.service';

@ApiTags('Admin Delivery Zones')
@ApiBearerAuth()
@Controller('admin/delivery-zones')
export class AdminDeliveryZoneController {
  constructor(private readonly zoneService: DeliveryZoneService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create delivery zone' })
  async create(@Body() dto: CreateDeliveryZoneDto) {
    return this.zoneService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List delivery zones' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.zoneService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get delivery zone' })
  async findOne(@Param('id') id: string) {
    return this.zoneService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update delivery zone' })
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryZoneDto) {
    return this.zoneService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate delivery zone' })
  async remove(@Param('id') id: string) {
    return this.zoneService.remove(id);
  }

  @Get(':id/drivers')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get available drivers in zone' })
  async getZoneDrivers(@Param('id') id: string) {
    return this.zoneService.getZoneDrivers(id);
  }
}
