import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';

import {
  OrderCancelledEvent,
  OrderConfirmedEvent,
  OrderCreatedEvent,
  OrderReadyForPickupEvent,
} from '../../events/domain-events/order.events';
import { NotificationService } from '../notification.service';

@Injectable()
export class OrderNotificationHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    await this.notifications.send({
      userId: event.customerId,
      type: NotificationType.ORDER_CONFIRMED,
      title: 'Order Created',
      body: `Order #${event.orderNumber} has been created successfully.`,
      data: { orderId: event.orderId, orderNumber: event.orderNumber },
    });

    if (event.sellerId) {
      await this.notifications.send({
        userId: event.sellerId,
        type: NotificationType.ORDER_CONFIRMED,
        title: 'New Order Received',
        body: `You have a new order #${event.orderNumber}.`,
        data: { orderId: event.orderId, orderNumber: event.orderNumber },
      });
    }
  }

  @OnEvent('order.confirmed')
  async handleOrderConfirmed(event: OrderConfirmedEvent) {
    await this.notifications.send({
      userId: event.customerId,
      type: NotificationType.ORDER_CONFIRMED,
      title: 'Order Confirmed',
      body: `Order #${event.orderNumber} has been confirmed.`,
      data: { orderId: event.orderId, orderNumber: event.orderNumber },
    });
  }

  @OnEvent('order.cancelled')
  async handleOrderCancelled(event: OrderCancelledEvent) {
    await this.notifications.send({
      userId: event.cancelledBy,
      type: NotificationType.ORDER_CANCELLED,
      title: 'Order Cancelled',
      body: event.reason ? `Order cancelled: ${event.reason}` : 'Order has been cancelled.',
      data: { orderId: event.orderId, orderNumber: event.orderNumber },
    });
  }

  @OnEvent('order.ready-for-pickup')
  async handleOrderReadyForPickup(event: OrderReadyForPickupEvent) {
    await this.notifications.send({
      userId: event.sellerId,
      type: NotificationType.ORDER_PREPARING,
      title: 'Ready for Pickup',
      body: `Order #${event.orderNumber} is ready for pickup.`,
      data: { orderId: event.orderId, orderNumber: event.orderNumber },
    });
  }
}
