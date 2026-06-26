import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { QueryWalletTransactionsDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Get current user wallet' })
  async getWallet(@CurrentUser() user: JwtPayload) {
    return this.walletService.getWallet(user.sub);
  }

  @Get('transactions')
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryWalletTransactionsDto,
  ) {
    return this.walletService.getTransactions(user.sub, query);
  }
}

@ApiTags('Admin Wallet')
@ApiBearerAuth()
@Controller('admin/transactions')
export class AdminTransactionsController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all transactions (admin)' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(@Query() query: QueryWalletTransactionsDto) {
    return this.walletService.getTransactions('admin', query);
  }
}
