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

interface DeliveryBasePayload {
  deliveryId: string;
  orderId: string;
  driverId: string;
}

interface DeliveryAssignedPayload extends DeliveryBasePayload {
  assignedBy: string;
}

interface DeliveryCompletedPayload extends DeliveryBasePayload {
  deliveredAt: Date;
}

interface DeliveryFailedPayload extends DeliveryBasePayload {
  reason: string;
}

interface DeliveryCancelledPayload extends DeliveryBasePayload {
  reason?: string;
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

  @OnEvent('delivery.assigned')
  handleDeliveryAssigned(payload: DeliveryAssignedPayload): void {
    this.server.emit('delivery.assigned', payload);
  }

  @OnEvent('delivery.accepted')
  handleDeliveryAccepted(payload: DeliveryBasePayload): void {
    this.server.emit('delivery.accepted', payload);
  }

  @OnEvent('delivery.rejected')
  handleDeliveryRejected(payload: DeliveryBasePayload): void {
    this.server.emit('delivery.rejected', payload);
  }

  @OnEvent('delivery.picking-up')
  handleDeliveryPickingUp(payload: DeliveryBasePayload): void {
    this.server.emit('delivery.picking-up', payload);
  }

  @OnEvent('delivery.picked-up')
  handleDeliveryPickedUp(payload: DeliveryBasePayload): void {
    this.server.emit('delivery.picked-up', payload);
  }

  @OnEvent('delivery.in-transit')
  handleDeliveryInTransit(payload: DeliveryBasePayload): void {
    this.server.emit('delivery.in-transit', payload);
  }

  @OnEvent('delivery.completed')
  handleDeliveryCompleted(payload: DeliveryCompletedPayload): void {
    this.server.emit('delivery.completed', payload);
  }

  @OnEvent('delivery.failed')
  handleDeliveryFailed(payload: DeliveryFailedPayload): void {
    this.server.emit('delivery.failed', payload);
  }

  @OnEvent('delivery.cancelled')
  handleDeliveryCancelled(payload: DeliveryCancelledPayload): void {
    this.server.emit('delivery.cancelled', payload);
  }
}
