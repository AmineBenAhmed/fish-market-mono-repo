import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateSellerDto {
  @IsString()
  userId!: string;

  @IsString()
  @MinLength(2)
  storeName!: string;

  @IsString()
  @IsOptional()
  storeDescription?: string;

  @IsNumber()
  @IsOptional()
  deliveryRadius?: number;

  @IsNumber()
  @IsOptional()
  preparationTime?: number;

  @IsNumber()
  @IsOptional()
  commissionRate?: number;

  @IsString()
  @MinLength(1)
  city!: string;

  @IsString()
  @MinLength(2)
  state!: string;

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

  @IsString()
  @IsOptional()
  storeLogoUrl?: string;
}
