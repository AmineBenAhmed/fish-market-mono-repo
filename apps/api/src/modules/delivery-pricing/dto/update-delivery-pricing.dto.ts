import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDeliveryPricingDto {
  @IsString()
  @IsOptional()
  fromAreaId?: string;

  @IsString()
  @IsOptional()
  toAreaId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}
