import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Auth } from '../../../common/decorators/auth.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseUtils } from '../../../common/utils/response.util';
import { User } from '../../../entities/user.entity';

@Controller('user/notification-settings')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 获取通知设置
   * GET /api/user/notification-settings
   */
  @Get()
  @Auth()
  async getSettings(@CurrentUser() user: User) {
    const settings = await this.notificationService.getSettings(user.id);
    return ResponseUtils.success(settings);
  }

  /**
   * 更新通知设置
   * PUT /api/user/notification-settings
   */
  @Put()
  @Auth()
  async updateSettings(
    @CurrentUser() user: User,
    @Body() dto: UpdateNotificationDto,
  ) {
    const settings = await this.notificationService.updateSettings(
      user.id,
      dto,
    );
    return ResponseUtils.success(settings, '设置已更新');
  }
}
