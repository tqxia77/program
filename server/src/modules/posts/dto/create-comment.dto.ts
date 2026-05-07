import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(500)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  voiceText?: string;
}
