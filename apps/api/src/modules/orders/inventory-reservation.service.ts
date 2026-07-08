import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryReservationService {
  async reserve(): Promise<void> {
    // No-op: inventory tracking removed
  }

  async release(): Promise<void> {
    // No-op: inventory tracking removed
  }
}
