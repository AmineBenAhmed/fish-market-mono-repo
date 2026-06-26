import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class OrdersJobs {
  private readonly logger = new Logger(OrdersJobs.name);

  constructor(@InjectQueue('orders') private readonly ordersQueue: Queue) {}

  async scheduleExpiration(orderId: string, delayMs: number): Promise<void> {
    await this.ordersQueue.add(
      'expire',
      { orderId },
      { delay: delayMs, removeOnComplete: true, attempts: 3 },
    );
    this.logger.log(`Scheduled expiration for order ${orderId} in ${delayMs}ms`);
  }

  async cancelExpiration(orderId: string): Promise<void> {
    const jobs = await this.ordersQueue.getJobs(['delayed', 'waiting']);
    for (const job of jobs) {
      if (job.data.orderId === orderId) {
        await job.remove();
        this.logger.log(`Cancelled expiration job for order ${orderId}`);
      }
    }
  }
}
