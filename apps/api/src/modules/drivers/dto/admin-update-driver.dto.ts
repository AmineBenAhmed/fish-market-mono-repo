import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

import { DriverStatus } from '@prisma/client';

export class AdminUpdateDriverDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  phone2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  idCardNumber?: string;

  @IsString()
  @IsOptional()
  idCardPhoto?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  governorateId?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  areaId?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  zoneId?: string;

  @IsString()
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
  deliveryZoneId?: string;

  @IsString()
  @IsOptional()
  vehiclePlate?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsNumber()
  @IsOptional()
  maxLoadKg?: number;

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;
}
