export class PaymentCreatedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly method: string,
    public readonly customerId: string,
  ) {}
}

export class PaymentSucceededEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly transactionId: string,
    public readonly amount: number,
    public readonly customerId: string,
  ) {}
}

export class PaymentFailedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly reason: string,
    public readonly customerId: string,
  ) {}
}

export class PaymentRefundedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly isFullRefund: boolean,
    public readonly customerId: string,
  ) {}
}
