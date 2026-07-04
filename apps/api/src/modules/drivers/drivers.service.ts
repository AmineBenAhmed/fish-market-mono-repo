import * as crypto from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, Prisma } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCreateDriverDto } from './dto/admin-create-driver.dto';
import { AdminUpdateDriverDto } from './dto/admin-update-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async adminCreate(dto: AdminCreateDriverDto) {
    let userId = dto.userId;

    if (!userId) {
      if (!dto.name) {
        throw new BadRequestException('Either userId or name must be provided');
      }
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: `${dto.name?.replace(/\s+/g, '.').toLowerCase()}.${crypto.randomUUID().slice(0, 6)}@driver.fishmarket.local`,
          passwordHash: crypto.randomUUID(),
          role: 'DRIVER',
          status: 'ACTIVE',
        },
      });
      userId = user.id;
    }

    const existing = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new BadRequestException('User already has a driver profile');
    }

    const profile = await this.prisma.driverProfile.create({
      data: {
        userId,
        city: dto.city,
        state: dto.state,
        vehicleType: dto.vehicleType,
        status: dto.status ?? DriverStatus.OFFLINE,
        idCardNumber: dto.idCardNumber,
        idCardPhoto: dto.idCardPhoto,
        phone2: dto.phone2,
        workingZone: dto.workingZone,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, role: true, status: true },
        },
        zone: { select: { id: true, name: true } },
      },
    });

    if (dto.name || dto.phone) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.phone && { phone: dto.phone }),
        },
      });
    }

    return profile;
  }

  async findAll(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    const where: Prisma.DriverProfileWhereInput = {};

    if (filters.status) {
      where.status = filters.status as DriverStatus;
    }
    if (filters.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' as const } } },
      ];
    }

    const { page, limit, skip } = parsePagination(filters.page, filters.limit);

    const [data, total] = await Promise.all([
      this.prisma.driverProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, role: true, status: true },
          },
          zone: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.driverProfile.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async getProfile(id: string) {
    const profile = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { zone: true },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return profile;
  }

  async updateProfile(id: string, dto: UpdateDriverDto) {
    const profile = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.driverProfile.update({
      where: { id: profile.id },
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

  async setOnlineStatus(id: string, status: 'ONLINE' | 'OFFLINE') {
    const profile = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.driverProfile.update({
      where: { id: profile.id },
      data: {
        status: status as DriverStatus,
        isAvailable: status === 'ONLINE',
      },
    });
  }

  async adminUpdateStatus(id: string, status: 'ONLINE' | 'OFFLINE', adminId: string) {
    const profile = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: { select: { name: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    const updated = await this.prisma.driverProfile.update({
      where: { id: profile.id },
      data: {
        status: status as DriverStatus,
        isAvailable: status === 'ONLINE',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE',
        entity: 'Driver',
        entityId: profile.id,
        oldValue: { status: profile.status },
        newValue: { status },
      },
    });

    return updated;
  }

  async adminUpdateProfile(id: string, dto: AdminUpdateDriverDto, adminId: string) {
    const profile = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!profile) throw new NotFoundException('Driver profile not found');

    const oldValue: Record<string, unknown> = {};

    const data: Record<string, unknown> = {};
    if (dto.city !== undefined) {
      oldValue.city = profile.city;
      data.city = dto.city;
    }
    if (dto.state !== undefined) {
      oldValue.state = profile.state;
      data.state = dto.state;
    }
    if (dto.vehicleType !== undefined) {
      oldValue.vehicleType = profile.vehicleType;
      data.vehicleType = dto.vehicleType;
    }
    if (dto.status !== undefined) {
      oldValue.status = profile.status;
      data.status = dto.status;
      data.isAvailable = dto.status === 'ONLINE';
    }
    if (dto.isAvailable !== undefined) {
      oldValue.isAvailable = profile.isAvailable;
      data.isAvailable = dto.isAvailable;
    }
    if (dto.idCardNumber !== undefined) {
      oldValue.idCardNumber = profile.idCardNumber;
      data.idCardNumber = dto.idCardNumber;
    }
    if (dto.idCardPhoto !== undefined) {
      oldValue.idCardPhoto = profile.idCardPhoto;
      data.idCardPhoto = dto.idCardPhoto;
    }
    if (dto.phone2 !== undefined) {
      oldValue.phone2 = profile.phone2;
      data.phone2 = dto.phone2;
    }
    if (dto.workingZone !== undefined) {
      oldValue.workingZone = profile.workingZone;
      data.workingZone = dto.workingZone;
    }
    if (dto.deliveryZoneId !== undefined) {
      oldValue.deliveryZoneId = profile.deliveryZoneId;
      data.deliveryZoneId = dto.deliveryZoneId;
    }
    if (dto.vehiclePlate !== undefined) {
      oldValue.vehiclePlate = profile.vehiclePlate;
      data.vehiclePlate = dto.vehiclePlate;
    }
    if (dto.licenseNumber !== undefined) {
      oldValue.licenseNumber = profile.licenseNumber;
      data.licenseNumber = dto.licenseNumber;
    }
    if (dto.maxLoadKg !== undefined) {
      oldValue.maxLoadKg = profile.maxLoadKg;
      data.maxLoadKg = dto.maxLoadKg;
    }

    const updated = await this.prisma.driverProfile.update({
      where: { id: profile.id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, role: true, status: true },
        },
        zone: { select: { id: true, name: true } },
      },
    });

    if (dto.name || dto.phone) {
      await this.prisma.user.update({
        where: { id: profile.userId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.phone && { phone: dto.phone }),
        },
      });
    }

    const newValue: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      newValue[key] = (updated as any)[key];
    }
    if (dto.name) newValue.name = dto.name;
    if (dto.phone) newValue.phone = dto.phone;

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE',
        entity: 'Driver',
        entityId: profile.id,
        oldValue: Object.keys(oldValue).length > 0 ? (oldValue as any) : undefined,
        newValue: Object.keys(newValue).length > 0 ? (newValue as any) : undefined,
      },
    });

    return updated;
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

  async getAuditLogs(id: string) {
    const profile = await this.prisma.driverProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      select: { id: true, userId: true },
    });

    if (!profile) throw new NotFoundException('Driver profile not found');

    return this.prisma.auditLog.findMany({
      where: {
        entity: 'Driver',
        entityId: profile.id,
      },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
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
