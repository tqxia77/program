import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { SocialModule } from './modules/social/social.module';
import { PostsModule } from './modules/posts/posts.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SeederModule } from './modules/seeder/seeder.module';

// 实体导入
import { User } from './entities/user.entity';
import { Activity } from './entities/activity.entity';
import { ActivityEnrollment } from './entities/activity-enrollment.entity';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    // TypeORM 配置
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'yinling',
        entities: [User, Activity, ActivityEnrollment, Post],
        synchronize: true, // 开发环境自动同步表结构
        logging: false,
      }),
    }),
    AuthModule,
    UploadModule,
    ActivitiesModule,
    SocialModule,
    PostsModule,
    UserModule,
    NotificationModule,
    SeederModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
