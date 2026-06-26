import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { DeliveryQueryDto } from './dto/delivery-query.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { DeliveriesService } from './deliveries.service';

@ApiTags('Driver Deliveries')
@ApiBearerAuth()
@Controller('driver/deliveries')
export class DriverDeliveriesController {
  constructor(
    private readonly deliveriesService: DeliveriesService,
    private readonly trackingService: DeliveryTrackingService,
  ) {}

  @Get()
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Get my deliveries' })
  async findAll(@CurrentUser() user: JwtPayload, @Query() filters: DeliveryQueryDto) {
    return this.deliveriesService.findByDriver(user.sub, filters);
  }

  @Get(':id')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Get delivery details' })
  async findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Patch(':id/accept')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Accept delivery assignment' })
  async accept(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deliveriesService.acceptDelivery(id, user.sub);
  }

  @Patch(':id/reject')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Reject delivery assignment' })
  async reject(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deliveriesService.rejectDelivery(id, user.sub);
  }

  @Patch(':id/arrive')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Arrived at seller for pickup' })
  async arrive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deliveriesService.startPickup(id, user.sub);
  }

  @Patch(':id/pickup')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Picked up order from seller' })
  async pickup(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deliveriesService.pickup(id, user.sub);
  }

  @Patch(':id/transit')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Start delivery (in transit)' })
  async startTransit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deliveriesService.startDelivery(id, user.sub);
  }

  @Patch(':id/complete')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Complete delivery' })
  async complete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.deliveriesService.complete(id, user.sub);
  }

  @Patch('location')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Update current location' })
  async updateLocation(@CurrentUser() user: JwtPayload, @Body() dto: UpdateLocationDto) {
    return this.trackingService.updateLocation(user.sub, dto.lat, dto.lng);
  }
}
