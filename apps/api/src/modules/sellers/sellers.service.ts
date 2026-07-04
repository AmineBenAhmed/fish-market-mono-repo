import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SellerVerificationStatus } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCreateSellerDto } from './dto/admin-create-seller.dto';
import { AdminUpdateSellerDto } from './dto/admin-update-seller.dto';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

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

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId: dto.userId,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
        commissionRate: dto.commissionRate ?? 0,
        deliveryRadius: dto.deliveryRadius ?? 10,
        preparationTime: dto.preparationTime ?? 30,
        city: dto.city,
        state: dto.state,
        lat: dto.lat,
        lng: dto.lng,
        pickupAddress: dto.pickupAddress,
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
    if (dto.pickupAddress !== undefined) data.pickupAddress = dto.pickupAddress;
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

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
        city: dto.city,
        state: dto.state,
        preparationTime: dto.preparationTime,
        deliveryRadius: dto.deliveryRadius,
        lat: dto.lat,
        lng: dto.lng,
        pickupAddress: dto.pickupAddress,
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
      orderBy: { createdAt: 'desc' },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return this.prisma.sellerProfile.update({
      where: { id: profile.id },
      data: {
        ...(dto.storeName !== undefined && { storeName: dto.storeName }),
        ...(dto.storeDescription !== undefined && { storeDescription: dto.storeDescription }),
        ...(dto.deliveryRadius !== undefined && { deliveryRadius: dto.deliveryRadius }),
        ...(dto.preparationTime !== undefined && { preparationTime: dto.preparationTime }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.pickupAddress !== undefined && { pickupAddress: dto.pickupAddress }),
        ...(dto.businessName !== undefined && { businessName: dto.businessName }),
        ...(dto.businessDoc !== undefined && { businessDoc: dto.businessDoc }),
        ...(dto.taxId !== undefined && { taxId: dto.taxId }),
        ...(dto.photo !== undefined && { photo: dto.photo }),
        ...(dto.registrationNumber !== undefined && { registrationNumber: dto.registrationNumber }),
      },
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
