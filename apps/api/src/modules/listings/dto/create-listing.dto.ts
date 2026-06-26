import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  productId!: string;

  @IsString()
  variantId!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
