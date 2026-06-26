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
      include: { zone: true },
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
        ...(dto.deliveryZoneId !== undefined && { deliveryZoneId: dto.deliveryZoneId }),
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

  async findAvailable(zoneId?: string) {
    return this.prisma.driverProfile.findMany({
      where: {
        status: 'ONLINE',
        isAvailable: true,
        ...(zoneId && { deliveryZoneId: zoneId }),
        activeDeliveries: { lt: this.prisma.driverProfile.fields.maxDeliveries },
      } as any,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        zone: { select: { id: true, name: true } },
      },
      orderBy: { activeDeliveries: 'asc' },
    });
  }

  async getDeliveryStats(userId: string) {
    const [activeCount, totalDeliveries, completedDeliveries] = await Promise.all([
      this.prisma.delivery.count({
        where: {
          driverId: userId,
          status: { in: ['ASSIGNED', 'ACCEPTED', 'PICKING_UP', 'PICKED_UP', 'IN_TRANSIT'] as any },
        },
      }),
      this.prisma.delivery.count({ where: { driverId: userId } }),
      this.prisma.delivery.count({ where: { driverId: userId, status: 'DELIVERED' as any } }),
    ]);

    return { activeCount, totalDeliveries, completedDeliveries };
  }
}
