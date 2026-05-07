import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  // 本地文件存储路径
  private readonly uploadDir: string;

  // OSS 上传配置（可选）
  private readonly ossEndpoint: string;
  private readonly ossAccessKeyId: string;
  private readonly ossAccessKeySecret: string;
  private readonly ossBucket: string;
  private readonly ossRegion: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    // 本地存储目录
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';

    // OSS 配置（可选）
    this.ossEndpoint = this.configService.get('OSS_ENDPOINT') || '';
    this.ossAccessKeyId = this.configService.get('OSS_ACCESS_KEY_ID') || '';
    this.ossAccessKeySecret = this.configService.get('OSS_ACCESS_KEY_SECRET') || '';
    this.ossBucket = this.configService.get('OSS_BUCKET') || '';
    this.ossRegion = this.configService.get('OSS_REGION') || '';

    // 确保上传目录存在
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`创建上传目录: ${this.uploadDir}`);
    }
  }

  /**
   * 生成唯一文件名
   */
  private generateFilename(originalname: string): string {
    const ext = path.extname(originalname);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * 文件上传主方法
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    // 验证文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型');
    }

    // 验证文件大小（默认 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }

    // 如果配置了 OSS，使用 OSS 上传
    if (this.ossAccessKeyId && this.ossAccessKeySecret) {
      return this.uploadToOSS(file, folder);
    }

    // 否则使用本地存储
    return this.uploadToLocal(file, folder);
  }

  /**
   * 本地上传
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    const filename = this.generateFilename(file.originalname);
    const folderPath = path.join(this.uploadDir, folder);

    // 确保文件夹存在
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);

    // 写入文件
    fs.writeFileSync(filePath, file.buffer);

    // 返回访问 URL（需要配合静态文件服务）
    const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/${folder}/${filename}`;

    this.logger.log(`文件上传成功: ${url}`);

    return {
      url,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * 阿里云 OSS 上传
   */
  private async uploadToOSS(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    const filename = this.generateFilename(file.originalname);
    const objectName = `${folder}/${filename}`;

    try {
      // 方法1：使用阿里云 OSS SDK（推荐）
      // 需要先安装：npm install ali-oss
      // 
      // import OSS from 'ali-oss';
      // const client = new OSS({
      //   region: this.ossRegion,
      //   accessKeyId: this.ossAccessKeyId,
      //   accessKeySecret: this.ossAccessKeySecret,
      //   bucket: this.ossBucket,
      // });
      // 
      // const result = await client.put(objectName, file.buffer);
      // return {
      //   url: result.url,
      //   filename,
      //   size: file.size,
      //   mimetype: file.mimetype,
      // };

      // 方法2：使用 HTTP API 直接上传
      const date = new Date().toISOString().split('T')[0];
      const objectPath = `/${this.ossBucket}/${objectName}`;

      // 签名前的字符串
      const policy = Buffer.from(
        JSON.stringify({
          expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
          conditions: [['content-length-range', 0, maxFileSize]],
        }),
      ).toString('base64');

      const signature = crypto
        .createHmac('sha1', this.ossAccessKeySecret)
        .update(policy)
        .digest('base64');

      const formData = new URLSearchParams();
      formData.append('OSSAccessKeyId', this.ossAccessKeyId);
      formData.append('Signature', signature);
      formData.append('policy', policy);
      formData.append('key', objectName);
      formData.append('file', file.buffer.toString('base64'));

      const uploadUrl = `https://${this.ossBucket}.${this.ossEndpoint}`;

      const response = await this.httpService
        .post(uploadUrl, formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .toPromise();

      const url = `https://${this.ossBucket}.${this.ossEndpoint}/${objectName}`;

      this.logger.log(`OSS上传成功: ${url}`);

      return {
        url,
        filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`OSS上传失败: ${error.message}`);
      throw new BadRequestException('文件上传失败，请重试');
    }
  }

  /**
   * 批量上传图片（最多9张，用于帖子发布）
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'posts',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (files.length > 9) {
      throw new BadRequestException('最多只能上传9张图片');
    }

    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, folder);
      results.push(result);
    }

    return results;
  }
}
