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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all addresses for current user' })
  @ApiResponse({ status: 200, description: 'List of addresses' })
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.addressesService.findAll(user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.addressesService.remove(user.sub, id);
    return { message: 'Address deleted successfully' };
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({ status: 200, description: 'Default address updated' })
  async setDefault(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.addressesService.setDefault(user.sub, id);
  }
}
