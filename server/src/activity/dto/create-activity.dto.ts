import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, MaxLength } from 'class-validator'
import { Activity } from '../entities/activity.entity'

export class CreateActivityDto implements Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'enrolled'> {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string

  @IsEnum(['文体娱乐', '健康养生', '社区服务'])
  category: '文体娱乐' | '健康养生' | '社区服务'

  @IsString()
  @IsNotEmpty()
  imageUrl: string

  @IsString()
  @IsNotEmpty()
  date: string

  @IsString()
  @IsNotEmpty()
  time: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string

  @IsNumber()
  @Min(1)
  capacity: number
}
