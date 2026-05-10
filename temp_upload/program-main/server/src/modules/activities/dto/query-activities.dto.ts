import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityCategory } from '../../../entities/activity.entity';

export class QueryActivitiesDto {
  @IsEnum(ActivityCategory)
  @IsOptional()
  category?: ActivityCategory;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10;
}
