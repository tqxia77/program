import { IsString, IsOptional, MaxLength } from 'class-validator';

export class SendFriendRequestDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  message?: string;
}
