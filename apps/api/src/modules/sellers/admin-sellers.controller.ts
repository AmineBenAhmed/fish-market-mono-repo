import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { SellersService } from './sellers.service';

@ApiTags('Admin Sellers')
@ApiBearerAuth()
@Controller('admin/sellers')
export class AdminSellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all sellers with profiles' })
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sellersService.findAll({
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
