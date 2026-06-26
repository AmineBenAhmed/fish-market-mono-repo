import { Injectable } from '@nestjs/common';

export interface CommissionInput {
  subtotal: number;
  commissionRate: number;
}

export interface CommissionResult {
  commissionAmount: number;
  commissionRate: number;
  netAmount: number;
}

export type CommissionStrategy = 'PERCENTAGE' | 'FIXED';

export interface CommissionConfig {
  strategy: CommissionStrategy;
  rate: number;
  fixedAmount?: number;
  maxCap?: number;
  minAmount?: number;
}

@Injectable()
export class CommissionService {
  calculate(input: CommissionInput, config?: CommissionConfig): CommissionResult {
    const cfg = config ?? {
      strategy: 'PERCENTAGE' as CommissionStrategy,
      rate: input.commissionRate,
    };

    let commissionAmount: number;

    if (cfg.strategy === 'FIXED') {
      commissionAmount = cfg.fixedAmount ?? 0;
    } else {
      commissionAmount = input.subtotal * cfg.rate;
    }

    if (cfg.maxCap !== undefined) {
      commissionAmount = Math.min(commissionAmount, cfg.maxCap);
    }

    if (cfg.minAmount !== undefined) {
      commissionAmount = Math.max(commissionAmount, cfg.minAmount);
    }

    commissionAmount = Math.round(commissionAmount * 100) / 100;

    return {
      commissionAmount,
      commissionRate: cfg.rate,
      netAmount: Math.round((input.subtotal - commissionAmount) * 100) / 100,
    };
  }

  calculateSellerEarnings(
    subtotal: number,
    commissionRate: number,
  ): {
    commission: number;
    sellerEarning: number;
    total: number;
  } {
    const commission = Math.round(subtotal * commissionRate * 100) / 100;
    const sellerEarning = Math.round((subtotal - commission) * 100) / 100;

    return {
      commission,
      sellerEarning,
      total: subtotal,
    };
  }

  calculateMarketplaceCommission(orders: { subtotal: number; rate: number }[]): {
    totalCommission: number;
    totalSellerEarnings: number;
  } {
    let totalCommission = 0;
    let totalSellerEarnings = 0;

    for (const order of orders) {
      const result = this.calculateSellerEarnings(order.subtotal, order.rate);
      totalCommission += result.commission;
      totalSellerEarnings += result.sellerEarning;
    }

    return {
      totalCommission: Math.round(totalCommission * 100) / 100,
      totalSellerEarnings: Math.round(totalSellerEarnings * 100) / 100,
    };
  }

  getCommissionRate(sellerProfile: { commissionRate: number }): number {
    return sellerProfile.commissionRate;
  }
}
