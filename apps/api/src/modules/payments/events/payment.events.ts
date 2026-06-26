export class PaymentCreatedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly method: string,
  ) {}
}

export class PaymentSucceededEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly transactionId: string,
    public readonly amount: number,
  ) {}
}

export class PaymentFailedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly reason: string,
  ) {}
}

export class PaymentRefundedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly isFullRefund: boolean,
  ) {}
}

export class WalletUpdatedEvent {
  constructor(
    public readonly walletId: string,
    public readonly userId: string,
    public readonly newBalance: number,
    public readonly transactionType: string,
  ) {}
}

export class CommissionCalculatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly sellerId: string,
    public readonly commissionAmount: number,
    public readonly commissionRate: number,
  ) {}
}
