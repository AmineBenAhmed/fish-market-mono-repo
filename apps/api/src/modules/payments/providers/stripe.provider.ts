import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

import {
  PaymentProvider,
  PaymentProviderStatus,
  PaymentRequest,
  PaymentResponse,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name = 'STRIPE';

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      transactionId: `pi_${crypto.randomUUID().replace(/-/g, '')}`,
      status: 'PROCESSING',
      gatewayResponse: {
        paymentIntentId: `pi_placeholder`,
        amount: request.amount,
        currency: request.currency,
      },
    };
  }

  async confirmPayment(transactionId: string): Promise<PaymentResponse> {
    return {
      transactionId,
      status: 'SUCCESS',
      gatewayResponse: {
        confirmed: true,
        confirmedAt: new Date().toISOString(),
      },
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentProviderStatus> {
    return 'SUCCESS';
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
