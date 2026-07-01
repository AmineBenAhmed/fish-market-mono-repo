import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private categoryInclude = {
    children: { orderBy: { sortOrder: 'asc' as const } },
  };

  private mapCategory(cat: any) {
    const imageUrl = cat.imageUrl || '';
    const imageId = cat.imageFileId || cat.imageUrl || '';
    return {
      ...cat,
      image: imageUrl ? { id: imageId, url: imageUrl } : null,
    };
  }

  async findAll() {
    const categories = await this.prisma.fishCategory.findMany({
      include: this.categoryInclude,
      orderBy: { sortOrder: 'asc' },
    });
    return categories.map((cat) => this.mapCategory(cat));
  }

  async findOne(id: string) {
    const category = await this.prisma.fishCategory.findUnique({
      where: { id },
      include: {
        ...this.categoryInclude,
        parent: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.mapCategory(category);
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.fishCategory.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const category = await this.prisma.fishCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        imageFileId: dto.imageFileId,
        imageUrl: dto.imageUrl,
      },
      include: this.categoryInclude,
    });
    return this.mapCategory(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.fishCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.fishCategory.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Category slug already exists');
      }
    }

    const updated = await this.prisma.fishCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.imageFileId !== undefined && { imageFileId: dto.imageFileId }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
      include: this.categoryInclude,
    });
    return this.mapCategory(updated);
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.fishCategory.findUnique({
      where: { id },
      include: { children: true, products: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    if (category.products.length > 0) {
      throw new ConflictException('Cannot delete category with associated products');
    }

    await this.prisma.fishCategory.delete({ where: { id } });
  }
}
