import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityStatus } from '../../../entities/activity.entity';
import { ActivityEnrollment } from '../../../entities/activity-enrollment.entity';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';
import { SignUpActivityDto } from '../dto/sign-up-activity.dto';
import { QueryActivitiesDto } from '../dto/query-activities.dto';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(ActivityEnrollment)
    private enrollmentRepository: Repository<ActivityEnrollment>,
  ) {}

  /**
   * 获取活动列表
   */
  async findAll(query: QueryActivitiesDto) {
    const { category, page = 1, pageSize = 10 } = query;

    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.organizer', 'organizer')
      .where('activity.status != :status', { status: ActivityStatus.CANCELLED });

    if (category) {
      qb.andWhere('activity.category = :category', { category });
    }

    const [list, total] = await qb
      .orderBy('activity.date', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 统计每个活动的报名人数
    const activitiesWithCount = await Promise.all(
      list.map(async (activity) => {
        const enrolledCount = await this.enrollmentRepository.count({
          where: { activityId: activity.id },
        });
        return {
          ...activity,
          enrolledCount,
        };
      }),
    );

    return { list: activitiesWithCount, total, page, pageSize };
  }

  /**
   * 获取活动详情
   */
  async findOne(id: string, userId?: string) {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    const enrolledCount = await this.enrollmentRepository.count({
      where: { activityId: id },
    });

    // 检查当前用户是否已报名
    let isEnrolled = false;
    if (userId) {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { activityId: id, userId },
      });
      isEnrolled = !!enrollment;
    }

    return {
      ...activity,
      enrolledCount,
      isEnrolled,
    };
  }

  /**
   * 创建活动（管理员）
   */
  async create(organizerId: string, dto: CreateActivityDto) {
    const activity = this.activityRepository.create({
      ...dto,
      organizerId,
    });

    await this.activityRepository.save(activity);
    this.logger.log(`活动创建成功: ${activity.id}`);

    return { id: activity.id };
  }

  /**
   * 更新活动（管理员）
   */
  async update(id: string, dto: UpdateActivityDto) {
    const activity = await this.activityRepository.findOne({ where: { id } });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    Object.assign(activity, dto);
    await this.activityRepository.save(activity);

    return { id: activity.id };
  }

  /**
   * 删除活动（管理员）
   */
  async remove(id: string) {
    const activity = await this.activityRepository.findOne({ where: { id } });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    await this.activityRepository.remove(activity);
    return { success: true };
  }

  /**
   * 活动报名
   */
  async signUp(activityId: string, userId: string, dto: SignUpActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    // 检查是否已报名
    const existing = await this.enrollmentRepository.findOne({
      where: { activityId, userId },
    });

    if (existing) {
      throw new BadRequestException('您已报名此活动');
    }

    // 检查是否满员
    const enrolledCount = await this.enrollmentRepository.count({
      where: { activityId },
    });

    if (enrolledCount >= activity.capacity) {
      throw new BadRequestException('活动已满员');
    }

    const enrollment = this.enrollmentRepository.create({
      activityId,
      userId,
      phone: dto.phone,
      remark: dto.remark,
    });

    await this.enrollmentRepository.save(enrollment);
    this.logger.log(`用户 ${userId} 报名了活动 ${activityId}`);

    return { enrollmentId: enrollment.id, activityId };
  }

  /**
   * 取消报名
   */
  async cancelSignUp(activityId: string, userId: string) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { activityId, userId },
    });

    if (!enrollment) {
      throw new BadRequestException('您未报名此活动');
    }

    await this.enrollmentRepository.remove(enrollment);
    this.logger.log(`用户 ${userId} 取消了活动 ${activityId} 的报名`);

    return { success: true };
  }

  /**
   * 获取报名用户列表（管理员）
   */
  async getEnrollees(activityId: string) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    const enrollments = await this.enrollmentRepository.find({
      where: { activityId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
    });

    return enrollments.map((e) => ({
      id: e.id,
      user: {
        id: e.user.id,
        nickname: e.user.nickname,
        avatar: e.user.avatar,
      },
      phone: e.user.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // 手机号脱敏
      remark: e.remark,
      enrolledAt: e.enrolledAt,
    }));
  }

  /**
   * 获取用户已报名的活动
   */
  async getUserEnrollments(userId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
      relations: ['activity'],
      order: { enrolledAt: 'DESC' },
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      activityId: e.activity.id,
      title: e.activity.title,
      category: e.activity.category,
      coverImage: e.activity.coverImage,
      date: e.activity.date,
      time: e.activity.time,
      location: e.activity.location,
      enrolledAt: e.enrolledAt,
    }));
  }
}
