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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles('SELLER', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a store' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStoreDto) {
    return this.storesService.create(user.sub, dto);
  }

  @Get()
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: "Get current seller's stores" })
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.storesService.findByUser(user.sub);
  }

  @Get(':id')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Get store by ID' })
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @Roles('SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Update a store' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @Roles('SELLER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.storesService.remove(user.sub, id);
  }
}
