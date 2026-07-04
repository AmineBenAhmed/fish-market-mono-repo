import { Injectable } from '@nestjs/common';

import { QueryOrdersDto } from '../orders/dto/query-orders.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly ordersService: OrdersService) {}

  async findAll(query: QueryOrdersDto) {
    return this.ordersService.findAllAdmin(query);
  }

  async updateStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(userId, orderId, dto);
  }
}
