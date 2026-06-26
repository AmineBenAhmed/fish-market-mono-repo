import { Test, TestingModule } from '@nestjs/testing';
import { BillingStatus, BillingType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: jest.Mocked<PrismaService>;

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-001',
    customer: { id: 'customer-1', name: 'John Doe', email: 'john@example.com' },
    items: [
      {
        id: 'item-1',
        productName: 'Fresh Salmon',
        variantName: null,
        quantity: 2,
        unitPrice: 25,
        totalPrice: 50,
        sellerId: 'seller-1',
        productId: 'prod-1',
        orderId: 'order-1',
        listingId: null,
        weight: null,
        weightUnit: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
    subtotal: 85,
    deliveryFee: 5,
    commission: 10,
    discount: 0,
    total: 100,
    status: 'CONFIRMED',
    sellerId: 'seller-1',
    customerId: 'customer-1',
    currency: 'TND',
    notes: null,
    billingAddressId: null,
    deliveryAddressId: null,
    confirmedAt: new Date(),
    cancelledAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: null,
  };

  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    billing: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;

    jest.clearAllMocks();
  });

  describe('generateCustomerReceipt', () => {
    it('should create a customer receipt billing record', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.billing.create.mockResolvedValue({
        id: 'bill-1',
        orderId: 'order-1',
        type: BillingType.CUSTOMER_RECEIPT,
        number: 'RC-ORD-001-ABC123',
        amount: 100,
        status: BillingStatus.GENERATED,
        metadata: {},
        documentUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await service.generateCustomerReceipt('order-1');

      expect(result.type).toBe(BillingType.CUSTOMER_RECEIPT);
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          items: true,
        },
      });
    });

    it('should throw if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.generateCustomerReceipt('order-1')).rejects.toThrow('Order not found');
    });
  });

  describe('generateSellerSettlement', () => {
    it('should create a seller settlement billing record', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        seller: { id: 'seller-1', name: 'Fish Seller' },
      });
      mockPrisma.billing.create.mockResolvedValue({
        id: 'bill-2',
        orderId: 'order-1',
        type: BillingType.SELLER_SETTLEMENT,
        number: 'ST-ORD-001-DEF456',
        amount: 100,
        status: BillingStatus.GENERATED,
        metadata: {},
        documentUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await service.generateSellerSettlement('order-1', 'seller-1');

      expect(result.type).toBe(BillingType.SELLER_SETTLEMENT);
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-1', sellerId: 'seller-1' },
        include: {
          items: { where: { sellerId: 'seller-1' } },
          seller: { select: { id: true, name: true } },
        },
      });
    });

    it('should throw if seller order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.generateSellerSettlement('order-1', 'seller-1')).rejects.toThrow(
        'Seller order not found',
      );
    });
  });

  describe('getBillingsForOrder', () => {
    it('should return billings for order', async () => {
      mockPrisma.billing.findMany.mockResolvedValue([
        {
          id: 'bill-1',
          number: 'RC-ORD-001-ABC',
          type: BillingType.CUSTOMER_RECEIPT,
          amount: 100,
          status: BillingStatus.GENERATED,
          documentUrl: null,
          createdAt: new Date(),
        },
      ]);

      const result = await service.getBillingsForOrder('order-1');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BillingType.CUSTOMER_RECEIPT);
    });
  });
});
