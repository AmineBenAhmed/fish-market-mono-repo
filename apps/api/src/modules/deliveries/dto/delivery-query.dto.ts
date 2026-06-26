import { IsOptional, IsString } from 'class-validator';

export class DeliveryQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  driverId?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  page?: number;

  @IsString()
  @IsOptional()
  limit?: number;
}
