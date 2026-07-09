import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGovernorates() {
    return this.prisma.governorate.findMany({ orderBy: { name: 'asc' } });
  }

  async getGovernorateById(slug: string) {
    return (
      this.prisma.governorate.findUnique({ where: { slug } }) ??
      (await this.prisma.governorate.findUnique({ where: { id: slug } }))
    );
  }

  async getAreas(governorateSlug: string) {
    const gov =
      (await this.prisma.governorate.findUnique({ where: { slug: governorateSlug } })) ??
      (await this.prisma.governorate.findUnique({ where: { id: governorateSlug } }));
    if (!gov) throw new NotFoundException('Governorate not found');
    return this.prisma.area.findMany({
      where: { governorateId: gov.id },
      orderBy: { name: 'asc' },
    });
  }

  async getZones(governorateSlug: string, areaSlug: string) {
    const gov =
      (await this.prisma.governorate.findUnique({ where: { slug: governorateSlug } })) ??
      (await this.prisma.governorate.findUnique({ where: { id: governorateSlug } }));
    if (!gov) throw new NotFoundException('Governorate not found');
    const area =
      (await this.prisma.area.findUnique({ where: { slug: areaSlug } })) ??
      (await this.prisma.area.findUnique({ where: { id: areaSlug } }));
    if (!area) throw new NotFoundException('Area not found');
    if (area.governorateId !== gov.id)
      throw new NotFoundException('Area not found in this governorate');
    const zones = await this.prisma.zone.findMany({
      where: { areaId: area.id },
      orderBy: { name: 'asc' },
    });
    if (zones.length === 0) throw new NotFoundException('Area not found');
    return zones;
  }
}
