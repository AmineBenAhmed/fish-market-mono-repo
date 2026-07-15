import { IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class ApplySellerDto {
  @IsString()
  @MinLength(2)
  storeName!: string;

  @IsString()
  @IsOptional()
  storeDescription?: string;

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

  @IsInt()
  @IsOptional()
  preparationTime?: number;

  @IsInt()
  @IsOptional()
  deliveryRadius?: number;

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
}
