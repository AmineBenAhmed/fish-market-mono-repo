import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { AddressesService } from './addresses.service';

describe('AddressesService', () => {
  let service: AddressesService;
  const mockPrisma = {
    userAddress: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    customerProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAddress = {
    id: 'addr-1',
    userId: 'user-1',
    label: 'Home',
    street: 'Rua A',
    number: '100',
    complement: null,
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01001000',
    lat: null,
    lng: null,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create address and set as default if first', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(0);
      mockPrisma.userAddress.create.mockResolvedValue(mockAddress);
      mockPrisma.customerProfile.findUnique.mockResolvedValue(null);

      const result = await service.create('user-1', {
        street: 'Rua A',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001000',
      });

      expect(result.isDefault).toBe(true);
    });

    it('should reject more than 20 addresses', async () => {
      mockPrisma.userAddress.count.mockResolvedValue(20);

      await expect(
        service.create('user-1', {
          street: 'Rua A',
          number: '100',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01001000',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update owned address', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue(mockAddress);
      mockPrisma.userAddress.update.mockResolvedValue({
        ...mockAddress,
        street: 'Rua B',
      });

      await service.update('user-1', 'addr-1', {
        street: 'Rua B',
      });

      expect(mockPrisma.userAddress.update).toHaveBeenCalled();
    });

    it('should reject update of unowned address', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue(null);

      await expect(service.update('user-1', 'addr-1', { street: 'Rua B' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete owned address', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue(mockAddress);

      await service.remove('user-1', 'addr-1');

      expect(mockPrisma.userAddress.delete).toHaveBeenCalledWith({
        where: { id: 'addr-1' },
      });
    });
  });

  describe('setDefault', () => {
    it('should set address as default', async () => {
      mockPrisma.userAddress.findFirst.mockResolvedValue(mockAddress);
      mockPrisma.userAddress.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.userAddress.update.mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      });
      mockPrisma.customerProfile.findUnique.mockResolvedValue(null);

      const result = await service.setDefault('user-1', 'addr-1');

      expect(result.isDefault).toBe(true);
    });
  });
});
