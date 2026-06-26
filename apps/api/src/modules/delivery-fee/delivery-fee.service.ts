import { Injectable } from '@nestjs/common';

export interface DeliveryFeeInput {
  sellerCity: string;
  customerCity: string;
  distanceKm?: number;
  subtotal: number;
  isExpress?: boolean;
}

export type DeliveryFeeStrategy = 'FLAT' | 'DISTANCE_BASED' | 'ZONE_BASED' | 'FREE_ABOVE_THRESHOLD';

export interface DeliveryFeeConfig {
  strategy: DeliveryFeeStrategy;
  flatRate?: number;
  perKmRate?: number;
  freeThreshold?: number;
  zoneRates?: Record<string, number>;
}

@Injectable()
export class DeliveryFeeService {
  private readonly defaultConfig: DeliveryFeeConfig = {
    strategy: 'FLAT',
    flatRate: 5,
    freeThreshold: 100,
  };

  calculate(input: DeliveryFeeInput, config?: DeliveryFeeConfig): number {
    const cfg = config ?? this.defaultConfig;

    if (cfg.freeThreshold && input.subtotal >= cfg.freeThreshold) {
      return 0;
    }

    switch (cfg.strategy) {
      case 'FLAT':
        return cfg.flatRate ?? 0;

      case 'DISTANCE_BASED': {
        const distance = input.distanceKm ?? 0;
        const perKm = cfg.perKmRate ?? 1;
        return Math.round(distance * perKm * 100) / 100;
      }

      case 'ZONE_BASED': {
        if (cfg.zoneRates) {
          const zoneKey = `${input.sellerCity}-${input.customerCity}`;
          return cfg.zoneRates[zoneKey] ?? cfg.flatRate ?? 5;
        }
        return cfg.flatRate ?? 5;
      }

      case 'FREE_ABOVE_THRESHOLD':
        return 0;

      default:
        return cfg.flatRate ?? 5;
    }
  }

  calculateForOrder(
    items: { sellerCity: string; subtotal: number }[],
    customerCity: string,
    config?: DeliveryFeeConfig,
  ): number {
    if (items.length === 0) return 0;

    const totalSubtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const sellerCities = [...new Set(items.map((i) => i.sellerCity))];

    if (sellerCities.length === 1) {
      return this.calculate(
        {
          sellerCity: sellerCities[0],
          customerCity,
          subtotal: totalSubtotal,
        },
        config,
      );
    }

    let totalFee = 0;
    for (const item of items) {
      const itemFee = this.calculate(
        {
          sellerCity: item.sellerCity,
          customerCity,
          subtotal: item.subtotal,
        },
        config,
      );
      totalFee += itemFee;
    }

    return Math.round(totalFee * 100) / 100;
  }
}
