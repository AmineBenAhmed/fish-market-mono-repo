import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UserSettingsService } from './user-settings.service';

@ApiTags('User Settings')
@ApiBearerAuth()
@Controller('settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({ status: 200, description: 'User settings' })
  async getSettings(@CurrentUser() user: JwtPayload) {
    return this.userSettingsService.getSettings(user.sub);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSettingsDto) {
    return this.userSettingsService.updateSettings(user.sub, dto);
  }
}
