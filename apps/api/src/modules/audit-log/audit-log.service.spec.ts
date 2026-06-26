import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';

const mockPrisma = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLogService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const entry = {
        id: 'log-1',
        entity: 'Order',
        entityId: 'order-1',
        action: 'UPDATE',
        userId: 'user-1',
        oldValue: { status: 'DRAFT' },
        newValue: { status: 'CONFIRMED' },
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test',
      };

      mockPrisma.auditLog.create.mockResolvedValue(entry);

      const result = await service.log({
        entity: 'Order',
        entityId: 'order-1',
        action: 'UPDATE',
        userId: 'user-1',
        oldValue: { status: 'DRAFT' },
        newValue: { status: 'CONFIRMED' },
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test',
      });

      expect(result).toEqual(entry);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          entity: 'Order',
          entityId: 'order-1',
          action: 'UPDATE',
          userId: 'user-1',
          oldValue: { status: 'DRAFT' },
          newValue: { status: 'CONFIRMED' },
          ipAddress: '127.0.0.1',
          userAgent: 'jest-test',
        },
      });
    });

    it('should default oldValue and newValue to empty objects', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.log({
        entity: 'Order',
        entityId: 'order-1',
        action: 'UPDATE',
        userId: 'user-1',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          entity: 'Order',
          entityId: 'order-1',
          action: 'UPDATE',
          userId: 'user-1',
          oldValue: {},
          newValue: {},
          ipAddress: undefined,
          userAgent: undefined,
        },
      });
    });
  });

  describe('findMany', () => {
    it('should return paginated audit logs', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([
        { id: 'log-1', entity: 'Order', action: 'UPDATE' },
      ]);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findMany({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by entity', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.findMany({ entity: 'Order' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entity: 'Order' },
        }),
      );
    });

    it('should filter by userId', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.findMany({ userId: 'user-1' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });
  });
});
