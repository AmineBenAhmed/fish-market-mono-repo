import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { DatabaseNotificationChannel } from './channels/database.channel';
import { EmailNotificationChannel } from './channels/email.channel';
import { PushNotificationChannel } from './channels/push.channel';
import { NotificationService } from './notification.service';

const mockPrisma = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

const mockDatabaseChannel = {
  name: 'database',
  send: jest.fn(),
};

const mockEmailChannel = {
  name: 'email',
  send: jest.fn(),
};

const mockPushChannel = {
  name: 'push',
  send: jest.fn(),
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DatabaseNotificationChannel, useValue: mockDatabaseChannel },
        { provide: EmailNotificationChannel, useValue: mockEmailChannel },
        { provide: PushNotificationChannel, useValue: mockPushChannel },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should send notification via database channel', async () => {
      const payload = {
        userId: 'user-1',
        type: NotificationType.ORDER_CONFIRMED,
        title: 'Test',
        body: 'Test body',
        data: { orderId: 'order-1' },
      };

      await service.send(payload);

      expect(mockDatabaseChannel.send).toHaveBeenCalledWith(payload);
    });

    it('should not throw if a channel fails', async () => {
      mockDatabaseChannel.send.mockRejectedValueOnce(new Error('Channel error'));

      const payload = {
        userId: 'user-1',
        type: NotificationType.ORDER_CANCELLED,
        title: 'Test',
      };

      await expect(service.send(payload)).resolves.not.toThrow();
    });
  });

  describe('findByUser', () => {
    it('should return paginated notifications', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([
        { id: 'n-1', userId: 'user-1', title: 'Test' },
      ]);
      mockPrisma.notification.count.mockResolvedValue(1);

      const result = await service.findByUser('user-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by unreadOnly', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.findByUser('user-1', { unreadOnly: 'true' });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isRead: false }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return notification if found', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'n-1',
        userId: 'user-1',
        title: 'Test',
      });

      const result = await service.findOne('n-1', 'user-1');
      expect(result.id).toBe('n-1');
    });

    it('should throw if not found', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.findOne('n-1', 'user-1')).rejects.toThrowError('Notification not found');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read if unread', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'n-1',
        userId: 'user-1',
        isRead: false,
      });
      mockPrisma.notification.update.mockResolvedValue({});

      const result = await service.markAsRead('n-1', 'user-1');
      expect(result.message).toBe('Notification marked as read');
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });

    it('should not update if already read', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'n-1',
        userId: 'user-1',
        isRead: true,
      });

      await service.markAsRead('n-1', 'user-1');
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');
      expect(result.message).toBe('All notifications marked as read');
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });
  });

  describe('remove', () => {
    it('should delete notification', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'n-1',
        userId: 'user-1',
      });
      mockPrisma.notification.delete.mockResolvedValue({});

      const result = await service.remove('n-1', 'user-1');
      expect(result.message).toBe('Notification deleted');
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'n-1' },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');
      expect(result).toBe(5);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
    });
  });
});
