/**
 * 银龄乐圈 - Mock数据与本地存储管理
 * 为适老化社区小程序提供活动数据和邻里圈动态
 */

import Taro from '@tarojs/taro'

// ============================================
// 数据类型定义
// ============================================

export interface Activity {
  id: string
  title: string
  category: '文体娱乐' | '健康养生' | '社区服务'
  imageUrl: string
  date: string
  time: string
  location: string
  description: string
  status: 'available' | 'full' | 'signed'
  capacity: number
  enrolled: number
}

export interface Post {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  images: string[]
  publishTime: string
  likes: number
  comments: number
  isLiked: boolean
}

export interface UserProfile {
  id: string
  name: string
  avatar: string
}

// ============================================
// Mock 活动数据（5条高质量活动）
// ============================================

export const mockActivities: Activity[] = [
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
    enrolled: 18
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
    enrolled: 42
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
    enrolled: 40
  },
  {
    id: 'act004',
    title: '智能手机使用培训',
    category: '社区服务',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    date: '2026-05-22',
    time: '10:00 - 12:00',
    location: '社区便民服务中心三楼',
    description: `【银龄数字课堂】智能手机使用入门培训

📱 本期主题：微信基础操作

👨‍🏫 课程内容：
• 微信的下载与注册
• 添加好友与建群
• 发送消息、图片、语音
• 微信支付基础操作
• 如何防范电信诈骗
• 智能手机日常维护

🎁 学习福利：
• 免费提供学习资料打印版
• 课后一对一答疑辅导
• 组建学习交流群，课后持续指导

💻 培训设备：
• 自带智能手机（安卓或苹果均可）
• 如无手机，现场可借用培训设备

📍 地点：社区便民服务中心三楼培训室
🅿️ 电梯直达，无障碍设施完善`,
    status: 'available',
    capacity: 25,
    enrolled: 15
  },
  {
    id: 'act005',
    title: '健康养生茶话会',
    category: '健康养生',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
    date: '2026-05-25',
    time: '15:00 - 17:00',
    location: '社区居家养老服务中心',
    description: `【养生茶话会】健康生活，品味人生

🍵 活动特色：
一场专门为老年朋友设计的养生茶话会，在轻松愉快的氛围中学习健康知识，结交志同道合的朋友。

📋 活动安排：
• 养生茶品鉴（菊花茶、枸杞茶、玫瑰花茶等）
• 中医养生知识分享
• 穴位按摩现场教学
• 健康咨询互动环节
• 文艺节目欣赏

🎁 参与福利：
• 免费品尝多种养生茶
• 获得养生茶包一份
• 参与互动可获小礼品

👨‍⚕️ 特邀嘉宾：
市中医院退休中医师王阿姨，为大家讲解四季养生要点。

🍰 茶点供应：
现场提供时令水果、低糖糕点等健康茶点

📍 地点：社区居家养老服务中心多功能厅`,
    status: 'available',
    capacity: 35,
    enrolled: 20
  }
]

// ============================================
// Mock 邻里圈动态数据（3条）
// ============================================

export const mockPosts: Post[] = [
  {
    id: 'post001',
    userId: 'user001',
    userName: '王秀英',
    userAvatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&q=80',
    content: '今天在太极拳晨练班学完了24式简化太极拳！老师教得很仔细，我终于把动作记住了。感觉身体暖暖的，精神也好了很多！感谢李老师耐心指导',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      'https://images.unsplash.com/photo-1601581975053-7c199cd76688?w=600&q=80'
    ],
    publishTime: '2小时前',
    likes: 28,
    comments: 12,
    isLiked: false
  },
  {
    id: 'post002',
    userId: 'user002',
    userName: '张建国',
    userAvatar: 'https://images.pexels.com/photos/14121821/pexels-photo-14121821.jpeg',
    content: '分享昨天防诈骗讲座学到的知识！昨天听了王警官的讲座，恍然大悟，原来骗子有这么多套路。现在我把几个关键点整理出来，大家一定要看：\n\n1、凡是打电话说涉嫌违法的，都是骗子！\n2、保健品治病是骗局，生病了要去医院！\n3、高收益理财都是坑，血本无归的例子太多了！\n\n大家一定要记住，有疑问就打110咨询！',
    images: [],
    publishTime: '昨天 15:30',
    likes: 56,
    comments: 23,
    isLiked: true
  },
  {
    id: 'post003',
    userId: 'user003',
    userName: '李阿姨',
    userAvatar: 'https://images.pexels.com/photos/34009474/pexels-photo-34009474.jpeg',
    content: '今天在书法班写的第一幅字，虽然还很稚嫩，但是很有成就感！张老师说我的握笔姿势很标准，进步很快\n\n有想学书法的邻居可以联系我，我们一起报名下期的课程！',
    images: [
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80'
    ],
    publishTime: '前天 10:15',
    likes: 42,
    comments: 18,
    isLiked: false
  }
]

// ============================================
// 默认用户信息
// ============================================

export const defaultUserProfile: UserProfile = {
  id: 'my001',
  name: '银龄用户',
  avatar: 'https://unsplash.com/photos/a-black-background-with-a-pink-and-blue-object-37jnYxNi5k0'
}

// ============================================
// LocalStorage 键名常量
// ============================================

const STORAGE_KEYS = {
  SIGNED_ACTIVITIES: 'yinling_signed_activities',
  USER_PROFILE: 'yinling_user_profile',
  POSTS: 'yinling_posts',
  LIKED_POSTS: 'yinling_liked_posts'
} as const

// ============================================
// 本地存储管理工具
// ============================================

/**
 * 获取已报名的活动ID列表
 */
export const getSignedActivityIds = (): string[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEYS.SIGNED_ACTIVITIES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 保存已报名的活动ID
 */
export const saveSignedActivityId = (activityId: string): void => {
  try {
    const ids = getSignedActivityIds()
    if (!ids.includes(activityId)) {
      ids.push(activityId)
      Taro.setStorageSync(STORAGE_KEYS.SIGNED_ACTIVITIES, JSON.stringify(ids))
    }
  } catch (e) {
    console.error('保存报名记录失败:', e)
  }
}

/**
 * 取消已报名的活动ID
 */
export const removeSignedActivityId = (activityId: string): void => {
  try {
    const ids = getSignedActivityIds()
    const newIds = ids.filter(id => id !== activityId)
    Taro.setStorageSync(STORAGE_KEYS.SIGNED_ACTIVITIES, JSON.stringify(newIds))
  } catch (e) {
    console.error('取消报名失败:', e)
  }
}

/**
 * 批量获取已报名的活动详情
 */
export const getSignedActivities = (): Activity[] => {
  const ids = getSignedActivityIds()
  return mockActivities.filter(activity => ids.includes(activity.id))
}

/**
 * 获取用户资料
 */
export const getUserProfile = (): UserProfile => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEYS.USER_PROFILE)
    return data ? JSON.parse(data) : defaultUserProfile
  } catch {
    return defaultUserProfile
  }
}

/**
 * 保存用户资料
 */
export const saveUserProfile = (profile: UserProfile): void => {
  try {
    Taro.setStorageSync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
  } catch (e) {
    console.error('保存用户资料失败:', e)
  }
}

/**
 * 获取邻里圈动态列表（包含本地新增的）
 */
export const getPosts = (): Post[] => {
  try {
    const localData = Taro.getStorageSync(STORAGE_KEYS.POSTS)
    const localPosts: Post[] = localData ? JSON.parse(localData) : []
    // 合并Mock数据和本地数据，本地数据在前
    return [...localPosts, ...mockPosts]
  } catch {
    return mockPosts
  }
}

/**
 * 添加新动态到本地存储
 */
export const addLocalPost = (post: Omit<Post, 'id' | 'publishTime' | 'likes' | 'comments' | 'isLiked'>): void => {
  try {
    const posts = getPosts()
    const newPost: Post = {
      ...post,
      id: `local_${Date.now()}`,
      publishTime: '刚刚',
      likes: 0,
      comments: 0,
      isLiked: false
    }
    // 插入到最前面
    posts.unshift(newPost)
    // 只保存本地新增的动态（不包括Mock数据）
    const localPosts = posts.filter(p => p.id.startsWith('local_'))
    Taro.setStorageSync(STORAGE_KEYS.POSTS, JSON.stringify(localPosts))
  } catch (e) {
    console.error('保存动态失败:', e)
  }
}

/**
 * 获取用户点赞的动态ID列表
 */
export const getLikedPostIds = (): string[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEYS.LIKED_POSTS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 切换动态点赞状态
 */
export const togglePostLike = (postId: string): boolean => {
  try {
    const likedIds = getLikedPostIds()
    const isLiked = likedIds.includes(postId)
    
    if (isLiked) {
      // 取消点赞
      const newLikedIds = likedIds.filter(id => id !== postId)
      Taro.setStorageSync(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(newLikedIds))
      return false
    } else {
      // 添加点赞
      likedIds.push(postId)
      Taro.setStorageSync(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likedIds))
      return true
    }
  } catch {
    return false
  }
}

/**
 * 保存点赞的动态ID
 */
export const saveLikedPostId = (postId: string): string[] => {
  try {
    const likedIds = getLikedPostIds()
    if (!likedIds.includes(postId)) {
      likedIds.push(postId)
      Taro.setStorageSync(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likedIds))
    }
    return likedIds
  } catch {
    return []
  }
}

/**
 * 移除点赞的动态ID
 */
export const removeLikedPostId = (postId: string): string[] => {
  try {
    const likedIds = getLikedPostIds()
    const newLikedIds = likedIds.filter(id => id !== postId)
    Taro.setStorageSync(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(newLikedIds))
    return newLikedIds
  } catch {
    return []
  }
}

/**
 * 获取当前用户自己发布的动态
 */
export const getUserPosts = (): Post[] => {
  try {
    const localData = Taro.getStorageSync(STORAGE_KEYS.POSTS)
    const localPosts: Post[] = localData ? JSON.parse(localData) : []
    return localPosts
  } catch {
    return []
  }
}

/**
 * 删除用户发布的动态
 */
export const deleteUserPost = (postId: string): void => {
  try {
    const localData = Taro.getStorageSync(STORAGE_KEYS.POSTS)
    const localPosts: Post[] = localData ? JSON.parse(localData) : []
    const newPosts = localPosts.filter(post => post.id !== postId)
    Taro.setStorageSync(STORAGE_KEYS.POSTS, JSON.stringify(newPosts))
  } catch (e) {
    console.error('删除动态失败:', e)
  }
}

// ============================================
// 导出类型
// ============================================
