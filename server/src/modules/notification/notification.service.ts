import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 获取用户通知设置
   */
  async getSettings(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return {
        smsEnabled: true,
        callEnabled: true,
        activityReminder: true,
        commentReminder: true,
        likeReminder: true,
      };
    }

    return (
      user.notificationSettings || {
        smsEnabled: true,
        callEnabled: true,
        activityReminder: true,
        commentReminder: true,
        likeReminder: true,
      }
    );
  }

  /**
   * 更新用户通知设置
   */
  async updateSettings(userId: string, dto: UpdateNotificationDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 合并现有设置和新设置
    const currentSettings = user.notificationSettings || {};
    user.notificationSettings = {
      ...currentSettings,
      ...dto,
    };

    await this.userRepository.save(user);
    this.logger.log(`用户 ${userId} 更新了通知设置`);

    return user.notificationSettings;
  }
}
