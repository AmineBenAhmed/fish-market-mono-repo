import { Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateDriverDto) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.driverProfile.update({
      where: { userId },
      data: {
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.deliveryZone !== undefined && { deliveryZone: dto.deliveryZone }),
        ...(dto.vehicleType !== undefined && { vehicleType: dto.vehicleType }),
        ...(dto.vehiclePlate !== undefined && { vehiclePlate: dto.vehiclePlate }),
        ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        ...(dto.maxLoadKg !== undefined && { maxLoadKg: dto.maxLoadKg }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
      },
    });
  }

  async setOnlineStatus(userId: string, status: 'ONLINE' | 'OFFLINE') {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.driverProfile.update({
      where: { userId },
      data: {
        status: status as DriverStatus,
        isAvailable: status === 'ONLINE',
      },
    });
  }
}
