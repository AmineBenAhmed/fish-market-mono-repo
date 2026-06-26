import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { SellersService } from './sellers.service';

@ApiTags('Sellers')
@ApiBearerAuth()
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply to become a seller' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  @ApiResponse({ status: 409, description: 'Already applied or is a seller' })
  async apply(@CurrentUser() user: JwtPayload, @Body() dto: ApplySellerDto) {
    return this.sellersService.apply(user.sub, dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get own seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.sellersService.getProfile(user.sub);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile updated' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSellerDto) {
    return this.sellersService.updateProfile(user.sub, dto);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve seller application' })
  @ApiResponse({ status: 200, description: 'Seller approved' })
  async approve(@Param('id') id: string) {
    return this.sellersService.updateVerification(id, 'APPROVED');
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject seller application' })
  @ApiResponse({ status: 200, description: 'Seller rejected' })
  async reject(@Param('id') id: string) {
    return this.sellersService.updateVerification(id, 'REJECTED');
  }
}
