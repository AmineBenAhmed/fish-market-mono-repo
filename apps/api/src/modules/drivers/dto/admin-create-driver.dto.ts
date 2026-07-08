import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

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
  workingZone?: string;

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsOptional()
  password?: string;
}
