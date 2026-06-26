import { Test, TestingModule } from '@nestjs/testing';

import { CommissionService } from './commission.service';

describe('CommissionService', () => {
  let service: CommissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionService],
    }).compile();

    service = module.get<CommissionService>(CommissionService);
  });

  describe('calculate', () => {
    it('should calculate percentage commission', () => {
      const result = service.calculate({ subtotal: 200, commissionRate: 0.1 });

      expect(result.commissionAmount).toBe(20);
      expect(result.netAmount).toBe(180);
    });

    it('should use fixed commission when strategy is FIXED', () => {
      const result = service.calculate(
        { subtotal: 200, commissionRate: 0.1 },
        { strategy: 'FIXED', fixedAmount: 50, rate: 0.1 },
      );

      expect(result.commissionAmount).toBe(50);
      expect(result.netAmount).toBe(150);
    });

    it('should apply max cap to commission', () => {
      const result = service.calculate(
        { subtotal: 1000, commissionRate: 0.1 },
        { strategy: 'PERCENTAGE', rate: 0.1, maxCap: 50 },
      );

      expect(result.commissionAmount).toBe(50);
    });

    it('should apply min amount to commission', () => {
      const result = service.calculate(
        { subtotal: 10, commissionRate: 0.1 },
        { strategy: 'PERCENTAGE', rate: 0.1, minAmount: 5 },
      );

      expect(result.commissionAmount).toBe(5);
    });
  });

  describe('calculateSellerEarnings', () => {
    it('should calculate commission and seller earning', () => {
      const result = service.calculateSellerEarnings(200, 0.1);

      expect(result.commission).toBe(20);
      expect(result.sellerEarning).toBe(180);
      expect(result.total).toBe(200);
    });

    it('should handle zero rate', () => {
      const result = service.calculateSellerEarnings(100, 0);

      expect(result.commission).toBe(0);
      expect(result.sellerEarning).toBe(100);
    });
  });

  describe('calculateMarketplaceCommission', () => {
    it('should aggregate multiple orders', () => {
      const result = service.calculateMarketplaceCommission([
        { subtotal: 100, rate: 0.1 },
        { subtotal: 200, rate: 0.05 },
      ]);

      expect(result.totalCommission).toBe(20);
      expect(result.totalSellerEarnings).toBe(280);
    });
  });

  describe('getCommissionRate', () => {
    it('should return seller commission rate', () => {
      const result = service.getCommissionRate({ commissionRate: 0.15 });

      expect(result).toBe(0.15);
    });
  });
});
