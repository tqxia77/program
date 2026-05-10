/**
 * 银龄乐圈 - 活动详情页
 * 展示活动详细信息，支持一键报名
 * 数据从后端 API 获取
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Calendar, MapPin, Users, ChevronLeft, Loader } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { mockActivities, getSignedActivityIds, saveSignedActivityId, removeSignedActivityId, type Activity } from '../../store/mock-data'
import { SafeImage } from '../../components/safe-image'
import { useFontMode } from '../../store/font-mode'

export default function ActivityDetail() {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载活动详情
  useEffect(() => {
    const loadActivityDetail = async () => {
      const currentPage = Taro.getCurrentPages().pop() as any
      const activityId = currentPage?.options?.id

      if (activityId) {
        setIsLoading(true)
        try {
          console.log('[ActivityDetail] 尝试加载活动详情:', activityId)
          const res = await Network.request({
            url: `/api/activities/${activityId}`,
            method: 'GET'
          })
          console.log('[ActivityDetail] API响应:', res.data)

          if (res.data?.code === 200) {
            const data = res.data.data
            
            // 检查是否已报名
            const signedIds = getSignedActivityIds()
            const signed = signedIds.includes(activityId)
            
            setIsSigned(signed)
            setActivity({
              ...data,
              status: signed ? 'signed' : data.status
            })
            console.log('[ActivityDetail] 使用API数据')
            return
          }
        } catch (error) {
          console.log('[ActivityDetail] API失败，使用Mock数据:', error)
        }
        
        // API失败时使用Mock数据
        const mockActivity = mockActivities.find(a => a.id === activityId)
        if (mockActivity) {
          const signedIds = getSignedActivityIds()
          const signed = signedIds.includes(activityId)
          setIsSigned(signed)
          setActivity({
            ...mockActivity,
            status: signed ? 'signed' : mockActivity.status
          })
          console.log('[ActivityDetail] 使用Mock数据')
        }
      }
    }

    loadActivityDetail()
  }, [])

  // 一键报名
  const handleSignUp = async () => {
    if (!activity || isSigned || activity.status === 'full') return

    setIsLoading(true)

    try {
      console.log('[ActivityDetail] 报名活动:', activity.id)
      const res = await Network.request({
        url: `/api/activities/${activity.id}/enroll`,
        method: 'POST'
      })
      console.log('[ActivityDetail] 报名响应:', res.data)

      if (res.data?.code === 200) {
        // 保存到本地存储
        saveSignedActivityId(activity.id)

        setIsSigned(true)
        setActivity(prev => prev ? { ...prev, status: 'signed', enrolled: res.data.data.enrolled } : null)

        Taro.showToast({ title: '报名成功', icon: 'success' })
      }
    } catch (error) {
      console.error('[ActivityDetail] 报名失败:', error)
      Taro.showToast({ title: '报名失败', icon: 'none' })
    } finally {
      setIsLoading(false)
    }
  }

  // 取消报名
  const handleCancelSignUp = async () => {
    if (!activity || !isSigned) return

    Taro.showModal({
      title: '取消报名',
      content: '确定要取消报名吗？',
      confirmText: '确定取消',
      cancelText: '保留报名',
      success: async (res) => {
        if (res.confirm) {
          setIsLoading(true)
          try {
            console.log('[ActivityDetail] 取消报名:', activity.id)
            const result = await Network.request({
              url: `/api/activities/${activity.id}/cancel`,
              method: 'POST'
            })
            console.log('[ActivityDetail] 取消响应:', result.data)

            if (result.data?.code === 200) {
              // 从本地存储移除
              removeSignedActivityId(activity.id)

              setIsSigned(false)
              setActivity(prev => prev ? { ...prev, status: 'available', enrolled: result.data.data.enrolled } : null)

              Taro.showToast({ title: '已取消报名', icon: 'success' })
            }
          } catch (error) {
            console.error('[ActivityDetail] 取消失败:', error)
            Taro.showToast({ title: '操作失败', icon: 'none' })
          } finally {
            setIsLoading(false)
          }
        }
      }
    })
  }

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 获取状态栏高度
  const statusBarHeight = Taro.getStorageSync('statusBarHeight') || 0

  // 渲染报名按钮
  const renderSignUpButton = () => {
    if (isLoading) {
      return (
        <View className="flex-1 flex items-center justify-center bg-primary rounded-xl py-4">
          <Loader color="#FFFFFF" size={28} />
        </View>
      )
    }

    if (isSigned) {
      return (
        <View 
          className="flex-1 flex items-center justify-center bg-white border-2 border-success rounded-xl py-4"
          onClick={handleCancelSignUp}
        >
          <View className="w-6 h-6 rounded-full bg-success flex items-center justify-center mr-2">
            <Text className="block text-white text-sm">&#10003;</Text>
          </View>
          <Text className="block text-success text-xl font-bold">已报名（点击取消）</Text>
        </View>
      )
    }

    if (activity?.status === 'full') {
      return (
        <View className="flex-1 flex items-center justify-center bg-muted-foreground rounded-xl py-4">
          <Text className="block text-white text-xl font-bold">名额已满</Text>
        </View>
      )
    }

    return (
      <View 
        className="flex-1 flex items-center justify-center bg-primary rounded-xl py-4 active:bg-primary"
        onClick={handleSignUp}
      >
        <Text className="block text-white text-xl font-bold">一键报名</Text>
      </View>
    )
  }

  if (isLoading && !activity) {
    return (
      <View className="flex items-center justify-center h-screen">
        <Text className="block text-base text-muted-foreground">加载中...</Text>
      </View>
    )
  }

  if (!activity) {
    return (
      <View className="flex items-center justify-center h-screen">
        <Text className="block text-base text-muted-foreground">活动不存在</Text>
      </View>
    )
  }

  // 计算剩余名额
  const remaining = (activity.capacity || 0) - (activity.enrolled || 0)

  return (
    <View className={`min-h-screen bg-background ${fontModeClass}`}>
      {/* 顶部导航 */}
      <View 
        className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: statusBarHeight + 'px' }}
      >
        <View className="flex items-center h-14 px-4">
          <View 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-80"
            onClick={handleGoBack}
          >
            <ChevronLeft color="#333333" size={28} />
          </View>
          <Text className="block text-xl font-bold text-foreground ml-2">活动详情</Text>
        </View>
      </View>

      <ScrollView
        scrollY
        className="pb-32"
        style={{ paddingTop: (statusBarHeight + 56) + 'px' }}
      >
        {/* 活动图片 */}
        <View className="relative">
          <SafeImage
            src={activity.imageUrl}
            className="w-full h-64"
            mode="aspectFill"
          />
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black bg-opacity-60 to-transparent p-4">
            <Text className="block text-white text-2xl font-bold">{activity.title}</Text>
          </View>
        </View>

        {/* 活动信息卡片 */}
        <View className="px-4 -mt-6 relative z-10">
          <View className="bg-white rounded-2xl card-shadow p-5">
            {/* 基本信息 */}
            <View className="flex items-start gap-4 mb-4 pb-4 border-b border-border">
              <View className="bg-primary-light rounded-full px-4 py-2">
                <Text className="block text-primary text-base font-medium">{activity.category}</Text>
              </View>
              <View className="flex-1">
                <Text className="block text-lg text-muted-foreground">
                  剩余 {remaining} / {activity.capacity} 名额
                </Text>
              </View>
            </View>

            <View className="flex items-center gap-3 mb-3">
              <Calendar color="#FF6B00" size={24} />
              <Text className="block text-lg text-foreground">{activity.date}</Text>
            </View>

            <View className="flex items-center gap-3 mb-3">
              <MapPin color="#FF6B00" size={24} />
              <Text className="block text-lg text-foreground">{activity.location}</Text>
            </View>

            <View className="flex items-center gap-3">
              <Users color="#FF6B00" size={24} />
              <Text className="block text-lg text-foreground">{activity.time}</Text>
            </View>
          </View>
        </View>

        {/* 活动详情 */}
        <View className="px-4 mt-4">
          <View className="bg-white rounded-2xl card-shadow p-5">
            <Text className="block text-xl font-bold text-foreground mb-4">活动详情</Text>
            <Text className="block text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {activity.description}
            </Text>
          </View>
        </View>

        {/* 底部留白 */}
        <View className="h-8" />
      </ScrollView>

      {/* 底部报名栏 */}
      <View 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-4 z-50"
        style={{ paddingBottom: 'calc(4px + env(safe-area-inset-bottom))' }}
      >
        <View className="flex items-center gap-4">
          {/* 报名信息 */}
          <View className="flex flex-col items-center">
            <Text className="block text-2xl font-bold text-primary">{activity.enrolled || 0}</Text>
            <Text className="block text-sm text-muted-foreground">已报名</Text>
          </View>
          <View className="w-px h-12 bg-border" />
          <View className="flex flex-col items-center">
            <Text className="block text-2xl font-bold text-muted-foreground">{remaining}</Text>
            <Text className="block text-sm text-muted-foreground">剩余名额</Text>
          </View>
          
          {/* 报名按钮 */}
          <View className="flex-1 ml-4">
            {renderSignUpButton()}
          </View>
        </View>
      </View>
    </View>
  )
}
