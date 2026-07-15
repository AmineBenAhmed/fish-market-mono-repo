import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryPricingDto } from './dto/create-delivery-pricing.dto';
import { UpdateDeliveryPricingDto } from './dto/update-delivery-pricing.dto';

const DEFAULT_SAME_AREA = 3.5;
const DEFAULT_FALLBACK = 6;

@Injectable()
export class DeliveryPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeliveryPricingDto) {
    const existing = await this.prisma.deliveryPricing.findUnique({
      where: { fromAreaId_toAreaId: { fromAreaId: dto.fromAreaId, toAreaId: dto.toAreaId } },
    });
    if (existing) {
      throw new ConflictException('Delivery pricing already exists for this area pair');
    }
    return this.prisma.deliveryPricing.create({ data: dto });
  }

  async findAll() {
    return this.prisma.deliveryPricing.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const pricing = await this.prisma.deliveryPricing.findUnique({ where: { id } });
    if (!pricing) throw new NotFoundException('Delivery pricing not found');
    return pricing;
  }

  async update(id: string, dto: UpdateDeliveryPricingDto) {
    await this.findOne(id);
    return this.prisma.deliveryPricing.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deliveryPricing.delete({ where: { id } });
  }

  async calculate(customerAreaId: string, storeAreaId: string): Promise<number> {
    if (customerAreaId === storeAreaId) return DEFAULT_SAME_AREA;

    const pricing = await this.prisma.deliveryPricing.findFirst({
      where: {
        OR: [
          { fromAreaId: customerAreaId, toAreaId: storeAreaId },
          { fromAreaId: storeAreaId, toAreaId: customerAreaId },
        ],
      },
    });

    return pricing ? Number(pricing.price) : DEFAULT_FALLBACK;
  }

  async calculateBatch(
    customerAreaId: string,
    sellerIds: string[],
  ): Promise<Record<string, number>> {
    const profiles = await this.prisma.sellerProfile.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, address: { select: { areaId: true } } },
    });

    const fees: Record<string, number> = {};
    for (const profile of profiles) {
      if (profile.address?.areaId) {
        fees[profile.id] = await this.calculate(customerAreaId, profile.address.areaId);
      } else {
        fees[profile.id] = DEFAULT_FALLBACK;
      }
    }
    return fees;
  }
}
