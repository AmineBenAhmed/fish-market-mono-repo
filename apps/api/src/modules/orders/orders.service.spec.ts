import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { DeliveryPricingService } from '../delivery-pricing/delivery-pricing.service';
import { InventoryReservationService } from './inventory-reservation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderStatusService } from './order-status.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockTx = {
    sellerProfile: { findMany: jest.fn() },
    sellerListing: { updateMany: jest.fn() },
    order: { create: jest.fn(), update: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    orderItem: { create: jest.fn(), findMany: jest.fn() },
    orderStatusHistory: { create: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
  };

  const mockEventEmitter = { emit: jest.fn() };

  const mockDeliveryPricing = { calculate: jest.fn().mockResolvedValue(3.5) };

  const mockPrisma = {
    cart: { findUnique: jest.fn() },
    order: { findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    orderItem: { findMany: jest.fn() },
    sellerProfile: { findMany: jest.fn() },
    userAddress: { findFirst: jest.fn() },
    $transaction: jest.fn((fn: any) => fn(mockTx)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: DeliveryPricingService, useValue: mockDeliveryPricing },
        InventoryReservationService,
        OrderCalculationService,
        OrderStatusService,
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createFromCart', () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const mockCartItem = {
      id: 'ci-1',
      cartId: 'cart-1',
      listingId: 'listing-1',
      variantId: 'variant-1',
      quantity: 2,
      listing: {
        id: 'listing-1',
        sellerId: 'seller-profile-1',
        variantId: 'variant-1',
        date: today,
        price: 25,
        quantity: 100,
        status: 'ACTIVE',
        category: { id: 'cat-1', name: 'Fish' },
        title: 'Sea Bass',
        variant: { id: 'variant-1', name: 'Whole', unit: 'kg' },
        seller: { id: 'seller-profile-1', user: { id: 'seller-user-1' } },
      },
    };

    it('should throw if cart is empty', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', items: [] });

      await expect(service.createFromCart('user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if cart does not exist', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.createFromCart('user-1')).rejects.toThrow(BadRequestException);
    });

    it('should create order from cart with single seller', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [mockCartItem],
      });

      mockPrisma.sellerProfile.findMany.mockResolvedValue([
        {
          id: 'seller-profile-1',
          userId: 'seller-user-1',
          commissionRate: 0.12,
          address: { areaId: 'area-1' },
        },
      ]);
      mockPrisma.userAddress.findFirst.mockResolvedValue({ areaId: 'customer-area-1' });
      mockTx.sellerListing.updateMany.mockResolvedValue({ count: 1 });
      mockTx.order.create.mockResolvedValue({ id: 'order-1' });

      const result = await service.createFromCart('user-1');

      expect(result.orders).toHaveLength(1);
      expect(mockTx.cartItem.deleteMany).toHaveBeenCalled();
    });

    it('should create independent orders for multi-seller cart', async () => {
      const seller2Item = {
        ...mockCartItem,
        id: 'ci-2',
        listingId: 'listing-2',
        listing: {
          ...mockCartItem.listing,
          id: 'listing-2',
          seller: { id: 'seller-profile-2', user: { id: 'seller-user-2' } },
          category: { id: 'cat-2', name: 'Seafood' },
          title: 'Shrimp',
        },
      };

      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [mockCartItem, seller2Item],
      });

      mockPrisma.sellerProfile.findMany.mockResolvedValue([
        {
          id: 'seller-profile-1',
          userId: 'seller-user-1',
          commissionRate: 0.12,
          address: { areaId: 'area-1' },
        },
        {
          id: 'seller-profile-2',
          userId: 'seller-user-2',
          commissionRate: 0.1,
          address: { areaId: 'area-2' },
        },
      ]);
      mockPrisma.userAddress.findFirst.mockResolvedValue({ areaId: 'customer-area-1' });
      mockTx.sellerListing.updateMany.mockResolvedValue({ count: 1 });
      mockTx.order.create.mockResolvedValue({ id: 'child-1' });

      const result = await service.createFromCart('user-1');

      expect(result.orders).toHaveLength(2);
    });
  });

  describe('findCustomerOrders', () => {
    it('should return paginated orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: 'order-1', orderNumber: 'FM-001' }]);
      mockPrisma.order.count.mockResolvedValue(1);

      const result = await service.findCustomerOrders('user-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return order details', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order-1', customerId: 'user-1' });

      const result = await service.findOne('user-1', 'order-1');

      expect(result).toBeDefined();
    });

    it('should throw if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'order-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order-1',
        customerId: 'user-1',
        status: 'DRAFT',
      });

      const result = await service.cancelOrder('user-1', 'order-1', { reason: 'Changed mind' });

      expect(result.message).toBe('Order cancelled successfully');
    });

    it('should throw if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.cancelOrder('user-1', 'order-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSellerOrders', () => {
    it('should return seller orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: 'order-1', sellerId: 'seller-1' }]);
      mockPrisma.order.count.mockResolvedValue(1);

      const result = await service.findSellerOrders('seller-1', {});

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findSellerOrder', () => {
    it('should return seller order detail', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order-1', sellerId: 'seller-1' });

      const result = await service.findSellerOrder('seller-1', 'order-1');

      expect(result).toBeDefined();
    });

    it('should throw if not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.findSellerOrder('seller-1', 'order-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllAdmin', () => {
    it('should return all orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: 'order-1' }]);
      mockPrisma.order.count.mockResolvedValue(1);

      const result = await service.findAllAdmin({});

      expect(result.data).toHaveLength(1);
    });
  });
});
