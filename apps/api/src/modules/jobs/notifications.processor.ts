import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import type { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('dispatch')
  async handleDispatch(
    job: Job<{
      userId: string;
      type: string;
      title: string;
      body?: string;
      data?: Record<string, unknown>;
    }>,
  ): Promise<void> {
    const { userId, type, title, body, data } = job.data;
    this.logger.log(`Dispatching notification: ${type} to user ${userId}`);

    await this.prisma.notification.create({
      data: {
        userId,
        type: type as NotificationType,
        channel: 'IN_APP',
        title,
        body,
        data: (data ?? undefined) as Prisma.InputJsonValue,
      },
    });
  }
}
