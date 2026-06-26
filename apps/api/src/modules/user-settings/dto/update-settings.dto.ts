import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  theme?: string;

  @IsBoolean()
  @IsOptional()
  marketingOptIn?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyOrderUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyPromotions?: boolean;
}
