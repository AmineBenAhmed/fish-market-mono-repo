import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

import {
  PaymentProvider,
  PaymentProviderStatus,
  PaymentRequest,
  PaymentResponse,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class CashOnDeliveryProvider implements PaymentProvider {
  readonly name = 'CASH_ON_DELIVERY';

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      transactionId: crypto.randomUUID(),
      status: 'PENDING',
      gatewayResponse: {
        method: 'CASH_ON_DELIVERY',
        amount: request.amount,
        note: 'Payment collected upon delivery',
      },
    };
  }

  async confirmPayment(transactionId: string): Promise<PaymentResponse> {
    return {
      transactionId,
      status: 'SUCCESS',
      gatewayResponse: { confirmedAt: new Date().toISOString() },
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentProviderStatus> {
    return 'PENDING';
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    return {
      transactionId,
      status: 'SUCCESS',
      gatewayResponse: {
        refunded: true,
        amount: amount ?? 'full',
        refundedAt: new Date().toISOString(),
      },
    };
  }
}
