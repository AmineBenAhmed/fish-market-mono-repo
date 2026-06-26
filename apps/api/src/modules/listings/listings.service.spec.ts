import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ListingStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  let service: ListingsService;
  const mockPrisma = {
    sellerProfile: {
      findUnique: jest.fn(),
    },
    sellerListing: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    fishVariant: {
      findUnique: jest.fn(),
    },
    fishProduct: {
      findUnique: jest.fn(),
    },
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const mockSellerProfile = {
    id: 'seller-1',
    userId: 'user-1',
    storeName: 'Fresh Fish',
    city: 'Test City',
    state: 'TS',
    isActive: true,
    deliveryRadius: 10,
    preparationTime: 30,
    commissionRate: 0.12,
    verificationStatus: 'APPROVED',
  };

  const mockListing = {
    id: 'listing-1',
    sellerId: 'seller-1',
    productId: 'product-1',
    variantId: 'variant-1',
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    price: 25,
    quantity: 100,
    unit: 'kg',
    minOrder: 1,
    maxOrder: 100,
    status: 'ACTIVE',
    notes: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      productId: 'product-1',
      variantId: 'variant-1',
      date: tomorrow.toISOString(),
      price: 30,
      quantity: 50,
      unit: 'kg',
    };

    it('should create a listing', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.fishVariant.findUnique.mockResolvedValue({ id: 'variant-1' });
      mockPrisma.fishProduct.findUnique.mockResolvedValue({ id: 'product-1', isActive: true });
      mockPrisma.sellerListing.findUnique.mockResolvedValue(null);
      mockPrisma.sellerListing.create.mockResolvedValue({
        ...mockListing,
        price: 30,
        quantity: 50,
      });

      const result = await service.create('user-1', createDto);

      expect(result).toBeDefined();
      expect(mockPrisma.sellerListing.create).toHaveBeenCalled();
    });

    it('should update existing listing for same variant+date', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.fishVariant.findUnique.mockResolvedValue({ id: 'variant-1' });
      mockPrisma.fishProduct.findUnique.mockResolvedValue({ id: 'product-1', isActive: true });
      mockPrisma.sellerListing.findUnique.mockResolvedValue({ id: 'existing-1' });
      mockPrisma.sellerListing.update.mockResolvedValue({
        ...mockListing,
        price: 30,
        quantity: 50,
      });

      await service.create('user-1', createDto);

      expect(mockPrisma.sellerListing.update).toHaveBeenCalled();
    });

    it('should throw if seller profile not active', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if variant not found', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.fishVariant.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if product not active', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.fishVariant.findUnique.mockResolvedValue({ id: 'variant-1' });
      mockPrisma.fishProduct.findUnique.mockResolvedValue({ id: 'product-1', isActive: false });

      await expect(service.create('user-1', createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findToday', () => {
    it('should return today listings for user', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);

      const result = await service.findToday('user-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.sellerListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ sellerId: 'seller-1' }) }),
      );
    });

    it('should throw if seller profile not found', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(null);

      await expect(service.findToday('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findHistory', () => {
    it('should return paginated history', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findMany.mockResolvedValue([mockListing]);
      mockPrisma.sellerListing.count.mockResolvedValue(1);

      const result = await service.findHistory('user-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('update', () => {
    const updateDto = { price: 35 };

    it('should update own listing', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.sellerListing.update.mockResolvedValue({ ...mockListing, price: 35 });

      const result = await service.update('user-1', 'listing-1', updateDto);

      expect(result.price).toBe(35);
    });

    it('should throw if not own listing', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue(null);

      await expect(service.update('user-1', 'listing-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete own listing', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue(mockListing);

      await expect(service.remove('user-1', 'listing-1')).resolves.toBeUndefined();
    });

    it('should throw if not own listing', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'listing-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reduceStock', () => {
    it('should reduce stock quantity', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.sellerListing.update.mockResolvedValue({ ...mockListing, quantity: 80 });

      const result = await service.reduceStock('user-1', 'listing-1', 20);

      expect(result.quantity).toBe(80);
    });

    it('should throw if insufficient stock', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue(mockListing);

      await expect(service.reduceStock('user-1', 'listing-1', 999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if listing expired', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue({
        ...mockListing,
        status: ListingStatus.EXPIRED,
      });

      await expect(service.reduceStock('user-1', 'listing-1', 20)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should mark OUT_OF_STOCK when quantity reaches 0', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.sellerListing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.sellerListing.update.mockResolvedValue({
        ...mockListing,
        quantity: 0,
        status: ListingStatus.OUT_OF_STOCK,
      });

      const result = await service.reduceStock('user-1', 'listing-1', 100);

      expect(result.quantity).toBe(0);
      expect(result.status).toBe(ListingStatus.OUT_OF_STOCK);
    });
  });

  describe('expireOldListings', () => {
    it('should expire listings from previous days', async () => {
      mockPrisma.sellerListing.updateMany.mockResolvedValue({ count: 5 });

      await service.expireOldListings();

      expect(mockPrisma.sellerListing.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ date: { lt: expect.any(Date) } }),
        }),
      );
    });
  });
});
