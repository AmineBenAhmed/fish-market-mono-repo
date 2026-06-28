import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateStoreDto) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!profile) {
      throw new BadRequestException('Seller profile not found');
    }

    return this.prisma.store.create({
      data: {
        sellerId: profile.id,
        name: dto.name,
        description: dto.description,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
      },
    });
  }

  async findByUser(userId: string) {
    const profiles = await this.prisma.sellerProfile.findMany({
      where: { userId },
    });

    console.log({ profiles });

    if (profiles.length === 0) {
      return [];
    }

    const stores = await this.prisma.store.findMany({
      where: { sellerId: { in: profiles.map((p) => p.id) } },
      orderBy: { createdAt: 'desc' },
    });

    console.log({ stores });
    return stores;
  }

  async findOne(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async update(userId: string, storeId: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { seller: true },
    });

    if (!store || store.seller.userId !== userId) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: dto,
    });
  }

  async remove(userId: string, storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { seller: true },
    });

    if (!store || store.seller.userId !== userId) {
      throw new NotFoundException('Store not found');
    }

    await this.prisma.store.delete({ where: { id: storeId } });
  }
}
