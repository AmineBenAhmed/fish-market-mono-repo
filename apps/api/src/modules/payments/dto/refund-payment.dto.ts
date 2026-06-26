import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
