import { ListingStatus } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  private listingInclude = {
    category: true,
    variant: true,
    coverImage: true,
    images: {
      include: { file: true },
      orderBy: { sortOrder: 'asc' as const },
    },
    orderItems: {
      select: {
        quantity: true,
        totalPrice: true,
      },
    },
  };

  private adminListingInclude = {
    ...this.listingInclude,
    seller: {
      select: {
        id: true,
        storeName: true,
        city: true,
        state: true,
      },
    },
  };

  async findOneAdmin(listingId: string) {
    const listing = await this.prisma.sellerListing.findFirst({
      where: { id: listingId },
      include: {
        ...this.adminListingInclude,
        category: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const boughtTotal = listing.orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    const { orderItems, ...listingData } = listing;

    return {
      ...listingData,
      boughtTotal,
    };
  }

  async findAllAdmin(options: {
    storeName?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    limit: number;
    sortBy?: 'createdAt' | 'price';
    sortOrder?: 'asc' | 'desc';
  }) {
    const skip = (options.page - 1) * options.limit;

    const where: any = {};

    if (options.fromDate || options.toDate) {
      where.date = {};
      if (options.fromDate) where.date.gte = new Date(options.fromDate);
      if (options.toDate) where.date.lte = new Date(options.toDate);
    }

    if (options.storeName) {
      where.seller = {
        storeName: { contains: options.storeName, mode: 'insensitive' },
      };
    }

    const orderBy: any = {};
    if (options.sortBy === 'price') {
      orderBy.price = options.sortOrder ?? 'desc';
    } else {
      orderBy.createdAt = options.sortOrder ?? 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.sellerListing.findMany({
        where,
        include: this.adminListingInclude,
        orderBy,
        skip,
        take: options.limit,
      }),
      this.prisma.sellerListing.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
        hasNextPage: skip + options.limit < total,
        hasPreviousPage: options.page > 1,
      },
    };
  }

  async create(userId: string, dto: CreateListingDto) {
    const profile = dto.sellerId
      ? await this.prisma.sellerProfile.findFirst({
          where: { id: dto.sellerId, userId },
        })
      : await this.prisma.sellerProfile.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

    if (!profile || !profile.isActive) {
      throw new BadRequestException('Seller profile is not active');
    }

    const listingDate = new Date(dto.date);
    listingDate.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (listingDate < today) {
      throw new BadRequestException('Cannot create listings for past dates');
    }

    const category = await this.prisma.fishCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const coverImageId = dto.imageIds?.[0] ?? null;

    const listing = await this.prisma.sellerListing.create({
      data: {
        sellerId: profile.id,
        categoryId: dto.categoryId,
        variantId: dto.variantId ?? null,
        date: listingDate,
        price: dto.price,
        title: dto.title,
        description: dto.description,
        catchDate: dto.catchDate ? new Date(dto.catchDate) : null,
        availabilityDate: dto.availabilityDate ? new Date(dto.availabilityDate) : listingDate,
        origin: dto.origin,
        condition: dto.condition ?? 'FRESH',
        averageWeight: dto.averageWeight ?? null,
        cleaningCost: dto.cleaningCost ?? 0,
        unit: dto.unit,
        currency: dto.currency ?? 'TND',
        notes: dto.notes,
        coverImageId,
        status: 'ACTIVE',
        imageUrls: dto.cloudinaryUrls ?? [],
        images: dto.imageIds?.length
          ? {
              create: dto.imageIds.map((fileId, i) => ({
                fileId,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: this.listingInclude,
    });

    return listing;
  }

  async findAll(
    userId: string,
    options: {
      fromDate?: string;
      toDate?: string;
      category?: string;
      search?: string;
      page: number;
      limit: number;
      sortBy?: 'createdAt' | 'price';
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const skip = (options.page - 1) * options.limit;

    const where: any = {
      sellerId: profile.id,
    };

    if (options.fromDate || options.toDate) {
      where.date = {};
      if (options.fromDate) where.date.gte = new Date(options.fromDate);
      if (options.toDate) where.date.lte = new Date(options.toDate);
    }

    if (options.category) {
      where.category = { name: { contains: options.category, mode: 'insensitive' } };
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { notes: { contains: options.search, mode: 'insensitive' } },
        { origin: { contains: options.search, mode: 'insensitive' } },
        { category: { name: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = {};
    if (options.sortBy === 'price') {
      orderBy.price = options.sortOrder ?? 'desc';
    } else {
      orderBy.createdAt = options.sortOrder ?? 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.sellerListing.findMany({
        where,
        include: this.listingInclude,
        orderBy,
        skip,
        take: options.limit,
      }),
      this.prisma.sellerListing.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
        hasNextPage: skip + options.limit < total,
        hasPreviousPage: options.page > 1,
      },
    };
  }

  async findToday(userId: string, options?: { search?: string }) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await this.expireOldListings();

    const where: any = {
      sellerId: profile.id,
      date: today,
      status: { not: 'EXPIRED' },
    };

    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { category: { name: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.sellerListing.findMany({
      where,
      include: this.listingInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findYesterday(userId: string) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    const now = new Date();
    const yesterday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
    );

    return this.prisma.sellerListing.findMany({
      where: { sellerId: profile.id, date: yesterday },
      include: this.listingInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async duplicateYesterday(userId: string) {
    const yesterdayListings = await this.findYesterday(userId);

    if (!yesterdayListings.length) {
      throw new BadRequestException('No listings from yesterday to duplicate');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const created: any[] = [];

    for (const listing of yesterdayListings) {
      const existing = await this.prisma.sellerListing.findFirst({
        where: {
          sellerId: listing.sellerId,
          categoryId: listing.categoryId,
          variantId: listing.variantId,
          date: today,
        },
      });

      if (existing) continue;

      const dup = await this.prisma.sellerListing.create({
        data: {
          sellerId: listing.sellerId,
          categoryId: listing.categoryId,
          variantId: listing.variantId,
          date: today,
          price: listing.price,
          title: listing.title,
          description: listing.description,
          origin: listing.origin,
          condition: listing.condition,
          averageWeight: listing.averageWeight,
          cleaningCost: listing.cleaningCost,
          unit: listing.unit,
          currency: listing.currency,
          notes: listing.notes,
          status: 'PENDING',
        },
        include: this.listingInclude,
      });

      created.push(dup);
    }

    return created;
  }

  async findOne(userId: string, listingId: string) {
    const listing = await this.prisma.sellerListing.findFirst({
      where: { id: listingId },
      include: {
        ...this.listingInclude,
        category: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const boughtTotal = listing.orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    const { orderItems, ...listingData } = listing;

    return {
      ...listingData,
      boughtTotal,
    };
  }

  async update(userId: string, listingId: string, dto: UpdateListingDto) {
    const listing = await this.findOwned(userId, listingId);

    if (listing.status === 'EXPIRED') {
      throw new BadRequestException('Cannot modify expired listing');
    }

    const coverImageId = dto.imageIds?.[0] ?? undefined;

    if (dto.imageIds !== undefined) {
      await this.prisma.listingImage.deleteMany({ where: { listingId } });
    }

    return this.prisma.sellerListing.update({
      where: { id: listingId },
      data: {
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.catchDate !== undefined && { catchDate: new Date(dto.catchDate) }),
        ...(dto.availabilityDate !== undefined && {
          availabilityDate: new Date(dto.availabilityDate),
        }),
        ...(dto.origin !== undefined && { origin: dto.origin }),
        ...(dto.condition !== undefined && { condition: dto.condition }),
        ...(dto.averageWeight !== undefined && { averageWeight: dto.averageWeight }),
        ...(dto.cleaningCost !== undefined && { cleaningCost: dto.cleaningCost }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.imageIds !== undefined && { coverImageId: coverImageId ?? null }),
        ...(dto.imageIds !== undefined && dto.imageIds.length > 0
          ? { images: { create: dto.imageIds.map((fileId, i) => ({ fileId, sortOrder: i })) } }
          : {}),
        ...(dto.cloudinaryUrls !== undefined && { imageUrls: dto.cloudinaryUrls }),
      },
      include: this.listingInclude,
    });
  }

  async markSoldOut(userId: string, listingId: string) {
    const listing = await this.findOwned(userId, listingId);

    if (listing.status === 'EXPIRED') {
      throw new BadRequestException('Cannot modify expired listing');
    }

    return this.prisma.sellerListing.update({
      where: { id: listingId },
      data: { status: 'OUT_OF_STOCK' },
      include: this.listingInclude,
    });
  }

  async remove(userId: string, listingId: string): Promise<void> {
    await this.findOwned(userId, listingId);
    await this.prisma.sellerListing.delete({ where: { id: listingId } });
  }

  async adminCreate(dto: CreateListingDto) {
    const profile = dto.sellerId
      ? await this.prisma.sellerProfile.findUnique({
          where: { id: dto.sellerId },
        })
      : null;

    if (!profile || !profile.isActive) {
      throw new BadRequestException('Seller profile is not active');
    }

    const listingDate = new Date(dto.date);
    listingDate.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (listingDate < today) {
      throw new BadRequestException('Cannot create listings for past dates');
    }

    const category = await this.prisma.fishCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const coverImageId = dto.imageIds?.[0] ?? null;

    const listing = await this.prisma.sellerListing.create({
      data: {
        sellerId: profile.id,
        categoryId: dto.categoryId,
        variantId: dto.variantId ?? null,
        date: listingDate,
        price: dto.price,
        title: dto.title,
        description: dto.description,
        catchDate: dto.catchDate ? new Date(dto.catchDate) : null,
        availabilityDate: dto.availabilityDate ? new Date(dto.availabilityDate) : listingDate,
        origin: dto.origin,
        condition: dto.condition ?? 'FRESH',
        averageWeight: dto.averageWeight ?? null,
        cleaningCost: dto.cleaningCost ?? 0,
        unit: dto.unit,
        currency: dto.currency ?? 'TND',
        notes: dto.notes,
        coverImageId,
        status: 'ACTIVE',
        imageUrls: dto.cloudinaryUrls ?? [],
        images: dto.imageIds?.length
          ? {
              create: dto.imageIds.map((fileId, i) => ({
                fileId,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: this.adminListingInclude,
    });

    return listing;
  }

  async updateStatusAdmin(listingId: string, status: ListingStatus) {
    const listing = await this.prisma.sellerListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.sellerListing.update({
      where: { id: listingId },
      data: { status },
      include: this.listingInclude,
    });
  }

  async expireOldListings(): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await this.prisma.sellerListing.updateMany({
      where: { date: { lt: today }, status: { not: 'EXPIRED' } },
      data: { status: 'EXPIRED' },
    });
  }

  private async findOwned(userId: string, listingId: string) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
