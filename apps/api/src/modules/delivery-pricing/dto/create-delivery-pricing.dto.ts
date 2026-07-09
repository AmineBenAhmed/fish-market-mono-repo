import { IsNumber, IsString, Min } from 'class-validator';

export class CreateDeliveryPricingDto {
  @IsString()
  fromAreaId!: string;

  @IsString()
  toAreaId!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}
