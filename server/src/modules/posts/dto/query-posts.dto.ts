import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPostsDto {
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
