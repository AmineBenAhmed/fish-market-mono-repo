import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

import { SellerVerificationStatus } from '@prisma/client';

export class AdminUpdateSellerDto {
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

  @IsNumber()
  @IsOptional()
  commissionRate?: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  governorateId?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  areaId?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  zoneId?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  street?: string;

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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(SellerVerificationStatus)
  @IsOptional()
  verificationStatus?: SellerVerificationStatus;
}
