import { Module } from '@nestjs/common';

import { DeliveryPricingModule } from '../delivery-pricing/delivery-pricing.module';
import { EventsModule } from '../events/events.module';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

@Module({
  imports: [EventsModule, DeliveryPricingModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}
