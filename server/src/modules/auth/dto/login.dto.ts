import { IsString, IsOptional, IsEnum } from 'class-validator';

export class LoginDto {
  @IsString()
  code: string; // 微信授权code

  @IsString()
  @IsOptional()
  nickname?: string; // 用户昵称

  @IsString()
  @IsOptional()
  avatar?: string; // 头像URL

  @IsEnum(['elder', 'child'])
  @IsOptional()
  role?: 'elder' | 'child'; // 用户角色
}
