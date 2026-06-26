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
  @ApiResponse({ status: 200, description: "Today's listings" })
  async findToday(@CurrentUser() user: JwtPayload) {
    return this.listingsService.findToday(user.sub);
  }

  @Get('history')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Get listing history for the current seller' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Listing history' })
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

  @Patch(':id')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Update a listing (price, quantity, status)' })
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

  @Patch(':id/reduce-stock')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Reduce stock by a quantity (e.g., after manual sale)' })
  @ApiResponse({ status: 200, description: 'Stock reduced' })
  async reduceStock(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.listingsService.reduceStock(user.sub, id, quantity);
  }
}
