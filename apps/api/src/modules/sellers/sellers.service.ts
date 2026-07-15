import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SellerVerificationStatus } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCreateSellerDto } from './dto/admin-create-seller.dto';
import { AdminUpdateSellerDto } from './dto/admin-update-seller.dto';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { getGovernorateById, getAreaById } from '../locations/locations.data';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    const where: Prisma.SellerProfileWhereInput = {};

    if (filters.status) {
      where.verificationStatus = filters.status as SellerVerificationStatus;
    }
    if (filters.search) {
      where.OR = [
        { storeName: { contains: filters.search, mode: 'insensitive' as const } },
        { user: { name: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' as const } } },
      ];
    }

    const { page, limit, skip } = parsePagination(filters.page, filters.limit);

    const [data, total] = await Promise.all([
      this.prisma.sellerProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true, phone: true, role: true, status: true },
          },
          address: {
            include: { governorate: true, area: true, zone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sellerProfile.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            status: true,
          },
        },
        address: {
          include: { governorate: true, area: true, zone: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return profile;
  }

  async adminCreate(dto: AdminCreateSellerDto) {
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: 'SELLER' },
    });

    const parts: string[] = [];
    if (dto.street) parts.push(dto.street);
    if (dto.floor) parts.push(`Floor ${dto.floor}`);
    if (dto.apartment) parts.push(`Room ${dto.apartment}`);
    if (dto.buildingNumber) parts.push(`Building ${dto.buildingNumber}`);
    const addressLine = parts.join(', ');

    const address = await this.prisma.address.create({
      data: {
        governorateId: dto.governorateId,
        areaId: dto.areaId,
        zoneId: dto.zoneId,
        addressLine,
        nearestReference: dto.landmark || null,
      },
    });

    const [area, governorate] = await Promise.all([
      this.prisma.area.findUnique({ where: { id: dto.areaId } }),
      this.prisma.governorate.findUnique({ where: { id: dto.governorateId } }),
    ]);

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId: dto.userId,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
        commissionRate: dto.commissionRate ?? 0,
        deliveryRadius: dto.deliveryRadius ?? 10,
        preparationTime: dto.preparationTime ?? 30,
        city: area?.name ?? dto.areaId,
        state: governorate?.name ?? dto.governorateId,
        addressId: address.id,
        lat: dto.lat,
        lng: dto.lng,
        businessName: dto.businessName,
        businessDoc: dto.businessDoc,
        taxId: dto.taxId,
        photo: dto.photo,
        registrationNumber: dto.registrationNumber,
        storeLogoUrl: dto.storeLogoUrl,
        verificationStatus: 'APPROVED',
        isActive: true,
      },
    });

    return profile;
  }

  async adminUpdate(id: string, dto: AdminUpdateSellerDto) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const data: Record<string, unknown> = {};

    if (dto.storeName !== undefined) data.storeName = dto.storeName;
    if (dto.storeDescription !== undefined) data.storeDescription = dto.storeDescription;
    if (dto.commissionRate !== undefined) data.commissionRate = dto.commissionRate;
    if (dto.deliveryRadius !== undefined) data.deliveryRadius = dto.deliveryRadius;
    if (dto.preparationTime !== undefined) data.preparationTime = dto.preparationTime;

    const hasAddressChanges =
      dto.governorateId !== undefined ||
      dto.areaId !== undefined ||
      dto.zoneId !== undefined ||
      dto.street !== undefined ||
      dto.buildingNumber !== undefined ||
      dto.floor !== undefined ||
      dto.apartment !== undefined ||
      dto.landmark !== undefined;

    if (hasAddressChanges) {
      const existing = profile.address;
      const govId = dto.governorateId ?? existing?.governorateId ?? '';
      const areaId = dto.areaId ?? existing?.areaId ?? '';
      const zoneId = dto.zoneId ?? existing?.zoneId ?? '';

      const existingParts = existing?.addressLine?.split(', ') || [];
      const existingStreet =
        existingParts.find(
          (p) => !p.startsWith('Floor ') && !p.startsWith('Room ') && !p.startsWith('Building '),
        ) || '';
      const existingFloor =
        existingParts.find((p) => p.startsWith('Floor '))?.replace('Floor ', '') || '';
      const existingRoom =
        existingParts.find((p) => p.startsWith('Room '))?.replace('Room ', '') || '';
      const existingBuilding =
        existingParts.find((p) => p.startsWith('Building '))?.replace('Building ', '') || '';

      const newParts: string[] = [];
      const newStreet = dto.street ?? existingStreet;
      if (newStreet) newParts.push(newStreet);
      const newFloor = dto.floor ?? existingFloor;
      if (newFloor) newParts.push(`Floor ${newFloor}`);
      const newRoom = dto.apartment ?? existingRoom;
      if (newRoom) newParts.push(`Room ${newRoom}`);
      const newBuilding = dto.buildingNumber ?? existingBuilding;
      if (newBuilding) newParts.push(`Building ${newBuilding}`);
      const addressLine = newParts.join(', ');

      const newAddress = await this.prisma.address.create({
        data: {
          governorateId: govId,
          areaId,
          zoneId,
          addressLine,
          nearestReference: dto.landmark ?? existing?.nearestReference ?? null,
        },
      });

      data.addressId = newAddress.id;

      const [area, governorate] = await Promise.all([
        this.prisma.area.findUnique({ where: { id: areaId } }),
        this.prisma.governorate.findUnique({ where: { id: govId } }),
      ]);
      data.city = area?.name ?? areaId;
      data.state = governorate?.name ?? govId;
    }

    if (dto.lat !== undefined) data.lat = dto.lat;
    if (dto.lng !== undefined) data.lng = dto.lng;
    if (dto.businessName !== undefined) data.businessName = dto.businessName;
    if (dto.businessDoc !== undefined) data.businessDoc = dto.businessDoc;
    if (dto.taxId !== undefined) data.taxId = dto.taxId;
    if (dto.photo !== undefined) data.photo = dto.photo;
    if (dto.registrationNumber !== undefined) data.registrationNumber = dto.registrationNumber;
    if (dto.storeLogoUrl !== undefined) data.storeLogoUrl = dto.storeLogoUrl;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.verificationStatus !== undefined) {
      data.verificationStatus = dto.verificationStatus as SellerVerificationStatus;
      if (dto.verificationStatus === 'APPROVED') {
        data.isActive = true;
      } else if (dto.verificationStatus === 'SUSPENDED' || dto.verificationStatus === 'REJECTED') {
        data.isActive = false;
      }
    }

    return this.prisma.sellerProfile.update({
      where: { id },
      data,
    });
  }

  async apply(userId: string, dto: ApplySellerDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'SELLER' },
    });

    const parts: string[] = [];
    if (dto.street) parts.push(dto.street);
    if (dto.floor) parts.push(`Floor ${dto.floor}`);
    if (dto.apartment) parts.push(`Room ${dto.apartment}`);
    if (dto.buildingNumber) parts.push(`Building ${dto.buildingNumber}`);
    const addressLine = parts.join(', ');

    const address = await this.prisma.address.create({
      data: {
        governorateId: dto.governorateId,
        areaId: dto.areaId,
        zoneId: dto.zoneId,
        addressLine,
        nearestReference: dto.landmark || null,
      },
    });

    const [area, governorate] = await Promise.all([
      this.prisma.area.findUnique({ where: { id: dto.areaId } }),
      this.prisma.governorate.findUnique({ where: { id: dto.governorateId } }),
    ]);

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
        addressId: address.id,
        city: area?.name ?? dto.areaId,
        state: governorate?.name ?? dto.governorateId,
        preparationTime: dto.preparationTime,
        deliveryRadius: dto.deliveryRadius,
        lat: dto.lat,
        lng: dto.lng,
        businessName: dto.businessName,
        businessDoc: dto.businessDoc,
        taxId: dto.taxId,
        photo: dto.photo,
        verificationStatus: 'PENDING',
        isActive: false,
      },
    });

    return profile;
  }

  async findByUserId(userId: string) {
    return this.prisma.sellerProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateSellerDto) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: { userId },
      include: { address: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const data: Record<string, unknown> = {};

    if (dto.storeName !== undefined) data.storeName = dto.storeName;
    if (dto.storeDescription !== undefined) data.storeDescription = dto.storeDescription;
    if (dto.deliveryRadius !== undefined) data.deliveryRadius = dto.deliveryRadius;
    if (dto.preparationTime !== undefined) data.preparationTime = dto.preparationTime;

    const hasAddressChanges =
      dto.governorateId !== undefined ||
      dto.areaId !== undefined ||
      dto.zoneId !== undefined ||
      dto.street !== undefined ||
      dto.buildingNumber !== undefined ||
      dto.floor !== undefined ||
      dto.apartment !== undefined ||
      dto.landmark !== undefined;

    if (hasAddressChanges) {
      const existing = profile.address;
      const govId = dto.governorateId ?? existing?.governorateId ?? '';
      const areaId = dto.areaId ?? existing?.areaId ?? '';
      const zoneId = dto.zoneId ?? existing?.zoneId ?? '';

      const existingParts = existing?.addressLine?.split(', ') || [];
      const existingStreet =
        existingParts.find(
          (p) => !p.startsWith('Floor ') && !p.startsWith('Room ') && !p.startsWith('Building '),
        ) || '';
      const existingFloor =
        existingParts.find((p) => p.startsWith('Floor '))?.replace('Floor ', '') || '';
      const existingRoom =
        existingParts.find((p) => p.startsWith('Room '))?.replace('Room ', '') || '';
      const existingBuilding =
        existingParts.find((p) => p.startsWith('Building '))?.replace('Building ', '') || '';

      const newParts: string[] = [];
      const newStreet = dto.street ?? existingStreet;
      if (newStreet) newParts.push(newStreet);
      const newFloor = dto.floor ?? existingFloor;
      if (newFloor) newParts.push(`Floor ${newFloor}`);
      const newRoom = dto.apartment ?? existingRoom;
      if (newRoom) newParts.push(`Room ${newRoom}`);
      const newBuilding = dto.buildingNumber ?? existingBuilding;
      if (newBuilding) newParts.push(`Building ${newBuilding}`);
      const addressLine = newParts.join(', ');

      const newAddress = await this.prisma.address.create({
        data: {
          governorateId: govId,
          areaId,
          zoneId,
          addressLine,
          nearestReference: dto.landmark ?? existing?.nearestReference ?? null,
        },
      });

      data.addressId = newAddress.id;

      const [area, governorate] = await Promise.all([
        this.prisma.area.findUnique({ where: { id: areaId } }),
        this.prisma.governorate.findUnique({ where: { id: govId } }),
      ]);
      data.city = area?.name ?? areaId;
      data.state = governorate?.name ?? govId;
    }

    if (dto.lat !== undefined) data.lat = dto.lat;
    if (dto.lng !== undefined) data.lng = dto.lng;
    if (dto.businessName !== undefined) data.businessName = dto.businessName;
    if (dto.businessDoc !== undefined) data.businessDoc = dto.businessDoc;
    if (dto.taxId !== undefined) data.taxId = dto.taxId;
    if (dto.photo !== undefined) data.photo = dto.photo;

    return this.prisma.sellerProfile.update({
      where: { id: profile.id },
      data,
    });
  }

  async updateVerification(id: string, status: SellerVerificationStatus) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const updateData: Record<string, unknown> = {
      verificationStatus: status,
    };

    if (status === 'APPROVED') {
      updateData.isActive = true;
    } else if (status === 'SUSPENDED' || status === 'REJECTED') {
      updateData.isActive = false;
    }

    const updated = await this.prisma.sellerProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    return updated;
  }
}
