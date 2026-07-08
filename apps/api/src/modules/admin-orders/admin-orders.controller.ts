import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { AdminOrdersService } from './admin-orders.service';
import { AssignOrderDriverDto } from './dto/assign-order-driver.dto';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'View all orders (admin)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('driverId') driverId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminOrdersService.findAll({
      status,
      search,
      startDate,
      endDate,
      driverId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post(':id/assign-driver')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign a driver to an order (admin only)' })
  @ApiResponse({ status: 200, description: 'Driver assigned' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async assignDriver(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AssignOrderDriverDto,
  ) {
    return this.adminOrdersService.assignDriver(id, dto, user.sub);
  }

  @Post(':id/unassign-driver')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Unassign driver from an order (admin only)' })
  @ApiResponse({ status: 200, description: 'Driver unassigned' })
  @ApiResponse({ status: 400, description: 'No driver assigned' })
  async unassignDriver(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adminOrdersService.unassignDriver(id, user.sub);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 400, description: 'Invalid transition' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminOrdersService.updateStatus(user.sub, id, dto);
  }
}
