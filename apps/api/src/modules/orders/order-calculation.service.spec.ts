import { Test, TestingModule } from '@nestjs/testing';

import { OrderCalculationService } from './order-calculation.service';

describe('OrderCalculationService', () => {
  let service: OrderCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderCalculationService],
    }).compile();

    service = module.get<OrderCalculationService>(OrderCalculationService);
  });

  describe('calculateItemSubtotal', () => {
    it('should multiply price by quantity', () => {
      expect(service.calculateItemSubtotal(25, 3)).toBe(75);
    });
  });

  describe('calculateSellerSubtotal', () => {
    it('should sum all item subtotals', () => {
      const items = [
        { unitPrice: 25, quantity: 2 },
        { unitPrice: 15, quantity: 3 },
      ];
      expect(service.calculateSellerSubtotal(items)).toBe(95);
    });
  });

  describe('calculateSellerOrder', () => {
    it('should compute subtotal, delivery fee, commission, and total', () => {
      const seller = {
        items: [{ unitPrice: 100, quantity: 2 }],
        commissionRate: 0.12,
      };

      const result = service.calculateSellerOrder(seller);

      expect(result.subtotal).toBe(200);
      expect(result.deliveryFee).toBe(0);
      expect(result.commission).toBe(24);
      expect(result.total).toBe(224);
    });
  });

  describe('calculateMarketplaceOrder', () => {
    it('should aggregate all seller orders', () => {
      const results = [
        { subtotal: 100, deliveryFee: 0, commission: 12, total: 112 },
        { subtotal: 200, deliveryFee: 5, commission: 24, total: 229 },
      ];

      const result = service.calculateMarketplaceOrder(results);

      expect(result.subtotal).toBe(300);
      expect(result.deliveryFee).toBe(5);
      expect(result.commission).toBe(36);
      expect(result.total).toBe(341);
    });
  });
});
