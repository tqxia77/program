import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * 需要登录的接口装饰器
 * @example
 * @Auth()
 * @Get('profile')
 * getProfile() {}
 */
export const Auth = () => applyDecorators(UseGuards(JwtAuthGuard));
