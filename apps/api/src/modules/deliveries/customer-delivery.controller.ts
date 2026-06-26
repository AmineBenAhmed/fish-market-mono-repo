import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { DeliveriesService } from './deliveries.service';

@ApiTags('Order Delivery')
@ApiBearerAuth()
@Controller('orders')
export class CustomerDeliveryController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get(':id/delivery')
  @Roles('CUSTOMER', 'SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Get delivery for an order' })
  async findDeliveryByOrder(@Param('id') orderId: string) {
    return this.deliveriesService.findByOrder(orderId);
  }
}
