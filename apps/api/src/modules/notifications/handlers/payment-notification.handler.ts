import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';

import {
  PaymentCreatedEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
  PaymentSucceededEvent,
} from '../../events/domain-events/payment.events';
import { NotificationService } from '../notification.service';

@Injectable()
export class PaymentNotificationHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('payment.created')
  async handlePaymentCreated(event: PaymentCreatedEvent) {
    await this.notifications.send({
      userId: event.customerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Initiated',
      body: `Payment of $${event.amount} via ${event.method} has been initiated.`,
      data: { paymentId: event.paymentId, orderId: event.orderId, amount: event.amount },
    });
  }

  @OnEvent('payment.succeeded')
  async handlePaymentSucceeded(event: PaymentSucceededEvent) {
    await this.notifications.send({
      userId: event.customerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Successful',
      body: `Payment of $${event.amount} was successful.`,
      data: {
        paymentId: event.paymentId,
        orderId: event.orderId,
        transactionId: event.transactionId,
      },
    });
  }

  @OnEvent('payment.failed')
  async handlePaymentFailed(event: PaymentFailedEvent) {
    await this.notifications.send({
      userId: event.customerId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Failed',
      body: event.reason || 'Payment could not be processed.',
      data: { paymentId: event.paymentId, orderId: event.orderId },
    });
  }

  @OnEvent('payment.refunded')
  async handlePaymentRefunded(event: PaymentRefundedEvent) {
    await this.notifications.send({
      userId: event.customerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Refunded',
      body: `$${event.amount} has been refunded to your account.`,
      data: { paymentId: event.paymentId, orderId: event.orderId, amount: event.amount },
    });
  }
}
