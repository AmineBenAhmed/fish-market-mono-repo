import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';

import {
  PaymentCreatedEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
  PaymentSucceededEvent,
} from '../../events/domain-events/payment.events';
import { NotificationService } from '../notification.service';
import { PaymentNotificationHandler } from './payment-notification.handler';

describe('PaymentNotificationHandler', () => {
  let handler: PaymentNotificationHandler;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentNotificationHandler,
        {
          provide: NotificationService,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<PaymentNotificationHandler>(PaymentNotificationHandler);
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePaymentCreated', () => {
    it('should send payment initiated notification', async () => {
      const event = new PaymentCreatedEvent('pay-1', 'order-1', 100, 'CREDIT_CARD', 'customer-1');

      await handler.handlePaymentCreated(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Payment Initiated',
        body: 'Payment of $100 via CREDIT_CARD has been initiated.',
        data: { paymentId: 'pay-1', orderId: 'order-1', amount: 100 },
      });
    });
  });

  describe('handlePaymentSucceeded', () => {
    it('should send payment success notification', async () => {
      const event = new PaymentSucceededEvent('pay-1', 'order-1', 'txn-1', 100, 'customer-1');

      await handler.handlePaymentSucceeded(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Payment Successful',
        body: 'Payment of $100 was successful.',
        data: { paymentId: 'pay-1', orderId: 'order-1', transactionId: 'txn-1' },
      });
    });
  });

  describe('handlePaymentFailed', () => {
    it('should send payment failed notification', async () => {
      const event = new PaymentFailedEvent('pay-1', 'order-1', 'Insufficient funds', 'customer-1');

      await handler.handlePaymentFailed(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.PAYMENT_FAILED,
        title: 'Payment Failed',
        body: 'Insufficient funds',
        data: { paymentId: 'pay-1', orderId: 'order-1' },
      });
    });
  });

  describe('handlePaymentRefunded', () => {
    it('should send refund notification', async () => {
      const event = new PaymentRefundedEvent('pay-1', 'order-1', 100, true, 'customer-1');

      await handler.handlePaymentRefunded(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Payment Refunded',
        body: '$100 has been refunded to your account.',
        data: { paymentId: 'pay-1', orderId: 'order-1', amount: 100 },
      });
    });
  });
});
