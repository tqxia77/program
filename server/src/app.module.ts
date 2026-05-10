import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { SocialModule } from './modules/social/social.module';
import { PostsModule } from './modules/posts/posts.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    AuthModule,
    UploadModule,
    ActivitiesModule,
    SocialModule,
    PostsModule,
    UserModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
