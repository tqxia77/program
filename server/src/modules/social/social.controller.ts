import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { SendFriendRequestDto } from './dto/friend-request.dto';
import { Auth } from '../../../common/decorators/auth.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseUtils } from '../../../common/utils/response.util';
import { User } from '../../../entities/user.entity';

@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ========== 关注接口 ==========

  /**
   * 关注用户
   * POST /api/users/:id/follow
   */
  @Post('users/:id/follow')
  @Auth()
  async follow(
    @CurrentUser() user: User,
    @Param('id') followingId: string,
  ) {
    const result = await this.socialService.follow(user.id, followingId);
    return ResponseUtils.success(result, '关注成功');
  }

  /**
   * 取消关注
   * DELETE /api/users/:id/follow
   */
  @Delete('users/:id/follow')
  @Auth()
  async unfollow(
    @CurrentUser() user: User,
    @Param('id') followingId: string,
  ) {
    const result = await this.socialService.unfollow(user.id, followingId);
    return ResponseUtils.success(result, '取消成功');
  }

  /**
   * 获取关注列表
   * GET /api/user/following
   */
  @Get('user/following')
  @Auth()
  async getFollowing(@CurrentUser() user: User) {
    const result = await this.socialService.getFollowing(user.id);
    return ResponseUtils.success(result);
  }

  /**
   * 获取粉丝列表
   * GET /api/user/followers
   */
  @Get('user/followers')
  @Auth()
  async getFollowers(@CurrentUser() user: User) {
    const result = await this.socialService.getFollowers(user.id);
    return ResponseUtils.success(result);
  }

  // ========== 好友请求接口 ==========

  /**
   * 发送好友请求
   * POST /api/friends/request
   */
  @Post('friends/request')
  @Auth()
  async sendFriendRequest(
    @CurrentUser() user: User,
    @Body() dto: SendFriendRequestDto,
  ) {
    const result = await this.socialService.sendFriendRequest(user.id, dto);
    return ResponseUtils.success(result, '请求已发送');
  }

  /**
   * 获取好友请求列表
   * GET /api/friend-requests
   */
  @Get('friend-requests')
  @Auth()
  async getFriendRequests(
    @CurrentUser() user: User,
    @Query('status') status?: string,
  ) {
    const result = await this.socialService.getFriendRequests(user.id, status);
    return ResponseUtils.success(result);
  }

  /**
   * 同意好友请求
   * POST /api/friend-requests/:id/accept
   */
  @Post('friend-requests/:id/accept')
  @Auth()
  async acceptFriendRequest(
    @CurrentUser() user: User,
    @Param('id') requestId: string,
  ) {
    const result = await this.socialService.acceptFriendRequest(user.id, requestId);
    return ResponseUtils.success(result, '已同意');
  }

  /**
   * 拒绝好友请求
   * POST /api/friend-requests/:id/reject
   */
  @Post('friend-requests/:id/reject')
  @Auth()
  async rejectFriendRequest(
    @CurrentUser() user: User,
    @Param('id') requestId: string,
  ) {
    const result = await this.socialService.rejectFriendRequest(user.id, requestId);
    return ResponseUtils.success(result, '已拒绝');
  }

  // ========== 好友列表接口 ==========

  /**
   * 获取好友列表
   * GET /api/user/friends
   */
  @Get('user/friends')
  @Auth()
  async getFriends(@CurrentUser() user: User) {
    const result = await this.socialService.getFriends(user.id);
    return ResponseUtils.success(result);
  }
}
