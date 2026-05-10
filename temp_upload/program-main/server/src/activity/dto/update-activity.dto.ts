import { IsString, IsEnum, IsNumber, Min, MaxLength, IsOptional } from 'class-validator'

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string

  @IsEnum(['文体娱乐', '健康养生', '社区服务'])
  @IsOptional()
  category?: '文体娱乐' | '健康养生' | '社区服务'

  @IsString()
  @IsOptional()
  imageUrl?: string

  @IsString()
  @IsOptional()
  date?: string

  @IsString()
  @IsOptional()
  time?: string

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @IsEnum(['available', 'full', 'signed'])
  @IsOptional()
  status?: 'available' | 'full' | 'signed'

  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number

  @IsNumber()
  @IsOptional()
  @Min(0)
  enrolled?: number
}
