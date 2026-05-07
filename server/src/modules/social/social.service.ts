import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow, FriendRequest, Friend } from '../../../entities/social.entity';
import { User } from '../../../entities/user.entity';
import { SendFriendRequestDto } from '../dto/friend-request.dto';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ========== 关注相关 ==========

  /**
   * 关注用户
   */
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('不能关注自己');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: followingId },
    });
    if (!targetUser) {
      throw new NotFoundException('用户不存在');
    }

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    if (existing) {
      throw new BadRequestException('已关注该用户');
    }

    const follow = this.followRepository.create({ followerId, followingId });
    await this.followRepository.save(follow);
    this.logger.log(`用户 ${followerId} 关注了 ${followingId}`);

    return { following: true };
  }

  /**
   * 取消关注
   */
  async unfollow(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new BadRequestException('未关注该用户');
    }

    await this.followRepository.remove(follow);
    this.logger.log(`用户 ${followerId} 取消关注了 ${followingId}`);

    return { following: false };
  }

  /**
   * 获取关注列表
   */
  async getFollowing(userId: string) {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      relations: ['following'],
      order: { createdAt: 'DESC' },
    });

    return follows.map((f) => ({
      id: f.following.id,
      nickname: f.following.nickname,
      avatar: f.following.avatar,
      bio: f.following.bio,
      followedAt: f.createdAt,
    }));
  }

  /**
   * 获取粉丝列表
   */
  async getFollowers(userId: string) {
    const follows = await this.followRepository.find({
      where: { followingId: userId },
      relations: ['follower'],
      order: { createdAt: 'DESC' },
    });

    return follows.map((f) => ({
      id: f.follower.id,
      nickname: f.follower.nickname,
      avatar: f.follower.avatar,
      bio: f.follower.bio,
      followedAt: f.createdAt,
    }));
  }

  // ========== 好友请求相关 ==========

  /**
   * 发送好友请求
   */
  async sendFriendRequest(fromUserId: string, dto: SendFriendRequestDto) {
    const { userId: toUserId, message } = dto;

    if (fromUserId === toUserId) {
      throw new BadRequestException('不能添加自己为好友');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: toUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('用户不存在');
    }

    // 检查是否已经是好友
    const existingFriend = await this.friendRepository.findOne({
      where: [{ userId: fromUserId, friendId: toUserId }],
    });
    if (existingFriend) {
      throw new BadRequestException('该用户已是您的好友');
    }

    // 检查是否有待处理的请求
    const existingRequest = await this.friendRequestRepository.findOne({
      where: [
        { fromUserId, toUserId, status: 'pending' },
        { fromUserId: toUserId, toUserId: fromUserId, status: 'pending' },
      ],
    });
    if (existingRequest) {
      throw new BadRequestException('已有待处理的好友请求');
    }

    const request = this.friendRequestRepository.create({
      fromUserId,
      toUserId,
      message,
    });
    await this.friendRequestRepository.save(request);
    this.logger.log(`用户 ${fromUserId} 向 ${toUserId} 发送了好友请求`);

    return { requestId: request.id };
  }

  /**
   * 获取好友请求列表
   */
  async getFriendRequests(userId: string, status?: string) {
    const qb = this.friendRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.fromUser', 'fromUser')
      .where('request.toUserId = :userId', { userId });

    if (status) {
      qb.andWhere('request.status = :status', { status });
    } else {
      qb.andWhere('request.status = :status', { status: 'pending' });
    }

    const requests = await qb.orderBy('request.createdAt', 'DESC').getMany();

    return requests.map((r) => ({
      id: r.id,
      fromUser: {
        id: r.fromUser.id,
        nickname: r.fromUser.nickname,
        avatar: r.fromUser.avatar,
      },
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  /**
   * 同意好友请求
   */
  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId, toUserId: userId, status: 'pending' },
    });

    if (!request) {
      throw new NotFoundException('好友请求不存在或已处理');
    }

    // 创建双向好友关系
    const friends = [
      this.friendRepository.create({ userId, friendId: request.fromUserId }),
      this.friendRepository.create({ userId: request.fromUserId, friendId: userId }),
    ];
    await this.friendRepository.save(friends);

    // 更新请求状态
    request.status = 'accepted';
    await this.friendRequestRepository.save(request);

    this.logger.log(`用户 ${userId} 同意了 ${request.fromUserId} 的好友请求`);

    return { success: true };
  }

  /**
   * 拒绝好友请求
   */
  async rejectFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId, toUserId: userId, status: 'pending' },
    });

    if (!request) {
      throw new NotFoundException('好友请求不存在或已处理');
    }

    request.status = 'rejected';
    await this.friendRequestRepository.save(request);

    this.logger.log(`用户 ${userId} 拒绝了 ${request.fromUserId} 的好友请求`);

    return { success: true };
  }

  // ========== 好友列表相关 ==========

  /**
   * 获取好友列表
   */
  async getFriends(userId: string) {
    const friends = await this.friendRepository.find({
      where: { userId },
      relations: ['friend'],
      order: { createdAt: 'DESC' },
    });

    return friends.map((f) => ({
      id: f.friend.id,
      nickname: f.friend.nickname,
      avatar: f.friend.avatar,
      bio: f.friend.bio,
      becameFriendsAt: f.createdAt,
    }));
  }
}
