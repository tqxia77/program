import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取个人资料
   */
  @Get('profile')
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.userService.getProfile(userId);
  }

  /**
   * 更新个人资料
   */
  @Put('profile')
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  /**
   * 更新头像
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // 头像上传后返回URL，实际项目中应上传到OSS
    const avatarUrl = file ? `/uploads/avatars/${file.filename}` : '';
    return this.userService.updateAvatar(userId, avatarUrl);
  }

  /**
   * 获取我的报名活动
   */
  @Get('activities')
  async getMyActivities(@CurrentUser('userId') userId: string) {
    return this.userService.getMyActivities(userId);
  }

  /**
   * 获取我的帖子
   */
  @Get('posts')
  async getMyPosts(@CurrentUser('userId') userId: string) {
    return this.userService.getMyPosts(userId);
  }

  /**
   * 获取我的点赞
   */
  @Get('likes')
  async getMyLikes(@CurrentUser('userId') userId: string) {
    return this.userService.getMyLikes(userId);
  }
}
