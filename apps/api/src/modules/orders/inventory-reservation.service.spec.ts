import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { InventoryReservationService } from './inventory-reservation.service';

describe('InventoryReservationService', () => {
  let service: InventoryReservationService;
  const mockTx = {
    sellerListing: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryReservationService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<InventoryReservationService>(InventoryReservationService);
    jest.clearAllMocks();
  });

  describe('reserve', () => {
    it('should decrement stock when sufficient', async () => {
      mockTx.sellerListing.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.reserve(mockTx as any, 'listing-1', 5)).resolves.toBeUndefined();

      expect(mockTx.sellerListing.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'listing-1', quantity: { gte: 5 } }),
          data: { quantity: { decrement: 5 } },
        }),
      );
    });

    it('should throw if insufficient stock', async () => {
      mockTx.sellerListing.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.reserve(mockTx as any, 'listing-1', 999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('release', () => {
    it('should increment stock on release', async () => {
      mockTx.sellerListing.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.release(mockTx as any, 'listing-1', 3)).resolves.toBeUndefined();

      expect(mockTx.sellerListing.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'listing-1', status: { not: 'EXPIRED' } }),
          data: { quantity: { increment: 3 } },
        }),
      );
    });

    it('should throw if listing expired', async () => {
      mockTx.sellerListing.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.release(mockTx as any, 'listing-1', 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
