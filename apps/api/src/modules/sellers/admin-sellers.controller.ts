import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { AdminCreateSellerDto } from './dto/admin-create-seller.dto';
import { AdminUpdateSellerDto } from './dto/admin-update-seller.dto';
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

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get seller profile by id' })
  async findOne(@Param('id') id: string) {
    return this.sellersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a seller profile (store)' })
  async create(@Body() dto: AdminCreateSellerDto) {
    return this.sellersService.adminCreate(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update seller profile (store)' })
  async update(@Param('id') id: string, @Body() dto: AdminUpdateSellerDto) {
    return this.sellersService.adminUpdate(id, dto);
  }
}
