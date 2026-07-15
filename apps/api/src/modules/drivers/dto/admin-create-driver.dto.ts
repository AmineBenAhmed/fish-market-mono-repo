import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

import { DriverStatus } from '@prisma/client';

export class AdminCreateDriverDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @IsString()
  @IsOptional()
  idCardNumber?: string;

  @IsString()
  @IsOptional()
  idCardPhoto?: string;

  @IsString()
  @IsOptional()
  phone2?: string;

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

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsOptional()
  password?: string;
}
