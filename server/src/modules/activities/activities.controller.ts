import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { SignUpActivityDto } from './dto/sign-up-activity.dto';
import { QueryActivitiesDto } from './dto/query-activities.dto';
import { Auth } from '../../../common/decorators/auth.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseUtils } from '../../../common/utils/response.util';
import { User } from '../../../entities/user.entity';
import { AdminGuard } from '../../../common/guards/admin.guard';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * 获取活动列表
   * GET /api/activities
   */
  @Get()
  async findAll(@Query() query: QueryActivitiesDto) {
    const result = await this.activitiesService.findAll(query);
    return ResponseUtils.page(result.list, result.total, result.page, result.pageSize);
  }

  /**
   * 获取活动详情
   * GET /api/activities/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ) {
    const result = await this.activitiesService.findOne(id, user?.id);
    return ResponseUtils.success(result);
  }

  /**
   * 活动报名
   * POST /api/activities/:id/signup
   */
  @Post(':id/signup')
  @Auth()
  async signUp(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: SignUpActivityDto,
  ) {
    const result = await this.activitiesService.signUp(id, user.id, dto);
    return ResponseUtils.success(result, '报名成功');
  }

  /**
   * 取消报名
   * POST /api/activities/:id/cancel
   */
  @Post(':id/cancel')
  @Auth()
  async cancelSignUp(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.activitiesService.cancelSignUp(id, user.id);
    return ResponseUtils.success(result, '取消成功');
  }

  /**
   * 获取报名用户列表（管理员）
   * GET /api/activities/:id/enrollees
   */
  @Get(':id/enrollees')
  @Auth()
  async getEnrollees(@Param('id') id: string) {
    const result = await this.activitiesService.getEnrollees(id);
    return ResponseUtils.success(result);
  }

  // ========== 管理员接口 ==========

  /**
   * 创建活动（管理员）
   * POST /api/admin/activities
   */
  @Post()
  @Auth()
  @UseGuards(AdminGuard)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateActivityDto,
  ) {
    const result = await this.activitiesService.create(user.id, dto);
    return ResponseUtils.success(result, '创建成功');
  }

  /**
   * 编辑活动（管理员）
   * PUT /api/admin/activities/:id
   */
  @Put(':id')
  @Auth()
  @UseGuards(AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    const result = await this.activitiesService.update(id, dto);
    return ResponseUtils.success(result, '更新成功');
  }

  /**
   * 删除活动（管理员）
   * DELETE /api/admin/activities/:id
   */
  @Delete(':id')
  @Auth()
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    const result = await this.activitiesService.remove(id);
    return ResponseUtils.success(result, '删除成功');
  }
}
