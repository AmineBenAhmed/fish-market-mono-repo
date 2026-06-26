import { Injectable, NotFoundException } from '@nestjs/common';

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
        avatarFileId: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        sellerProfile: {
          select: {
            id: true,
            storeName: true,
            storeDescription: true,
            deliveryRadius: true,
            isActive: true,
            city: true,
            state: true,
          },
        },
        driverProfile: {
          select: {
            id: true,
            isAvailable: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
}
