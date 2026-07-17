import { Module } from '@nestjs/common';

import { DeliveryPricingModule } from '../delivery-pricing/delivery-pricing.module';
import { EventsModule } from '../events/events.module';
import { OrderCalculationService } from './order-calculation.service';
import { OrderStatusService } from './order-status.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [EventsModule, DeliveryPricingModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderCalculationService, OrderStatusService],
  exports: [OrdersService, OrderCalculationService, OrderStatusService],
})
export class OrdersModule {}
