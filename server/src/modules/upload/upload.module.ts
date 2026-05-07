import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [
    // 配置 Multer 模块
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // 文件大小限制（10MB）
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
        // 文件过滤器
        fileFilter: (req, file, callback) => {
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
          ];
          if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(new Error('不支持的文件类型'), false);
          }
        },
        // 存储配置
        storage: diskStorage({
          // 存储目录
          destination: (req, file, callback) => {
            const uploadDir = configService.get('UPLOAD_DIR') || './uploads';
            callback(null, uploadDir);
          },
          // 文件名
          filename: (req, file, callback) => {
            const ext = path.extname(file.originalname);
            const timestamp = Date.now();
            const random = crypto.randomBytes(8).toString('hex');
            callback(null, `${timestamp}-${random}${ext}`);
          },
        }),
      }),
    }),
    HttpModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
