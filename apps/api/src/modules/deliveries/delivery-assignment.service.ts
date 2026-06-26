import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export interface AssignmentResult {
  driverId: string;
  driverName: string;
  strategy: string;
}

export interface AssignmentStrategy {
  findDriver(deliveryId: string, zoneId?: string): Promise<AssignmentResult | null>;
  readonly name: string;
}

@Injectable()
export class ManualAssignmentStrategy implements AssignmentStrategy {
  readonly name = 'MANUAL';

  constructor(private readonly prisma: PrismaService) {}

  async findDriver(deliveryId: string, _zoneId?: string): Promise<AssignmentResult | null> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: { select: { id: true } },
      },
    });

    if (!delivery || !delivery.driverId) return null;

    const driver = await this.prisma.user.findUnique({
      where: { id: delivery.driverId },
      select: { id: true, name: true },
    });

    if (!driver) return null;

    return {
      driverId: driver.id,
      driverName: driver.name,
      strategy: this.name,
    };
  }
}

@Injectable()
export class AutoAssignmentStrategy implements AssignmentStrategy {
  readonly name = 'AUTO';

  constructor(private readonly prisma: PrismaService) {}

  async findDriver(deliveryId: string, zoneId?: string): Promise<AssignmentResult | null> {
    const whereClause: Record<string, unknown> = {
      status: 'ONLINE',
      isAvailable: true,
    };

    if (zoneId) {
      whereClause.deliveryZoneId = zoneId;
    }

    const driver = await this.prisma.driverProfile.findFirst({
      where: {
        ...whereClause,
        activeDeliveries: { lt: this.prisma.driverProfile.fields.maxDeliveries },
      } as any,
      orderBy: { activeDeliveries: 'asc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!driver) return null;

    return {
      driverId: driver.user.id,
      driverName: driver.user.name,
      strategy: this.name,
    };
  }
}

@Injectable()
export class DeliveryAssignmentService {
  private strategies: Map<string, AssignmentStrategy> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly manualStrategy: ManualAssignmentStrategy,
    private readonly autoStrategy: AutoAssignmentStrategy,
  ) {
    this.register(manualStrategy);
    this.register(autoStrategy);
  }

  register(strategy: AssignmentStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  getStrategy(name: string): AssignmentStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Assignment strategy "${name}" not found`);
    }
    return strategy;
  }

  async assignManually(deliveryId: string, driverId: string): Promise<AssignmentResult> {
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      select: { id: true, name: true },
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    return {
      driverId: driver.id,
      driverName: driver.name,
      strategy: 'MANUAL',
    };
  }

  async assignAutomatically(deliveryId: string, zoneId?: string): Promise<AssignmentResult | null> {
    return this.autoStrategy.findDriver(deliveryId, zoneId);
  }
}
