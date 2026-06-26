export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly sellerId: string | null,
    public readonly total: number,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly cancelledBy: string,
    public readonly reason: string | null,
  ) {}
}

export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly sellerId: string | null,
    public readonly total: number,
  ) {}
}

export class OrderReadyForPickupEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly sellerId: string,
  ) {}
}
