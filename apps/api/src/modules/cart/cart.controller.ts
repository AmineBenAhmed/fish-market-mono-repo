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

import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles('CUSTOMER', 'SELLER', 'ADMIN')
  @ApiOperation({ summary: 'View current cart' })
  async findCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.findCart(user.sub);
  }

  @Post('items')
  @Roles('CUSTOMER', 'SELLER', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added' })
  @ApiResponse({ status: 400, description: 'Validation error or insufficient stock' })
  async addItem(@CurrentUser() user: JwtPayload, @Body() dto: AddItemDto) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Patch('items/:id')
  @Roles('CUSTOMER', 'SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(user.sub, id, dto);
  }

  @Delete('items/:id')
  @Roles('CUSTOMER', 'SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.cartService.removeItem(user.sub, id);
    return { message: 'Item removed' };
  }

  @Delete()
  @Roles('CUSTOMER', 'SELLER', 'ADMIN')
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@CurrentUser() user: JwtPayload) {
    await this.cartService.clearCart(user.sub);
    return { message: 'Cart cleared' };
  }
}
