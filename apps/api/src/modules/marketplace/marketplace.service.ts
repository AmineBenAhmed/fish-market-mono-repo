import { Injectable, NotFoundException } from '@nestjs/common';
import { Preservation, Prisma, QualityGrade } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';

interface FindTodayParams {
  city?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  qualityGrade?: string;
  preservation?: string;
  sortBy?: 'price' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findToday(params: FindTodayParams = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Prisma.SellerListingWhereInput = {
      date: today,
      status: 'ACTIVE',
      quantity: { gt: 0 },
    };

    if (params.city) {
      where.seller = {
        city: { contains: params.city, mode: 'insensitive' },
      };
    }

    const productFilter: Prisma.FishProductWhereInput = {};

    if (params.categoryId) {
      productFilter.categoryId = params.categoryId;
    }

    if (params.search) {
      productFilter.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.qualityGrade) {
      productFilter.qualityGrade = params.qualityGrade as QualityGrade;
    }

    if (params.preservation) {
      productFilter.preservation = params.preservation as Preservation;
    }

    if (Object.keys(productFilter).length > 0) {
      where.product = productFilter;
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }

    const orderBy: Prisma.SellerListingOrderByWithRelationInput[] = [];

    if (params.sortBy === 'price') {
      orderBy.push({ price: params.sortOrder || 'asc' });
    } else if (params.sortBy === 'name') {
      orderBy.push({ product: { name: params.sortOrder || 'asc' } });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    const { page, limit, skip } = parsePagination(params.page, params.limit);

    const [data, total] = await Promise.all([
      this.prisma.sellerListing.findMany({
        where,
        include: {
          product: {
            include: {
              category: true,
              variants: true,
            },
          },
          variant: true,
          seller: {
            select: {
              id: true,
              storeName: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.sellerListing.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async search(q: string) {
    return this.prisma.fishProduct.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
        variants: true,
      },
      take: 20,
    });
  }

  async findBySeller(sellerProfileId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
      select: {
        id: true,
        storeName: true,
        city: true,
        state: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const listings = await this.prisma.sellerListing.findMany({
      where: {
        sellerId: sellerProfileId,
        date: today,
        status: 'ACTIVE',
        quantity: { gt: 0 },
      },
      include: {
        product: { include: { category: true } },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { seller, listings };
  }
}
