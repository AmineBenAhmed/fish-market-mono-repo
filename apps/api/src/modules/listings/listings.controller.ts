import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

@ApiTags('Seller Listings')
@ApiBearerAuth()
@Controller('seller/listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @Roles('SELLER', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a daily listing as a seller' })
  @ApiResponse({ status: 201, description: 'Listing created' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.sub, dto);
  }

  @Get('today')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: "Get today's listings for the current seller" })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findToday(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.listingsService.findToday(user.sub, {
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: sortBy as 'createdAt' | 'price' | 'quantity' | 'productName' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
  }

  @Get('history')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Get listing history for the current seller' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listingsService.findHistory(user.sub, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('yesterday')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: "Get yesterday's listings for duplication" })
  async findYesterday(@CurrentUser() user: JwtPayload) {
    return this.listingsService.findYesterday(user.sub);
  }

  @Post('duplicate-yesterday')
  @Roles('SELLER', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplicate yesterday listings to today' })
  async duplicateYesterday(@CurrentUser() user: JwtPayload) {
    return this.listingsService.duplicateYesterday(user.sub);
  }

  @Get(':id')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Get listing details' })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.listingsService.findOne(user.sub, id);
  }

  @Patch(':id')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Update a listing' })
  @ApiResponse({ status: 200, description: 'Listing updated' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiResponse({ status: 200, description: 'Listing deleted' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.listingsService.remove(user.sub, id);
    return { message: 'Listing deleted' };
  }

  @Patch(':id/sold-out')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Mark a listing as sold out' })
  @ApiResponse({ status: 200, description: 'Listing marked as sold out' })
  async markSoldOut(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.listingsService.markSoldOut(user.sub, id);
  }
}
