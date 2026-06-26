import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryZoneDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsObject()
  @IsOptional()
  polygon?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
