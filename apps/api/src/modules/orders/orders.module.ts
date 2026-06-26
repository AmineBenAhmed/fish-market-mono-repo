import { Module } from '@nestjs/common';

import { InventoryReservationService } from './inventory-reservation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderStatusService } from './order-status.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    InventoryReservationService,
    OrderCalculationService,
    OrderStatusService,
  ],
  exports: [
    OrdersService,
    InventoryReservationService,
    OrderCalculationService,
    OrderStatusService,
  ],
})
export class OrdersModule {}
