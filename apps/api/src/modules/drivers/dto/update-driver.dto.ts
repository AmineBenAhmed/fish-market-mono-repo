import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  deliveryZone?: string;

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  vehiclePlate?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsNumber()
  @IsOptional()
  maxLoadKg?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
