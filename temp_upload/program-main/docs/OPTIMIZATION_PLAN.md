# 银龄乐圈 - 功能优化与扩展方案

> 本文档基于当前已实现功能，提出短期可落地的优化方向和中期可扩展的能力边界。方案按「用户体验优化」「功能补全」「社交增强」「运营支持」四个维度组织，每个条目标注实现状态和预估工作量。

---

## 一、用户体验优化

### 1.1 已实现但可优化

#### 1.1.1 首页下拉刷新
**现状**：活动中心页面无下拉刷新，用户无法手动刷新活动列表  
**扩展方案**：
- 在活动中心和邻里圈添加下拉刷新功能
- 刷新时显示 loading 动画
- 刷新成功后提示"内容已更新"

```tsx
// 实现示例（伪代码）
<ScrollView
  scrollY
  refresherEnabled
  onRefresherRefresh={handleRefresh}
  refresherTriggered={isRefreshing}
>
```

**工作量**：0.5 天  
**优先级**：中

---

#### 1.1.2 搜索功能
**现状**：活动列表和邻里圈均无搜索能力  
**扩展方案**：
- 活动中心：支持按活动名称、地点搜索
- 邻里圈：支持按用户名、内容关键词搜索
- 搜索历史记录（本地存储）

```tsx
// 搜索栏组件
<View className="px-4 py-3 bg-white border-b border-border">
  <Input
    className="bg-gray-50 rounded-full px-4"
    placeholder="搜索活动..."
    onConfirm={handleSearch}
  />
</View>
```

**工作量**：1 天  
**优先级**：中

---

#### 1.1.3 页面加载状态优化
**现状**：列表加载时仅显示简单文字"加载中..."  
**扩展方案**：
- 使用 Skeleton 骨架屏替代静态文字
- 骨架屏展示卡片轮廓，提升感知体验

```tsx
// 实现示例
{loading ? (
  <View className="space-y-4 px-4">
    {[1, 2, 3].map(i => (
      <View key={i} className="bg-white rounded-2xl p-4">
        <Skeleton className="w-full h-52 rounded-xl mb-4" />
        <Skeleton className="w-3/4 h-6 rounded mb-2" />
        <Skeleton className="w-1/2 h-4 rounded" />
      </View>
    ))}
  </View>
) : (
  // 实际内容
)}
```

**工作量**：0.5 天  
**优先级**：低

---

### 1.2 未实现但可实现

#### 1.2.1 活动收藏功能
**现状**：仅支持报名，不支持收藏  
**扩展方案**：
- 添加收藏按钮（星形图标）
- 收藏列表独立展示
- 本地存储收藏状态

```tsx
// 数据结构
interface Favorite {
  id: string
  type: 'activity' | 'post'
  itemId: string
  createdAt: string
}
```

**工作量**：1 天  
**优先级**：中

---

#### 1.2.2 活动签到功能
**现状**：报名后无法现场签到  
**扩展方案**：
- 活动当天显示签到入口
- 二维码签到（调用 Taro.scanCode）
- 签到成功记录

```tsx
// 活动详情页签到区域
{isActivityDay && isSigned && !isCheckedIn && (
  <View className="bg-success text-white text-center py-4 rounded-xl" onClick={handleCheckIn}>
    <Text className="block text-xl font-bold">点击签到</Text>
  </View>
)}
```

**工作量**：1.5 天  
**优先级**：中

---

#### 1.2.3 消息通知中心
**现状**：无消息通知功能  
**扩展方案**：
- 新评论通知
- 新活动提醒
- 报名状态变更通知
- 本地消息存储 + 未读红点

```tsx
// 消息类型
interface Notification {
  id: string
  type: 'comment' | 'activity' | 'system'
  title: string
  content: string
  read: boolean
  createdAt: string
}
```

**工作量**：2 天  
**优先级**：中

---

## 二、功能补全

### 2.1 已实现但可优化

#### 2.1.1 时光照相馆功能落地
**现状**：点击提示"功能正在开发中"  
**扩展方案**：
- 接入图像处理 API（Base64 上传 + AI 修复）
- 老照片上传 + 修复效果对比展示
- 修复后图片保存到相册

```tsx
// 技术方案
// 1. 使用 storage skill 上传原图
// 2. 调用图像处理 API 进行老照片修复
// 3. 返回修复后图片 URL
// 4. 支持修复前后对比滑动
```

**工作量**：3 天  
**优先级**：高（核心差异化功能）

---

#### 2.1.2 邻里圈图片上传
**现状**：发布动态时无图片上传功能  
**扩展方案**：
- 支持选择本地图片（最多 9 张）
- 图片预览 + 删除已选图片
- 上传到对象存储（TOS）

```tsx
// 实现方案
// 1. 使用 Taro.chooseImage 选择图片
// 2. 调用 Network.uploadFile 上传到服务器或 TOS
// 3. 获取图片 URL 后提交动态

const handleSelectImages = async () => {
  const res = await Taro.chooseImage({ count: 9 })
  // 上传并获取 URL
  const urls = await Promise.all(res.tempFilePaths.map(p => uploadImage(p)))
  setSelectedImages(urls)
}
```

**工作量**：1.5 天  
**优先级**：高（用户反馈强烈）

---

#### 2.1.3 活动封面图自定义上传
**现状**：仅支持预设图片选择  
**扩展方案**：
- 支持自定义上传封面图
- 图片裁剪（1:1 或 16:9 比例）
- 上传到对象存储

**工作量**：1 天  
**优先级**：中

---

### 2.2 未实现但可实现

#### 2.2.1 报名成功分享海报
**现状**：报名后无分享功能  
**扩展方案**：
- 生成报名成功海报（含活动信息二维码）
- 保存到相册或分享给好友

```tsx
// 海报数据结构
interface PosterData {
  activityTitle: string
  activityDate: string
  activityLocation: string
  userName: string
  qrCodeUrl: string
}
```

**工作量**：2 天  
**优先级**：低

---

#### 2.2.2 活动日历视图
**现状**：仅列表展示  
**扩展方案**：
- 月历视图展示活动分布
- 点击日期查看当天活动
- 有活动的日期标记红点

```tsx
// Calendar 组件扩展
<Calendar
  markedDates={activityDates}
  onDayClick={handleDayClick}
/>
```

**工作量**：2 天  
**优先级**：低

---

#### 2.2.3 用户签到打卡
**现状**：无连续签到机制  
**扩展方案**：
- 连续签到天数统计
- 签到成就徽章
- 打卡日历展示

**工作量**：1.5 天  
**优先级**：低

---

## 三、社交增强

### 3.1 已实现但可优化

#### 3.1.1 邻里圈@提及功能
**现状**：评论仅支持纯文字  
**扩展方案**：
- 支持 @用户名提及
- 提及后用户收到通知
- 评论中突出显示被提及用户名

```tsx
// 提及正则匹配
const mentionPattern = /@([^\s@]+)/g
const renderComment = (content: string) => {
  return content.replace(mentionPattern, '<span class="text-primary">@$1</span>')
}
```

**工作量**：1 天  
**优先级**：中

---

#### 3.1.2 邻里圈图片放大查看
**现状**：图片点击无放大功能  
**扩展方案**：
- 点击图片全屏预览
- 支持左右滑动切换多图
- 双指缩放图片

```tsx
// 使用 ImagePreview 组件
const handleImagePreview = (urls: string[], index: number) => {
  Taro.previewImage({
    urls,
    current: urls[index]
  })
}
```

**工作量**：0.5 天  
**优先级**：高（用户反馈强烈）

---

#### 3.1.3 用户主页
**现状**：点击用户名无反应  
**扩展方案**：
- 点击头像/用户名进入用户主页
- 展示该用户发布的动态
- 关注/粉丝数量展示

```tsx
// 用户主页数据结构
interface UserProfile {
  id: string
  name: string
  avatar: string
  bio?: string
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
}
```

**工作量**：1.5 天  
**优先级**：中

---

### 3.2 未实现但可实现

#### 3.2.1 关注/粉丝功能
**现状**：无社交关系链  
**扩展方案**：
- 关注按钮
- 关注列表/粉丝列表
- 互相关注标识

```tsx
// 关注操作
const handleFollow = async (userId: string) => {
  await Network.request({
    url: `/api/users/${userId}/follow`,
    method: 'POST'
  })
}
```

**工作量**：2 天  
**优先级**：中

---

#### 3.2.2 邻里圈话题标签
**现状**：动态无话题分类  
**扩展方案**：
- 支持 #话题 标签
- 话题聚合页面
- 推荐热门话题

```tsx
// 话题数据结构
interface Topic {
  id: string
  name: string
  postsCount: number
  coverImage?: string
}
```

**工作量**：1.5 天  
**优先级**：低

---

#### 3.2.3 即时通讯（私信）
**现状**：无私聊功能  
**扩展方案**：
- 一对一私信
- 消息列表
- 未读消息红点

```tsx
// 私信数据结构
interface Message {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  type: 'text' | 'image'
  read: boolean
  createdAt: string
}
```

**工作量**：4 天  
**优先级**：低（复杂度高）

---

## 四、运营支持

### 4.1 已实现但可优化

#### 4.1.1 管理员数据面板
**现状**：活动管理仅列表操作  
**扩展方案**：
- 活动报名统计（报名率、取消率）
- 用户活跃数据
- 数据可视化图表

```tsx
// 统计数据接口
interface AdminStats {
  totalActivities: number
  totalEnrollments: number
  totalUsers: number
  activePosts: number
}
```

**工作量**：2 天  
**优先级**：中

---

#### 4.1.2 消息推送配置
**现状**：无消息推送配置  
**扩展方案**：
- 管理员推送系统消息
- 活动开始前提醒
- 报名成功/失败通知

**工作量**：1.5 天  
**优先级**：中

---

### 4.2 未实现但可实现

#### 4.2.1 用户积分系统
**现状**：无积分机制  
**扩展方案**：
- 报名活动获得积分
- 发布动态获得积分
- 积分兑换礼品

```tsx
// 积分规则配置
const POINTS_RULES = {
  enrollActivity: 10,
  publishPost: 5,
  commentPost: 2,
  likePost: 1
}
```

**工作量**：2 天  
**优先级**：低

---

#### 4.2.2 活动评价系统
**现状**：活动结束后无反馈收集  
**扩展方案**：
- 活动结束评分（1-5 星）
- 文字评价
- 评价展示在活动详情页

```tsx
// 评价数据结构
interface ActivityReview {
  id: string
  activityId: string
  userId: string
  rating: number
  content: string
  createdAt: string
}
```

**工作量**：1.5 天  
**优先级**：中

---

#### 4.2.3 Banner 轮播管理
**现状**：首页 Banner 固定  
**扩展方案**：
- 管理员配置 Banner 内容
- 支持跳转活动详情或外部链接
- Banner 点击统计

```tsx
// Banner 数据结构
interface Banner {
  id: string
  imageUrl: string
  title: string
  linkType: 'activity' | 'webview' | 'none'
  linkValue: string
  sort: number
  status: 'active' | 'inactive'
}
```

**工作量**：1.5 天  
**优先级**：中

---

## 五、技术优化

### 5.1 性能优化

#### 5.1.1 图片懒加载
**现状**：列表图片一次性加载  
**扩展方案**：
- 使用 IntersectionObserver 实现懒加载
- 占位图 + 加载动画
- 滚动时按需加载

```tsx
// 懒加载组件示例
const LazyImage = ({ src, className }) => {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    const observer = Taro.createIntersectionObserver()
    observer.relativeToViewport({ bottom: 100 }).observe('.lazy-image', (res) => {
      if (res.intersectionRatio > 0) {
        setLoaded(true)
      }
    })
    return () => observer.disconnect()
  }, [])
  
  return (
    <View className={className}>
      {!loaded && <View className="bg-gray-200 animate-pulse" />}
      {loaded && <Image src={src} className={className} />}
    </View>
  )
}
```

**工作量**：1 天  
**优先级**：中

---

#### 5.1.2 分页加载
**现状**：一次性加载全部数据  
**扩展方案**：
- 列表分页加载（每页 10 条）
- 下拉加载更多
- 返回顶部按钮

```tsx
// 分页参数
interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}
```

**工作量**：1 天  
**优先级**：中

---

### 5.2 数据持久化

#### 5.2.1 后端数据库接入
**现状**：使用 LocalStorage 和内存数据  
**扩展方案**：
- 接入 PostgreSQL 数据库（使用 supabase skill）
- 替换内存数据为持久化存储
- 数据迁移脚本

**工作量**：3 天  
**优先级**：高

---

#### 5.2.2 用户认证系统
**现状**：无用户登录  
**扩展方案**：
- 手机号登录
- 微信一键登录
- Token 鉴权

```tsx
// 登录流程
const handleLogin = async () => {
  // 1. 获取微信授权
  const { code } = await Taro.login()
  // 2. 发送到后端验证
  const res = await Network.request({
    url: '/api/auth/login',
    method: 'POST',
    data: { code }
  })
  // 3. 保存 token
  Taro.setStorageSync('token', res.data.token)
}
```

**工作量**：3 天  
**优先级**：高

---

## 六、扩展功能清单汇总

### 短期（1-2 周可完成）

| 功能 | 工作量 | 优先级 | 状态 |
|-----|-------|-------|------|
| 首页下拉刷新 | 0.5 天 | 中 | 待实现 |
| 邻里圈图片放大 | 0.5 天 | 高 | 待实现 |
| 邻里圈图片上传 | 1.5 天 | 高 | 待实现 |
| 活动签到 | 1.5 天 | 中 | 待实现 |
| 图片懒加载 | 1 天 | 中 | 待实现 |
| 列表分页 | 1 天 | 中 | 待实现 |
| 活动收藏 | 1 天 | 中 | 待实现 |
| @提及功能 | 1 天 | 中 | 待实现 |
| 活动评价 | 1.5 天 | 中 | 待实现 |

### 中期（1 个月可完成）

| 功能 | 工作量 | 优先级 | 状态 |
|-----|-------|-------|------|
| 时光照相馆 AI 修复 | 3 天 | 高 | 待实现 |
| 消息通知中心 | 2 天 | 中 | 待实现 |
| 用户主页 | 1.5 天 | 中 | 待实现 |
| 关注/粉丝 | 2 天 | 中 | 待实现 |
| 用户积分系统 | 2 天 | 低 | 待实现 |
| 管理员数据面板 | 2 天 | 中 | 待实现 |
| Banner 管理 | 1.5 天 | 中 | 待实现 |
| 报名成功海报 | 2 天 | 低 | 待实现 |

### 长期（需产品规划）

| 功能 | 工作量 | 优先级 | 状态 |
|-----|-------|-------|------|
| 用户认证系统 | 3 天 | 高 | 待实现 |
| 后端数据库接入 | 3 天 | 高 | 待实现 |
| 即时通讯 | 4 天 | 低 | 待规划 |
| 活动日历视图 | 2 天 | 低 | 待规划 |

---

## 七、技术债务

### 7.1 需重构部分

1. **Mock 数据迁移**：当前使用内存数据，需迁移到后端 API
2. **类型定义统一**：Activity、Post 等类型在多处重复定义
3. **网络请求封装**：增加请求拦截、错误统一处理
4. **组件抽象**：抽取通用卡片组件、列表组件

### 7.2 测试覆盖

1. 单元测试：工具函数、数据处理逻辑
2. 集成测试：API 请求、数据存储
3. E2E 测试：核心用户路径覆盖

---

> 本方案可根据实际业务优先级进行调整。建议从「短期高优先级」功能开始迭代，快速验证产品方向。
