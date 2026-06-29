import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AdminListingsController } from './admin-listings.controller';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [PrismaModule],
  controllers: [ListingsController, AdminListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
