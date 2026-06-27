import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UserQueryDto {
  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
