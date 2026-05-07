import { IsString, IsOptional, MaxLength } from 'class-validator';

export class SignUpActivityDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  remark?: string;
}
