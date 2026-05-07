import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../entities/user.entity';

/**
 * 获取当前登录用户
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {}
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
