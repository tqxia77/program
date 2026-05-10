/**
 * 银龄乐圈 - 活动中心（首页）
 * 专为老年用户设计的适老化活动浏览页面
 * 活动数据从后端 API 获取
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Calendar, MapPin, Clock, Settings } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { mockActivities, getSignedActivityIds, type Activity } from '../../store/mock-data'
import { SafeImage } from '../../components/safe-image'
import { useFontMode } from '../../store/font-mode'

// 分类标签
const CATEGORIES = ['全部', '文体娱乐', '健康养生', '社区服务'] as const
type Category = typeof CATEGORIES[number]

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('全部')
  const [activities, setActivities] = useState<Activity[]>([])
  const [signedIds, setSignedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { fontMode } = useFontMode()
  
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载已报名数据
  const loadSignedData = useCallback(() => {
    const ids = getSignedActivityIds()
    setSignedIds(ids)
  }, [])

  // 加载活动数据（优先从后端API，失败则使用Mock数据）
  const loadActivities = useCallback(async () => {
    setLoading(true)
    try {
      console.log('[ActivityCenter] 尝试加载活动列表')
      const res = await Network.request({
        url: '/api/activities',
        method: 'GET'
      })
      console.log('[ActivityCenter] API响应数据:', res.data)
      
      if (res.data?.code === 200) {
        let data = res.data.data || []
        
        // 按分类筛选
        if (selectedCategory !== '全部') {
          data = data.filter((a: Activity) => a.category === selectedCategory)
        }
        
        // 按日期排序（最近的在前）
        data.sort((a: Activity, b: Activity) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        
        setActivities(data)
        console.log('[ActivityCenter] 使用API数据，共', data.length, '条')
        return
      }
    } catch (error) {
      console.log('[ActivityCenter] API请求失败，使用Mock数据:', error)
    }
    
    // API失败时使用Mock数据
    let data = [...mockActivities]
    if (selectedCategory !== '全部') {
      data = data.filter((a) => a.category === selectedCategory)
    }
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setActivities(data)
    console.log('[ActivityCenter] 使用Mock数据，共', data.length, '条')
    setLoading(false)
  }, [selectedCategory])

  useEffect(() => {
    loadActivities()
    loadSignedData()
  }, [loadActivities, loadSignedData])

  // 选择分类
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
  }

  // 每日签到状态
  const [signedToday, setSignedToday] = useState(false)
  const [signStreak, setSignStreak] = useState(0)

  // 点击每日签到
  const handleSignInClick = () => {
    if (signedToday) {
      Taro.showToast({ title: '今日已签到', icon: 'success' })
      return
    }
    Taro.showModal({
      title: '每日签到',
      content: `恭喜！连续签到 ${signStreak + 1} 天`,
      showCancel: false,
      confirmText: '签到成功'
    })
    setSignedToday(true)
    setSignStreak(prev => prev + 1)
    // TODO: 调用后端 API 保存签到状态
  }

  // 跳转活动详情
  const handleActivityClick = (activityId: string) => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activityId}`
    })
  }

  // 跳转管理员页面（长按标题进入）
  const handleTitleLongPress = () => {
    Taro.showModal({
      title: '提示',
      content: '是否进入活动管理页面？',
      confirmText: '进入',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateTo({
            url: '/pages/admin/activities/index'
          })
        }
      }
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
    <View className={`min-h-screen bg-background pb-20 ${fontModeClass}`}>
      {/* 页面标题 */}
      <View className="bg-white border-b border-border px-5 py-5">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-3xl font-bold text-foreground">活动中心</Text>
            <Text className="block text-lg text-muted-foreground mt-1">发现精彩社区活动</Text>
          </View>
          {/* 管理员入口 - 长按标题进入 */}
          <View 
            className="p-2"
            onLongPress={handleTitleLongPress}
          >
            <Settings color="#999999" size={28} />
          </View>
        </View>
      </View>

      {/* 可滚动内容区域 */}
      <ScrollView scrollY className="px-4" style={{ height: 'calc(100vh - 120px)' }}>
        {/* 顶部功能卡片 - 每日签到 */}
        <View 
          className="mt-4 rounded-2xl overflow-hidden card-shadow bg-gradient-to-r from-green-500 to-emerald-400"
          onClick={handleSignInClick}
        >
          <View className="flex items-center justify-between px-6 py-5">
            <View className="flex items-center gap-4">
              <View className="w-14 h-14 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                <Calendar size={32} color="white" />
              </View>
              <View>
                <Text className="block text-white text-2xl font-bold">每日签到</Text>
                <Text className="block text-white text-opacity-90 text-lg mt-1">
                  连续签到 {signStreak} 天
                </Text>
              </View>
            </View>
            <View 
              className={`rounded-full px-5 py-3 ${signedToday ? 'bg-white bg-opacity-30' : 'bg-white active:bg-opacity-80'}`}
              onClick={(e) => {
                e.stopPropagation()
                handleSignInClick()
              }}
            >
              <Text className="block text-white text-xl font-bold">
                {signedToday ? '已签到' : '立即签到'}
              </Text>
            </View>
          </View>
        </View>

        {/* 分类筛选 */}
        <ScrollView
          scrollX
          className="mt-4"
          scrollWithAnimation
          scrollLeft={0}
        >
          <View className="flex gap-3 px-4">
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
        <View className="mt-4 pb-4">
          {loading ? (
            <View className="flex flex-col items-center justify-center py-16">
              <Calendar color="#CCCCCC" size={60} />
              <Text className="block text-lg text-muted-foreground mt-4">加载中...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-16">
              <Calendar color="#CCCCCC" size={80} />
              <Text className="block text-lg text-muted-foreground mt-4">暂无活动</Text>
              <Text className="block text-base text-muted-foreground mt-2">敬请期待更多精彩活动</Text>
            </View>
          ) : (
            activities.map((activity) => {
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
            })
          )}

          {/* 底部留白 */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </View>
  )
}
