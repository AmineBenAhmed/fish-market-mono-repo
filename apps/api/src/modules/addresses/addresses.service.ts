import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAddressDto) {
    const count = await this.prisma.userAddress.count({
      where: { userId },
    });

    if (count >= 20) {
      throw new BadRequestException('Maximum of 20 addresses per user');
    }

    if (dto.isDefault) {
      await this.unsetDefault(userId);
    }

    const address = await this.prisma.userAddress.create({
      data: {
        userId,
        label: dto.label,
        street: dto.street,
        number: dto.number,
        complement: dto.complement,
        neighborhood: dto.neighborhood,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        lat: dto.lat,
        lng: dto.lng,
        isDefault: dto.isDefault ?? count === 0,
      },
    });

    if (address.isDefault) {
      await this.ensureCustomerProfile(userId, address.id);
    }

    return address;
  }

  async findAll(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(userId: string, addressId: string, dto: UpdateAddressDto) {
    await this.findOwned(userId, addressId);

    if (dto.isDefault) {
      await this.unsetDefault(userId);
    }

    const updated = await this.prisma.userAddress.update({
      where: { id: addressId },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.street !== undefined && { street: dto.street }),
        ...(dto.number !== undefined && { number: dto.number }),
        ...(dto.complement !== undefined && { complement: dto.complement }),
        ...(dto.neighborhood !== undefined && { neighborhood: dto.neighborhood }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });

    if (updated.isDefault) {
      await this.ensureCustomerProfile(userId, updated.id);
    }

    return updated;
  }

  async remove(userId: string, addressId: string): Promise<void> {
    await this.findOwned(userId, addressId);

    await this.prisma.userAddress.delete({
      where: { id: addressId },
    });
  }

  async setDefault(userId: string, addressId: string) {
    await this.findOwned(userId, addressId);

    await this.unsetDefault(userId);

    const updated = await this.prisma.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    await this.ensureCustomerProfile(userId, updated.id);

    return updated;
  }

  private async findOwned(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  private async unsetDefault(userId: string): Promise<void> {
    await this.prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  private async ensureCustomerProfile(userId: string, addressId: string): Promise<void> {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      await this.prisma.customerProfile.update({
        where: { userId },
        data: { defaultAddressId: addressId },
      });
    }
  }
}
