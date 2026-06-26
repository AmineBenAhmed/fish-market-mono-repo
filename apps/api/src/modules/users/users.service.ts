import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
