import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

import {
  PaymentProvider,
  PaymentProviderStatus,
  PaymentRequest,
  PaymentResponse,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class BankTransferProvider implements PaymentProvider {
  readonly name = 'BANK_TRANSFER';

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const reference = `FM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    return {
      transactionId: crypto.randomUUID(),
      status: 'PENDING',
      gatewayResponse: {
        bankReference: reference,
        instructions: 'Transfer the amount using the reference code above',
        amount: request.amount,
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
