import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';

import {
  DeliveryAcceptedEvent,
  DeliveryAssignedEvent,
  DeliveryCancelledEvent,
  DeliveryCompletedEvent,
  DeliveryPickedUpEvent,
} from '../../events/domain-events/delivery.events';
import { NotificationService } from '../notification.service';
import { DeliveryNotificationHandler } from './delivery-notification.handler';

describe('DeliveryNotificationHandler', () => {
  let handler: DeliveryNotificationHandler;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryNotificationHandler,
        {
          provide: NotificationService,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<DeliveryNotificationHandler>(DeliveryNotificationHandler);
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAssigned', () => {
    it('should notify driver on assignment', async () => {
      const event = new DeliveryAssignedEvent('del-1', 'order-1', 'driver-1', 'admin-1');

      await handler.handleAssigned(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'driver-1',
        type: NotificationType.ORDER_OUT_FOR_DELIVERY,
        title: 'New Delivery Assignment',
        body: 'A new delivery has been assigned to you.',
        data: { deliveryId: 'del-1', orderId: 'order-1' },
      });
    });
  });

  describe('handleAccepted', () => {
    it('should notify driver on acceptance', async () => {
      const event = new DeliveryAcceptedEvent('del-1', 'order-1', 'driver-1');

      await handler.handleAccepted(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'driver-1',
        type: NotificationType.ORDER_OUT_FOR_DELIVERY,
        title: 'Delivery Accepted',
        body: 'You have accepted the delivery.',
        data: { deliveryId: 'del-1', orderId: 'order-1' },
      });
    });
  });

  describe('handlePickedUp', () => {
    it('should notify driver and customer on pickup', async () => {
      const event = new DeliveryPickedUpEvent('del-1', 'order-1', 'driver-1');

      await handler.handlePickedUp(event);

      expect(notificationService.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleCompleted', () => {
    it('should notify driver on completion', async () => {
      const event = new DeliveryCompletedEvent('del-1', 'order-1', 'driver-1', new Date());

      await handler.handleCompleted(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'driver-1',
        type: NotificationType.ORDER_DELIVERED,
        title: 'Delivery Completed',
        body: 'Delivery has been marked as completed.',
        data: { deliveryId: 'del-1', orderId: 'order-1' },
      });
    });
  });

  describe('handleCancelled', () => {
    it('should notify driver on cancellation', async () => {
      const event = new DeliveryCancelledEvent('del-1', 'order-1', 'driver-1', 'No longer needed');

      await handler.handleCancelled(event);

      expect(notificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'driver-1',
          type: NotificationType.ORDER_CANCELLED,
          title: 'Delivery Cancelled',
        }),
      );
    });
  });
});
