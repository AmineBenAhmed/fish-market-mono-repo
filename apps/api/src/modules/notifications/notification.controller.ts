import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Get my notifications' })
  async findAll(@CurrentUser() user: JwtPayload, @Query() query: NotificationQueryDto) {
    return this.notificationService.findByUser(user.sub, query);
  }

  @Get('unread-count')
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@CurrentUser() user: JwtPayload) {
    const count = await this.notificationService.getUnreadCount(user.sub);
    return { unreadCount: count };
  }

  @Get(':id')
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Get notification details' })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationService.findOne(id, user.sub);
  }

  @Patch(':id/read')
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, user.sub);
  }

  @Patch('read-all')
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllAsRead(user.sub);
  }

  @Delete(':id')
  @Roles('CUSTOMER', 'SELLER', 'DRIVER', 'ADMIN')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationService.remove(id, user.sub);
  }
}
