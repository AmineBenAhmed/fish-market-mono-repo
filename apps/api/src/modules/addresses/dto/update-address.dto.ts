import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  street?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  city?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  state?: string;

  @IsString()
  @MinLength(5)
  @IsOptional()
  zipCode?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
