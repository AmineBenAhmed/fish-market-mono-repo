import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationChannel, NotificationPayload } from './notification-channel.interface';

@Injectable()
export class DatabaseNotificationChannel implements NotificationChannel {
  readonly name = 'database';

  constructor(private readonly prisma: PrismaService) {}

  async send(payload: NotificationPayload): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        channel: 'IN_APP',
        title: payload.title,
        body: payload.body,
        data: (payload.data ?? {}) as Prisma.InputJsonValue,
      },
    });
  }
}
