import * as crypto from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus, Prisma } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { DeliveryPricingService } from '../delivery-pricing/delivery-pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrderCalculationService } from './order-calculation.service';
import { OrderStatusService } from './order-status.service';

export interface OrderCreateResult {
  orders: Order[];
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculation: OrderCalculationService,
    private readonly orderStatus: OrderStatusService,
    private readonly eventEmitter: EventEmitter2,
    private readonly deliveryPricing: DeliveryPricingService,
  ) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase();
    return `FM-${datePart}-${suffix}`;
  }

  async createFromCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                seller: { include: { user: { select: { id: true } } } },
                category: { select: { id: true, name: true } },
                variant: { select: { id: true, name: true, unit: true } },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (const item of cart.items) {
      if (item.listing.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Listing for ${item.listing.title ?? item.listing.category.name} is not active`,
        );
      }
      if (item.listing.date < today) {
        throw new BadRequestException(
          `Listing for ${item.listing.title ?? item.listing.category.name} is expired`,
        );
      }
    }

    const groupedBySeller = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const sellerProfileId = item.listing.seller.id;
      if (!groupedBySeller.has(sellerProfileId)) {
        groupedBySeller.set(sellerProfileId, []);
      }
      groupedBySeller.get(sellerProfileId)!.push(item);
    }

    const customerAddress = await this.prisma.userAddress.findFirst({
      where: { userId, isDefault: true },
    });
    const customerAreaId = (customerAddress as any)?.areaId ?? null;

    const sellerProfileIds = Array.from(groupedBySeller.keys());
    const profiles = await this.prisma.sellerProfile.findMany({
      where: { id: { in: sellerProfileIds } },
      select: {
        id: true,
        userId: true,
        commissionRate: true,
        address: { select: { areaId: true } },
      },
    });
    const commissionMap = new Map(profiles.map((p) => [p.id, p.commissionRate]));
    const profileUserMap = new Map(profiles.map((p) => [p.id, p.userId]));

    const deliveryFeeMap = new Map<string, number>();
    for (const profile of profiles) {
      const storeAreaId = profile.address?.areaId;
      if (customerAreaId && storeAreaId) {
        deliveryFeeMap.set(
          profile.id,
          await this.deliveryPricing.calculate(customerAreaId, storeAreaId),
        );
      } else {
        deliveryFeeMap.set(profile.id, 0);
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const createdOrders: Order[] = [];

      for (const [sellerProfileId, items] of groupedBySeller) {
        const calcItems = items.map((i) => ({
          unitPrice: Number(i.listing.price) + Number(i.listing.cleaningCost ?? 0),
          quantity: i.quantity,
        }));
        const sellerCommissionRate = commissionMap.get(sellerProfileId) || 0.12;
        const sellerCalc = this.calculation.calculateSellerOrder({
          items: calcItems,
          commissionRate: sellerCommissionRate,
        });
        const deliveryFee = deliveryFeeMap.get(sellerProfileId) ?? 0;

        const orderNumber = this.generateOrderNumber();
        const sellerUserId = profileUserMap.get(sellerProfileId)!;

        const created = await tx.order.create({
          data: {
            orderNumber,
            customer: { connect: { id: userId } },
            seller: { connect: { id: sellerUserId } },
            sellerProfile: { connect: { id: sellerProfileId } },
            status: OrderStatus.DRAFT,
            subtotal: sellerCalc.subtotal,
            deliveryFee,
            commission: sellerCalc.commission,
            discount: 0,
            total: sellerCalc.subtotal + deliveryFee + sellerCalc.commission,
          },
        });

        for (const cartItem of items) {
          const variant = cartItem.listing.variant;
          const cleaningCost = Number(cartItem.listing.cleaningCost ?? 0);
          const effectiveUnitPrice = Number(cartItem.listing.price) + cleaningCost;

          const itemData = {
            orderId: created.id,
            listingId: cartItem.listingId,
            sellerId: cartItem.listing.seller.user.id,
            productName: cartItem.listing.title ?? cartItem.listing.category.name,
            variantName: variant?.name ?? 'Standard',
            quantity: cartItem.quantity,
            unit: (variant?.unit ?? 'KG') as any,
            unitPrice: effectiveUnitPrice,
            totalPrice: effectiveUnitPrice * cartItem.quantity,
            cleaning: cleaningCost > 0,
            cleaningCost,
          } as any;

          if (variant?.id) itemData.variantId = variant.id;

          await tx.orderItem.create({ data: itemData });
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: created.id,
            toStatus: OrderStatus.DRAFT,
            reason: 'Order created from cart',
          },
        });

        createdOrders.push(created);
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return { orders: createdOrders } satisfies OrderCreateResult;
    });

    for (const order of result.orders) {
      this.eventEmitter.emit('order.created', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: userId,
        sellerId: order.sellerId ?? null,
        total: Number(order.total),
      });
    }

    return result as OrderCreateResult;
  }

  async findCustomerOrders(userId: string, query: QueryOrdersDto) {
    const where: Prisma.OrderWhereInput = {
      customerId: userId,
    };

    if (query.status) where.status = query.status as OrderStatus;
    if (query.search) {
      where.OR = [{ orderNumber: { contains: query.search, mode: 'insensitive' as const } }];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(userId: string, orderId: string, userRole?: string) {
    const where: Prisma.OrderWhereInput = { id: orderId };
    if (userRole !== 'ADMIN') {
      where.customerId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        sellerProfile: {
          select: {
            id: true,
            storeName: true,
            city: true,
            state: true,
            address: {
              select: {
                addressLine: true,
                nearestReference: true,
              },
            },
          },
        },
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        delivery: {
          include: {
            address: true,
            driver: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.orderStatus.validateTransition(order.status as OrderStatus, dto.status);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: dto.status,
          changedById: userId,
          reason: dto.reason,
        },
      });
    });

    return { message: 'Order status updated successfully', status: dto.status };
  }

  async cancelOrder(userId: string, orderId: string, dto: CancelOrderDto, userRole?: string) {
    const where: Prisma.OrderWhereInput = { id: orderId };
    if (userRole !== 'ADMIN') {
      where.customerId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.orderStatus.validateTransition(order.status as OrderStatus, OrderStatus.CANCELLED);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED, cancelReason: dto.reason, cancelledById: userId },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          changedById: userId,
          reason: dto.reason,
        },
      });
    });

    this.eventEmitter.emit('order.cancelled', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      cancelledBy: userId,
      reason: dto.reason ?? null,
    });

    return { message: 'Order cancelled successfully' };
  }

  async markReadyForPickup(sellerUserId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerUserId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.orderStatus.validateTransition(order.status as OrderStatus, OrderStatus.READY_FOR_PICKUP);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.READY_FOR_PICKUP },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.READY_FOR_PICKUP,
          changedById: sellerUserId,
        },
      });
    });

    this.eventEmitter.emit('order.ready-for-pickup', {
      orderId,
      orderNumber: order.orderNumber,
      sellerId: sellerUserId,
    });

    return { message: 'Order marked as ready for pickup' };
  }

  async findSellerOrders(sellerUserId: string, query: QueryOrdersDto) {
    const where: Prisma.OrderWhereInput = {
      sellerId: sellerUserId,
    };

    if (query.status) where.status = query.status as OrderStatus;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findSellerOrder(sellerUserId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerUserId },
      include: {
        items: {
          include: { listing: { include: { category: { select: { name: true } } } } },
        },
        customer: { select: { id: true, name: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findAllAdmin(query: QueryOrdersDto) {
    const where: Prisma.OrderWhereInput = {};

    if (query.status) where.status = query.status as OrderStatus;
    if (query.search) {
      where.OR = [{ orderNumber: { contains: query.search, mode: 'insensitive' as const } }];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.driverId) {
      where.delivery = { driverId: query.driverId };
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          sellerProfile: {
            select: {
              id: true,
              storeName: true,
              city: true,
              state: true,
              address: {
                select: {
                  addressLine: true,
                  nearestReference: true,
                },
              },
            },
          },
          items: true,
          delivery: {
            include: {
              driver: { select: { id: true, name: true, phone: true } },
              address: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }
}
