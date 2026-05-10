import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  callEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  activityReminder?: boolean;

  @IsBoolean()
  @IsOptional()
  commentReminder?: boolean;

  @IsBoolean()
  @IsOptional()
  likeReminder?: boolean;
}
