import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// 内存用户存储（测试版用）
interface MemoryUser {
  id: number;
  openid: string;
  nickname: string;
  avatar: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private memoryUsers: MemoryUser[] = [];
  private userIdCounter = 1;

  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * 微信登录/注册
   */
  async login(dto: { code: string; nickname?: string; avatar?: string; role?: string }) {
    const { code, nickname, avatar, role } = dto;

    // ============ 步骤1：调用微信接口换取 openid ============
    const wechatAppId = this.configService.get('WECHAT_APPID');
    const wechatSecret = this.configService.get('WECHAT_SECRET');

    let openid: string;

    if (wechatAppId && wechatSecret && code && !code.startsWith('mock_')) {
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

        openid = wxResponse?.data?.openid;

        if (!openid) {
          // 测试号可能返回模拟数据
          openid = `test_${code}`;
        }
      } catch (error) {
        this.logger.warn(`微信接口调用失败，使用模拟登录: ${error.message}`);
        openid = `test_${code}`;
      }
    } else {
      // 开发环境：使用 code 作为 openid（模拟）
      this.logger.warn('使用模拟登录');
      openid = `mock_${code || Date.now()}`;
    }

    // ============ 步骤2：查找或创建用户 ============
    let user = this.memoryUsers.find(u => u.openid === openid);

    if (!user) {
      // 新用户注册
      user = {
        id: this.userIdCounter++,
        openid: openid,
        nickname: nickname || `用户${user?.id || this.userIdCounter % 10000}`,
        avatar: avatar || '',
        role: role || 'elder',
        createdAt: new Date(),
      };
      this.memoryUsers.push(user);
      this.logger.log(`新用户注册: ${user.nickname} (${user.role})`);
    }

    // ============ 步骤3：生成 Token ============
    const payload = { sub: user.id, openid: user.openid, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      userId: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(dto: { refreshToken: string }) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken);
      const user = this.memoryUsers.find(u => u.id === payload.sub);

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const newPayload = { sub: user.id, openid: user.openid, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        token: newAccessToken,
        refreshToken: dto.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Token 无效');
    }
  }

  /**
   * 登出（测试版无需操作）
   */
  async logout() {
    return { message: '登出成功' };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: number) {
    const user = this.memoryUsers.find(u => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
    };
  }
}
