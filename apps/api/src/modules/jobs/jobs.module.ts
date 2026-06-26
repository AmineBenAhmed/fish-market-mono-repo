import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';

import { OrdersJobs } from './orders.jobs';
import { OrdersProcessor } from './orders.processor';
import { NotificationsProcessor } from './notifications.processor';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
    BullModule.registerQueue({ name: 'orders' }, { name: 'notifications' }, { name: 'cleanup' }),
  ],
  providers: [OrdersJobs, OrdersProcessor, NotificationsProcessor],
  exports: [BullModule, OrdersJobs],
})
export class JobsModule {}
