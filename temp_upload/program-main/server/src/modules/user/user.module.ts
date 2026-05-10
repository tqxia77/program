import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { ActivityEnrollment } from '../../entities/activity-enrollment.entity';
import { Post, PostComment, PostLike } from '../../entities/post.entity';
import { Follow, FriendRequest } from '../../entities/social.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ActivityEnrollment,
      Post,
      PostComment,
      PostLike,
      Follow,
      FriendRequest,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('只支持图片格式'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
