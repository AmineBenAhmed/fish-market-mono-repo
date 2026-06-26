import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';

import {
  DriverActivatedEvent,
  SellerApprovedEvent,
  UserCreatedEvent,
} from '../../events/domain-events/user.events';
import { NotificationService } from '../notification.service';
import { UserNotificationHandler } from './user-notification.handler';

describe('UserNotificationHandler', () => {
  let handler: UserNotificationHandler;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserNotificationHandler,
        {
          provide: NotificationService,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<UserNotificationHandler>(UserNotificationHandler);
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUserCreated', () => {
    it('should send welcome notification', async () => {
      const event = new UserCreatedEvent('user-1', 'test@test.com', 'John', 'CUSTOMER');

      await handler.handleUserCreated(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'user-1',
        type: NotificationType.ACCOUNT_CREATED,
        title: 'Welcome!',
        body: 'Welcome to Fishmarket, John!',
        data: { role: 'CUSTOMER' },
      });
    });
  });

  describe('handleSellerApproved', () => {
    it('should send seller approved notification', async () => {
      const event = new SellerApprovedEvent('user-1', 'My Fish Store');

      await handler.handleSellerApproved(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'user-1',
        type: NotificationType.SELLER_APPROVED,
        title: 'Seller Approved',
        body: 'Your store "My Fish Store" has been approved.',
      });
    });
  });

  describe('handleDriverActivated', () => {
    it('should send driver activated notification', async () => {
      const event = new DriverActivatedEvent('user-1', 'John');

      await handler.handleDriverActivated(event);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: 'user-1',
        type: NotificationType.DRIVER_ACTIVATED,
        title: 'Driver Activated',
        body: 'Your driver account has been activated. You can now accept deliveries.',
      });
    });
  });
});
