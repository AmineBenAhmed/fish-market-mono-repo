import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DriverStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { DriversService } from './drivers.service';

describe('DriversService', () => {
  let service: DriversService;
  const mockPrisma = {
    driverProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockProfile = {
    id: 'driver-1',
    userId: 'user-1',
    status: DriverStatus.OFFLINE,
    isAvailable: false,
    currentLat: null,
    currentLng: null,
    city: 'São Paulo',
    state: 'SP',
    deliveryZone: 'Zona Sul',
    vehicleType: 'car',
    vehiclePlate: 'ABC-1234',
    licenseNumber: 'LIC-001',
    maxLoadKg: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriversService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<DriversService>(DriversService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return driver profile', async () => {
      mockPrisma.driverProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-1');

      expect(result.vehicleType).toBe('car');
    });

    it('should throw if not found', async () => {
      mockPrisma.driverProfile.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update driver profile', async () => {
      mockPrisma.driverProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.driverProfile.update.mockResolvedValue({
        ...mockProfile,
        vehicleType: 'van',
      });

      await service.updateProfile('user-1', {
        vehicleType: 'van',
      });

      expect(mockPrisma.driverProfile.update).toHaveBeenCalled();
    });
  });

  describe('setOnlineStatus', () => {
    it('should set driver online', async () => {
      mockPrisma.driverProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.driverProfile.update.mockResolvedValue({
        ...mockProfile,
        status: DriverStatus.ONLINE,
        isAvailable: true,
      });

      const result = await service.setOnlineStatus('user-1', 'ONLINE');

      expect(result.status).toBe(DriverStatus.ONLINE);
      expect(result.isAvailable).toBe(true);
    });

    it('should set driver offline', async () => {
      mockPrisma.driverProfile.findUnique.mockResolvedValue({
        ...mockProfile,
        status: DriverStatus.ONLINE,
        isAvailable: true,
      });
      mockPrisma.driverProfile.update.mockResolvedValue({
        ...mockProfile,
        status: DriverStatus.OFFLINE,
        isAvailable: false,
      });

      const result = await service.setOnlineStatus('user-1', 'OFFLINE');

      expect(result.status).toBe(DriverStatus.OFFLINE);
      expect(result.isAvailable).toBe(false);
    });
  });
});
