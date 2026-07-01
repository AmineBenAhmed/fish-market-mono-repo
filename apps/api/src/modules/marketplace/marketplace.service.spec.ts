import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceService } from './marketplace.service';

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  const mockPrisma = {
    sellerListing: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    fishProduct: {
      findMany: jest.fn(),
    },
    sellerProfile: {
      findUnique: jest.fn(),
    },
  };

  const mockListing = {
    id: 'listing-1',
    sellerId: 'seller-1',
    categoryId: 'cat-1',
    variantId: 'variant-1',
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    price: 25,
    quantity: 100,
    title: 'Sea Bass',
    unit: 'kg',
    status: 'ACTIVE',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: 'cat-1', name: 'Fish' },
    variant: { id: 'variant-1', name: 'Whole', price: 25 },
    seller: {
      id: 'seller-1',
      storeName: 'Fresh Fish Store',
      city: 'Test City',
      state: 'TS',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplaceService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
    jest.clearAllMocks();
  });

  describe('findToday', () => {
    it('should return paginated listings', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      const result = await service.findToday({});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by city', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      await service.findToday({ city: 'Test' });

      expect(mockPrisma.sellerListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            seller: expect.objectContaining({ city: expect.any(Object) }),
          }),
        }),
      );
    });

    it('should filter by categoryId', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      await service.findToday({ categoryId: 'cat-1' });

      expect(mockPrisma.sellerListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        }),
      );
    });

    it('should search by title or category name', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      await service.findToday({ search: 'Sea Bass' });

      expect(mockPrisma.sellerListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should filter by price range', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      await service.findToday({ minPrice: 10, maxPrice: 50 });

      expect(mockPrisma.sellerListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 10, lte: 50 },
          }),
        }),
      );
    });

    it('should sort by price ascending', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      await service.findToday({ sortBy: 'price', sortOrder: 'asc' });

      expect(mockPrisma.sellerListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([{ price: 'asc' }]),
        }),
      );
    });

    it('should sort by name ascending', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      await service.findToday({ sortBy: 'name', sortOrder: 'asc' });

      expect(mockPrisma.sellerListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([{ title: 'asc' }]),
        }),
      );
    });

    it('should paginate results', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([]);
      mockPrisma.sellerListing.count.mockResolvedValue(50);

      const result = await service.findToday({ page: 3, limit: 10 });

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should handle empty result', async () => {
      mockPrisma.sellerListing.findMany.mockResolvedValue([]);
      mockPrisma.sellerListing.count.mockResolvedValue(0);

      const result = await service.findToday({});

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('search', () => {
    it('should search products by query', async () => {
      mockPrisma.fishProduct.findMany.mockResolvedValue([{ id: 'product-1', name: 'Sea Bass' }]);

      const result = await service.search('Sea Bass');

      expect(result).toHaveLength(1);
      expect(mockPrisma.fishProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findBySeller', () => {
    it('should return seller with today listings', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue({
        id: 'seller-1',
        storeName: 'Fresh Fish Store',
        city: 'Test City',
        state: 'TS',
      });
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);

      const result = await service.findBySeller('seller-1');

      expect(result.seller.storeName).toBe('Fresh Fish Store');
      expect(result.listings).toHaveLength(1);
    });

    it('should throw if seller not found', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(null);

      await expect(service.findBySeller('seller-1')).rejects.toThrow(NotFoundException);
    });
  });
});
