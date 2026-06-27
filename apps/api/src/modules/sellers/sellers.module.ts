import { Module } from '@nestjs/common';

import { AdminSellersController } from './admin-sellers.controller';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';

@Module({
  controllers: [SellersController, AdminSellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
