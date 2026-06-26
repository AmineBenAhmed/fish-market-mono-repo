import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { InventoryReservationService } from './inventory-reservation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderStatusService } from './order-status.service';

@Injectable()
export class OrdersService {
  private static orderCounter = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryReservation: InventoryReservationService,
    private readonly calculation: OrderCalculationService,
    private readonly orderStatus: OrderStatusService,
  ) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const seq = String(++OrdersService.orderCounter).padStart(4, '0');
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `FM-${datePart}-${seq}${rand}`;
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
                product: { select: { id: true, name: true, slug: true } },
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
    today.setHours(0, 0, 0, 0);

    for (const item of cart.items) {
      if (item.listing.status !== 'ACTIVE') {
        throw new BadRequestException(`Listing for ${item.listing.product.name} is not active`);
      }
      if (item.listing.date < today) {
        throw new BadRequestException(`Listing for ${item.listing.product.name} is expired`);
      }
      if (item.listing.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${item.listing.product.name}`);
      }
    }

    const groupedBySeller = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const sellerId = item.listing.seller.user.id;
      if (!groupedBySeller.has(sellerId)) {
        groupedBySeller.set(sellerId, []);
      }
      groupedBySeller.get(sellerId)!.push(item);
    }

    const orderNumber = this.generateOrderNumber();

    const result = await this.prisma.$transaction(async (tx) => {
      const sellerOrders: { data: Prisma.OrderCreateInput; items: typeof cart.items }[] = [];

      for (const [sellerId, items] of groupedBySeller) {
        const calcItems = items.map((i) => ({
          unitPrice: Number(i.listing.price),
          quantity: i.quantity,
        }));
        const sellerCommissionRate = 0.12;
        const sellerCalc = this.calculation.calculateSellerOrder({
          items: calcItems,
          commissionRate: sellerCommissionRate,
        });

        sellerOrders.push({
          data: {
            orderNumber: `${orderNumber}-S${sellerOrders.length + 1}`,
            customer: { connect: { id: userId } },
            seller: { connect: { id: sellerId } },
            status: OrderStatus.DRAFT,
            subtotal: sellerCalc.subtotal,
            deliveryFee: sellerCalc.deliveryFee,
            commission: sellerCalc.commission,
            discount: 0,
            total: sellerCalc.total,
          },
          items,
        });
      }

      let parentOrder: any = null;

      if (sellerOrders.length > 1) {
        const parentCalc = this.calculation.calculateMarketplaceOrder(
          sellerOrders.map((so) => ({
            subtotal: so.data.subtotal as number,
            deliveryFee: so.data.deliveryFee as number,
            commission: so.data.commission as number,
            total: so.data.total as number,
          })),
        );

        parentOrder = await tx.order.create({
          data: {
            orderNumber,
            customer: { connect: { id: userId } },
            status: OrderStatus.DRAFT,
            subtotal: parentCalc.subtotal,
            deliveryFee: parentCalc.deliveryFee,
            commission: parentCalc.commission,
            discount: 0,
            total: parentCalc.total,
          },
        });

        for (const so of sellerOrders) {
          so.data.parentOrder = { connect: { id: parentOrder.id } };
        }
      }

      const createdOrders: any[] = [];

      for (const so of sellerOrders) {
        const created = await tx.order.create({
          data: so.data,
        });

        for (const cartItem of so.items) {
          await this.inventoryReservation.reserve(tx, cartItem.listingId, cartItem.quantity);

          await tx.orderItem.create({
            data: {
              orderId: created.id,
              listingId: cartItem.listingId,
              variantId: cartItem.listing.variantId,
              sellerId: cartItem.listing.seller.user.id,
              productName: cartItem.listing.product.name,
              variantName: cartItem.listing.variant.name,
              quantity: cartItem.quantity,
              unit: cartItem.listing.variant.unit,
              unitPrice: cartItem.listing.price,
              totalPrice: Number(cartItem.listing.price) * cartItem.quantity,
            },
          });
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

      return { parentOrder, childOrders: createdOrders };
    });

    return result;
  }

  async findCustomerOrders(userId: string, query: QueryOrdersDto) {
    const where: Prisma.OrderWhereInput = {
      customerId: userId,
      parentOrderId: null,
    };

    if (query.status) where.status = query.status as OrderStatus;
    if (query.search) {
      where.OR = [{ orderNumber: { contains: query.search, mode: 'insensitive' as any } }];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          childOrders: {
            include: {
              seller: { select: { id: true, name: true } },
              items: true,
            },
          },
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: {
        childOrders: {
          include: {
            seller: { select: { id: true, name: true } },
            items: true,
            statusHistory: { orderBy: { createdAt: 'desc' } },
          },
        },
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string, dto: CancelOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.orderStatus.validateTransition(order.status as OrderStatus, OrderStatus.CANCELLED);

    const cancelTargets: string[] = [];

    if (order.parentOrderId === null) {
      const children = await this.prisma.order.findMany({
        where: { parentOrderId: order.id },
        select: { id: true },
      });
      cancelTargets.push(order.id, ...children.map((c) => c.id));
    } else {
      cancelTargets.push(order.id);
      const parent = await this.prisma.order.findUnique({
        where: { id: order.parentOrderId! },
        select: { id: true },
      });
      if (parent) cancelTargets.push(parent.id);
    }

    await this.prisma.$transaction(async (tx) => {
      for (const id of cancelTargets) {
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const item of items) {
          if (item.listingId) {
            await this.inventoryReservation.release(tx, item.listingId, item.quantity);
          }
        }

        await tx.order.update({
          where: { id },
          data: { status: OrderStatus.CANCELLED, cancelReason: dto.reason, cancelledById: userId },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            fromStatus: order.status,
            toStatus: OrderStatus.CANCELLED,
            changedById: userId,
            reason: dto.reason,
          },
        });
      }
    });

    return { message: 'Order cancelled successfully' };
  }

  async findSellerOrders(sellerUserId: string, query: QueryOrdersDto) {
    const where: Prisma.OrderWhereInput = {
      sellerId: sellerUserId,
      parentOrderId: { not: null },
    };

    if (query.status) where.status = query.status as OrderStatus;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
          parentOrder: { select: { id: true, orderNumber: true } },
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findSellerOrder(sellerUserId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerUserId },
      include: {
        items: {
          include: { listing: { include: { product: { select: { name: true } } } } },
        },
        customer: { select: { id: true, name: true } },
        parentOrder: { select: { id: true, orderNumber: true } },
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
      where.OR = [{ orderNumber: { contains: query.search, mode: 'insensitive' as any } }];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true } },
          items: true,
          childOrders: { select: { id: true, orderNumber: true, status: true, total: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}
