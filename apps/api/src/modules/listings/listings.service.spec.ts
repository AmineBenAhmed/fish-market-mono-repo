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
    fishCategory: {
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
    categoryId: 'cat-1',
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
      categoryId: 'cat-1',
      variantId: 'variant-1',
      date: tomorrow.toISOString(),
      price: 30,
      quantity: 50,
      unit: 'kg',
    };

    it('should create a listing', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockSellerProfile);
      mockPrisma.fishVariant.findUnique.mockResolvedValue({ id: 'variant-1' });
      mockPrisma.fishCategory.findUnique.mockResolvedValue({ id: 'cat-1', name: 'Sea Bass' });
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

    it('should throw if seller profile not active', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', createDto)).rejects.toThrow(BadRequestException);
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
