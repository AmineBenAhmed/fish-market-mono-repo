import { Injectable } from '@nestjs/common';

import { QueryOrdersDto } from '../orders/dto/query-orders.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly ordersService: OrdersService) {}

  async findAll(query: QueryOrdersDto) {
    return this.ordersService.findAllAdmin(query);
  }
}
