import { InventoryUnit, Preservation, QualityGrade } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  categoryId!: string;

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
}
