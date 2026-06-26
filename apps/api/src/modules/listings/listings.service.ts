import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateListingDto) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.isActive) {
      throw new BadRequestException('Seller profile is not active');
    }

    const listingDate = new Date(dto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (listingDate < today) {
      throw new BadRequestException('Cannot create listings for past dates');
    }

    const variant = await this.prisma.fishVariant.findUnique({
      where: { id: dto.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    const product = await this.prisma.fishProduct.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found or inactive');
    }

    const existing = await this.prisma.sellerListing.findUnique({
      where: {
        variantId_sellerId_date: {
          variantId: dto.variantId,
          sellerId: profile.id,
          date: listingDate,
        },
      },
    });

    if (existing) {
      return this.prisma.sellerListing.update({
        where: { id: existing.id },
        data: {
          price: dto.price,
          quantity: dto.quantity,
          notes: dto.notes,
          status: 'ACTIVE',
        },
        include: { product: true, variant: true },
      });
    }

    return this.prisma.sellerListing.create({
      data: {
        sellerId: profile.id,
        productId: dto.productId,
        variantId: dto.variantId,
        date: listingDate,
        price: dto.price,
        quantity: dto.quantity,
        notes: dto.notes,
      },
      include: { product: true, variant: true },
    });
  }

  async findToday(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.expireOldListings();

    return this.prisma.sellerListing.findMany({
      where: {
        sellerId: profile.id,
        date: today,
        status: { not: 'EXPIRED' },
      },
      include: {
        product: { include: { category: true } },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findHistory(userId: string, pagination: { page: number; limit: number }) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      this.prisma.sellerListing.findMany({
        where: { sellerId: profile.id },
        include: {
          product: { include: { category: true } },
          variant: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: pagination.limit,
      }),
      this.prisma.sellerListing.count({
        where: { sellerId: profile.id },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
        hasNextPage: skip + pagination.limit < total,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async update(userId: string, listingId: string, dto: UpdateListingDto) {
    const listing = await this.findOwned(userId, listingId);

    if (dto.status === 'EXPIRED' || listing.status === 'EXPIRED') {
      throw new BadRequestException('Cannot modify expired listing');
    }

    if (dto.quantity !== undefined && dto.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    return this.prisma.sellerListing.update({
      where: { id: listingId },
      data: {
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: { product: true, variant: true },
    });
  }

  async remove(userId: string, listingId: string): Promise<void> {
    await this.findOwned(userId, listingId);

    await this.prisma.sellerListing.delete({
      where: { id: listingId },
    });
  }

  async reduceStock(userId: string, listingId: string, quantity: number) {
    const listing = await this.findOwned(userId, listingId);

    if (listing.status === 'EXPIRED') {
      throw new BadRequestException('Cannot modify expired listing');
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    if (quantity > listing.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const newQuantity = listing.quantity - quantity;
    const newStatus = newQuantity === 0 ? 'OUT_OF_STOCK' : listing.status;

    return this.prisma.sellerListing.update({
      where: { id: listingId },
      data: {
        quantity: newQuantity,
        ...(newStatus === 'OUT_OF_STOCK' && { status: 'OUT_OF_STOCK' }),
      },
      include: { product: true, variant: true },
    });
  }

  async expireOldListings(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.sellerListing.updateMany({
      where: {
        date: { lt: today },
        status: { not: 'EXPIRED' },
      },
      data: { status: 'EXPIRED' },
    });
  }

  private async findOwned(userId: string, listingId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    const listing = await this.prisma.sellerListing.findFirst({
      where: { id: listingId, sellerId: profile?.id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }
}
