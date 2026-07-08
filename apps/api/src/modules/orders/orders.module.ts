import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { OrderCalculationService } from './order-calculation.service';
import { OrderStatusService } from './order-status.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [EventsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderCalculationService, OrderStatusService],
  exports: [OrdersService, OrderCalculationService, OrderStatusService],
})
export class OrdersModule {}
