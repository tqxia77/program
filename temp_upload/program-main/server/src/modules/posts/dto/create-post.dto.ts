import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(500)
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(500)
  voiceText?: string;
}
