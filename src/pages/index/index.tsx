/**
 * 银龄乐圈 - 活动中心（首页）
 * 专为老年用户设计的适老化活动浏览页面
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Camera, Calendar, MapPin, Clock, ChevronRight } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { mockActivities, getSignedActivityIds, type Activity } from '../../store/mock-data'

// 分类标签
const CATEGORIES = ['全部', '文体娱乐', '健康养生', '社区服务'] as const
type Category = typeof CATEGORIES[number]

// 状态标签显示文本
const getStatusText = (status: Activity['status']): string => {
  switch (status) {
    case 'available':
      return '立即报名'
    case 'full':
      return '名额已满'
    case 'signed':
      return '已报名'
  }
}

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('全部')
  const [activities, setActivities] = useState<Activity[]>([])
  const [signedIds, setSignedIds] = useState<string[]>([])
  const [showPhotoStudioTip, setShowPhotoStudioTip] = useState(false)

  // 图片加载失败处理
  const handleImageError = (e: any) => {
    if (e.target && e.target.src) {
      e.target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80'
    }
  }

  // 加载已报名数据
  const loadSignedData = useCallback(() => {
    const ids = getSignedActivityIds()
    setSignedIds(ids)
  }, [])

  // 过滤活动列表
  const filterActivities = useCallback(() => {
    let filtered = [...mockActivities]
    
    // 根据分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(a => a.category === selectedCategory)
    }
    
    // 更新已报名状态
    filtered = filtered.map(activity => ({
      ...activity,
      status: signedIds.includes(activity.id) ? 'signed' : activity.status
    }))
    
    setActivities(filtered)
  }, [selectedCategory, signedIds])

  useEffect(() => {
    loadSignedData()
  }, [loadSignedData])

  useEffect(() => {
    filterActivities()
  }, [filterActivities])

  // 点击活动卡片
  const handleActivityClick = (activityId: string) => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activityId}`
    })
  }

  // 点击时光照相馆
  const handlePhotoStudioClick = () => {
    setShowPhotoStudioTip(true)
    setTimeout(() => setShowPhotoStudioTip(false), 2000)
  }

  // 切换分类
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
  }

  return (
    <View className="min-h-screen bg-background">
      {/* 顶部功能卡片 - 时光照相馆 */}
      <View 
        className="mx-4 mt-4 rounded-2xl overflow-hidden card-shadow"
        onClick={handlePhotoStudioClick}
      >
        <View className="relative">
          <Image
            src="https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=800&q=80"
            className="w-full h-36 object-cover"
            mode="aspectFill"
            onError={handleImageError}
          />
          <View className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-300 flex items-center px-6">
            <View className="flex items-center gap-4">
              {/* 方形图标 */}
              <View className="w-16 h-16 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                <Camera color="#FFFFFF" size={32} />
              </View>
              <View>
                <Text className="block text-white text-2xl font-bold">时光照相馆</Text>
                <Text className="block text-white text-opacity-90 text-lg mt-1">AI 老照片修复，让记忆重现</Text>
              </View>
            </View>
            {/* 去试试按钮 */}
            <View 
              className="ml-auto bg-white rounded-full px-6 py-3 active:bg-opacity-80"
              onClick={(e) => {
                e.stopPropagation()
                handlePhotoStudioClick()
              }}
            >
              <Text className="block text-primary text-2xl font-bold">去试试</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 时光照相馆提示 */}
      {showPhotoStudioTip && (
        <View className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-80 rounded-2xl px-10 py-8 flex items-center gap-4">
          <View className="w-8 h-8 rounded-full bg-warning bg-opacity-80 flex items-center justify-center">
            <Text className="block text-white text-lg">!</Text>
          </View>
          <Text className="block text-white text-xl">功能建设中，尽情期待！</Text>
        </View>
      )}

      {/* 分类筛选标签 */}
      <View className="px-4 py-5">
        <ScrollView
          scrollX
          className="whitespace-nowrap"
          scrollWithAnimation
        >
          <View className="flex gap-4">
            {CATEGORIES.map((category) => (
              <View
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`inline-flex items-center justify-center px-6 py-4 rounded-full text-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-foreground border-2 border-border'
                }`}
              >
                <Text className={`block ${selectedCategory === category ? 'text-white' : 'text-foreground'}`}>
                  {category}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 活动列表 */}
      <ScrollView
        scrollY
        className="px-4 pb-32"
      >
        {activities.map((activity) => (
          <View
            key={activity.id}
            className="bg-white rounded-2xl overflow-hidden card-shadow mb-5"
            onClick={() => handleActivityClick(activity.id)}
          >
            {/* 活动图片 */}
            <View className="relative">
              <Image
                src={activity.imageUrl}
                className="w-full h-52 object-cover"
                mode="aspectFill"
                onError={handleImageError}
              />
              {/* 分类标签 */}
              <View className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-full px-4 py-2">
                <Text className="block text-primary text-base font-medium">{activity.category}</Text>
              </View>
              {/* 已报名角标 */}
              {signedIds.includes(activity.id) && (
                <View className="absolute top-4 right-4 bg-primary rounded-full px-4 py-2">
                  <Text className="block text-white text-base font-medium">已报名</Text>
                </View>
              )}
            </View>

            {/* 活动信息 */}
            <View className="p-5">
              <Text className="block text-xl font-bold text-foreground mb-4 leading-tight">
                {activity.title}
              </Text>

              <View className="flex items-center gap-3 mb-3">
                <Calendar color="#FF6B00" size={22} />
                <Text className="block text-lg text-foreground">{activity.date}</Text>
              </View>

              <View className="flex items-center gap-3 mb-3">
                <Clock color="#666666" size={22} />
                <Text className="block text-base text-foreground-light">{activity.time}</Text>
              </View>

              <View className="flex items-center gap-3 mb-5">
                <MapPin color="#666666" size={22} />
                <Text className="block text-base text-foreground-light truncate">{activity.location}</Text>
              </View>

              {/* 底部状态栏 */}
              <View className="flex items-center justify-between pt-4 border-t border-border">
                <View className="flex items-center gap-2">
                  <Text className="block text-base text-muted-foreground">
                    已报名 {activity.enrolled}/{activity.capacity} 人
                  </Text>
                </View>
                <View 
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-lg font-medium ${
                    activity.status === 'available'
                      ? 'bg-primary text-white'
                      : activity.status === 'full'
                      ? 'bg-warning text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Text className={`block ${
                    activity.status === 'available'
                      ? 'text-white'
                      : activity.status === 'full'
                      ? 'text-white'
                      : 'text-muted-foreground'
                  }`}
                  >
                    {getStatusText(activity.status)}
                  </Text>
                  {activity.status === 'available' && (
                    <ChevronRight 
                      size={20} 
                      color={activity.status === 'available' ? '#FFFFFF' : '#999999'} 
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* 空状态 */}
        {activities.length === 0 && (
          <View className="flex flex-col items-center justify-center py-20">
            <Text className="block text-2xl text-muted-foreground mb-2">暂无活动</Text>
            <Text className="block text-base text-muted-foreground">敬请期待更多精彩活动</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
