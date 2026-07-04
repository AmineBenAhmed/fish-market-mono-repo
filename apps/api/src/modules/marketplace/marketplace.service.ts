import * as crypto from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';

interface FindTodayParams {
  city?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
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

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { category: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
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
      orderBy.push({ title: params.sortOrder || 'asc' });
    } else {
      orderBy.push({ createdAt: params.sortOrder || 'desc' });
    }

    const { page, limit, skip } = parsePagination(params.page, params.limit);

    const [data, total] = await Promise.all([
      this.prisma.sellerListing.findMany({
        where,
        include: {
          category: true,
          variant: true,
          seller: {
            select: {
              id: true,
              storeName: true,
              city: true,
              state: true,
              photo: true,
              storeLogoUrl: true,
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

  async findAllListings(params: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.SellerListingWhereInput = {
      status: 'ACTIVE',
      quantity: { gt: 0 },
    };

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { category: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }

    const { page, limit, skip } = parsePagination(params.page, params.limit);

    const [data, total] = await Promise.all([
      this.prisma.sellerListing.findMany({
        where,
        include: {
          category: true,
          variant: true,
          seller: {
            select: {
              id: true,
              storeName: true,
              city: true,
              state: true,
              photo: true,
              storeLogoUrl: true,
            },
          },
          images: {
            include: { file: true },
            orderBy: { sortOrder: 'asc' as const },
          },
          coverImage: true,
        },
        orderBy: { createdAt: 'desc' },
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

  async findOneListing(listingId: string) {
    const listing = await this.prisma.sellerListing.findFirst({
      where: { id: listingId, status: 'ACTIVE', quantity: { gt: 0 } },
      include: {
        category: true,
        variant: true,
        seller: {
          select: {
            id: true,
            storeName: true,
            city: true,
            state: true,
          },
        },
        images: {
          include: { file: true },
          orderBy: { sortOrder: 'asc' as const },
        },
        coverImage: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async createOrder(dto: CreateOrderDto) {
    const { items, customerName, customerPhone, customerAddress } = dto;

    if (items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const listingIds = items.map((i) => i.listingId);
    const listings = await this.prisma.sellerListing.findMany({
      where: { id: { in: listingIds } },
      include: {
        category: { select: { id: true, name: true } },
        variant: { select: { id: true, name: true, unit: true } },
        seller: { select: { id: true, user: { select: { id: true } } } },
      },
    });

    const listingMap = new Map(listings.map((l) => [l.id, l]));

    for (const item of items) {
      const listing = listingMap.get(item.listingId);
      if (!listing) {
        throw new BadRequestException(`Listing ${item.listingId} not found`);
      }
      if (listing.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Listing "${listing.title ?? listing.category.name}" is not active`,
        );
      }
      if (listing.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${listing.title ?? listing.category.name}"`,
        );
      }
    }

    const guestEmail = `guest-${crypto.randomUUID().slice(0, 8)}@fishmarket.app`;

    const guestUser = await this.prisma.user.create({
      data: {
        email: guestEmail,
        passwordHash: crypto.randomUUID(),
        name: customerName,
        phone: customerPhone,
        role: 'CUSTOMER',
      },
    });

    await this.prisma.userAddress.create({
      data: {
        userId: guestUser.id,
        label: 'Guest Address',
        street: customerAddress,
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
    });

    const groupedBySeller = new Map<string, typeof items>();
    for (const item of items) {
      const listing = listingMap.get(item.listingId)!;
      const sellerId = listing.seller.user.id;
      if (!groupedBySeller.has(sellerId)) {
        groupedBySeller.set(sellerId, []);
      }
      groupedBySeller.get(sellerId)!.push(item);
    }

    const orderNumber = this.generateOrderNumber();

    const result = await this.prisma.$transaction(async (tx) => {
      const sellerOrders: {
        data: Prisma.OrderCreateInput;
        items: typeof items;
      }[] = [];

      const sellerIds = Array.from(groupedBySeller.keys());
      const profiles = await tx.sellerProfile.findMany({
        where: { userId: { in: sellerIds } },
        select: { userId: true, commissionRate: true },
      });
      const commissionMap = new Map(profiles.map((p) => [p.userId, p.commissionRate]));

      for (const [sellerId, sellerItems] of groupedBySeller) {
        const subtotal = sellerItems.reduce((sum, i) => {
          const listing = listingMap.get(i.listingId)!;
          const unitPrice =
            Number(listing.price) + (i.cleaning ? Number(listing.cleaningCost ?? 0) : 0);
          return sum + unitPrice * i.quantity;
        }, 0);
        const commissionRate = commissionMap.get(sellerId) ?? 0.12;
        const commission = subtotal * commissionRate;
        const total = subtotal + commission;

        sellerOrders.push({
          data: {
            orderNumber: `${orderNumber}-S${sellerOrders.length + 1}`,
            customer: { connect: { id: guestUser.id } },
            seller: { connect: { id: sellerId } },
            status: OrderStatus.DRAFT,
            subtotal,
            deliveryFee: 0,
            commission,
            discount: 0,
            total,
          },
          items: sellerItems,
        });
      }

      let parentOrderId: string | null = null;

      if (sellerOrders.length > 1) {
        const parentTotal = sellerOrders.reduce((sum, so) => sum + (so.data.total as number), 0);

        const parent = await tx.order.create({
          data: {
            orderNumber,
            customer: { connect: { id: guestUser.id } },
            status: OrderStatus.DRAFT,
            subtotal: parentTotal,
            deliveryFee: 0,
            commission: 0,
            discount: 0,
            total: parentTotal,
          },
        });
        parentOrderId = parent.id;

        for (const so of sellerOrders) {
          so.data.parentOrder = { connect: { id: parent.id } };
        }
      }

      const createdOrders: any[] = [];

      for (const so of sellerOrders) {
        const created = await tx.order.create({ data: so.data });

        for (const cartItem of so.items) {
          const listing = listingMap.get(cartItem.listingId)!;
          await tx.sellerListing.update({
            where: { id: cartItem.listingId },
            data: { quantity: { decrement: cartItem.quantity } },
          });

          const cleaningCost = cartItem.cleaning ? Number(listing.cleaningCost ?? 0) : 0;
          const effectiveUnitPrice = Number(listing.price) + cleaningCost;

          const itemData = {
            orderId: created.id,
            listingId: cartItem.listingId,
            variantId: listing.variant?.id ?? undefined,
            sellerId: listing.seller.id,
            productName: listing.title ?? listing.category.name,
            variantName: listing.variant?.name ?? 'Standard',
            quantity: cartItem.quantity,
            unit: (listing.variant?.unit ?? 'KG') as any,
            unitPrice: effectiveUnitPrice,
            totalPrice: effectiveUnitPrice * cartItem.quantity,
            cleaning: cartItem.cleaning ?? false,
          };

          await tx.orderItem.create({ data: itemData });
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: created.id,
            toStatus: OrderStatus.DRAFT,
            reason: 'Order created by guest',
          },
        });

        createdOrders.push(created);
      }

      return { parentOrderId, childOrders: createdOrders };
    });

    return {
      message: 'Order created successfully',
      orderNumber,
      customerName,
    };
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase();
    return `FM-${datePart}-${suffix}`;
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

    const listings = await this.prisma.sellerListing.findMany({
      where: {
        sellerId: sellerProfileId,
        status: 'ACTIVE',
      },
      include: {
        category: true,
        variant: true,
        coverImage: true,
        seller: {
          select: {
            id: true,
            storeName: true,
            city: true,
            state: true,
            photo: true,
            storeLogoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { seller, listings };
  }
}
