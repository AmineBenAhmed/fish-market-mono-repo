import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.fishProduct.findMany({
      where: { isActive: true },
      include: {
        category: true,
        variants: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.fishProduct.findUnique({
      where: { id },
      include: {
        category: {
          include: { parent: true },
        },
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.fishProduct.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Product slug already exists');
    }

    return this.prisma.fishProduct.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        categoryId: dto.categoryId,
        description: dto.description,
        origin: dto.origin,
        preservation: dto.preservation ?? 'FRESH',
        qualityGrade: dto.qualityGrade ?? 'STANDARD',
        unitType: dto.unitType ?? 'KG',
        marketPriceMin: dto.marketPriceMin,
        marketPriceMax: dto.marketPriceMax,
      },
      include: { category: true, variants: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.fishProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.prisma.fishProduct.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Product slug already exists');
      }
    }

    return this.prisma.fishProduct.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.origin !== undefined && { origin: dto.origin }),
        ...(dto.preservation !== undefined && { preservation: dto.preservation }),
        ...(dto.qualityGrade !== undefined && { qualityGrade: dto.qualityGrade }),
        ...(dto.unitType !== undefined && { unitType: dto.unitType }),
        ...(dto.marketPriceMin !== undefined && { marketPriceMin: dto.marketPriceMin }),
        ...(dto.marketPriceMax !== undefined && { marketPriceMax: dto.marketPriceMax }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { category: true, variants: true },
    });
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.fishProduct.findUnique({
      where: { id },
      include: { listings: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.listings.length > 0) {
      throw new ConflictException('Cannot delete product with active listings');
    }

    await this.prisma.fishVariant.deleteMany({ where: { productId: id } });
    await this.prisma.fishProduct.delete({ where: { id } });
  }

  async createVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.fishProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.fishVariant.create({
      data: {
        productId,
        name: dto.name,
        description: dto.description,
        unit: dto.unit,
      },
    });
  }

  async updateVariant(productId: string, variantId: string, dto: UpdateVariantDto) {
    const variant = await this.prisma.fishVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.fishVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
      },
    });
  }

  async removeVariant(productId: string, variantId: string): Promise<void> {
    const variant = await this.prisma.fishVariant.findFirst({
      where: { id: variantId, productId },
      include: { listings: { where: { status: 'ACTIVE' } } },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    if (variant.listings.length > 0) {
      throw new ConflictException('Cannot delete variant with active listings');
    }

    await this.prisma.fishVariant.delete({ where: { id: variantId } });
  }
}
