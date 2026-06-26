import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLocation(driverId: string, lat: number, lng: number) {
    await this.prisma.driverProfile.update({
      where: { userId: driverId },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationAt: new Date(),
      },
    });

    return { lat, lng, updatedAt: new Date() };
  }

  async getDriverLocation(driverId: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { userId: driverId },
      select: {
        currentLat: true,
        currentLng: true,
        lastLocationAt: true,
      },
    });

    if (!driver || (!driver.currentLat && !driver.currentLng)) {
      return null;
    }

    return {
      lat: driver.currentLat,
      lng: driver.currentLng,
      updatedAt: driver.lastLocationAt,
    };
  }

  async getDeliveryProgress(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        status: true,
        pickedUpAt: true,
        deliveredAt: true,
        failedAt: true,
        driverId: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          select: {
            fromStatus: true,
            toStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!delivery) return null;

    let driverLocation = null;
    if (delivery.driverId) {
      driverLocation = await this.getDriverLocation(delivery.driverId);
    }

    return { ...delivery, driverLocation };
  }
}
