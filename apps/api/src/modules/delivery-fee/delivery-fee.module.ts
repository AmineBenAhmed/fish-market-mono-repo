import { Module } from '@nestjs/common';

import { DeliveryFeeService } from './delivery-fee.service';

@Module({
  providers: [DeliveryFeeService],
  exports: [DeliveryFeeService],
})
export class DeliveryFeeModule {}
