/**
 * 银龄乐圈 - 活动中心（首页）
 * 专为老年用户设计的适老化活动浏览页面
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Camera, Sparkles, Calendar, MapPin, Clock, ChevronRight } from 'lucide-react-taro'
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
            className="w-full h-32 object-cover"
            mode="aspectFill"
          />
          <View className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-300 flex items-center px-5">
            <View className="flex items-center gap-3">
              <View className="w-14 h-14 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                <Camera color="#FFFFFF" size={28} />
              </View>
              <View>
                <Text className="block text-white text-xl font-bold">时光照相馆</Text>
                <Text className="block text-white text-opacity-90 text-base mt-1">AI 老照片修复，让记忆重现</Text>
              </View>
            </View>
            <View className="ml-auto bg-white bg-opacity-20 rounded-full px-4 py-2">
              <View className="flex items-center gap-1">
                <Sparkles color="#FFFFFF" size={16} />
                <Text className="block text-white text-sm">新功能</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 时光照相馆提示 */}
      {showPhotoStudioTip && (
        <View className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-80 rounded-2xl px-8 py-6 flex items-center gap-3">
          <View className="w-6 h-6 rounded-full bg-warning bg-opacity-80 flex items-center justify-center">
            <Text className="block text-white text-sm">!</Text>
          </View>
          <Text className="block text-white text-lg">功能建设中，尽情期待！</Text>
        </View>
      )}

      {/* 分类筛选标签 */}
      <View className="px-4 py-4">
        <ScrollView
          scrollX
          className="whitespace-nowrap"
          scrollWithAnimation
        >
          <View className="flex gap-3">
            {CATEGORIES.map((category) => (
              <View
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`inline-flex items-center justify-center px-5 py-3 rounded-full text-base font-medium transition-all ${
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
            className="bg-white rounded-2xl overflow-hidden card-shadow mb-4"
            onClick={() => handleActivityClick(activity.id)}
          >
            {/* 活动图片 */}
            <View className="relative">
              <Image
                src={activity.imageUrl}
                className="w-full h-48 object-cover"
                mode="aspectFill"
              />
              {/* 分类标签 */}
              <View className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-full px-3 py-1">
                <Text className="block text-primary text-sm font-medium">{activity.category}</Text>
              </View>
              {/* 已报名角标 */}
              {signedIds.includes(activity.id) && (
                <View className="absolute top-3 right-3 bg-primary rounded-full px-3 py-1">
                  <Text className="block text-white text-sm font-medium">已报名</Text>
                </View>
              )}
            </View>

            {/* 活动信息 */}
            <View className="p-4">
              <Text className="block text-xl font-bold text-foreground mb-3 leading-tight">
                {activity.title}
              </Text>

              <View className="flex items-center gap-2 mb-2">
                <Calendar color="#FF6B00" size={18} />
                <Text className="block text-base text-foreground">{activity.date}</Text>
              </View>

              <View className="flex items-center gap-2 mb-2">
                <Clock color="#666666" size={18} />
                <Text className="block text-base text-foreground-light">{activity.time}</Text>
              </View>

              <View className="flex items-center gap-2 mb-4">
                <MapPin color="#666666" size={18} />
                <Text className="block text-base text-foreground-light truncate">{activity.location}</Text>
              </View>

              {/* 底部状态栏 */}
              <View className="flex items-center justify-between pt-3 border-t border-border">
                <View className="flex items-center gap-2">
                  <Text className="block text-sm text-muted-foreground">
                    已报名 {activity.enrolled}/{activity.capacity} 人
                  </Text>
                </View>
                <View 
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-base font-medium ${
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
                      size={18} 
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
