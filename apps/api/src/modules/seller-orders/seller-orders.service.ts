import { Injectable } from '@nestjs/common';

import { QueryOrdersDto } from '../orders/dto/query-orders.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class SellerOrdersService {
  constructor(private readonly ordersService: OrdersService) {}

  async findOrders(sellerUserId: string, query: QueryOrdersDto) {
    return this.ordersService.findSellerOrders(sellerUserId, query);
  }

  async findOne(sellerUserId: string, orderId: string) {
    return this.ordersService.findSellerOrder(sellerUserId, orderId);
  }
}
