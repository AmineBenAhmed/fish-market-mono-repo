import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile with all profiles' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user basic profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete own account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    await this.usersService.softDelete(user.sub);
    return { message: 'Account deleted successfully' };
  }

  @Patch('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update avatar file reference' })
  @ApiResponse({ status: 200, description: 'Avatar updated' })
  async updateAvatar(@CurrentUser() user: JwtPayload, @Body('fileId') fileId: string) {
    return this.usersService.updateAvatar(user.sub, fileId);
  }
}
