import * as crypto from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import { BillingStatus, BillingType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateCustomerReceipt(orderId: string): Promise<Record<string, unknown>> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const billing = await this.prisma.billing.create({
      data: {
        orderId: order.id,
        type: BillingType.CUSTOMER_RECEIPT,
        number: this.generateNumber('RC', order.orderNumber),
        amount: order.total,
        status: BillingStatus.GENERATED,
        metadata: {
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          items: order.items.map((i) => ({
            product: i.productName,
            variant: i.variantName,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
            totalPrice: Number(i.totalPrice),
          })),
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          commission: Number(order.commission),
          discount: Number(order.discount),
          total: Number(order.total),
        },
      },
    });

    this.logger.log(`Customer receipt generated: ${billing.number} for order ${order.orderNumber}`);

    return {
      id: billing.id,
      number: billing.number,
      type: billing.type,
      amount: billing.amount,
      status: billing.status,
    };
  }

  async generateSellerSettlement(
    orderId: string,
    sellerId: string,
  ): Promise<Record<string, unknown>> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId },
      include: {
        items: { where: { sellerId } },
        seller: { select: { id: true, name: true } },
      },
    });

    if (!order || !order.seller) {
      throw new Error('Seller order not found');
    }

    const sellerTotal = order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    const billing = await this.prisma.billing.create({
      data: {
        orderId: order.id,
        type: BillingType.SELLER_SETTLEMENT,
        number: this.generateNumber('ST', order.orderNumber),
        amount: order.total,
        status: BillingStatus.GENERATED,
        metadata: {
          sellerId,
          sellerName: order.seller.name,
          items: order.items.map((i) => ({
            product: i.productName,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
            totalPrice: Number(i.totalPrice),
          })),
          sellerTotal,
          commission: Number(order.commission),
          netAmount: sellerTotal - Number(order.commission),
        },
      },
    });

    this.logger.log(`Seller settlement generated: ${billing.number} for seller ${sellerId}`);

    return {
      id: billing.id,
      number: billing.number,
      type: billing.type,
      amount: billing.amount,
      status: billing.status,
    };
  }

  async getBillingsForOrder(orderId: string): Promise<Record<string, unknown>[]> {
    const billings = await this.prisma.billing.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return billings.map((b) => ({
      id: b.id,
      number: b.number,
      type: b.type,
      amount: b.amount,
      status: b.status,
      documentUrl: b.documentUrl,
      createdAt: b.createdAt,
    }));
  }

  private generateNumber(prefix: string, orderNumber: string): string {
    const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
    return `${prefix}-${orderNumber}-${suffix}`;
  }
}
