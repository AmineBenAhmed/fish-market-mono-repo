import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SellerVerificationStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async updateVerification(userId: string, status: 'APPROVED' | 'REJECTED') {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
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
      where: { userId },
      data: updateData,
    });

    return updated;
  }
}
