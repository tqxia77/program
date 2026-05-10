import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { SocialModule } from './modules/social/social.module';
import { PostsModule } from './modules/posts/posts.module';
import { UserModule } from './modules/user/user.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 开发环境使用，生产环境请关闭
        logging: false,
      }),
      inject: [ConfigService],
    }),

    // 业务模块
    AuthModule,
    UploadModule,
    NotificationModule,
    ActivitiesModule,
    SocialModule,
    PostsModule,
    UserModule,
  ],
})
export class AppModule {}
