import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@Public()
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('today')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Browse all available fish for today' })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'qualityGrade', required: false, type: String })
  @ApiQuery({ name: 'preservation', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['price', 'date', 'name'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: "Today's available fish" })
  async findToday(
    @Query('city') city?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('qualityGrade') qualityGrade?: string,
    @Query('preservation') preservation?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.marketplaceService.findToday({
      city,
      categoryId,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      qualityGrade,
      preservation,
      sortBy: sortBy as 'price' | 'date' | 'name' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('category/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Browse fish by category for today' })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Category listings' })
  async findByCategory(@Param('id') categoryId: string, @Query('city') city?: string) {
    return this.marketplaceService.findToday({ categoryId, city });
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search available fish' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Query('q') q: string) {
    return this.marketplaceService.search(q);
  }

  @Get('sellers/:sellerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'See all listings from a specific seller for today' })
  @ApiResponse({ status: 200, description: 'Seller listings' })
  async findBySeller(@Param('sellerId') sellerId: string) {
    return this.marketplaceService.findBySeller(sellerId);
  }
}
