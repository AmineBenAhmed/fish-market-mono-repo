import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma, TransactionType } from '@prisma/client';

import { BillingService } from '../billing/billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { PaymentProviderRegistry } from './payment-provider.registry';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: jest.Mocked<PrismaService>;
  let providerRegistry: jest.Mocked<PaymentProviderRegistry>;
  let walletService: jest.Mocked<WalletService>;
  let billingService: jest.Mocked<BillingService>;

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-001',
    status: OrderStatus.DRAFT,
    customerId: 'customer-1',
    sellerId: 'seller-1',
    total: 100,
    commission: 10,
    deliveryFee: 5,
    itemsTotal: 85,
    currency: 'TND',
    notes: null,
    metadata: null,
    confirmedAt: null,
    cancelledAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    billingAddressId: null,
    deliveryAddressId: null,
  };

  const mockPayment = {
    id: 'payment-1',
    orderId: 'order-1',
    method: PaymentMethod.COD,
    status: PaymentStatus.PENDING,
    amount: 100,
    currency: 'TND',
    transactionId: null,
    gatewayResponse: Prisma.DbNull,
    paidAt: null,
    notes: null,
    failedAt: null,
    failureReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: { id: 'order-1', customerId: 'customer-1', status: OrderStatus.DRAFT },
  };

  const mockProvider = {
    createPayment: jest.fn(),
    confirmPayment: jest.fn(),
    cancelPayment: jest.fn(),
    refundPayment: jest.fn(),
    getStatus: jest.fn(),
    getProviderName: jest.fn().mockReturnValue('CASH_ON_DELIVERY'),
  };

  const mockTx = {
    payment: { update: jest.fn() },
    order: { update: jest.fn() },
  };

  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockProviderRegistry = {
    get: jest.fn().mockReturnValue(mockProvider),
    has: jest.fn(),
  };

  const mockWalletService = {
    credit: jest.fn(),
    debit: jest.fn(),
    getWallet: jest.fn(),
    getTransactions: jest.fn(),
  };

  const mockBillingService = {
    generateCustomerReceipt: jest.fn(),
    generateSellerSettlement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PaymentProviderRegistry, useValue: mockProviderRegistry },
        { provide: WalletService, useValue: mockWalletService },
        { provide: BillingService, useValue: mockBillingService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    providerRegistry = module.get(PaymentProviderRegistry) as jest.Mocked<PaymentProviderRegistry>;
    walletService = module.get(WalletService) as jest.Mocked<WalletService>;
    billingService = module.get(BillingService) as jest.Mocked<BillingService>;

    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<any>) =>
      cb(mockTx),
    );
  });

  describe('create', () => {
    it('should create a payment and set order to PENDING', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ ...mockOrder, payment: null });
      mockProvider.createPayment.mockResolvedValue({
        transactionId: 'tx-provider',
        redirectUrl: null,
      });
      mockPrisma.payment.create.mockResolvedValue(mockPayment);

      const result = await service.create('customer-1', 'order-1', PaymentMethod.COD);

      expect(result.payment.status).toBe(PaymentStatus.PENDING);
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.PENDING },
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);
      await expect(service.create('customer-1', 'order-1', PaymentMethod.COD)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if payment already exists', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ ...mockOrder, payment: mockPayment });
      await expect(service.create('customer-1', 'order-1', PaymentMethod.COD)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if order not draft/pending', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
        payment: null,
      });
      await expect(service.create('customer-1', 'order-1', PaymentMethod.COD)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirm', () => {
    const mockPaymentWithCustomer = {
      ...mockPayment,
      transactionId: 'tx-1',
      order: { id: 'order-1', customerId: 'customer-1', status: OrderStatus.DRAFT },
    };

    it('should confirm payment and process wallet/billing', async () => {
      mockPrisma.payment.findUnique
        .mockResolvedValueOnce(mockPaymentWithCustomer)
        .mockResolvedValueOnce({
          ...mockPayment,
          order: {
            ...mockOrder,
            orderNumber: 'ORD-001',
            total: 100,
            commission: 10,
            items: [],
            seller: { id: 'seller-1' },
          },
        });
      mockProvider.confirmPayment.mockResolvedValue({
        status: 'SUCCESS',
        transactionId: 'tx-provider',
        gatewayResponse: { confirmed: true },
      });

      const result = await service.confirm('customer-1', 'payment-1');

      expect(result.message).toBe('Payment confirmed successfully');
      expect(mockWalletService.credit).toHaveBeenCalledWith(
        'seller-1',
        90,
        TransactionType.SELLER_EARNING,
        'ORDER',
        'order-1',
        'Earnings for order ORD-001',
        false,
      );
      expect(mockWalletService.credit).toHaveBeenCalledWith(
        'PLATFORM',
        10,
        TransactionType.COMMISSION,
        'ORDER',
        'payment-1',
        'Marketplace commission for order ORD-001',
        true,
      );
      expect(mockBillingService.generateCustomerReceipt).toHaveBeenCalledWith('order-1');
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);
      await expect(service.confirm('customer-1', 'payment-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if payment not PENDING', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...mockPaymentWithCustomer,
        status: PaymentStatus.APPROVED,
      });
      await expect(service.confirm('customer-1', 'payment-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if provider declines', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPaymentWithCustomer);
      mockProvider.confirmPayment.mockResolvedValue({ status: 'FAILED' });

      await expect(service.confirm('customer-1', 'payment-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a PENDING payment', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        order: { id: 'order-1', customerId: 'customer-1', status: OrderStatus.PENDING },
      });
      mockProvider.cancelPayment.mockResolvedValue({ status: 'SUCCESS' });

      await service.cancel('customer-1', 'payment-1');
      expect(mockTx.payment.update).toHaveBeenCalled();
      expect(mockTx.order.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-cancellable status', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.APPROVED,
        order: { id: 'order-1', customerId: 'customer-1', status: OrderStatus.CONFIRMED },
      });
      await expect(service.cancel('customer-1', 'payment-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refund', () => {
    it('should refund an approved payment', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.APPROVED,
        amount: 100,
        transactionId: 'tx-1',
        order: { id: 'order-1', customerId: 'customer-1' },
      });
      mockProvider.refundPayment.mockResolvedValue({ status: 'SUCCESS' });

      const result = await service.refund('customer-1', 'payment-1', 100, 'R42');
      expect(result.message).toBe('Payment fully refunded');
    });

    it('should throw BadRequestException if payment not approved', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        order: { id: 'order-1', customerId: 'customer-1' },
      });
      await expect(service.refund('customer-1', 'payment-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllAdmin', () => {
    it('should return paginated payments', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([mockPayment]);
      mockPrisma.payment.count.mockResolvedValue(1);

      const result = await service.findAllAdmin({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should find payment by id for customer', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        order: {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: OrderStatus.DRAFT,
          total: 100,
          customerId: 'customer-1',
        },
      });

      const result = await service.findOne('customer-1', 'payment-1');
      expect(result.id).toBe('payment-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);
      await expect(service.findOne('customer-1', 'payment-1')).rejects.toThrow(NotFoundException);
    });
  });
});
