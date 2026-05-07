import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {}

  /**
   * 上传图片到对象存储
   * TODO: 根据实际使用的OSS（阿里云/腾讯云）实现具体逻辑
   */
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    width?: number;
    height?: number;
  }> {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片');
    }

    // 校验文件类型
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      throw new BadRequestException('只支持jpg、png、gif、webp格式图片');
    }

    // 校验文件大小（最大5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('图片大小不能超过5MB');
    }

    // 生成文件名
    const filename = this.generateFilename(ext);

    // TODO: 上传到OSS
    // 阿里云OSS示例：
    // const url = await this.uploadToAliOSS(filename, file.buffer);

    // 临时返回本地路径（开发测试用）
    const url = `/uploads/${filename}`;

    this.logger.log(`图片上传成功: ${filename}`);

    return {
      url,
      filename,
      size: file.size,
    };
  }

  /**
   * 生成唯一文件名
   */
  private generateFilename(ext: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * TODO: 阿里云OSS上传实现示例
   */
  private async uploadToAliOSS(
    filename: string,
    buffer: Buffer,
  ): Promise<string> {
    // 需要安装 aliyun-sdk 并配置
    // const OSS = require('aliyun-sdk').OSS;
    // const client = new OSS({
    //   region: this.configService.get('OSS_REGION'),
    //   accessKeyId: this.configService.get('OSS_ACCESS_KEY_ID'),
    //   accessKeySecret: this.configService.get('OSS_ACCESS_KEY_SECRET'),
    // });
    // await client.put(filename, buffer);
    // return `https://${this.configService.get('OSS_BUCKET')}.${this.configService.get('OSS_ENDPOINT')}/${filename}`;
    return '';
  }

  /**
   * TODO: 腾讯云COS上传实现示例
   */
  private async uploadToTencentCOS(
    filename: string,
    buffer: Buffer,
  ): Promise<string> {
    // 需要安装 cos-nodejs-sdk-v5 并配置
    // const COS = require('cos-nodejs-sdk-v5');
    // const cos = new COS({
    //   SecretId: this.configService.get('OSS_ACCESS_KEY_ID'),
    //   SecretKey: this.configService.get('OSS_ACCESS_KEY_SECRET'),
    // });
    // await cos.putObject({
    //   Bucket: this.configService.get('OSS_BUCKET'),
    //   Region: this.configService.get('OSS_REGION'),
    //   Key: filename,
    //   Body: buffer,
    // });
    return '';
  }
}
