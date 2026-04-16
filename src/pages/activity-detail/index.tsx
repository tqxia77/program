/**
 * 银龄乐圈 - 活动详情页
 * 展示活动详细信息，支持一键报名
 */

import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Calendar, MapPin, Users, ChevronLeft, Loader } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { mockActivities, getSignedActivityIds, saveSignedActivityId, type Activity } from '../../store/mock-data'

export default function ActivityDetail() {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSigned, setIsSigned] = useState(false)

  // 图片加载失败处理
  const handleImageError = (e: any) => {
    if (e.target && e.target.src) {
      e.target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80'
    }
  }

  useEffect(() => {
    // 获取活动ID
    const currentPage = Taro.getCurrentPages().pop() as any
    const activityId = currentPage?.options?.id

    if (activityId) {
      const found = mockActivities.find(a => a.id === activityId)
      if (found) {
        // 检查是否已报名
        const signedIds = getSignedActivityIds()
        setIsSigned(signedIds.includes(activityId))
        setActivity({
          ...found,
          status: signedIds.includes(activityId) ? 'signed' : found.status
        })
      }
    }
  }, [])

  // 一键报名
  const handleSignUp = async () => {
    if (!activity || isSigned || activity.status === 'full') return

    setIsLoading(true)

    // 模拟网络请求延迟 1 秒
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存到本地存储
    saveSignedActivityId(activity.id)

    setIsLoading(false)
    setShowSuccess(true)
    setIsSigned(true)
    setActivity(prev => prev ? { ...prev, status: 'signed' } : null)

    // 2秒后关闭成功提示
    setTimeout(() => {
      setShowSuccess(false)
    }, 2000)
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
        <View className="flex-1 flex items-center justify-center bg-muted rounded-xl py-4">
          <View className="w-6 h-6 rounded-full bg-success flex items-center justify-center mr-2">
            <Text className="block text-white text-sm">&#10003;</Text>
          </View>
          <Text className="block text-muted-foreground text-xl font-bold">已报名</Text>
        </View>
      )
    }

    if (activity?.status === 'full') {
      return (
        <View className="flex-1 flex items-center justify-center bg-warning rounded-xl py-4">
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

  if (!activity) {
    return (
      <View className="flex items-center justify-center h-screen">
        <Text className="block text-base text-muted-foreground">活动不存在</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-background">
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
          <Image
            src={activity.imageUrl}
            className="w-full h-64 object-cover"
            mode="aspectFill"
            onError={handleImageError}
          />
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black bg-opacity-60 to-transparent p-4">
            <Text className="block text-white text-2xl font-bold">{activity.title}</Text>
            <View className="flex items-center gap-2 mt-2">
              <View className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                <Text className="block text-white text-sm">{activity.category}</Text>
              </View>
              {isSigned && (
                <View className="bg-primary rounded-full px-3 py-1">
                  <Text className="block text-white text-sm">已报名</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 活动基本信息 */}
        <View className="p-4 bg-white m-4 rounded-2xl card-shadow">
          <View className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <Calendar color="#FF6B00" size={28} />
            <View>
              <Text className="block text-lg text-foreground font-medium">{activity.date}</Text>
              <Text className="block text-base text-muted-foreground">{activity.time}</Text>
            </View>
          </View>

          <View className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <MapPin color="#FF6B00" size={28} />
            <View className="flex-1">
              <Text className="block text-lg text-foreground font-medium">活动地点</Text>
              <Text className="block text-base text-muted-foreground">{activity.location}</Text>
            </View>
          </View>

          <View className="flex items-center gap-3">
            <Users color="#FF6B00" size={28} />
            <View className="flex-1">
              <Text className="block text-lg text-foreground font-medium">报名情况</Text>
              <Text className="block text-base text-muted-foreground">
                已报名 {activity.enrolled}/{activity.capacity} 人
              </Text>
            </View>
          </View>
        </View>

        {/* 活动详情说明 */}
        <View className="p-4 bg-white m-4 rounded-2xl card-shadow">
          <Text className="block text-xl font-bold text-foreground mb-4">活动详情</Text>
          <View className="leading-relaxed">
            {activity.description.split('\n').map((line, index) => {
              // 处理标题行
              if (line.startsWith('【') && line.endsWith('】')) {
                return (
                  <Text 
                    key={index} 
                    className="block text-lg font-bold text-primary mt-4 mb-2"
                  >
                    {line}
                  </Text>
                )
              }
              // 处理emoji开头的行
              if (/^[\u4e00-\u9fa5]/.test(line) && /[📖🎁👨‍🏫📍🅿️🧘📋🍵👨‍⚕️🎯📢💻💡🔔⚠️]/.test(line)) {
                return (
                  <Text 
                    key={index} 
                    className="block text-lg font-semibold text-foreground mt-3 mb-1"
                  >
                    {line}
                  </Text>
                )
              }
              // 处理emoji符号开头的内容
              if (/^[📖🎁👨‍🏫📍🅿️🧘📋🍵👨‍⚕️🎯📢💻💡🔔⚠️1️⃣2️⃣3️⃣4️⃣5️⃣]/.test(line)) {
                return (
                  <Text 
                    key={index} 
                    className="block text-base text-foreground leading-loose"
                  >
                    {line}
                  </Text>
                )
              }
              // 普通文本
              return (
                <Text 
                  key={index} 
                  className="block text-base text-foreground leading-loose"
                >
                  {line}
                </Text>
              )
            })}
          </View>
        </View>

        {/* 底部留白 */}
        <View className="h-24" />
      </ScrollView>

      {/* 底部报名栏 */}
      <View 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40"
        style={{ paddingBottom: Taro.getStorageSync('safeAreaBottom') + 'px' }}
      >
        <View className="flex items-center gap-4">
          {renderSignUpButton()}
        </View>
      </View>

      {/* 报名成功提示 */}
      {showSuccess && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <View className="bg-white rounded-3xl p-8 flex flex-col items-center mx-8">
            <View className="w-20 h-20 bg-success bg-opacity-10 rounded-full flex items-center justify-center mb-4">
              <View className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                <Text className="block text-white text-2xl">&#10003;</Text>
              </View>
            </View>
            <Text className="block text-2xl font-bold text-foreground mb-2">报名成功！</Text>
            <Text className="block text-lg text-muted-foreground text-center">
              我们已将您添加到报名名单中{'\n'}期待您的参与！
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
