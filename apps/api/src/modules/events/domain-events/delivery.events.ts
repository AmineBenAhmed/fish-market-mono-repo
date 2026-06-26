export class DeliveryAssignedEvent {
  constructor(
    public readonly deliveryId: string,
    public readonly orderId: string,
    public readonly driverId: string,
    public readonly assignedBy: string,
  ) {}
}

export class DeliveryAcceptedEvent {
  constructor(
    public readonly deliveryId: string,
    public readonly orderId: string,
    public readonly driverId: string,
  ) {}
}

export class DeliveryPickedUpEvent {
  constructor(
    public readonly deliveryId: string,
    public readonly orderId: string,
    public readonly driverId: string,
  ) {}
}

export class DeliveryCompletedEvent {
  constructor(
    public readonly deliveryId: string,
    public readonly orderId: string,
    public readonly driverId: string,
    public readonly deliveredAt: Date,
  ) {}
}

export class DeliveryCancelledEvent {
  constructor(
    public readonly deliveryId: string,
    public readonly orderId: string,
    public readonly driverId?: string,
    public readonly reason?: string,
  ) {}
}
