import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { DeliveryAssignmentService } from './delivery-assignment.service';
import { DeliveryStateService } from './delivery-state.service';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { DeliveriesService } from './deliveries.service';

const mockOrder = {
  id: 'order-1',
  orderNumber: 'ORD-001',
  status: OrderStatus.READY_FOR_PICKUP,
  customerId: 'customer-1',
  sellerId: 'seller-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDriverProfile = {
  id: 'dp-1',
  userId: 'driver-1',
  status: 'ONLINE' as const,
  isAvailable: true,
  activeDeliveries: 0,
  maxDeliveries: 3,
  deliveryZoneId: null,
  city: 'Tunis',
  state: 'Tunis',
  vehicleType: 'car',
  vehiclePlate: '123-TUN',
  licenseNumber: 'LIC-123',
  maxLoadKg: 100,
  currentLat: null,
  currentLng: null,
  lastLocationAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDelivery = {
  id: 'delivery-1',
  orderId: 'order-1',
  addressId: 'addr-1',
  driverId: null,
  status: DeliveryStatus.PENDING_ASSIGNMENT,
  scheduledDate: null,
  scheduledTime: null,
  pickedUpAt: null,
  deliveredAt: null,
  failedAt: null,
  failReason: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DeliveriesService', () => {
  let service: DeliveriesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockTx = {
    delivery: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    order: { update: jest.fn() },
    driverProfile: { update: jest.fn() },
    deliveryStatusHistory: { create: jest.fn() },
  };

  const mockPrisma = {
    delivery: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    order: { findUnique: jest.fn() },
    driverProfile: { findUnique: jest.fn() },
    deliveryStatusHistory: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockAssignmentService = {
    assignAutomatically: jest.fn(),
    assignManually: jest.fn(),
  };

  const mockTrackingService = {
    getDriverLocation: jest.fn(),
    updateLocation: jest.fn(),
    getDeliveryProgress: jest.fn(),
  };

  const mockEventEmitter = { emit: jest.fn() };

  function resetTx() {
    mockTx.delivery.create.mockResolvedValue(mockDelivery);
    mockTx.delivery.update.mockResolvedValue(mockDelivery);
    mockTx.delivery.findUnique.mockResolvedValue(mockDelivery);
    mockTx.order.update.mockResolvedValue(mockOrder);
    mockTx.driverProfile.update.mockResolvedValue(mockDriverProfile);
    mockTx.deliveryStatusHistory.create.mockResolvedValue({ id: 'h-1' });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        DeliveryStateService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DeliveryAssignmentService, useValue: mockAssignmentService },
        { provide: DeliveryTrackingService, useValue: mockTrackingService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;

    jest.clearAllMocks();
    resetTx();
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<any>) =>
      cb(mockTx),
    );
  });

  describe('create', () => {
    it('should create delivery for an order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...mockOrder, delivery: null });
      mockPrisma.delivery.create.mockResolvedValue(mockDelivery);

      const result = await service.create('order-1', 'addr-1');

      expect(result.status).toBe(DeliveryStatus.PENDING_ASSIGNMENT);
      expect(mockPrisma.delivery.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order-1',
          addressId: 'addr-1',
          status: DeliveryStatus.PENDING_ASSIGNMENT,
        },
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.create('order-1', 'addr-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if delivery already exists', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...mockOrder, delivery: { id: 'existing' } });
      await expect(service.create('order-1', 'addr-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('assign', () => {
    it('should assign a driver to delivery', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driverId: null,
        status: DeliveryStatus.PENDING_ASSIGNMENT,
        order: { status: OrderStatus.READY_FOR_PICKUP, id: 'order-1' },
      });
      mockPrisma.driverProfile.findUnique.mockResolvedValue(mockDriverProfile);

      await service.assign('delivery-1', { driverId: 'driver-1', notes: 'Test' }, 'admin-1');

      expect(mockTx.delivery.update).toHaveBeenCalled();
      expect(mockTx.driverProfile.update).toHaveBeenCalled();
      expect(mockPrisma.deliveryStatusHistory.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if delivery not found', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue(null);
      await expect(
        service.assign('delivery-1', { driverId: 'driver-1' }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order not READY_FOR_PICKUP', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        order: { status: OrderStatus.DRAFT, id: 'order-1' },
      });
      await expect(
        service.assign('delivery-1', { driverId: 'driver-1' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if driver is offline', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        order: { status: OrderStatus.READY_FOR_PICKUP, id: 'order-1' },
      });
      mockPrisma.driverProfile.findUnique.mockResolvedValue({
        ...mockDriverProfile,
        status: 'OFFLINE',
      });
      await expect(
        service.assign('delivery-1', { driverId: 'driver-1' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if driver at max capacity', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        order: { status: OrderStatus.READY_FOR_PICKUP, id: 'order-1' },
      });
      mockPrisma.driverProfile.findUnique.mockResolvedValue({
        ...mockDriverProfile,
        activeDeliveries: 3,
        maxDeliveries: 3,
      });
      await expect(
        service.assign('delivery-1', { driverId: 'driver-1' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptDelivery', () => {
    it('should transition from ASSIGNED to ACCEPTED', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.ASSIGNED,
        order: { id: 'order-1' },
      });

      await service.acceptDelivery('delivery-1', 'driver-1');

      expect(mockTx.delivery.update).toHaveBeenCalled();
      expect(mockPrisma.deliveryStatusHistory.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if wrong driver', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driverId: 'other-driver',
        order: { id: 'order-1' },
      });
      await expect(service.acceptDelivery('delivery-1', 'driver-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('rejectDelivery', () => {
    it('should cancel delivery and decrement active count', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.ASSIGNED,
      });

      const result = await service.rejectDelivery('delivery-1', 'driver-1');

      expect(result.message).toBe('Delivery rejected');
      expect(mockTx.delivery.update).toHaveBeenCalled();
      expect(mockTx.driverProfile.update).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete a delivery in transit', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.IN_TRANSIT,
        order: { id: 'order-1' },
      });

      await service.complete('delivery-1', 'driver-1');

      expect(mockTx.delivery.update).toHaveBeenCalled();
      expect(mockTx.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: OrderStatus.DELIVERED },
        }),
      );
      expect(mockTx.driverProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { activeDeliveries: { decrement: 1 } },
        }),
      );
    });

    it('should throw BadRequestException if not picked up', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.ASSIGNED,
      });
      await expect(service.complete('delivery-1', 'driver-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending delivery', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        status: DeliveryStatus.PENDING_ASSIGNMENT,
        order: { id: 'order-1' },
      });

      await service.cancel('delivery-1', 'No longer needed', 'admin-1');

      expect(mockTx.delivery.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already delivered', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        status: DeliveryStatus.DELIVERED,
        order: { id: 'order-1' },
      });
      await expect(service.cancel('delivery-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return delivery with details', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driverId: 'driver-1',
        order: {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: OrderStatus.READY_FOR_PICKUP,
          total: 100,
          customer: { id: 'cust-1', name: 'Test', phone: '123' },
        },
        driver: { id: 'driver-1', name: 'Driver', phone: '456' },
        address: { id: 'addr-1', street: '123 Main' },
        statusHistory: [],
      });
      mockTrackingService.getDriverLocation.mockResolvedValue({
        lat: 10,
        lng: 20,
        updatedAt: new Date(),
      });

      const result = await service.findOne('delivery-1');

      expect(result.id).toBe('delivery-1');
      expect(result.driverLocation).toBeDefined();
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue(null);
      await expect(service.findOne('delivery-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrder', () => {
    it('should return delivery for order', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue({
        ...mockDelivery,
        driver: { id: 'driver-1', name: 'Driver', phone: '456' },
        statusHistory: [],
      });

      const result = await service.findByOrder('order-1');
      expect(result.id).toBe('delivery-1');
    });

    it('should throw NotFoundException if no delivery', async () => {
      mockPrisma.delivery.findUnique.mockResolvedValue(null);
      await expect(service.findByOrder('order-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated deliveries', async () => {
      mockPrisma.delivery.findMany.mockResolvedValue([mockDelivery]);
      mockPrisma.delivery.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(1);
    });
  });
});
