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
  governorateId!: string;

  @IsString()
  @MinLength(1)
  areaId!: string;

  @IsString()
  @MinLength(1)
  zoneId!: string;

  @IsString()
  @MinLength(1)
  street!: string;

  @IsString()
  @IsOptional()
  buildingNumber?: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

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
