import { ListingStatus, Preservation } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateListingDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(ListingStatus)
  @IsOptional()
  status?: ListingStatus;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  @IsOptional()
  catchDate?: string;

  @IsDateString()
  @IsOptional()
  availabilityDate?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsEnum(Preservation)
  @IsOptional()
  condition?: Preservation;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cleaningCost?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cloudinaryUrls?: string[];
}
