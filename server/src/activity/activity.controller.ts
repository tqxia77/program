/**
 * 活动控制器
 * 提供活动管理的 RESTful API
 */

import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query 
} from '@nestjs/common'
import { ActivityService } from './activity.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  /**
   * 创建活动
   * POST /api/activities
   */
  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    console.log('[ActivityController] POST /api/activities - 创建活动')
    console.log('[ActivityController] Request Body:', JSON.stringify(createActivityDto))
    const activity = this.activityService.create(createActivityDto)
    console.log('[ActivityController] Response:', JSON.stringify(activity))
    return {
      code: 200,
      msg: '活动创建成功',
      data: activity
    }
  }

  /**
   * 获取活动列表
   * GET /api/activities
   * GET /api/activities?category=文体娱乐
   */
  @Get()
  findAll(@Query('category') category?: string) {
    console.log('[ActivityController] GET /api/activities - 获取活动列表')
    console.log('[ActivityController] Query category:', category)
    const activities = this.activityService.findAll(category)
    console.log('[ActivityController] Response count:', activities.length)
    return {
      code: 200,
      msg: 'success',
      data: activities
    }
  }

  /**
   * 获取单个活动详情
   * GET /api/activities/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('[ActivityController] GET /api/activities/:id - 获取活动详情')
    console.log('[ActivityController] Param id:', id)
    const activity = this.activityService.findOne(id)
    console.log('[ActivityController] Response:', JSON.stringify(activity))
    return {
      code: 200,
      msg: 'success',
      data: activity
    }
  }

  /**
   * 更新活动
   * PUT /api/activities/:id
   */
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    console.log('[ActivityController] PUT /api/activities/:id - 更新活动')
    console.log('[ActivityController] Param id:', id)
    console.log('[ActivityController] Request Body:', JSON.stringify(updateActivityDto))
    const activity = this.activityService.update(id, updateActivityDto)
    console.log('[ActivityController] Response:', JSON.stringify(activity))
    return {
      code: 200,
      msg: '活动更新成功',
      data: activity
    }
  }

  /**
   * 删除活动
   * DELETE /api/activities/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('[ActivityController] DELETE /api/activities/:id - 删除活动')
    console.log('[ActivityController] Param id:', id)
    const result = this.activityService.remove(id)
    console.log('[ActivityController] Response:', JSON.stringify(result))
    return {
      code: 200,
      msg: '活动删除成功',
      data: result
    }
  }

  /**
   * 报名活动
   * POST /api/activities/:id/enroll
   */
  @Post(':id/enroll')
  enroll(@Param('id') id: string) {
    console.log('[ActivityController] POST /api/activities/:id/enroll - 报名活动')
    console.log('[ActivityController] Param id:', id)
    const activity = this.activityService.enroll(id)
    console.log('[ActivityController] Response:', JSON.stringify(activity))
    return {
      code: 200,
      msg: '报名成功',
      data: activity
    }
  }

  /**
   * 取消报名
   * POST /api/activities/:id/cancel
   */
  @Post(':id/cancel')
  cancelEnroll(@Param('id') id: string) {
    console.log('[ActivityController] POST /api/activities/:id/cancel - 取消报名')
    console.log('[ActivityController] Param id:', id)
    const activity = this.activityService.cancelEnroll(id)
    console.log('[ActivityController] Response:', JSON.stringify(activity))
    return {
      code: 200,
      msg: '取消报名成功',
      data: activity
    }
  }
}
