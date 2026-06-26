import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    let settings = await this.prisma.userSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSetting.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    await this.getSettings(userId);

    return this.prisma.userSetting.update({
      where: { userId },
      data: {
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.theme !== undefined && { theme: dto.theme }),
        ...(dto.marketingOptIn !== undefined && { marketingOptIn: dto.marketingOptIn }),
        ...(dto.notifyOrderUpdates !== undefined && { notifyOrderUpdates: dto.notifyOrderUpdates }),
        ...(dto.notifyPromotions !== undefined && { notifyPromotions: dto.notifyPromotions }),
      },
    });
  }
}
