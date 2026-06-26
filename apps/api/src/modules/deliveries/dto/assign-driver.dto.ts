import { IsOptional, IsString } from 'class-validator';

export class AssignDriverDto {
  @IsString()
  driverId!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
