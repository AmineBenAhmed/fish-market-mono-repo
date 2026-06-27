import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { parsePagination, createPaginationMeta } from '../../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (query.role) {
      where.role = query.role as any;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' as const } },
        { email: { contains: query.search, mode: 'insensitive' as const } },
      ];
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateStatus(id: string, status: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        avatarFileId: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        deletedAt: true,
        createdAt: true,
        customerProfile: {
          select: {
            id: true,
            defaultAddressId: true,
          },
        },
        sellerProfile: {
          select: {
            id: true,
            storeName: true,
            storeDescription: true,
            deliveryRadius: true,
            preparationTime: true,
            verificationStatus: true,
            isActive: true,
            city: true,
            state: true,
            businessName: true,
          },
        },
        driverProfile: {
          select: {
            id: true,
            status: true,
            isAvailable: true,
            city: true,
            state: true,
            vehicleType: true,
            deliveryZoneId: true,
          },
        },
        setting: true,
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const { deletedAt: _, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone, id: { not: userId }, deletedAt: null },
      });
      if (existingPhone) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarFileId: true,
        isEmailVerified: true,
      },
    });
  }

  async softDelete(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deletedAt) {
      throw new BadRequestException('Account already deleted');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  async updateAvatar(userId: string, fileId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarFileId: fileId },
      select: {
        id: true,
        avatarFileId: true,
      },
    });
  }
}
