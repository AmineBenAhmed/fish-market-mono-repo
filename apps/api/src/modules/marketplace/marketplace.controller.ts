import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators';
import { CreateOrderDto } from './dto/create-order.dto';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@Public()
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('today')
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
  @ApiOperation({ summary: 'Browse fish by category for today' })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Category listings' })
  async findByCategory(@Param('id') categoryId: string, @Query('city') city?: string) {
    return this.marketplaceService.findToday({ categoryId, city });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search available fish' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Query('q') q: string) {
    return this.marketplaceService.search(q);
  }

  @Get('listings')
  @ApiOperation({ summary: 'Browse all listings with pagination (no date filter)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated listings' })
  async findAllListings(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.marketplaceService.findAllListings({
      categoryId,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Get a single listing by ID' })
  @ApiResponse({ status: 200, description: 'Listing details' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async findOneListing(@Param('id') id: string) {
    return this.marketplaceService.findOneListing(id);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create an order as a guest' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.marketplaceService.createOrder(dto);
  }

  @Get('sellers/:sellerId')
  @ApiOperation({ summary: 'See all listings from a specific seller for today' })
  @ApiResponse({ status: 200, description: 'Seller listings' })
  async findBySeller(@Param('sellerId') sellerId: string) {
    return this.marketplaceService.findBySeller(sellerId);
  }
}
