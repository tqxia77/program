import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController, AdminActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from '../../entities/activity.entity';
import { ActivityEnrollment } from '../../entities/activity-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, ActivityEnrollment])],
  controllers: [ActivitiesController, AdminActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
