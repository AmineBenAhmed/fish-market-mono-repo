import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveryStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.PENDING_ASSIGNMENT]: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.ASSIGNED]: [DeliveryStatus.ACCEPTED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.ACCEPTED]: [DeliveryStatus.PICKING_UP, DeliveryStatus.CANCELLED],
  [DeliveryStatus.PICKING_UP]: [DeliveryStatus.PICKED_UP, DeliveryStatus.FAILED],
  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.FAILED],
  [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.FAILED]: [DeliveryStatus.PICKING_UP, DeliveryStatus.CANCELLED],
  [DeliveryStatus.RETURNED]: [],
  [DeliveryStatus.CANCELLED]: [],
};

@Injectable()
export class DeliveryStateService {
  validateTransition(from: DeliveryStatus, to: DeliveryStatus): void {
    if (from === to) {
      throw new BadRequestException(`Delivery is already in ${from} status`);
    }

    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new BadRequestException(`Cannot transition delivery from "${from}" to "${to}"`);
    }
  }

  canBeCompleted(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.PICKED_UP || status === DeliveryStatus.IN_TRANSIT;
  }

  isTerminal(status: DeliveryStatus): boolean {
    return [DeliveryStatus.DELIVERED, DeliveryStatus.RETURNED, DeliveryStatus.CANCELLED].includes(
      status as never,
    );
  }

  isDriverActionable(status: DeliveryStatus): boolean {
    return [
      DeliveryStatus.ASSIGNED,
      DeliveryStatus.ACCEPTED,
      DeliveryStatus.PICKING_UP,
      DeliveryStatus.PICKED_UP,
      DeliveryStatus.IN_TRANSIT,
    ].includes(status as never);
  }
}
