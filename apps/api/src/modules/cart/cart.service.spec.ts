import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  const mockPrisma = {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    sellerListing: {
      findUnique: jest.fn(),
    },
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockCart = { id: 'cart-1', userId: 'user-1', createdAt: new Date(), updatedAt: new Date() };
  const mockListing = {
    id: 'listing-1',
    variantId: 'variant-1',
    sellerId: 'seller-1',
    date: today,
    price: 25,
    quantity: 100,
    status: 'ACTIVE',
    variant: { id: 'variant-1', name: 'Whole', unit: 'kg' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  describe('findCart', () => {
    it('should return empty cart if none exists', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);

      const result = await service.findCart('user-1');

      expect(result.items).toEqual([]);
    });

    it('should return cart with items', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [
          {
            id: 'item-1',
            quantity: 2,
            listing: {
              product: { name: 'Sea Bass' },
              variant: { name: 'Whole' },
              seller: { storeName: 'Fish Store' },
            },
          },
        ],
      });

      const result = await service.findCart('user-1');

      expect(result.items).toHaveLength(1);
    });
  });

  describe('addItem', () => {
    const addDto = { listingId: 'listing-1', quantity: 2 };

    it('should create cart and add item', async () => {
      mockPrisma.cart.findUnique.mockResolvedValueOnce(null);
      mockPrisma.cart.create.mockResolvedValue(mockCart);
      mockPrisma.sellerListing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);
      mockPrisma.cartItem.create.mockResolvedValue({ id: 'item-1', ...addDto });

      const result = await service.addItem('user-1', addDto);

      expect(result).toBeDefined();
      expect(mockPrisma.cartItem.create).toHaveBeenCalled();
    });

    it('should throw if listing not found', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.sellerListing.findUnique.mockResolvedValue(null);

      await expect(service.addItem('user-1', addDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if listing is from past date', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      mockPrisma.sellerListing.findUnique.mockResolvedValue({ ...mockListing, date: pastDate });

      await expect(service.addItem('user-1', addDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if listing is not active', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.sellerListing.findUnique.mockResolvedValue({ ...mockListing, status: 'EXPIRED' });

      await expect(service.addItem('user-1', addDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if insufficient stock', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.sellerListing.findUnique.mockResolvedValue({ ...mockListing, quantity: 1 });

      await expect(
        service.addItem('user-1', { listingId: 'listing-1', quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should merge quantity with existing cart item', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.sellerListing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.cartItem.findUnique.mockResolvedValue({
        id: 'existing-item',
        cartId: 'cart-1',
        quantity: 3,
      });

      await service.addItem('user-1', addDto);

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'existing-item' },
          data: expect.objectContaining({ quantity: 5 }),
        }),
      );
    });
  });

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        listing: { quantity: 100 },
      });

      await service.updateItem('user-1', 'item-1', { quantity: 10 });

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'item-1' }, data: { quantity: 10 } }),
      );
    });

    it('should throw if item not found', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(service.updateItem('user-1', 'item-1', { quantity: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if quantity exceeds stock', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        listing: { quantity: 3 },
      });

      await expect(service.updateItem('user-1', 'item-1', { quantity: 10 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.findFirst.mockResolvedValue({ id: 'item-1', cartId: 'cart-1' });

      await service.removeItem('user-1', 'item-1');

      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
    });

    it('should throw if item not found', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(service.removeItem('user-1', 'item-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart', () => {
    it('should delete all cart items', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);

      await service.clearCart('user-1');

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1' } });
    });

    it('should not fail if cart does not exist', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.clearCart('user-1')).resolves.toBeUndefined();
    });
  });
});
