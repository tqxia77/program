import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * 微信登录/注册
   */
  async login(dto: LoginDto) {
    const { code, nickname, avatar, role } = dto;

    // ============ 步骤1：调用微信接口换取 openid ============
    const wechatAppId = this.configService.get('WECHAT_APPID');
    const wechatSecret = this.configService.get('WECHAT_SECRET');

    let openid: string;

    if (wechatAppId && wechatSecret) {
      // 正式环境：调用微信接口
      try {
        const wxResponse = await this.httpService
          .get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: wechatAppId,
              secret: wechatSecret,
              js_code: code,
              grant_type: 'authorization_code',
            },
          })
          .toPromise();

        openid = wxResponse.data.openid;

        if (!openid) {
          throw new UnauthorizedException('微信登录失败：无法获取用户标识');
        }
      } catch (error) {
        this.logger.error(`微信接口调用失败: ${error.message}`);
        throw new UnauthorizedException('微信登录失败');
      }
    } else {
      // 开发环境：使用 code 作为 openid（模拟）
      this.logger.warn('未配置微信参数，使用模拟登录');
      openid = `mock_openid_${code}`;
    }

    // ============ 步骤2：查找或创建用户 ============
    let user = await this.userRepository.findOne({
      where: { openid: openid },
    });

    if (!user) {
      // 新用户注册
      user = this.userRepository.create({
        openid: openid,
        nickname: nickname || `用户${Date.now() % 10000}`,
        avatar: avatar || '',
        role: (role as UserRole) || 'elder',
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
    } else {
      // 老用户登录：更新昵称和头像
      if (nickname) user.nickname = nickname;
      if (avatar) user.avatar = avatar;
      user = await this.userRepository.save(user);
    }

    // ============ 步骤3：生成 Token ============
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
   * 生成 Access Token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      openid: user.openid,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });
  }

  /**
   * 生成 Refresh Token
   */
  private generateRefreshToken(user: User): string {
    const payload = { sub: user.id, type: 'refresh' };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
  }

  /**
   * 刷新 Token
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
   * 登出
   */
  async logout(userId: string) {
    this.logger.log(`用户登出: ${userId}`);
    return { success: true };
  }
}
