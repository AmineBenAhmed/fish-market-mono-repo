import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get own driver profile' })
  @ApiResponse({ status: 200, description: 'Driver profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.driversService.getProfile(user.sub);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own driver profile' })
  @ApiResponse({ status: 200, description: 'Driver profile updated' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateDriverDto) {
    return this.driversService.updateProfile(user.sub, dto);
  }

  @Patch('me/online')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set driver online' })
  @ApiResponse({ status: 200, description: 'Driver is now online' })
  async goOnline(@CurrentUser() user: JwtPayload) {
    return this.driversService.setOnlineStatus(user.sub, 'ONLINE');
  }

  @Patch('me/offline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set driver offline' })
  @ApiResponse({ status: 200, description: 'Driver is now offline' })
  async goOffline(@CurrentUser() user: JwtPayload) {
    return this.driversService.setOnlineStatus(user.sub, 'OFFLINE');
  }
}
