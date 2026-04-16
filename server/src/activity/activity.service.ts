/**
 * 活动服务
 * 提供活动数据的增删改查操作
 */

import { Injectable, NotFoundException } from '@nestjs/common'
import { Activity, CreateActivityDto, UpdateActivityDto } from './entities/activity.entity'

@Injectable()
export class ActivityService {
  // 内存存储活动数据
  private activities: Activity[] = [
    {
      id: 'act001',
      title: '书法入门体验课',
      category: '文体娱乐',
      imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80',
      date: '2026-05-15',
      time: '09:00 - 11:00',
      location: '社区活动中心二楼书画室',
      description: `【书法入门体验课】专为老年朋友开设的书法入门课程！

📖 课程内容：
• 书法基础知识与握笔姿势
• 基础笔画练习（横、竖、撇、捺）
• 简单汉字书写示范
• 作品欣赏与交流

🎁 特别福利：
• 提供全套书法工具（毛笔、宣纸、墨汁）
• 现场老师一对一指导
• 赠送入门字帖一本

👨‍🏫 讲师介绍：
张明华老师，中国书法家协会会员，从事书法教学30余年，耐心细致，深受学员喜爱。

📍 地址：社区活动中心二楼书画室
🅿️ 提供无障碍通道，轮椅友好`,
      status: 'available',
      capacity: 30,
      enrolled: 18,
      createdAt: '2026-04-01T08:00:00.000Z',
      updatedAt: '2026-04-01T08:00:00.000Z'
    },
    {
      id: 'act002',
      title: '防诈骗知识讲座',
      category: '社区服务',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      date: '2026-05-18',
      time: '14:00 - 16:00',
      location: '社区会议室（一楼大厅旁）',
      description: `【防范电信网络诈骗专题讲座】守护您的钱袋子！

⚠️ 课程背景：
近年来，针对老年人的电信网络诈骗案件频发，为了提高大家的防骗意识，特此举办本次讲座。

📚 讲座内容：
• 常见诈骗手法揭秘（冒充公检法、保健品诈骗、投资理财诈骗等）
• 真实案例分析
• 如何识别诈骗电话和短信
• 遇到诈骗怎么办

🎯 学习目标：
• 掌握识别诈骗的基本方法
• 提高自我保护意识
• 保护个人财产和隐私安全

📢 互动环节：
现场设置有奖问答，答对者可获得精美礼品一份！

🔔 特别提醒：
讲座结束后，将发放《老年人防骗手册》，人手一份！`,
      status: 'available',
      capacity: 50,
      enrolled: 42,
      createdAt: '2026-04-02T08:00:00.000Z',
      updatedAt: '2026-04-02T08:00:00.000Z'
    },
    {
      id: 'act003',
      title: '太极拳晨练班',
      category: '健康养生',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      date: '2026-05-20',
      time: '06:30 - 08:00',
      location: '社区广场（音乐喷泉旁）',
      description: `【太极拳晨练班】健康养生，从清晨开始！

🧘 太极拳的好处：
• 强身健体，提高免疫力
• 调节气息，改善呼吸系统
• 舒缓压力，愉悦心情
• 结识邻里，丰富生活

📋 课程安排：
• 热身运动（10分钟）
• 太极拳基本功（20分钟）
• 24式简化太极拳教学（40分钟）
• 放松整理（10分钟）

👨‍🏫 教练介绍：
李建国老师，陈式太极拳第12代传人，国家级社会体育指导员，义务教学10余年。

📍 集合地点：社区广场音乐喷泉旁
⏰ 请提前10分钟到达

💡 温馨提示：
• 请穿着舒适的运动服装和软底鞋
• 根据身体状况适度运动
• 自带饮用水
• 雨天移至社区活动中心一楼`,
      status: 'full',
      capacity: 40,
      enrolled: 40,
      createdAt: '2026-04-03T08:00:00.000Z',
      updatedAt: '2026-04-03T08:00:00.000Z'
    },
    {
      id: 'act004',
      title: '健康义诊服务',
      category: '健康养生',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      date: '2026-05-22',
      time: '09:00 - 12:00',
      location: '社区卫生服务中心',
      description: `【社区健康义诊服务】关爱健康，服务邻里！

🏥 服务内容：
• 血压、血糖免费检测
• 中医体质辨识
• 口腔健康检查
• 视力筛查
• 健康咨询与指导

👨‍⚕️ 义诊专家：
邀请市第一人民医院老年科、心内科、内分泌科专家团队现场坐诊。

📍 地址：社区卫生服务中心（3楼会议室）

💡 温馨提示：
• 请携带身份证和社保卡
• 检测血糖请空腹前来
• 请全程佩戴口罩`,
      status: 'available',
      capacity: 100,
      enrolled: 65,
      createdAt: '2026-04-04T08:00:00.000Z',
      updatedAt: '2026-04-04T08:00:00.000Z'
    },
    {
      id: 'act005',
      title: '棋牌交流赛',
      category: '文体娱乐',
      imageUrl: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&q=80',
      date: '2026-05-25',
      time: '14:00 - 17:00',
      location: '社区活动中心三楼棋牌室',
      description: `【社区棋牌交流赛】以棋会友，邻里同乐！

🎯 比赛项目：
• 象棋（个人赛）
• 扑克牌（双扣对弈）

🏆 奖项设置：
• 一等奖：精美礼品一份 + 荣誉证书
• 二等奖：实用礼品一份 + 荣誉证书
• 三等奖：参与奖（所有参赛者）

📋 比赛规则：
• 象棋采用单循环赛制
• 扑克牌采用淘汰赛制
• 详情现场公布

👥 参赛须知：
• 象棋限报32人
• 扑克牌限报24人（12组）
• 报名截止：5月23日

📍 地址：社区活动中心三楼棋牌室`,
      status: 'available',
      capacity: 56,
      enrolled: 38,
      createdAt: '2026-04-05T08:00:00.000Z',
      updatedAt: '2026-04-05T08:00:00.000Z'
    }
  ]

  // 创建活动
  create(createActivityDto: CreateActivityDto): Activity {
    const now = new Date().toISOString()
    const activity: Activity = {
      ...createActivityDto,
      id: `act${Date.now()}`,
      status: 'available',
      enrolled: 0,
      createdAt: now,
      updatedAt: now
    }
    this.activities.push(activity)
    console.log('[ActivityService] 创建活动:', activity)
    return activity
  }

  // 获取所有活动
  findAll(category?: string): Activity[] {
    console.log('[ActivityService] 获取活动列表, category:', category)
    if (category && category !== '全部') {
      return this.activities.filter(a => a.category === category)
    }
    return this.activities
  }

  // 获取单个活动
  findOne(id: string): Activity {
    console.log('[ActivityService] 获取活动详情, id:', id)
    const activity = this.activities.find(a => a.id === id)
    if (!activity) {
      throw new NotFoundException(`活动 ID ${id} 不存在`)
    }
    return activity
  }

  // 更新活动
  update(id: string, updateActivityDto: UpdateActivityDto): Activity {
    console.log('[ActivityService] 更新活动, id:', id, updateActivityDto)
    const index = this.activities.findIndex(a => a.id === id)
    if (index === -1) {
      throw new NotFoundException(`活动 ID ${id} 不存在`)
    }
    
    this.activities[index] = {
      ...this.activities[index],
      ...updateActivityDto,
      updatedAt: new Date().toISOString()
    }
    
    return this.activities[index]
  }

  // 删除活动
  remove(id: string): { message: string } {
    console.log('[ActivityService] 删除活动, id:', id)
    const index = this.activities.findIndex(a => a.id === id)
    if (index === -1) {
      throw new NotFoundException(`活动 ID ${id} 不存在`)
    }
    
    this.activities.splice(index, 1)
    return { message: '活动删除成功' }
  }

  // 报名活动
  enroll(id: string): Activity {
    console.log('[ActivityService] 报名活动, id:', id)
    const activity = this.findOne(id)
    
    if (activity.enrolled >= activity.capacity) {
      activity.status = 'full'
      throw new Error('活动名额已满')
    }
    
    activity.enrolled += 1
    activity.updatedAt = new Date().toISOString()
    
    if (activity.enrolled >= activity.capacity) {
      activity.status = 'full'
    } else {
      activity.status = 'available'
    }
    
    return activity
  }

  // 取消报名
  cancelEnroll(id: string): Activity {
    console.log('[ActivityService] 取消报名, id:', id)
    const activity = this.findOne(id)
    
    if (activity.enrolled > 0) {
      activity.enrolled -= 1
      activity.updatedAt = new Date().toISOString()
      
      if (activity.enrolled < activity.capacity) {
        activity.status = 'available'
      }
    }
    
    return activity
  }
}
