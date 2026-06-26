import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AdminDeliveryZoneController } from './admin-delivery-zone.controller';
import { DeliveryZoneService } from './delivery-zone.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminDeliveryZoneController],
  providers: [DeliveryZoneService],
  exports: [DeliveryZoneService],
})
export class DeliveryZoneModule {}
