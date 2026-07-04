import { IsOptional, IsString } from 'class-validator';

export class AssignOrderDriverDto {
  @IsString()
  driverId!: string;

  @IsString()
  @IsOptional()
  addressId?: string;
}
