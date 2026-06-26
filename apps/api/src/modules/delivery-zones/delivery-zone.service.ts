import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';

@Injectable()
export class DeliveryZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeliveryZoneDto) {
    const { polygon, ...rest } = dto;
    return this.prisma.deliveryZone.create({
      data: {
        ...rest,
        polygon: polygon as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.deliveryZone.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const zone = await this.prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Delivery zone not found');
    return zone;
  }

  async update(id: string, dto: UpdateDeliveryZoneDto) {
    await this.findOne(id);
    const { polygon, ...rest } = dto;
    return this.prisma.deliveryZone.update({
      where: { id },
      data: {
        ...rest,
        ...(polygon !== undefined && { polygon: polygon as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deliveryZone.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getZoneDrivers(zoneId: string) {
    return this.prisma.driverProfile.findMany({
      where: { deliveryZoneId: zoneId, status: 'ONLINE', isAvailable: true },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
