import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }
    return cart;
  }

  async findCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                category: { select: { id: true, name: true } },
                variant: { select: { id: true, name: true, unit: true } },
                seller: { select: { id: true, storeName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!cart) {
      return { id: '', userId, items: [] };
    }
    return cart;
  }

  async addItem(userId: string, dto: AddItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const listing = await this.prisma.sellerListing.findUnique({
      where: { id: dto.listingId },
      include: { variant: { select: { id: true } } },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (listing.date < today) {
      throw new BadRequestException('Listing is from a past date');
    }

    if (listing.status !== 'ACTIVE') {
      throw new BadRequestException('Listing is not active');
    }

    if (!listing.variantId) {
      throw new BadRequestException('Listing must have a variant');
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: listing.variantId } },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity, listingId: dto.listingId },
        include: { listing: { include: { category: true, variant: true, seller: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        listingId: dto.listingId,
        variantId: listing.variantId,
        quantity: dto.quantity,
      },
      include: { listing: { include: { category: true, variant: true, seller: true } } },
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { listing: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { listing: { include: { category: true, variant: true, seller: true } } },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }
}
