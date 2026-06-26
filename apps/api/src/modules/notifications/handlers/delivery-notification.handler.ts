import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';

import {
  DeliveryAcceptedEvent,
  DeliveryAssignedEvent,
  DeliveryCancelledEvent,
  DeliveryCompletedEvent,
  DeliveryPickedUpEvent,
} from '../../events/domain-events/delivery.events';
import { NotificationService } from '../notification.service';

@Injectable()
export class DeliveryNotificationHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('delivery.assigned')
  async handleAssigned(event: DeliveryAssignedEvent) {
    await this.notifications.send({
      userId: event.driverId,
      type: NotificationType.ORDER_OUT_FOR_DELIVERY,
      title: 'New Delivery Assignment',
      body: 'A new delivery has been assigned to you.',
      data: { deliveryId: event.deliveryId, orderId: event.orderId },
    });
  }

  @OnEvent('delivery.accepted')
  async handleAccepted(event: DeliveryAcceptedEvent) {
    await this.notifications.send({
      userId: event.driverId,
      type: NotificationType.ORDER_OUT_FOR_DELIVERY,
      title: 'Delivery Accepted',
      body: 'You have accepted the delivery.',
      data: { deliveryId: event.deliveryId, orderId: event.orderId },
    });
  }

  @OnEvent('delivery.picked-up')
  async handlePickedUp(event: DeliveryPickedUpEvent) {
    await this.notifications.send({
      userId: event.driverId,
      type: NotificationType.ORDER_OUT_FOR_DELIVERY,
      title: 'Order Picked Up',
      body: 'The order has been picked up.',
      data: { deliveryId: event.deliveryId, orderId: event.orderId },
    });

    await this.notifications.send({
      userId: event.driverId,
      type: NotificationType.ORDER_OUT_FOR_DELIVERY,
      title: 'Order on the Way',
      body: 'The order is on its way to you.',
      data: { deliveryId: event.deliveryId, orderId: event.orderId },
    });
  }

  @OnEvent('delivery.completed')
  async handleCompleted(event: DeliveryCompletedEvent) {
    await this.notifications.send({
      userId: event.driverId,
      type: NotificationType.ORDER_DELIVERED,
      title: 'Delivery Completed',
      body: 'Delivery has been marked as completed.',
      data: { deliveryId: event.deliveryId, orderId: event.orderId },
    });
  }

  @OnEvent('delivery.cancelled')
  async handleCancelled(event: DeliveryCancelledEvent) {
    await this.notifications.send({
      userId: event.driverId || '',
      type: NotificationType.ORDER_CANCELLED,
      title: 'Delivery Cancelled',
      body: event.reason || 'Delivery has been cancelled.',
      data: { deliveryId: event.deliveryId, orderId: event.orderId },
    });
  }
}
