import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ActivityCategory } from '../../../entities/activity.entity';

export class CreateActivityDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  date: string; // 格式: 2024-02-01

  @IsString()
  time: string; // 格式: 09:00

  @IsString()
  @MaxLength(100)
  location: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsString()
  @IsOptional()
  description?: string;
}
