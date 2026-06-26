import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { OrderStatusService } from './order-status.service';

describe('OrderStatusService', () => {
  let service: OrderStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderStatusService],
    }).compile();

    service = module.get<OrderStatusService>(OrderStatusService);
  });

  describe('validateTransition', () => {
    it('should allow DRAFT -> PENDING', () => {
      expect(() => service.validateTransition('DRAFT' as any, 'PENDING' as any)).not.toThrow();
    });

    it('should allow DRAFT -> CANCELLED', () => {
      expect(() => service.validateTransition('DRAFT' as any, 'CANCELLED' as any)).not.toThrow();
    });

    it('should allow CONFIRMED -> PREPARING', () => {
      expect(() =>
        service.validateTransition('CONFIRMED' as any, 'PREPARING' as any),
      ).not.toThrow();
    });

    it('should reject DRAFT -> DELIVERED', () => {
      expect(() => service.validateTransition('DRAFT' as any, 'DELIVERED' as any)).toThrow(
        BadRequestException,
      );
    });

    it('should reject CANCELLED -> anything', () => {
      expect(() => service.validateTransition('CANCELLED' as any, 'PENDING' as any)).toThrow(
        BadRequestException,
      );
    });

    it('should allow same status transition', () => {
      expect(() => service.validateTransition('PENDING' as any, 'PENDING' as any)).not.toThrow();
    });
  });
});
