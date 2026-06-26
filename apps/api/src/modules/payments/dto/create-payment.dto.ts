import { IsEnum, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsEnum(['CASH_ON_DELIVERY', 'BANK_TRANSFER', 'STRIPE', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX'])
  method!: string;
}
