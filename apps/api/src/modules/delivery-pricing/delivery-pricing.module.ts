import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDeliveryPricingController } from './admin-delivery-pricing.controller';
import { DeliveryPricingService } from './delivery-pricing.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminDeliveryPricingController],
  providers: [DeliveryPricingService],
  exports: [DeliveryPricingService],
})
export class DeliveryPricingModule {}
