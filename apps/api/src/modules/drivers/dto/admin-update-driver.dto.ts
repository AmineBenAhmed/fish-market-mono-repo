import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

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
  workingZone?: string;

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
