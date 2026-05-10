import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { ActivityEnrollment } from '../../../entities/activity-enrollment.entity';
import { Post } from '../../../entities/post.entity';
import { PostLike } from '../../../entities/post.entity';
import { Follow } from '../../../entities/social.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ActivityEnrollment)
    private enrollmentRepository: Repository<ActivityEnrollment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  /**
   * 获取用户资料
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 统计关注数、粉丝数、帖子数
    const [followingCount, followersCount, postsCount] = await Promise.all([
      this.followRepository.count({ where: { followerId: userId } }),
      this.followRepository.count({ where: { followingId: userId } }),
      this.postRepository.count({ where: { userId } }),
    ]);

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      bio: user.bio,
      followersCount,
      followingCount,
      postsCount,
      createdAt: user.createdAt,
    };
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.nickname) {
      user.nickname = dto.nickname;
    }
    if (dto.bio !== undefined) {
      user.bio = dto.bio;
    }

    await this.userRepository.save(user);
    this.logger.log(`用户 ${userId} 更新了个人资料`);

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
    };
  }

  /**
   * 更新头像
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.avatar = avatarUrl;
    await this.userRepository.save(user);

    return { avatar: avatarUrl };
  }

  /**
   * 获取我的报名活动
   */
  async getMyActivities(userId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
      relations: ['activity'],
      order: { enrolledAt: 'DESC' },
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      activity: {
        id: e.activity.id,
        title: e.activity.title,
        category: e.activity.category,
        coverImage: e.activity.coverImage,
        date: e.activity.date,
        time: e.activity.time,
        location: e.activity.location,
      },
      enrolledAt: e.enrolledAt,
    }));
  }

  /**
   * 获取我的帖子
   */
  async getMyPosts(userId: string) {
    const posts = await this.postRepository.find({
      where: { userId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    // 获取点赞状态
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        const like = await this.postLikeRepository.findOne({
          where: { postId: post.id, userId },
        });
        return {
          id: post.id,
          content: post.content,
          images: post.images,
          voiceText: post.voiceText,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          isLiked: !!like,
          createdAt: post.createdAt,
        };
      }),
    );

    return postsWithLikeStatus;
  }

  /**
   * 获取我的点赞
   */
  async getMyLikes(userId: string) {
    const likes = await this.postLikeRepository.find({
      where: { userId },
      relations: ['post', 'post.author'],
      order: { createdAt: 'DESC' },
    });

    return likes
      .filter((like) => like.post)
      .map((like) => ({
        id: like.post.id,
        content: like.post.content,
        images: like.post.images,
        voiceText: like.post.voiceText,
        author: {
          id: like.post.author.id,
          nickname: like.post.author.nickname,
          avatar: like.post.author.avatar,
        },
        likeCount: like.post.likeCount,
        commentCount: like.post.commentCount,
        isLiked: true,
        likedAt: like.createdAt,
      }));
  }
}
