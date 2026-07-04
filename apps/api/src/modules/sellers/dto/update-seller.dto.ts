import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSellerDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  storeName?: string;

  @IsString()
  @IsOptional()
  storeDescription?: string;

  @IsNumber()
  @IsOptional()
  deliveryRadius?: number;

  @IsNumber()
  @IsOptional()
  preparationTime?: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  city?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  state?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsString()
  @IsOptional()
  pickupAddress?: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessDoc?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;
}
