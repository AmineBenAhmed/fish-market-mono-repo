import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators';
import { ListingsService } from './listings.service';

@ApiTags('Admin Listings')
@ApiBearerAuth()
@Controller('admin/listings')
export class AdminListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update listing status (admin)' })
  @ApiParam({ name: 'id', type: String })
  async updateStatus(@Param('id') id: string, @Body('status') status: ListingStatus) {
    return this.listingsService.updateStatusAdmin(id, status);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a single listing with full details (admin)' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.listingsService.findOneAdmin(id);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'View all listings across all sellers (admin)' })
  @ApiQuery({ name: 'storeName', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('storeName') storeName?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.listingsService.findAllAdmin({
      storeName,
      fromDate,
      toDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: sortBy as 'createdAt' | 'price' | 'quantity' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
  }
}
