import { Injectable, OnModuleInit } from '@nestjs/common';

import { PaymentProvider } from './interfaces/payment-provider.interface';
import { BankTransferProvider } from './providers/bank-transfer.provider';
import { CashOnDeliveryProvider } from './providers/cash-on-delivery.provider';
import { StripeProvider } from './providers/stripe.provider';

@Injectable()
export class PaymentProviderRegistry implements OnModuleInit {
  private providers = new Map<string, PaymentProvider>();

  constructor(
    private readonly cashOnDelivery: CashOnDeliveryProvider,
    private readonly bankTransfer: BankTransferProvider,
    private readonly stripe: StripeProvider,
  ) {}

  onModuleInit(): void {
    this.register(this.cashOnDelivery);
    this.register(this.bankTransfer);
    this.register(this.stripe);
  }

  register(provider: PaymentProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(
        `Payment provider "${name}" is not registered. Available: ${this.getAvailable().join(', ')}`,
      );
    }
    return provider;
  }

  getAvailable(): string[] {
    return Array.from(this.providers.keys());
  }
}
