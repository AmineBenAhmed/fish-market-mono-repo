import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  sellerId: string | null;
  total: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/admin',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    this.logger.log(`Admin client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Admin client disconnected: ${client.id}`);
  }

  @OnEvent('order.created')
  handleOrderCreated(payload: OrderCreatedPayload): void {
    this.logger.log(`Broadcasting order.created: #${payload.orderNumber} (${payload.total})`);
    this.server.emit('order.created', payload);
  }
}
