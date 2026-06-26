import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDeliveriesController } from './admin-deliveries.controller';
import { CustomerDeliveryController } from './customer-delivery.controller';
import { DeliveriesService } from './deliveries.service';
import {
  AutoAssignmentStrategy,
  DeliveryAssignmentService,
  ManualAssignmentStrategy,
} from './delivery-assignment.service';
import { DeliveryStateService } from './delivery-state.service';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { DriverDeliveriesController } from './driver-deliveries.controller';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [DriverDeliveriesController, AdminDeliveriesController, CustomerDeliveryController],
  providers: [
    DeliveriesService,
    DeliveryStateService,
    DeliveryAssignmentService,
    DeliveryTrackingService,
    ManualAssignmentStrategy,
    AutoAssignmentStrategy,
  ],
  exports: [DeliveriesService, DeliveryStateService],
})
export class DeliveriesModule {}
