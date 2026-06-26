import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseNotificationChannel } from './channels/database.channel';
import { EmailNotificationChannel } from './channels/email.channel';
import {
  NotificationChannel,
  NotificationPayload,
} from './channels/notification-channel.interface';
import { PushNotificationChannel } from './channels/push.channel';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private channels: NotificationChannel[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseChannel: DatabaseNotificationChannel,
    private readonly emailChannel: EmailNotificationChannel,
    private readonly pushChannel: PushNotificationChannel,
  ) {
    this.channels = [this.databaseChannel];
  }

  async send(payload: NotificationPayload): Promise<void> {
    for (const channel of this.channels) {
      try {
        await channel.send(payload);
      } catch (error) {
        this.logger.error(
          `Notification channel ${channel.name} failed for user ${payload.userId}`,
          error,
        );
      }
    }
  }

  async findByUser(userId: string, query: NotificationQueryDto) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (query.unreadOnly === 'true') {
      where.isRead = false;
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    if (!notification.isRead) {
      await this.prisma.notification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { message: 'All notifications marked as read' };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
