import { Injectable } from '@nestjs/common';

interface CalculationItem {
  unitPrice: number;
  quantity: number;
}

interface SellerCalculation {
  items: CalculationItem[];
  commissionRate: number;
}

interface CalculationResult {
  subtotal: number;
  deliveryFee: number;
  commission: number;
  total: number;
}

@Injectable()
export class OrderCalculationService {
  calculateItemSubtotal(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }

  calculateSellerSubtotal(items: CalculationItem[]): number {
    return items.reduce(
      (sum, item) => sum + this.calculateItemSubtotal(item.unitPrice, item.quantity),
      0,
    );
  }

  calculateSellerOrder(seller: SellerCalculation): CalculationResult {
    const subtotal = this.calculateSellerSubtotal(seller.items);
    const deliveryFee = 0;
    const commission = subtotal * seller.commissionRate;
    const total = subtotal + deliveryFee + commission;
    return {
      subtotal,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  calculateMarketplaceOrder(sellerResults: CalculationResult[]): CalculationResult {
    const subtotal = sellerResults.reduce((s, r) => s + r.subtotal, 0);
    const deliveryFee = sellerResults.reduce((s, r) => s + r.deliveryFee, 0);
    const commission = sellerResults.reduce((s, r) => s + r.commission, 0);
    const total = sellerResults.reduce((s, r) => s + r.total, 0);
    return {
      subtotal,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}
