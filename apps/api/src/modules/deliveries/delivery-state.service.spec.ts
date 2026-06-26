import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryStatus } from '@prisma/client';

import { DeliveryStateService } from './delivery-state.service';

describe('DeliveryStateService', () => {
  let service: DeliveryStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryStateService],
    }).compile();

    service = module.get<DeliveryStateService>(DeliveryStateService);
  });

  describe('validateTransition', () => {
    it('should allow PENDING_ASSIGNMENT → ASSIGNED', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.PENDING_ASSIGNMENT, DeliveryStatus.ASSIGNED),
      ).not.toThrow();
    });

    it('should allow ASSIGNED → ACCEPTED', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.ASSIGNED, DeliveryStatus.ACCEPTED),
      ).not.toThrow();
    });

    it('should allow ACCEPTED → PICKING_UP', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.ACCEPTED, DeliveryStatus.PICKING_UP),
      ).not.toThrow();
    });

    it('should allow PICKING_UP → PICKED_UP', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.PICKING_UP, DeliveryStatus.PICKED_UP),
      ).not.toThrow();
    });

    it('should allow PICKED_UP → IN_TRANSIT', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT),
      ).not.toThrow();
    });

    it('should allow IN_TRANSIT → DELIVERED', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED),
      ).not.toThrow();
    });

    it('should reject DELIVERED → any other status', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.DELIVERED, DeliveryStatus.IN_TRANSIT),
      ).toThrow(BadRequestException);
    });

    it('should reject CANCELLED → any other status', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.CANCELLED, DeliveryStatus.ASSIGNED),
      ).toThrow(BadRequestException);
    });

    it('should throw on same status transition', () => {
      expect(() =>
        service.validateTransition(
          DeliveryStatus.PENDING_ASSIGNMENT,
          DeliveryStatus.PENDING_ASSIGNMENT,
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject ASSIGNED → DELIVERED (skip states)', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.ASSIGNED, DeliveryStatus.DELIVERED),
      ).toThrow(BadRequestException);
    });

    it('should reject PENDING_ASSIGNMENT → PICKED_UP (skip states)', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.PENDING_ASSIGNMENT, DeliveryStatus.PICKED_UP),
      ).toThrow(BadRequestException);
    });

    it('should allow IN_TRANSIT → FAILED', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.IN_TRANSIT, DeliveryStatus.FAILED),
      ).not.toThrow();
    });

    it('should allow PENDING_ASSIGNMENT → CANCELLED', () => {
      expect(() =>
        service.validateTransition(DeliveryStatus.PENDING_ASSIGNMENT, DeliveryStatus.CANCELLED),
      ).not.toThrow();
    });
  });

  describe('canBeCompleted', () => {
    it('should return true for PICKED_UP', () => {
      expect(service.canBeCompleted(DeliveryStatus.PICKED_UP)).toBe(true);
    });

    it('should return true for IN_TRANSIT', () => {
      expect(service.canBeCompleted(DeliveryStatus.IN_TRANSIT)).toBe(true);
    });

    it('should return false for PENDING_ASSIGNMENT', () => {
      expect(service.canBeCompleted(DeliveryStatus.PENDING_ASSIGNMENT)).toBe(false);
    });

    it('should return false for DELIVERED', () => {
      expect(service.canBeCompleted(DeliveryStatus.DELIVERED)).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it('should return true for DELIVERED', () => {
      expect(service.isTerminal(DeliveryStatus.DELIVERED)).toBe(true);
    });

    it('should return true for CANCELLED', () => {
      expect(service.isTerminal(DeliveryStatus.CANCELLED)).toBe(true);
    });

    it('should return true for RETURNED', () => {
      expect(service.isTerminal(DeliveryStatus.RETURNED)).toBe(true);
    });

    it('should return false for PENDING_ASSIGNMENT', () => {
      expect(service.isTerminal(DeliveryStatus.PENDING_ASSIGNMENT)).toBe(false);
    });
  });

  describe('isDriverActionable', () => {
    it('should return true for ASSIGNED', () => {
      expect(service.isDriverActionable(DeliveryStatus.ASSIGNED)).toBe(true);
    });

    it('should return false for DELIVERED', () => {
      expect(service.isDriverActionable(DeliveryStatus.DELIVERED)).toBe(false);
    });

    it('should return false for PENDING_ASSIGNMENT', () => {
      expect(service.isDriverActionable(DeliveryStatus.PENDING_ASSIGNMENT)).toBe(false);
    });
  });
});
