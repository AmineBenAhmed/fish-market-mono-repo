export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  transactionId: string;
  status: PaymentProviderStatus;
  gatewayResponse?: Record<string, unknown>;
  redirectUrl?: string;
}

export type PaymentProviderStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface PaymentProvider {
  readonly name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  confirmPayment(transactionId: string): Promise<PaymentResponse>;
  checkStatus(transactionId: string): Promise<PaymentProviderStatus>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>;
}
