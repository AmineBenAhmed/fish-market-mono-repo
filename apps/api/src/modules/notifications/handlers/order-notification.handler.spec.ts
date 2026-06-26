import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';

import {
  OrderCancelledEvent,
  OrderConfirmedEvent,
  OrderCreatedEvent,
  OrderReadyForPickupEvent,
} from '../../events/domain-events/order.events';
import { NotificationService } from '../notification.service';
import { OrderNotificationHandler } from './order-notification.handler';

describe('OrderNotificationHandler', () => {
  let handler: OrderNotificationHandler;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderNotificationHandler,
        {
          provide: NotificationService,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<OrderNotificationHandler>(OrderNotificationHandler);
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleOrderCreated', () => {
    it('should send notification to customer and seller', async () => {
      const event = new OrderCreatedEvent('order-1', 'FM-001', 'customer-1', 'seller-1', 100);

      await handler.handleOrderCreated(event);

      expect(notificationService.send).toHaveBeenCalledTimes(2);
      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.ORDER_CONFIRMED,
        title: 'Order Created',
        body: 'Order #FM-001 has been created successfully.',
        data: { orderId: 'order-1', orderNumber: 'FM-001' },
      });
      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'seller-1',
        type: NotificationType.ORDER_CONFIRMED,
        title: 'New Order Received',
        body: 'You have a new order #FM-001.',
        data: { orderId: 'order-1', orderNumber: 'FM-001' },
      });
    });

    it('should skip seller notification if no seller', async () => {
      const event = new OrderCreatedEvent('order-1', 'FM-001', 'customer-1', null, 100);

      await handler.handleOrderCreated(event);

      expect(notificationService.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleOrderConfirmed', () => {
    it('should send confirmed notification', async () => {
      const event = new OrderConfirmedEvent('order-1', 'FM-001', 'customer-1', 'seller-1', 100);

      await handler.handleOrderConfirmed(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.ORDER_CONFIRMED,
        title: 'Order Confirmed',
        body: 'Order #FM-001 has been confirmed.',
        data: { orderId: 'order-1', orderNumber: 'FM-001' },
      });
    });
  });

  describe('handleOrderCancelled', () => {
    it('should send cancellation notification with reason', async () => {
      const event = new OrderCancelledEvent('order-1', 'FM-001', 'customer-1', 'Out of stock');

      await handler.handleOrderCancelled(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.ORDER_CANCELLED,
        title: 'Order Cancelled',
        body: 'Order cancelled: Out of stock',
        data: { orderId: 'order-1', orderNumber: 'FM-001' },
      });
    });

    it('should send cancellation notification without reason', async () => {
      const event = new OrderCancelledEvent('order-1', 'FM-001', 'customer-1', null);

      await handler.handleOrderCancelled(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'customer-1',
        type: NotificationType.ORDER_CANCELLED,
        title: 'Order Cancelled',
        body: 'Order has been cancelled.',
        data: { orderId: 'order-1', orderNumber: 'FM-001' },
      });
    });
  });

  describe('handleOrderReadyForPickup', () => {
    it('should send ready for pickup notification', async () => {
      const event = new OrderReadyForPickupEvent('order-1', 'FM-001', 'seller-1');

      await handler.handleOrderReadyForPickup(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'seller-1',
        type: NotificationType.ORDER_PREPARING,
        title: 'Ready for Pickup',
        body: 'Order #FM-001 is ready for pickup.',
        data: { orderId: 'order-1', orderNumber: 'FM-001' },
      });
    });
  });
});
