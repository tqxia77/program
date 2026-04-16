/**
 * 银龄乐圈 - 活动中心（首页）
 * 专为老年用户设计的适老化活动浏览页面
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Calendar, MapPin, Clock } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { mockActivities, getSignedActivityIds, type Activity } from '../../store/mock-data'
import { SafeImage } from '../../components/safe-image'

// 分类标签
const CATEGORIES = ['全部', '文体娱乐', '健康养生', '社区服务'] as const
type Category = typeof CATEGORIES[number]

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('全部')
  const [activities, setActivities] = useState<Activity[]>([])
  const [signedIds, setSignedIds] = useState<string[]>([])

  // 加载已报名数据
  const loadSignedData = useCallback(() => {
    const ids = getSignedActivityIds()
    setSignedIds(ids)
  }, [])

  // 加载活动数据
  const loadActivities = useCallback(() => {
    let filteredActivities = [...mockActivities]
    
    if (selectedCategory !== '全部') {
      filteredActivities = mockActivities.filter(
        activity => activity.category === selectedCategory
      )
    }
    
    setActivities(filteredActivities)
  }, [selectedCategory])

  useEffect(() => {
    loadActivities()
    loadSignedData()
  }, [loadActivities, loadSignedData])

  // 选择分类
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
  }

  // 点击时光照相馆
  const handlePhotoStudioClick = () => {
    Taro.showModal({
      title: '时光照相馆',
      content: 'AI老照片修复功能正在开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // 跳转活动详情
  const handleActivityClick = (activityId: string) => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activityId}`
    })
  }

  // 分类按钮样式
  const getCategoryBtnClass = (category: Category) => {
    const baseClass = 'px-6 py-4 rounded-full text-lg font-medium transition-all whitespace-nowrap'
    if (selectedCategory === category) {
      return `${baseClass} bg-primary text-white shadow-md`
    }
    return `${baseClass} bg-white text-foreground border-2 border-border`
  }

  return (
    <View className="min-h-screen bg-background pb-20">
      {/* 页面标题 */}
      <View className="bg-white border-b border-border px-5 py-5">
        <Text className="block text-3xl font-bold text-foreground">活动中心</Text>
        <Text className="block text-lg text-muted-foreground mt-1">发现精彩社区活动</Text>
      </View>

      {/* 顶部功能卡片 - 时光照相馆 */}
      <View 
        className="mx-4 mt-4 rounded-2xl overflow-hidden card-shadow"
        onClick={handlePhotoStudioClick}
      >
        <View className="relative">
          <SafeImage
            src="https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=800&q=60"
            className="w-full h-36"
            mode="aspectFill"
          />
          <View className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-300 flex items-center px-6">
            <View className="flex items-center gap-4">
              <SafeImage
                src="https://images.unsplash.com/photo-1562583277-333d8dca6415?w=200&q=60"
                className="w-16 h-16 rounded-xl"
                mode="aspectFill"
              />
              <View>
                <Text className="block text-white text-2xl font-bold">时光照相馆</Text>
                <Text className="block text-white text-opacity-90 text-lg mt-1">AI 老照片修复，让记忆重现</Text>
              </View>
            </View>
            <View 
              className="ml-auto bg-white rounded-full px-6 py-3 active:bg-opacity-80"
              onClick={(e) => {
                e.stopPropagation()
                handlePhotoStudioClick()
              }}
            >
              <Text className="block text-primary text-3xl font-bold">去试试</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 分类筛选 */}
      <ScrollView
        scrollX
        className="px-4 mt-4"
        scrollWithAnimation
        scrollLeft={0}
      >
        <View className="flex gap-3">
          {CATEGORIES.map((category) => (
            <View
              key={category}
              className={getCategoryBtnClass(category)}
              onClick={() => handleCategorySelect(category)}
            >
              <Text className="block">{category}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 活动列表 */}
      <ScrollView scrollY className="px-4 mt-4" style={{ height: 'calc(100vh - 380px)' }}>
        {activities.map((activity) => {
          const isSigned = signedIds.includes(activity.id)
          const isFull = activity.status === 'full'
          
          return (
            <View
              key={activity.id}
              className="bg-white rounded-2xl card-shadow mb-4 overflow-hidden"
              onClick={() => handleActivityClick(activity.id)}
            >
              {/* 活动图片 */}
              <View className="relative">
                <SafeImage
                  src={activity.imageUrl}
                  className="w-full h-52"
                  mode="aspectFill"
                />
                {/* 状态标签 */}
                <View
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full ${
                    isSigned
                      ? 'bg-success'
                      : isFull
                        ? 'bg-muted-foreground'
                        : 'bg-primary'
                  }`}
                >
                  <Text className="block text-white text-base font-medium">
                    {isSigned ? '已报名' : isFull ? '名额已满' : '立即报名'}
                  </Text>
                </View>
              </View>

              {/* 活动信息 */}
              <View className="p-5">
                <Text className="block text-xl font-bold text-foreground mb-3">
                  {activity.title}
                </Text>
                
                <View className="flex items-center gap-2 mb-2">
                  <Calendar color="#999999" size={20} />
                  <Text className="block text-base text-muted-foreground">
                    {activity.date}
                  </Text>
                </View>
                
                <View className="flex items-center gap-2 mb-2">
                  <MapPin color="#999999" size={20} />
                  <Text className="block text-base text-muted-foreground">
                    {activity.location}
                  </Text>
                </View>
                
                <View className="flex items-center gap-2">
                  <Clock color="#999999" size={20} />
                  <Text className="block text-base text-muted-foreground">
                    {activity.time}
                  </Text>
                </View>
              </View>
            </View>
          )
        })}

        {/* 空状态 */}
        {activities.length === 0 && (
          <View className="flex flex-col items-center justify-center py-24">
            <Calendar color="#CCCCCC" size={80} />
            <Text className="block text-xl text-muted-foreground mt-4">暂无活动</Text>
            <Text className="block text-base text-muted-foreground mt-2">敬请期待更多精彩活动</Text>
          </View>
        )}

        {/* 底部留白 */}
        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
