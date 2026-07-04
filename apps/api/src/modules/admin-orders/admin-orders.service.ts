import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryStatus, Prisma } from '@prisma/client';

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
    if (driver.activeDeliveries >= driver.maxDeliveries) {
      throw new BadRequestException('Driver has reached maximum active deliveries');
    }

    let delivery = order.delivery;

    const result = await this.prisma.$transaction(async (tx) => {
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

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          toStatus: order.status,
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
}
