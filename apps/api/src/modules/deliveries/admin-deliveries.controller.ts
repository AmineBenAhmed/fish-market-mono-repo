import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { DeliveryQueryDto } from './dto/delivery-query.dto';
import { DeliveriesService } from './deliveries.service';

@ApiTags('Admin Deliveries')
@ApiBearerAuth()
@Controller('admin/deliveries')
export class AdminDeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post(':id/assign')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign driver to delivery' })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignDriverDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deliveriesService.assign(id, dto, user.sub);
  }

  @Post(':id/auto-assign')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Auto-assign driver' })
  async autoAssign(@Param('id') id: string, @Query('zoneId') zoneId?: string) {
    return this.deliveriesService.autoAssign(id, zoneId);
  }

  @Post(':id/fail')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Mark delivery as failed' })
  async fail(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deliveriesService.fail(id, reason, user.sub);
  }

  @Post(':id/cancel')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancel delivery' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deliveriesService.cancel(id, reason, user.sub);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all deliveries' })
  async findAll(@Query() filters: DeliveryQueryDto) {
    return this.deliveriesService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get delivery details' })
  async findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Get('drivers')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List available drivers' })
  async getDrivers() {
    return this.deliveriesService.findAll({ status: 'PENDING_ASSIGNMENT' });
  }
}
