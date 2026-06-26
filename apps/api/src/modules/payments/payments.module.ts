import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { EventsModule } from '../events/events.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentProviderRegistry } from './payment-provider.registry';
import { AdminPaymentsController, PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BankTransferProvider } from './providers/bank-transfer.provider';
import { CashOnDeliveryProvider } from './providers/cash-on-delivery.provider';
import { StripeProvider } from './providers/stripe.provider';

@Module({
  imports: [PrismaModule, WalletModule, BillingModule, EventsModule],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [
    PaymentsService,
    PaymentProviderRegistry,
    CashOnDeliveryProvider,
    BankTransferProvider,
    StripeProvider,
  ],
  exports: [PaymentsService, PaymentProviderRegistry],
})
export class PaymentsModule {}
