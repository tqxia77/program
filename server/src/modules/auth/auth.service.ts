import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 微信登录
   * 1. 通过code调用微信接口获取openid
   * 2. 查询或创建用户
   * 3. 生成JWT token
   */
  async login(dto: LoginDto) {
    const { code, nickname, avatar, role } = dto;

    // TODO: 调用微信接口获取openid
    // const openid = await this.getWechatOpenid(code);
    const openid = this.generateMockOpenid(code); // 临时模拟

    // 查询用户是否存在
    let user = await this.userRepository.findOne({ where: { openid } });

    if (!user) {
      // 创建新用户
      user = this.userRepository.create({
        openid,
        nickname: nickname || '新用户',
        avatar: avatar || '',
        role: role || 'elder',
        notificationSettings: {
          smsEnabled: true,
          callEnabled: true,
          activityReminder: true,
          commentReminder: true,
          likeReminder: true,
        },
      });
      user = await this.userRepository.save(user);
      this.logger.log(`新用户注册: ${user.id}`);
    }

    // 生成Token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  /**
   * 刷新Token
   */
  async refresh(dto: RefreshTokenDto) {
    const { refreshToken } = dto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      return {
        token: this.generateToken(user),
        refreshToken: this.generateRefreshToken(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token无效');
    }
  }

  /**
   * 登出（将token加入黑名单）
   * 实际项目中可以将token加入Redis黑名单或数据库
   */
  async logout(userId: string) {
    this.logger.log(`用户登出: ${userId}`);
    return { success: true };
  }

  /**
   * 生成访问令牌
   */
  private generateToken(user: User): string {
    const payload = { sub: user.id, openid: user.openid };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
  }

  /**
   * 生成刷新令牌
   */
  private generateRefreshToken(user: User): string {
    const payload = { sub: user.id, type: 'refresh' };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  /**
   * 调用微信接口获取openid（TODO: 实现）
   */
  private async getWechatOpenid(code: string): Promise<string> {
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    // TODO: 调用微信接口
    // const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    // const response = await fetch(url);
    // const data = await response.json();
    // return data.openid;

    // 临时返回模拟值
    return this.generateMockOpenid(code);
  }

  /**
   * 临时模拟openid
   */
  private generateMockOpenid(code: string): string {
    return crypto.createHash('md5').update(code).digest('hex');
  }
}
