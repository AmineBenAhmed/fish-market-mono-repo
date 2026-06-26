import { ListingStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateListingDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsEnum(ListingStatus)
  @IsOptional()
  status?: ListingStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
