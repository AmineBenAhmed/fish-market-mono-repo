import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SellerVerificationStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { SellersService } from './sellers.service';

describe('SellersService', () => {
  let service: SellersService;
  const mockPrisma = {
    user: {
      update: jest.fn(),
    },
    sellerProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockProfile = {
    id: 'seller-1',
    userId: 'user-1',
    storeName: 'Fresh Fish Store',
    storeDescription: null,
    storeLogoFileId: null,
    deliveryRadius: 10,
    commissionRate: 0.12,
    preparationTime: 30,
    verificationStatus: SellerVerificationStatus.APPROVED,
    businessName: null,
    businessDoc: null,
    taxId: null,
    isActive: true,
    city: 'São Paulo',
    state: 'SP',
    governorateId: 'sousse',
    areaId: 'centre-ville',
    zoneId: 'zone-1',
    street: '123 Main St',
    buildingNumber: null,
    apartment: null,
    floor: null,
    landmark: null,
    lat: null,
    lng: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<SellersService>(SellersService);
    jest.clearAllMocks();
  });

  describe('apply', () => {
    const applyDto = {
      storeName: 'My Fish Store',
      governorateId: 'sousse',
      areaId: 'centre-ville',
      zoneId: 'zone-1',
      street: '123 Main St',
    };

    it('should create seller profile on first application', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(null);
      mockPrisma.sellerProfile.create.mockResolvedValue({
        ...mockProfile,
        verificationStatus: SellerVerificationStatus.PENDING,
        isActive: false,
      });

      const result = await service.apply('user-1', applyDto);

      expect(result).toBeDefined();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'SELLER' },
      });
    });

    it('should reject if already approved', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockProfile);

      await expect(service.apply('user-1', applyDto)).rejects.toThrow(ConflictException);
    });

    it('should reject if already pending', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue({
        ...mockProfile,
        verificationStatus: SellerVerificationStatus.PENDING,
      });

      await expect(service.apply('user-1', applyDto)).rejects.toThrow(ConflictException);
    });

    it('should re-submit if previously rejected', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue({
        ...mockProfile,
        verificationStatus: SellerVerificationStatus.REJECTED,
        isActive: false,
      });
      mockPrisma.sellerProfile.update.mockResolvedValue({
        ...mockProfile,
        verificationStatus: SellerVerificationStatus.PENDING,
        isActive: false,
      });

      await service.apply('user-1', applyDto);

      expect(mockPrisma.sellerProfile.update).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return seller profile', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-1');

      expect(result.storeName).toBe('Fresh Fish Store');
    });

    it('should throw if not found', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateVerification', () => {
    it('should approve seller', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.sellerProfile.update.mockResolvedValue({
        ...mockProfile,
        verificationStatus: SellerVerificationStatus.APPROVED,
        isActive: true,
      });

      const result = await service.updateVerification('user-1', 'APPROVED');

      expect(result.isActive).toBe(true);
    });

    it('should reject seller', async () => {
      mockPrisma.sellerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.sellerProfile.update.mockResolvedValue({
        ...mockProfile,
        verificationStatus: SellerVerificationStatus.REJECTED,
        isActive: false,
      });

      const result = await service.updateVerification('user-1', 'REJECTED');

      expect(result.verificationStatus).toBe(SellerVerificationStatus.REJECTED);
    });
  });
});
