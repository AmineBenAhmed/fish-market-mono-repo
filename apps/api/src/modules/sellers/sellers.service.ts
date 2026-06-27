import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    const existing = await this.prisma.sellerProfile.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new ConflictException('User already has a seller profile');
    }

    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: 'SELLER' },
    });

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId: dto.userId,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
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
        verificationStatus: 'PENDING',
        isActive: false,
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

    return this.prisma.sellerProfile.update({
      where: { id },
      data: {
        ...(dto.storeName !== undefined && { storeName: dto.storeName }),
        ...(dto.storeDescription !== undefined && { storeDescription: dto.storeDescription }),
        ...(dto.deliveryRadius !== undefined && { deliveryRadius: dto.deliveryRadius }),
        ...(dto.preparationTime !== undefined && { preparationTime: dto.preparationTime }),
        ...(dto.pickupAddress !== undefined && { pickupAddress: dto.pickupAddress }),
        ...(dto.businessName !== undefined && { businessName: dto.businessName }),
        ...(dto.businessDoc !== undefined && { businessDoc: dto.businessDoc }),
        ...(dto.taxId !== undefined && { taxId: dto.taxId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async apply(userId: string, dto: ApplySellerDto) {
    const existing = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      if (existing.verificationStatus === 'PENDING') {
        throw new ConflictException('Seller application already pending');
      }
      if (existing.verificationStatus === 'APPROVED') {
        throw new ConflictException('Already registered as a seller');
      }
      if (existing.verificationStatus === 'REJECTED') {
        await this.prisma.sellerProfile.update({
          where: { userId },
          data: {
            verificationStatus: 'PENDING',
            isActive: false,
            ...dto,
          },
        });

        return this.prisma.sellerProfile.findUnique({
          where: { userId },
        });
      }
    }

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
        lat: dto.lat,
        lng: dto.lng,
        pickupAddress: dto.pickupAddress,
        businessName: dto.businessName,
        businessDoc: dto.businessDoc,
        taxId: dto.taxId,
        verificationStatus: 'PENDING',
        isActive: false,
      },
    });

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateSellerDto) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return this.prisma.sellerProfile.update({
      where: { userId },
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
      },
    });
  }

  async updateVerification(id: string, status: 'APPROVED' | 'REJECTED') {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const updateData: Record<string, unknown> = {
      verificationStatus: status as SellerVerificationStatus,
    };

    if (status === 'APPROVED') {
      updateData.isActive = true;
    }

    const updated = await this.prisma.sellerProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    return updated;
  }
}
