export class InventoryReservedEvent {
  constructor(
    public readonly orderId: string,
    public readonly listingId: string,
    public readonly quantity: number,
  ) {}
}

export class InventoryReleasedEvent {
  constructor(
    public readonly orderId: string,
    public readonly listingId: string,
    public readonly quantity: number,
  ) {}
}
