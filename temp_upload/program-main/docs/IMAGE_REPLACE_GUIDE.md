# 银龄乐圈 - 图片替换指南

## 如何替换图片

本项目使用网络图片 URL，主要集中在两个位置：

### 1. 活动数据图片 (`src/store/mock-data.ts`)

#### 活动封面图片
```typescript
// 搜索关键词：imageUrl
imageUrl: 'https://images.unsplash.com/photo-xxx?w=800&q=80'
```

**替换方法**：
1. 打开 `src/store/mock-data.ts` 文件
2. 找到 `mockActivities` 数组中的 `imageUrl` 字段
3. 将 URL 替换为你自己的图片地址

#### 用户头像图片
```typescript
// 搜索关键词：userAvatar
userAvatar: 'https://images.unsplash.com/photo-xxx?w=200&q=80'
```

**替换方法**：
1. 打开 `src/store/mock-data.ts` 文件
2. 找到 `mockPosts` 数组中的 `userAvatar` 字段
3. 替换为老人头像的 URL

### 2. 页面固定图片

#### 首页时光照相馆卡片
文件：`src/pages/index/index.tsx`
```typescript
src="https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=800&q=80"
```

## 推荐图片来源

### 免费图片资源

1. **Unsplash** (https://unsplash.com)
   - 免费高分辨率照片
   - 搜索关键词：elderly, senior, chinese elderly, community activities

2. **Pexels** (https://pexels.com)
   - 免费图片素材库
   - 适合老年人题材

3. **中国政府网图片库**
   - 用于正式场合的活动照片

### 自定义图片

1. **微信小程序云存储**
   - 上传图片到微信云开发存储
   - 获取永久链接

2. **对象存储服务**
   - 使用腾讯云 COS 或阿里云 OSS
   - 获取公网访问地址

## 图片规格建议

| 用途 | 推荐尺寸 | 格式 |
|------|----------|------|
| 活动封面 | 800x600px | JPG/PNG |
| 用户头像 | 200x200px | JPG/PNG |
| 动态配图 | 600x400px | JPG/PNG |

## 代码示例

### 替换活动封面
```typescript
// 原来
imageUrl: 'https://images.unsplash.com/photo-xxx'

// 替换为你的图片
imageUrl: 'https://your-cos-url.com/activity-cover.jpg'
```

### 替换用户头像
```typescript
// 原来
userAvatar: 'https://images.unsplash.com/photo-xxx'

// 替换为你的图片
userAvatar: 'https://your-cos-url.com/elderly-avatar.png'
```

## 注意事项

1. **跨域问题**：确保图片服务器允许跨域访问
2. **访问速度**：建议使用国内 CDN 加速的图片服务
3. **图片大小**：单张图片建议不超过 500KB
4. **隐私合规**：使用真实老人照片需获得本人授权
