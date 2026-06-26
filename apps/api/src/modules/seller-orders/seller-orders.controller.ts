import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { SellerOrdersService } from './seller-orders.service';

@ApiTags('Seller Orders')
@ApiBearerAuth()
@Controller('seller/orders')
export class SellerOrdersController {
  constructor(private readonly sellerOrdersService: SellerOrdersService) {}

  @Get()
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: "List seller's orders (pending, today, history)" })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findOrders(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.sellerOrdersService.findOrders(user.sub, {
      status,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Get seller order details' })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.sellerOrdersService.findOne(user.sub, id);
  }
}
