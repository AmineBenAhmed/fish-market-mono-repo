import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { OrdersGateway } from './orders.gateway';

@Module({
  imports: [EventsModule],
  providers: [OrdersGateway],
})
export class GatewaysModule {}
