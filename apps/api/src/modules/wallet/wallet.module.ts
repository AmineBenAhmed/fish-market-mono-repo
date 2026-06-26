import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AdminTransactionsController, WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [PrismaModule],
  controllers: [WalletController, AdminTransactionsController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
