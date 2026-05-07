import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { Follow } from '../../../entities/social.entity';
import { FriendRequest } from '../../../entities/social.entity';
import { Friend } from '../../../entities/social.entity';
import { User } from '../../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, FriendRequest, Friend, User]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
