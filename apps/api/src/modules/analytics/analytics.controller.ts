import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue-trends')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Monthly revenue trends (commission + delivery fees)' })
  @ApiQuery({ name: 'months', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getRevenueTrends(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueTrends(
      months ? parseInt(months, 10) : 12,
      startDate,
      endDate,
    );
  }

  @Get('order-trends')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Monthly order volume trends' })
  @ApiQuery({ name: 'months', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getOrderTrends(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOrderTrends(
      months ? parseInt(months, 10) : 12,
      startDate,
      endDate,
    );
  }

  @Get('user-growth')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Monthly new user registrations' })
  @ApiQuery({ name: 'months', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getUserGrowth(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getUserGrowth(
      months ? parseInt(months, 10) : 12,
      startDate,
      endDate,
    );
  }

  @Get('seller-growth')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Monthly new seller registrations' })
  @ApiQuery({ name: 'months', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSellerGrowth(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSellerGrowth(
      months ? parseInt(months, 10) : 12,
      startDate,
      endDate,
    );
  }

  @Get('summary')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Summary KPI metrics for the top stats cards' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.analyticsService.getSummary(startDate, endDate);
  }
}
