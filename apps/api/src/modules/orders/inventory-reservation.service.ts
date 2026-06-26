import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(tx: Prisma.TransactionClient, listingId: string, quantity: number): Promise<void> {
    const result = await tx.sellerListing.updateMany({
      where: {
        id: listingId,
        quantity: { gte: quantity },
        status: 'ACTIVE',
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      data: { quantity: { decrement: quantity } },
    });

    if (result.count === 0) {
      throw new BadRequestException('Insufficient stock or listing not available');
    }
  }

  async release(tx: Prisma.TransactionClient, listingId: string, quantity: number): Promise<void> {
    const result = await tx.sellerListing.updateMany({
      where: { id: listingId, status: { not: 'EXPIRED' } },
      data: { quantity: { increment: quantity } },
    });

    if (result.count === 0) {
      throw new BadRequestException('Failed to release inventory - listing may be expired');
    }
  }
}
