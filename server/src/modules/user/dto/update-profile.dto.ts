import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nickname?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}
