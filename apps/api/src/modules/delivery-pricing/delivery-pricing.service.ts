import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryPricingDto } from './dto/create-delivery-pricing.dto';
import { UpdateDeliveryPricingDto } from './dto/update-delivery-pricing.dto';

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
}
