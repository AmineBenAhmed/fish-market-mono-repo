import { Module } from '@nestjs/common';

import { OrdersModule } from '../orders/orders.module';
import { SellerOrdersController } from './seller-orders.controller';
import { SellerOrdersService } from './seller-orders.service';

@Module({
  imports: [OrdersModule],
  controllers: [SellerOrdersController],
  providers: [SellerOrdersService],
})
export class SellerOrdersModule {}
