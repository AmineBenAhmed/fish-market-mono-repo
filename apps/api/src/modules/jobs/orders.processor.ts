import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { PrismaService } from '../prisma/prisma.service';

@Processor('orders')
export class OrdersProcessor {
  private readonly logger = new Logger(OrdersProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('expire')
  async handleExpiration(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Processing order expiration: ${orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order || order.status !== 'PENDING') {
      this.logger.log(`Order ${orderId} already processed, skipping`);
      return;
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelReason: 'Order expired',
      },
    });

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: 'CANCELLED',
        reason: 'Order expired',
      },
    });

    this.logger.log(`Order ${orderId} expired and cancelled`);
  }
}
