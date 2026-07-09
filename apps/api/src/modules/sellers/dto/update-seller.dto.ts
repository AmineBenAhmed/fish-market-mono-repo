import { IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSellerDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  storeName?: string;

  @IsString()
  @IsOptional()
  storeDescription?: string;

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
