import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';

import {
  DriverActivatedEvent,
  SellerApprovedEvent,
  UserCreatedEvent,
} from '../../events/domain-events/user.events';
import { NotificationService } from '../notification.service';

@Injectable()
export class UserNotificationHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    await this.notifications.send({
      userId: event.userId,
      type: NotificationType.ACCOUNT_CREATED,
      title: 'Welcome!',
      body: `Welcome to Fishmarket, ${event.name}!`,
      data: { role: event.role },
    });
  }

  @OnEvent('user.seller-approved')
  async handleSellerApproved(event: SellerApprovedEvent) {
    await this.notifications.send({
      userId: event.userId,
      type: NotificationType.SELLER_APPROVED,
      title: 'Seller Approved',
      body: `Your store "${event.storeName}" has been approved.`,
    });
  }

  @OnEvent('user.driver-activated')
  async handleDriverActivated(event: DriverActivatedEvent) {
    await this.notifications.send({
      userId: event.userId,
      type: NotificationType.DRIVER_ACTIVATED,
      title: 'Driver Activated',
      body: 'Your driver account has been activated. You can now accept deliveries.',
    });
  }
}
