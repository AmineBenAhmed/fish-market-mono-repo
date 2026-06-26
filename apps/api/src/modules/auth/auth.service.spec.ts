import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    phone: null,
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    avatarFileId: null,
    isEmailVerified: false,
    isPhoneVerified: false,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    resetToken: null,
    resetTokenExpiresAt: null,
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'StrongPass1',
      name: 'New User',
      phone: '+5511999999999',
      role: 'CUSTOMER' as const,
    };

    it('should register a new user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-id',
        email: registerDto.email,
        name: registerDto.name,
        role: UserRole.CUSTOMER,
        phone: registerDto.phone,
        avatarFileId: null,
        isEmailVerified: false,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt-1',
        userId: 'new-id',
        jti: 'uuid',
        expiresAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
      });

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'StrongPass1' };

    it('should login and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        jti: 'uuid',
        expiresAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
      });

      const result = await service.login(loginDto);

      expect(result.user.email).toBe(loginDto.email);
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for suspended user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.SUSPENDED,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    const refreshDto = { refreshToken: 'valid-refresh-token' };
    const mockTokenPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'CUSTOMER',
      type: 'refresh' as const,
      jti: 'jti-1',
    };

    it('should rotate tokens', async () => {
      jwtService.verify.mockReturnValue(mockTokenPayload);
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        jti: 'jti-1',
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        revokedAt: null,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
      });
      mockPrisma.refreshToken.update.mockResolvedValue({} as never);
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt-2',
        userId: 'user-1',
        jti: 'uuid',
        expiresAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
      });

      const result = await service.refresh(refreshDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockPrisma.refreshToken.update).toHaveBeenCalled();
    });

    it('should throw on invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on revoked token and revoke all', async () => {
      jwtService.verify.mockReturnValue(mockTokenPayload);
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        jti: 'jti-1',
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        revokedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
      });

      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 } as never);

      await expect(service.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      jwtService.verify.mockReturnValue({
        type: 'refresh',
        jti: 'jti-1',
      });
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 } as never);

      await service.logout({ refreshToken: 'token' });

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { jti: 'jti-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should not throw on invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid');
      });

      await expect(service.logout({ refreshToken: 'bad' })).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password and revoke tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 } as never);

      await service.resetPassword({ token: 'valid-token', password: 'NewPass1' });

      expect(mockPrisma.user.findFirst).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
    });

    it('should throw on invalid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword({ token: 'bad', password: 'NewPass1' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CUSTOMER,
        phone: null,
        avatarFileId: null,
        isEmailVerified: true,
      });

      const result = await service.getMe('user-1');

      expect(result.user.id).toBe('user-1');
    });
  });
});
