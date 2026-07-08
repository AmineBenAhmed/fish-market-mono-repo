import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own driver profile' })
  @ApiResponse({ status: 200, description: 'Driver profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.driversService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own driver profile' })
  @ApiResponse({ status: 200, description: 'Driver profile updated' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateDriverDto) {
    return this.driversService.updateProfile(user.sub, dto);
  }

  @Patch('me/online')
  @ApiOperation({ summary: 'Set driver online' })
  @ApiResponse({ status: 200, description: 'Driver is now online' })
  async goOnline(@CurrentUser() user: JwtPayload) {
    return this.driversService.setOnlineStatus(user.sub, 'ONLINE');
  }

  @Patch('me/offline')
  @ApiOperation({ summary: 'Set driver offline' })
  @ApiResponse({ status: 200, description: 'Driver is now offline' })
  async goOffline(@CurrentUser() user: JwtPayload) {
    return this.driversService.setOnlineStatus(user.sub, 'OFFLINE');
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change own password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    await this.driversService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
    return { message: 'Senha alterada com sucesso' };
  }

  @Get('me/earnings')
  @ApiOperation({ summary: 'Get own earnings' })
  @ApiResponse({ status: 200, description: 'Earnings data' })
  async getEarnings(@CurrentUser() user: JwtPayload) {
    return this.driversService.getEarnings(user.sub);
  }
}
