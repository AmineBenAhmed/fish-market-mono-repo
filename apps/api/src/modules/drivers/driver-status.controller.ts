import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { DriversService } from './drivers.service';

@ApiTags('Driver Status')
@ApiBearerAuth()
@Controller('driver')
export class DriverStatusController {
  constructor(private readonly driversService: DriversService) {}

  @Patch('status')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Toggle driver online/offline status' })
  async setStatus(@CurrentUser() user: JwtPayload, @Body('status') status: 'ONLINE' | 'OFFLINE') {
    return this.driversService.setOnlineStatus(user.sub, status);
  }

  @Get('stats')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Get delivery stats' })
  async getStats(@CurrentUser() user: JwtPayload) {
    return this.driversService.getDeliveryStats(user.sub);
  }
}
