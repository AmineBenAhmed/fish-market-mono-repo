import { Test, TestingModule } from '@nestjs/testing';

import { DeliveryFeeService } from './delivery-fee.service';

describe('DeliveryFeeService', () => {
  let service: DeliveryFeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryFeeService],
    }).compile();

    service = module.get<DeliveryFeeService>(DeliveryFeeService);
  });

  describe('calculate', () => {
    it('should return flat rate when strategy is FLAT', () => {
      const result = service.calculate(
        { sellerCity: 'Tunis', customerCity: 'Tunis', subtotal: 100 },
        { strategy: 'FLAT', flatRate: 10 },
      );

      expect(result).toBe(10);
    });

    it('should calculate distance-based fee', () => {
      const result = service.calculate(
        { sellerCity: 'Tunis', customerCity: 'Sfax', distanceKm: 15, subtotal: 100 },
        { strategy: 'DISTANCE_BASED', perKmRate: 2 },
      );

      expect(result).toBe(30);
    });

    it('should calculate zone-based fee', () => {
      const result = service.calculate(
        { sellerCity: 'Ariana', customerCity: 'Tunis', subtotal: 100 },
        { strategy: 'ZONE_BASED', zoneRates: { 'Ariana-Tunis': 15 } },
      );

      expect(result).toBe(15);
    });

    it('should return 0 when subtotal exceeds free threshold', () => {
      const result = service.calculate(
        { sellerCity: 'Tunis', customerCity: 'Tunis', subtotal: 200 },
        { strategy: 'FLAT', flatRate: 10, freeThreshold: 150 },
      );

      expect(result).toBe(0);
    });

    it('should return flat rate when subtotal below free threshold', () => {
      const result = service.calculate(
        { sellerCity: 'Tunis', customerCity: 'Tunis', subtotal: 100 },
        { strategy: 'FLAT', flatRate: 10, freeThreshold: 150 },
      );

      expect(result).toBe(10);
    });

    it('should return default flat rate when strategy unknown', () => {
      const result = service.calculate(
        { sellerCity: 'Tunis', customerCity: 'Tunis', subtotal: 100 },
        { strategy: 'UNKNOWN' as 'FLAT' },
      );

      expect(result).toBe(5);
    });

    it('should use default config when none provided', () => {
      const result = service.calculate({
        sellerCity: 'Tunis',
        customerCity: 'Tunis',
        subtotal: 50,
      });

      expect(result).toBe(5);
    });

    it('should return 0 for free orders with default config', () => {
      const result = service.calculate({
        sellerCity: 'Tunis',
        customerCity: 'Tunis',
        subtotal: 150,
      });

      expect(result).toBe(0);
    });
  });

  describe('calculateForOrder', () => {
    it('should return 0 for empty items', () => {
      const result = service.calculateForOrder([], 'Tunis');

      expect(result).toBe(0);
    });

    it('should calculate single-seller delivery fee', () => {
      const items = [
        { sellerCity: 'Tunis', subtotal: 80 },
        { sellerCity: 'Tunis', subtotal: 40 },
      ];

      const result = service.calculateForOrder(items, 'Ariana', { strategy: 'FLAT', flatRate: 10 });

      expect(result).toBe(10);
    });

    it('should sum fees for multi-seller orders', () => {
      const items = [
        { sellerCity: 'Tunis', subtotal: 50 },
        { sellerCity: 'Sfax', subtotal: 30 },
      ];

      const result = service.calculateForOrder(items, 'Ariana', { strategy: 'FLAT', flatRate: 5 });

      expect(result).toBe(10);
    });

    it('should apply free threshold to multi-seller orders', () => {
      const items = [{ sellerCity: 'Tunis', subtotal: 100 }];

      const result = service.calculateForOrder(items, 'Ariana', {
        strategy: 'FLAT',
        flatRate: 5,
        freeThreshold: 80,
      });

      expect(result).toBe(0);
    });
  });
});
