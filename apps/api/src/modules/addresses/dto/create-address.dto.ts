import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @MinLength(1)
  street!: string;

  @IsString()
  @MinLength(1)
  number!: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @MinLength(1)
  neighborhood!: string;

  @IsString()
  @MinLength(1)
  city!: string;

  @IsString()
  @MinLength(2)
  state!: string;

  @IsString()
  @MinLength(5)
  zipCode!: string;

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
