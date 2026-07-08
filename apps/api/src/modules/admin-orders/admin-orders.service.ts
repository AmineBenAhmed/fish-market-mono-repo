import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryStatus, OrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { QueryOrdersDto } from '../orders/dto/query-orders.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrdersService } from '../orders/orders.service';
import { AssignOrderDriverDto } from './dto/assign-order-driver.dto';

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: QueryOrdersDto) {
    return this.ordersService.findAllAdmin(query);
  }

  async updateStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(userId, orderId, dto);
  }

  async assignDriver(orderId: string, dto: AssignOrderDriverDto, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        delivery: true,
        customer: { select: { id: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const driver = await this.prisma.driverProfile.findUnique({
      where: { userId: dto.driverId },
      include: { user: { select: { name: true } } },
    });

    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.status === 'OFFLINE') throw new BadRequestException('Driver is offline');
    if (!driver.isAvailable) throw new BadRequestException('Driver is not available');

    let delivery = order.delivery;

    const result = await this.prisma.$transaction(async (tx) => {
      const orderStatus = order.status as OrderStatus;

      if (!delivery) {
        let addressId = dto.addressId;
        if (!addressId) {
          const addr = await tx.userAddress.findFirst({
            where: { userId: order.customer.id, isDefault: true },
          });
          addressId = addr?.id;
        }
        if (!addressId) {
          const addr = await tx.userAddress.findFirst({
            where: { userId: order.customer.id },
          });
          addressId = addr?.id;
        }
        if (!addressId) {
          throw new BadRequestException(
            'No delivery address found for this customer. Provide an addressId.',
          );
        }

        delivery = await tx.delivery.create({
          data: {
            orderId,
            addressId,
            status: DeliveryStatus.ASSIGNED,
            driverId: dto.driverId,
          },
        });

        await tx.deliveryStatusHistory.create({
          data: {
            deliveryId: delivery.id,
            fromStatus: null,
            toStatus: DeliveryStatus.ASSIGNED,
          },
        });
      } else {
        await tx.delivery.update({
          where: { id: delivery.id },
          data: {
            driverId: dto.driverId,
            status: DeliveryStatus.ASSIGNED,
          },
        });

        await tx.deliveryStatusHistory.create({
          data: {
            deliveryId: delivery.id,
            fromStatus: delivery.status,
            toStatus: DeliveryStatus.ASSIGNED,
          },
        });
      }

      await tx.driverProfile.update({
        where: { userId: dto.driverId },
        data: { activeDeliveries: { increment: 1 } },
      });

      if (orderStatus !== OrderStatus.READY_FOR_PICKUP) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.READY_FOR_PICKUP },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: orderStatus,
          toStatus: OrderStatus.READY_FOR_PICKUP,
          changedById: adminId,
          reason: `Driver assigned: ${driver.user?.name || dto.driverId}`,
        },
      });

      return tx.delivery.findUnique({
        where: { id: delivery!.id },
        include: {
          driver: { select: { id: true, name: true, phone: true } },
        },
      });
    });

    return result;
  }

  async unassignDriver(orderId: string, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!order.delivery) throw new BadRequestException('No delivery found for this order');
    if (!order.delivery.driverId) throw new BadRequestException('No driver assigned to this order');

    const result = await this.prisma.$transaction(async (tx) => {
      const oldDriverId = order.delivery!.driverId!;
      const oldStatus = order.delivery!.status;

      await tx.delivery.update({
        where: { id: order.delivery!.id },
        data: {
          driverId: null,
          status: DeliveryStatus.PENDING_ASSIGNMENT,
        },
      });

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId: order.delivery!.id,
          fromStatus: oldStatus as DeliveryStatus,
          toStatus: DeliveryStatus.PENDING_ASSIGNMENT,
        },
      });

      await tx.driverProfile.update({
        where: { userId: oldDriverId },
        data: { activeDeliveries: { decrement: 1 } },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          toStatus: order.status as OrderStatus,
          changedById: adminId,
          reason: `Driver unassigned`,
        },
      });

      return tx.delivery.findUnique({
        where: { id: order.delivery!.id },
        include: {
          driver: { select: { id: true, name: true, phone: true } },
        },
      });
    });

    return result;
  }
}
