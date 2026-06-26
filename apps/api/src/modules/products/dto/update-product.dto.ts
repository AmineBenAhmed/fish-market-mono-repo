import { InventoryUnit, Preservation, QualityGrade } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsEnum(Preservation)
  @IsOptional()
  preservation?: Preservation;

  @IsEnum(QualityGrade)
  @IsOptional()
  qualityGrade?: QualityGrade;

  @IsEnum(InventoryUnit)
  @IsOptional()
  unitType?: InventoryUnit;

  @IsNumber()
  @IsOptional()
  marketPriceMin?: number;

  @IsNumber()
  @IsOptional()
  marketPriceMax?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
