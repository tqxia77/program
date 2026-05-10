import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { User } from '../../entities/user.entity';
import { Activity } from '../../entities/activity.entity';
import { ActivityEnrollment } from '../../entities/activity-enrollment.entity';
import { Post, Comment } from '../../entities/post.entity';
import { Follow } from '../../entities/social.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Activity, ActivityEnrollment, Post, Comment, Follow]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
