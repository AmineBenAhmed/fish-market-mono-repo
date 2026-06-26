import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    file: {
      findUnique: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    phone: null,
    role: UserRole.CUSTOMER,
    avatarFileId: null,
    isEmailVerified: false,
    isPhoneVerified: false,
    deletedAt: null,
    createdAt: new Date(),
    customerProfile: null,
    sellerProfile: null,
    driverProfile: null,
    setting: null,
    addresses: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException for deleted user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.getProfile('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user name and phone', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: 'Updated' });

      await service.updateProfile('user-1', {
        name: 'Updated',
        phone: '+5511999999999',
      });

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should reject duplicate phone', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'other-user' });

      await expect(service.updateProfile('user-1', { phone: '+5511999999999' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException for deleted user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.updateProfile('user-1', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await service.softDelete('user-1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw if already deleted', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.softDelete('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar file reference', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.file.findUnique.mockResolvedValue({ id: 'file-1' });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', avatarFileId: 'file-1' });

      const result = await service.updateAvatar('user-1', 'file-1');

      expect(result.avatarFileId).toBe('file-1');
    });

    it('should throw if file not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.file.findUnique.mockResolvedValue(null);

      await expect(service.updateAvatar('user-1', 'bad-file')).rejects.toThrow(NotFoundException);
    });
  });
});
