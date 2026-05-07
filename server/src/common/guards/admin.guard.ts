import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../entities/user.entity';

/**
 * 管理员守卫
 * 用于保护管理员接口
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // TODO: 根据实际需求判断是否为管理员
    // 例如：检查用户角色、检查是否为活动组织者等
    const isAdmin = user && user.role === 'elder';

    if (!isAdmin) {
      throw new ForbiddenException('无权限访问');
    }

    return true;
  }
}
