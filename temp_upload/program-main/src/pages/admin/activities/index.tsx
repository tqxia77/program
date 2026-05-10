/**
 * 银龄乐圈 - 管理员活动管理页面
 * 活动列表展示，支持编辑和删除
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Calendar, MapPin, Clock, Plus, Trash2, Pencil } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { SafeImage } from '@/components/safe-image'
import { useFontMode } from '@/store/font-mode'
import { type Activity as BaseActivity } from '@/store/mock-data'

// 扩展的活动类型，包含后端返回的额外字段
interface Activity extends BaseActivity {
  createdAt?: string
  updatedAt?: string
}

// 分类选项
const CATEGORIES = ['全部', '文体娱乐', '健康养生', '社区服务'] as const
type Category = typeof CATEGORIES[number]

export default function AdminActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>('全部')
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载活动列表
  const loadActivities = useCallback(async () => {
    setLoading(true)
    try {
      console.log('[AdminActivities] 加载活动列表')
      const res = await Network.request({
        url: '/api/activities',
        method: 'GET'
      })
      console.log('[AdminActivities] 响应数据:', res.data)
      
      if (res.data?.code === 200) {
        let data = res.data.data || []
        // 按分类筛选
        if (selectedCategory !== '全部') {
          data = data.filter((a: Activity) => a.category === selectedCategory)
        }
        // 按创建时间倒序
        data.sort((a: Activity, b: Activity) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        setActivities(data)
      }
    } catch (error) {
      console.error('[AdminActivities] 加载失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // 跳转到发布活动页面
  const handlePublish = () => {
    Taro.navigateTo({
      url: '/pages/admin/activities/publish'
    })
  }

  // 编辑活动
  const handleEdit = (activityId: string) => {
    Taro.navigateTo({
      url: `/pages/admin/activities/publish?id=${activityId}`
    })
  }

  // 删除活动
  const handleDelete = (activity: Activity) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除活动"${activity.title}"吗？此操作不可撤销。`,
      confirmText: '删除',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            console.log('[AdminActivities] 删除活动:', activity.id)
            const result = await Network.request({
              url: `/api/activities/${activity.id}`,
              method: 'DELETE'
            })
            console.log('[AdminActivities] 删除响应:', result.data)
            
            if (result.data?.code === 200) {
              Taro.showToast({ title: '删除成功', icon: 'success' })
              loadActivities()
            }
          } catch (error) {
            console.error('[AdminActivities] 删除失败:', error)
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 分类按钮样式
  const getCategoryBtnClass = (category: Category) => {
    const baseClass = 'px-4 py-2 rounded-full text-base font-medium transition-all whitespace-nowrap'
    if (selectedCategory === category) {
      return `${baseClass} bg-primary text-white`
    }
    return `${baseClass} bg-white text-foreground border border-border`
  }

  // 获取状态标签
  const getStatusBadge = (activity: Activity) => {
    const enrolled = activity.enrolled || 0
    const capacity = activity.capacity || 0
    const remaining = capacity - enrolled
    
    if (activity.status === 'full' || remaining <= 0) {
      return { text: '名额已满', className: 'bg-muted-foreground text-white' }
    }
    return { text: `剩余 ${remaining} 名额`, className: 'bg-primary text-white' }
  }

  return (
    <View className={`min-h-screen bg-background ${fontModeClass}`}>
      {/* 页面标题 */}
      <View className="bg-white border-b border-border px-5 py-5">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-3xl font-bold text-foreground">活动管理</Text>
            <Text className="block text-base text-muted-foreground mt-1">管理社区活动</Text>
          </View>
          <View 
            className="bg-primary rounded-full px-5 py-3 flex items-center gap-2"
            onClick={handlePublish}
          >
            <Plus color="#FFFFFF" size={24} />
            <Text className="block text-white text-lg font-medium">发布活动</Text>
          </View>
        </View>
      </View>

      {/* 分类筛选 */}
      <ScrollView scrollX className="px-4 py-4">
        <View className="flex gap-3">
          {CATEGORIES.map((category) => (
            <View
              key={category}
              className={getCategoryBtnClass(category)}
              onClick={() => setSelectedCategory(category)}
            >
              <Text className="block">{category}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 活动列表 */}
      <ScrollView scrollY className="px-4" style={{ height: 'calc(100vh - 200px)' }}>
        {loading ? (
          <View className="flex items-center justify-center py-20">
            <Text className="block text-lg text-muted-foreground">加载中...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <Calendar color="#CCCCCC" size={80} />
            <Text className="block text-lg text-muted-foreground mt-4">暂无活动</Text>
            <Text className="block text-base text-muted-foreground mt-2">点击上方按钮发布新活动</Text>
          </View>
        ) : (
          activities.map((activity) => {
            const statusBadge = getStatusBadge(activity)
            
            return (
              <View
                key={activity.id}
                className="bg-white rounded-2xl card-shadow mb-4 overflow-hidden"
              >
                {/* 活动图片 */}
                <View className="relative">
                  <SafeImage
                    src={activity.imageUrl}
                    className="w-full h-40"
                    mode="aspectFill"
                  />
                  {/* 分类标签 */}
                  <View className="absolute top-3 left-3 bg-black bg-opacity-50 rounded-full px-3 py-1">
                    <Text className="block text-white text-sm">{activity.category}</Text>
                  </View>
                  {/* 状态标签 */}
                  <View className={`absolute top-3 right-3 px-3 py-1 rounded-full ${statusBadge.className}`}>
                    <Text className="block text-sm font-medium">{statusBadge.text}</Text>
                  </View>
                </View>

                {/* 活动信息 */}
                <View className="p-4">
                  <Text className="block text-xl font-bold text-foreground mb-3">
                    {activity.title}
                  </Text>
                  
                  <View className="flex items-center gap-2 mb-2">
                    <Calendar color="#999999" size={18} />
                    <Text className="block text-base text-muted-foreground">
                      {activity.date}
                    </Text>
                  </View>
                  
                  <View className="flex items-center gap-2 mb-2">
                    <Clock color="#999999" size={18} />
                    <Text className="block text-base text-muted-foreground">
                      {activity.time}
                    </Text>
                  </View>
                  
                  <View className="flex items-center gap-2">
                    <MapPin color="#999999" size={18} />
                    <Text className="block text-base text-muted-foreground truncate flex-1">
                      {activity.location}
                    </Text>
                    <Text className="block text-base text-primary font-medium">
                      {activity.enrolled || 0}/{activity.capacity || 0}人
                    </Text>
                  </View>
                </View>

                {/* 操作按钮 */}
                <View className="flex items-center border-t border-border">
                  <View 
                    className="flex-1 py-4 flex items-center justify-center gap-2 border-r border-border active:bg-secondary"
                    onClick={() => handleEdit(activity.id)}
                  >
                    <Pencil color="#FF6B00" size={20} />
                    <Text className="block text-primary text-base font-medium">编辑</Text>
                  </View>
                  <View 
                    className="flex-1 py-4 flex items-center justify-center gap-2 active:bg-secondary"
                    onClick={() => handleDelete(activity)}
                  >
                    <Trash2 color="#E53935" size={20} />
                    <Text className="block text-error text-base font-medium">删除</Text>
                  </View>
                </View>
              </View>
            )
          })
        )}
        
        {/* 底部留白 */}
        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
