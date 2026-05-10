import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Activity } from '../../entities/activity.entity';
import { Post, Comment } from '../../entities/post.entity';
import { Follow } from '../../entities/social.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async onModuleInit() {
    console.log('🔧 运行数据初始化...');
    await this.seed();
  }

  async seedAll() {
    return this.seed();
  }

  async getStatus() {
    const users = await this.userRepository.count();
    const activities = await this.activityRepository.count();
    const posts = await this.postRepository.count();
    const comments = await this.commentRepository.count();
    
    return {
      users,
      activities,
      posts,
      comments,
      initialized: users > 0,
    };
  }

  async seed() {
    try {
      const userCount = await this.userRepository.count();
      if (userCount > 0) {
        console.log('📦 数据已存在，跳过初始化');
        return { message: '数据已存在', initialized: true };
      }

      console.log('🌱 开始播种数据...');

      const users = await this.seedUsers();
      await this.seedActivities();
      const posts = await this.seedPosts(users);
      await this.seedComments(posts, users);
      await this.seedFollows(users);

      console.log('🎉 数据初始化完成！');
      return { message: '数据初始化完成', initialized: true };
    } catch (error) {
      console.error('❌ 数据初始化失败:', error);
      throw error;
    }
  }

  private async seedUsers(): Promise<User[]> {
    const userData = [
      {
        openid: 'test_openid_1',
        nickname: '王大爷',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
        role: 'elder' as const,
        phone: '13800138001',
      },
      {
        openid: 'test_openid_2',
        nickname: '李阿姨',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
        role: 'elder' as const,
        phone: '13800138002',
      },
      {
        openid: 'test_openid_3',
        nickname: '张叔叔',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
        role: 'elder' as const,
        phone: '13800138003',
      },
      {
        openid: 'test_openid_admin',
        nickname: '社区管理员',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        role: 'admin' as const,
        phone: '13900139000',
      },
    ];

    const users = this.userRepository.create(userData as any[]);
    return this.userRepository.save(users);
  }

  private async seedActivities() {
    const now = new Date();
    const activityData = [
      {
        title: '社区健康讲座',
        description: '邀请专业医生讲解老年人健康保健知识，包括饮食、运动、心理调节等方面。',
        category: 'health' as const,
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        time: '09:00',
        location: '社区活动中心二楼会议室',
        capacity: 50,
        currentParticipants: 23,
        imageUrl: 'https://picsum.photos/seed/health/800/400',
        status: 'upcoming' as const,
        organizerId: 'test_openid_admin',
      },
      {
        title: '太极拳晨练活动',
        description: '每天早晨的太极拳集体锻炼活动，欢迎广大太极拳爱好者参与。',
        category: 'sports' as const,
        date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        time: '06:30',
        location: '社区广场',
        capacity: 30,
        currentParticipants: 18,
        imageUrl: 'https://picsum.photos/seed/taichi/800/400',
        status: 'upcoming' as const,
        organizerId: 'test_openid_admin',
      },
      {
        title: '书法交流班',
        description: '书法爱好者交流学习，分享书法技艺，传承中华传统文化。',
        category: 'culture' as const,
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        time: '14:00',
        location: '社区文化站',
        capacity: 20,
        currentParticipants: 12,
        imageUrl: 'https://picsum.photos/seed/calligraphy/800/400',
        status: 'upcoming' as const,
        organizerId: 'test_openid_admin',
      },
      {
        title: '棋牌休闲活动',
        description: '象棋、围棋、扑克牌等休闲活动，老年朋友们一起娱乐交流。',
        category: 'entertainment' as const,
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        time: '14:00',
        location: '社区棋牌室',
        capacity: 40,
        currentParticipants: 28,
        imageUrl: 'https://picsum.photos/seed/chess/800/400',
        status: 'upcoming' as const,
        organizerId: 'test_openid_admin',
      },
      {
        title: '春季踏青活动',
        description: '组织老年人到郊区公园踏青赏花，呼吸新鲜空气，享受春光。',
        category: 'outdoor' as const,
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        time: '08:00',
        location: '人民公园',
        capacity: 35,
        currentParticipants: 15,
        imageUrl: 'https://picsum.photos/seed/spring/800/400',
        status: 'upcoming' as const,
        organizerId: 'test_openid_admin',
      },
    ];

    const activities = this.activityRepository.create(activityData as any[]);
    return this.activityRepository.save(activities);
  }

  private async seedPosts(users: User[]) {
    const posts = [
      {
        content: '今天天气真好，在广场打太极拳，感觉整个人都精神了！有喜欢太极拳的朋友吗？我们可以一起练习。',
        authorId: users[0].id,
        images: ['https://picsum.photos/seed/post1/400/300'],
        voiceText: null,
        likes: 12,
        isLiked: false,
      },
      {
        content: '社区新开的棋牌室环境很好，今天和几个老朋友下了一下午象棋，非常开心！',
        authorId: users[1].id,
        images: ['https://picsum.photos/seed/post2/400/300'],
        voiceText: null,
        likes: 8,
        isLiked: false,
      },
      {
        content: '昨天参加了健康讲座，学到了很多养生知识。医生说每天走8000步对身体好，我准备开始坚持！',
        authorId: users[2].id,
        images: [],
        voiceText: null,
        likes: 15,
        isLiked: false,
      },
      {
        content: '春天到了，院子里花都开了。哪位邻居知道哪里有好的踏青地点？想去看看油菜花。',
        authorId: users[0].id,
        images: ['https://picsum.photos/seed/post4/400/300'],
        voiceText: null,
        likes: 6,
        isLiked: false,
      },
    ];

    return this.postRepository.save(posts);
  }

  private async seedComments(posts: Post[], users: User[]) {
    const comments = [
      {
        content: '太极拳真的很适合我们老年人，我也每天早上练习！',
        postId: posts[0].id,
        authorId: users[1].id,
      },
      {
        content: '支持！我也想学太极拳，能带我一 起吗？',
        postId: posts[0].id,
        authorId: users[2].id,
      },
      {
        content: '棋牌室我去过，环境确实不错！',
        postId: posts[1].id,
        authorId: users[0].id,
      },
      {
        content: '每天8000步，这个目标很好！加油！',
        postId: posts[2].id,
        authorId: users[1].id,
      },
    ];

    return this.commentRepository.save(comments);
  }

  private async seedFollows(users: User[]) {
    const follows = [
      { followerId: users[0].id, followingId: users[1].id },
      { followerId: users[0].id, followingId: users[2].id },
      { followerId: users[1].id, followingId: users[0].id },
      { followerId: users[2].id, followingId: users[0].id },
      { followerId: users[2].id, followingId: users[1].id },
    ];

    return this.followRepository.save(follows);
  }
}
