import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeliveryStatus, OrderStatus, Prisma } from '@prisma/client';

import { createPaginationMeta, parsePagination } from '../../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { DeliveryQueryDto } from './dto/delivery-query.dto';
import { DeliveryAssignmentService } from './delivery-assignment.service';
import { DeliveryStateService } from './delivery-state.service';
import { DeliveryTrackingService } from './delivery-tracking.service';

@Injectable()
export class DeliveriesService {
  private readonly logger = new Logger(DeliveriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: DeliveryStateService,
    private readonly assignmentService: DeliveryAssignmentService,
    private readonly trackingService: DeliveryTrackingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async recordStatusHistory(
    deliveryId: string,
    fromStatus: DeliveryStatus | null,
    toStatus: DeliveryStatus,
  ) {
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus,
        toStatus,
      },
    });
  }

  async create(orderId: string, addressId: string): Promise<Record<string, unknown>> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, delivery: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.delivery) throw new BadRequestException('Delivery already exists for this order');

    const delivery = await this.prisma.delivery.create({
      data: {
        orderId,
        addressId,
        status: DeliveryStatus.PENDING_ASSIGNMENT,
      },
    });

    await this.recordStatusHistory(delivery.id, null, DeliveryStatus.PENDING_ASSIGNMENT);
    this.logger.log(`Delivery created: ${delivery.id} for order ${orderId}`);

    return {
      id: delivery.id,
      status: delivery.status,
      orderId: delivery.orderId,
    };
  }

  async assign(deliveryId: string, dto: AssignDriverDto, assignedBy: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        driver: { select: { id: true } },
        order: { select: { status: true, id: true } },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new BadRequestException('Order must be READY_FOR_PICKUP before assigning a driver');
    }

    this.stateService.validateTransition(delivery.status, DeliveryStatus.ASSIGNED);

    const driver = await this.prisma.driverProfile.findUnique({
      where: { userId: dto.driverId },
    });

    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.status === 'OFFLINE') throw new BadRequestException('Driver is offline');
    if (!driver.isAvailable) throw new BadRequestException('Driver is not available');

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          driverId: dto.driverId,
          status: DeliveryStatus.ASSIGNED,
          notes: dto.notes,
        },
      });

      await tx.driverProfile.update({
        where: { userId: dto.driverId },
        data: { activeDeliveries: { increment: 1 } },
      });

      await this.recordStatusHistory(deliveryId, delivery.status, DeliveryStatus.ASSIGNED);

      return tx.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          driver: { select: { id: true, name: true, phone: true } },
          order: { select: { id: true, orderNumber: true } },
        },
      });
    });

    this.eventEmitter.emit('delivery.assigned', {
      deliveryId,
      orderId: delivery.order.id,
      driverId: dto.driverId,
      assignedBy,
    });

    this.logger.log(`Driver ${dto.driverId} assigned to delivery ${deliveryId}`);
    return result;
  }

  async autoAssign(deliveryId: string, zoneId?: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { select: { status: true } } },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    this.stateService.validateTransition(delivery.status, DeliveryStatus.ASSIGNED);

    const assignment = await this.assignmentService.assignAutomatically(deliveryId, zoneId);
    if (!assignment) {
      throw new BadRequestException('No available driver found');
    }

    return this.assign(deliveryId, { driverId: assignment.driverId }, 'SYSTEM');
  }

  async acceptDelivery(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { orderId: true },
    });

    const result = await this.transition(deliveryId, driverId, DeliveryStatus.ACCEPTED, null);

    this.eventEmitter.emit('delivery.accepted', {
      deliveryId,
      orderId: delivery?.orderId ?? '',
      driverId,
    });

    return result;
  }

  async rejectDelivery(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: { select: { id: true, status: true } },
        driver: { select: { name: true } },
      },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.driverId !== driverId) throw new NotFoundException('Delivery not found');

    this.stateService.validateTransition(delivery.status, DeliveryStatus.CANCELLED);

    const driverName = delivery.driver?.name || driverId;

    await this.prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: DeliveryStatus.CANCELLED, driverId: null },
      });

      await tx.order.update({
        where: { id: delivery.order.id },
        data: { status: OrderStatus.READY_FOR_PICKUP },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.order.id,
          fromStatus: delivery.order.status as OrderStatus,
          toStatus: OrderStatus.READY_FOR_PICKUP,
          changedById: driverId,
          reason: `Driver ${driverName} refused the delivery`,
        },
      });

      await tx.driverProfile.update({
        where: { userId: driverId },
        data: { activeDeliveries: { decrement: 1 } },
      });

      await this.recordStatusHistory(deliveryId, delivery.status, DeliveryStatus.CANCELLED);
    });

    this.eventEmitter.emit('delivery.rejected', {
      deliveryId,
      orderId: delivery.orderId,
      driverId,
    });

    this.logger.log(`Delivery ${deliveryId} rejected by driver ${driverId}`);
    return { message: 'Delivery rejected' };
  }

  async startPickup(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { orderId: true },
    });

    const result = await this.transition(deliveryId, driverId, DeliveryStatus.PICKING_UP, null);

    this.eventEmitter.emit('delivery.picking-up', {
      deliveryId,
      orderId: delivery?.orderId ?? '',
      driverId,
    });

    return result;
  }

  async pickup(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { orderId: true },
    });

    const result = await this.transition(
      deliveryId,
      driverId,
      DeliveryStatus.PICKED_UP,
      'pickedUpAt',
    );

    this.eventEmitter.emit('delivery.picked-up', {
      deliveryId,
      orderId: delivery?.orderId ?? '',
      driverId,
    });

    return result;
  }

  async startDelivery(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { orderId: true },
    });

    const result = await this.transition(deliveryId, driverId, DeliveryStatus.IN_TRANSIT, null);

    this.eventEmitter.emit('delivery.in-transit', {
      deliveryId,
      orderId: delivery?.orderId ?? '',
      driverId,
    });

    return result;
  }

  async complete(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { select: { id: true, status: true } } },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.driverId !== driverId) throw new NotFoundException('Delivery not found');
    if (!this.stateService.canBeCompleted(delivery.status)) {
      throw new BadRequestException('Delivery must be picked up before completing');
    }

    this.stateService.validateTransition(delivery.status, DeliveryStatus.DELIVERED);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: delivery.order.id },
        data: { status: OrderStatus.DELIVERED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.order.id,
          fromStatus: delivery.order.status,
          toStatus: OrderStatus.DELIVERED,
          changedById: driverId,
          reason: 'Driver completed delivery',
        },
      });

      await tx.driverProfile.update({
        where: { userId: driverId },
        data: { activeDeliveries: { decrement: 1 } },
      });

      await this.recordStatusHistory(deliveryId, delivery.status, DeliveryStatus.DELIVERED);

      return tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { driver: { select: { id: true, name: true } } },
      });
    });

    this.eventEmitter.emit('delivery.completed', {
      deliveryId,
      orderId: delivery.order.id,
      driverId,
      deliveredAt: new Date(),
    });

    this.logger.log(`Delivery ${deliveryId} completed by driver ${driverId}`);
    return result;
  }

  async fail(deliveryId: string, reason: string, changedBy: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { select: { id: true, status: true } } },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    this.stateService.validateTransition(delivery.status, DeliveryStatus.FAILED);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.FAILED,
          failedAt: new Date(),
          failReason: reason,
        },
      });

      await tx.driverProfile.update({
        where: { userId: delivery.driverId! },
        data: { activeDeliveries: { decrement: 1 } },
      });

      await this.recordStatusHistory(deliveryId, delivery.status, DeliveryStatus.FAILED);

      return tx.delivery.findUnique({ where: { id: deliveryId } });
    });

    this.eventEmitter.emit('delivery.failed', {
      deliveryId,
      orderId: delivery.order.id,
      driverId: delivery.driverId ?? '',
      reason,
    });

    this.logger.log(`Delivery ${deliveryId} failed: ${reason}`);
    return result;
  }

  async cancel(deliveryId: string, reason?: string, cancelledBy?: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { select: { id: true, status: true } } },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    if (this.stateService.isTerminal(delivery.status)) {
      throw new BadRequestException('Cannot cancel a completed delivery');
    }

    this.stateService.validateTransition(delivery.status, DeliveryStatus.CANCELLED);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: DeliveryStatus.CANCELLED, failReason: reason },
      });

      if (delivery.driverId) {
        await tx.driverProfile.update({
          where: { userId: delivery.driverId },
          data: { activeDeliveries: { decrement: 1 } },
        });
      }

      await this.recordStatusHistory(deliveryId, delivery.status, DeliveryStatus.CANCELLED);

      return tx.delivery.findUnique({ where: { id: deliveryId } });
    });

    this.eventEmitter.emit('delivery.cancelled', {
      deliveryId,
      orderId: delivery.order.id,
      driverId: delivery.driverId,
      reason,
    });

    this.logger.log(`Delivery ${deliveryId} cancelled: ${reason}`);
    return result;
  }

  private async transition(
    deliveryId: string,
    driverId: string,
    toStatus: DeliveryStatus,
    timestampField: string | null,
  ) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { select: { id: true, status: true } } },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.driverId !== driverId) throw new NotFoundException('Delivery not found');

    this.stateService.validateTransition(delivery.status, toStatus);

    const updateData: Record<string, unknown> = { status: toStatus };
    if (timestampField) updateData[timestampField] = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: updateData,
      });

      await this.recordStatusHistory(deliveryId, delivery.status, toStatus);

      if (toStatus === DeliveryStatus.ACCEPTED) {
        await tx.order.update({
          where: { id: delivery.order.id },
          data: { status: OrderStatus.ACCEPTED },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: delivery.order.id,
            fromStatus: delivery.order.status,
            toStatus: OrderStatus.ACCEPTED,
            changedById: driverId,
            reason: 'Driver accepted delivery',
          },
        });
      } else if (toStatus === DeliveryStatus.PICKING_UP) {
        await tx.order.update({
          where: { id: delivery.order.id },
          data: { status: OrderStatus.ARRIVED },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: delivery.order.id,
            fromStatus: delivery.order.status,
            toStatus: OrderStatus.ARRIVED,
            changedById: driverId,
            reason: 'Driver arrived at seller store',
          },
        });
      } else if (toStatus === DeliveryStatus.PICKED_UP) {
        await tx.order.update({
          where: { id: delivery.order.id },
          data: { status: OrderStatus.PICKED_UP },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: delivery.order.id,
            fromStatus: delivery.order.status,
            toStatus: OrderStatus.PICKED_UP,
            changedById: driverId,
            reason: 'Driver picked up order',
          },
        });
      } else if (toStatus === DeliveryStatus.IN_TRANSIT) {
        await tx.order.update({
          where: { id: delivery.order.id },
          data: { status: OrderStatus.OUT_FOR_DELIVERY },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: delivery.order.id,
            fromStatus: delivery.order.status,
            toStatus: OrderStatus.OUT_FOR_DELIVERY,
            changedById: driverId,
            reason: 'Driver en route to customer',
          },
        });
      }

      return tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { driver: { select: { id: true, name: true } } },
      });
    });

    this.logger.log(`Delivery ${deliveryId} → ${toStatus}`);
    return result;
  }

  async findOne(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            customer: { select: { id: true, name: true, phone: true } },
            seller: {
              select: {
                id: true,
                name: true,
                phone: true,
                sellerProfiles: {
                  select: {
                    storeName: true,
                    pickupAddress: true,
                    city: true,
                    state: true,
                    lat: true,
                    lng: true,
                  },
                },
              },
            },
          },
        },
        driver: { select: { id: true, name: true, phone: true } },
        address: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    let driverLocation = null;
    if (delivery.driverId) {
      driverLocation = await this.trackingService.getDriverLocation(delivery.driverId);
    }

    return { ...delivery, driverLocation };
  }

  async findByDriver(driverId: string, filters: DeliveryQueryDto) {
    return this.findAll({ ...filters, driverId });
  }

  async findByOrder(orderId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found for this order');
    return delivery;
  }

  async findAll(filters: DeliveryQueryDto) {
    const where: Prisma.DeliveryWhereInput = {};
    if (filters.status) where.status = filters.status as DeliveryStatus;
    if (filters.driverId) where.driverId = filters.driverId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const { page, limit, skip } = parsePagination(filters.page, filters.limit);

    const [data, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              seller: {
                select: {
                  name: true,
                  sellerProfiles: { select: { storeName: true } },
                },
              },
            },
          },
          driver: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.delivery.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }
}
