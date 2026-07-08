import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { InventoryReservationService } from './inventory-reservation.service';

describe('InventoryReservationService', () => {
  let service: InventoryReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryReservationService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<InventoryReservationService>(InventoryReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reserve', () => {
    it('should be a no-op', async () => {
      await expect(service.reserve()).resolves.toBeUndefined();
    });
  });

  describe('release', () => {
    it('should be a no-op', async () => {
      await expect(service.release()).resolves.toBeUndefined();
    });
  });
});
