export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
  ) {}
}

export class SellerApprovedEvent {
  constructor(
    public readonly userId: string,
    public readonly storeName: string,
  ) {}
}

export class DriverActivatedEvent {
  constructor(
    public readonly userId: string,
    public readonly name: string,
  ) {}
}
