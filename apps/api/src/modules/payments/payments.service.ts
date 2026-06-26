import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma, TransactionType } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { WalletService } from '../wallet/wallet.service';
import { PaymentProviderRegistry } from './payment-provider.registry';

interface PaymentFilters {
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly walletService: WalletService,
    private readonly billingService: BillingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: string,
    orderId: string,
    method: string,
  ): Promise<{
    payment: Record<string, unknown>;
    redirectUrl?: string;
  }> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment) {
      throw new ConflictException('Payment already exists for this order');
    }

    const validDraftStatuses: OrderStatus[] = [OrderStatus.DRAFT, OrderStatus.PENDING];
    if (!validDraftStatuses.includes(order.status as OrderStatus)) {
      throw new BadRequestException(`Cannot create payment for order in "${order.status}" status`);
    }

    const provider = this.providerRegistry.get(method);

    const providerResponse = await provider.createPayment({
      amount: Number(order.total),
      currency: 'TND',
      description: `Order ${order.orderNumber}`,
      metadata: { orderId: order.id, customerId: userId },
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: method as PaymentMethod,
        status: PaymentStatus.PENDING,
        amount: order.total,
        transactionId: providerResponse.transactionId,
        gatewayResponse: (providerResponse.gatewayResponse ??
          Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });

    if (order.status === OrderStatus.DRAFT) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PENDING },
      });
    }

    this.eventEmitter.emit('payment.created', {
      paymentId: payment.id,
      orderId: order.id,
      amount: Number(payment.amount),
      method: payment.method,
      customerId: userId,
    });

    this.logger.log(`Payment created: ${payment.id} for order ${order.orderNumber}`);

    return {
      payment: {
        id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        orderId: payment.orderId,
        transactionId: payment.transactionId,
      },
      redirectUrl: providerResponse.redirectUrl,
    };
  }

  async confirm(
    userId: string,
    paymentId: string,
    transactionId?: string,
  ): Promise<Record<string, unknown>> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { id: true, customerId: true, status: true } } },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.customerId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.PROCESSING) {
      throw new BadRequestException(`Cannot confirm payment in "${payment.status}" status`);
    }

    const provider = this.providerRegistry.get(payment.method as string);

    const providerResponse = await provider.confirmPayment(
      transactionId ?? payment.transactionId ?? '',
    );

    if (providerResponse.status === 'SUCCESS') {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.APPROVED,
            paidAt: new Date(),
            transactionId: providerResponse.transactionId ?? payment.transactionId,
            gatewayResponse: (providerResponse.gatewayResponse ??
              Prisma.DbNull) as Prisma.InputJsonValue,
          },
        });

        await tx.order.update({
          where: { id: payment.order.id },
          data: { status: OrderStatus.CONFIRMED },
        });
      });

      try {
        const paymentRecord = await this.prisma.payment.findUnique({
          where: { id: payment.id },
          include: {
            order: {
              include: {
                items: true,
                seller: { select: { id: true } },
              },
            },
          },
        });

        if (paymentRecord?.order.seller) {
          const sellerEarning =
            Number(paymentRecord.order.total) - Number(paymentRecord.order.commission);

          await this.walletService.credit(
            paymentRecord.order.seller.id,
            sellerEarning,
            TransactionType.SELLER_EARNING,
            'ORDER',
            paymentRecord.order.id,
            `Earnings for order ${paymentRecord.order.orderNumber}`,
            false,
          );
        }

        await this.walletService.credit(
          'PLATFORM',
          Number(paymentRecord?.order.commission ?? 0),
          TransactionType.COMMISSION,
          'ORDER',
          payment.id,
          `Marketplace commission for order ${paymentRecord?.order.orderNumber}`,
          true,
        );

        await this.billingService.generateCustomerReceipt(payment.order.id);
      } catch (error) {
        this.logger.error(`Post-payment processing failed for ${payment.id}`, error);
      }

      this.eventEmitter.emit('payment.succeeded', {
        paymentId: payment.id,
        orderId: payment.order.id,
        transactionId: providerResponse.transactionId ?? payment.transactionId,
        amount: Number(payment.amount),
        customerId: userId,
      });

      this.logger.log(`Payment confirmed: ${payment.id}`);
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.DECLINED },
      });

      this.eventEmitter.emit('payment.failed', {
        paymentId: payment.id,
        orderId: payment.order.id,
        reason: 'Payment was not approved by provider',
        customerId: userId,
      });

      throw new BadRequestException('Payment was not approved by provider');
    }

    return { message: 'Payment confirmed successfully' };
  }

  async cancel(userId: string, paymentId: string): Promise<Record<string, unknown>> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { id: true, customerId: true, status: true } } },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.customerId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    const cancellableStatuses: PaymentStatus[] = [PaymentStatus.PENDING, PaymentStatus.PROCESSING];
    if (!cancellableStatuses.includes(payment.status as PaymentStatus)) {
      throw new BadRequestException(`Cannot cancel payment in "${payment.status}" status`);
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.DECLINED },
      });

      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: OrderStatus.DRAFT },
      });
    });

    this.logger.log(`Payment cancelled: ${payment.id}`);

    return { message: 'Payment cancelled successfully' };
  }

  async refund(
    userId: string,
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Record<string, unknown>> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { id: true, customerId: true } } },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.customerId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException(`Cannot refund payment in "${payment.status}" status`);
    }

    const refundAmount = amount ?? Number(payment.amount);
    const isFullRefund = refundAmount >= Number(payment.amount);

    const provider = this.providerRegistry.get(payment.method as string);
    await provider.refundPayment(payment.transactionId ?? '', refundAmount);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
        },
      });

      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: isFullRefund ? OrderStatus.REFUNDED : OrderStatus.CANCELLED },
      });
    });

    this.eventEmitter.emit('payment.refunded', {
      paymentId: payment.id,
      orderId: payment.order.id,
      amount: refundAmount,
      isFullRefund,
      customerId: userId,
    });

    this.logger.log(`Payment refunded: ${payment.id}, amount: ${refundAmount}`);

    return { message: `Payment ${isFullRefund ? 'fully' : 'partially'} refunded` };
  }

  async findOne(userId: string, paymentId: string): Promise<Record<string, unknown>> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            customerId: true,
          },
        },
      },
    });

    if (!payment || payment.order.customerId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      method: payment.method,
      status: payment.status,
      amount: payment.amount,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    };
  }

  async findAllAdmin(filters: PaymentFilters) {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.status) {
      where.status = filters.status as PaymentStatus;
    }
    if (filters.method) {
      where.method = filters.method as PaymentMethod;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const { page, limit, skip } = parsePagination(filters.page, filters.limit);

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              customer: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }
}
