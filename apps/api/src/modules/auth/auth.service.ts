import * as crypto from 'node:crypto';

import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { JwtPayload, TokenPair } from '../../common/interfaces';
import { parseDurationToMs } from '../../common/utils';
import { env } from '../../config/env';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AuthResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        role: (dto.role as UserRole) || 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarFileId: true,
        isEmailVerified: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user, ...tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarFileId: user.avatarFileId,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: env.jwtSecret,
      });

      if (payload.type !== 'refresh' || !payload.jti) {
        return;
      }

      await this.prisma.refreshToken.updateMany({
        where: { jti: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      return;
    }
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: env.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh' || !payload.jti) {
      throw new UnauthorizedException('Invalid token type');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      include: {
        user: { select: { id: true, email: true, role: true, status: true, deletedAt: true } },
      },
    });

    if (!storedToken || storedToken.revokedAt) {
      if (storedToken?.revokedAt) {
        await this.revokeAllUserTokens(storedToken.userId);
      }
      throw new UnauthorizedException('Token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (storedToken.user.deletedAt || storedToken.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.role);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; resetToken?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: tokenHash,
        resetTokenExpiresAt: expiresAt,
      },
    });

    return {
      message: 'If the email exists, a reset link has been sent',
      resetToken: rawToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    await this.revokeAllUserTokens(user.id);
  }

  async getMe(userId: string): Promise<Omit<AuthResponse, 'accessToken' | 'refreshToken'>> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarFileId: true,
        isEmailVerified: true,
      },
    });

    return { user };
  }

  private async generateTokens(userId: string, email: string, role: string): Promise<TokenPair> {
    const jti = crypto.randomUUID();

    const accessToken = this.jwtService.sign(
      { sub: userId, email, role, type: 'access' },
      { expiresIn: env.jwtExpiration },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, jti, type: 'refresh' },
      { expiresIn: env.jwtRefreshExpiration },
    );

    const refreshExpiresAt = new Date(Date.now() + parseDurationToMs(env.jwtRefreshExpiration));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        jti,
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
