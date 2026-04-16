/**
 * 银龄乐圈 - 个人中心
 * 展示用户信息和已报名活动
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Calendar, Settings, Users, MessageCircle, Type, Bell } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { getUserProfile, getSignedActivities, type Activity } from '../../store/mock-data'

interface MenuItem {
  id: string
  title: string
  icon: typeof Calendar
  action?: () => void
}

export default function Profile() {
  const [userName, setUserName] = useState('银龄用户')
  const [userAvatar, setUserAvatar] = useState('')
  const [signedActivities, setSignedActivities] = useState<Activity[]>([])

  // 加载用户数据和报名记录
  const loadUserData = useCallback(() => {
    const user = getUserProfile()
    setUserName(user.name)
    setUserAvatar(user.avatar)

    const signed = getSignedActivities()
    setSignedActivities(signed)
  }, [])

  useEffect(() => {
    loadUserData()
    
    // 监听页面显示，刷新数据
    const page = Taro.getCurrentPages().pop()
    if (page) {
      page.onShow = () => {
        loadUserData()
      }
    }
  }, [loadUserData])

  // 菜单项配置
  const menuItems: MenuItem[] = [
    { 
      id: 'posts', 
      title: '我的动态', 
      icon: MessageCircle,
      action: () => {
        Taro.switchTab({ url: '/pages/neighborhood/index' })
      }
    },
    { 
      id: 'binding', 
      title: '子女绑定设置', 
      icon: Users 
    },
    { 
      id: 'settings', 
      title: '系统设置', 
      icon: Settings 
    }
  ]

  // 大字体调节
  const handleFontSizeAdjust = () => {
    Taro.showToast({
      title: '大字体模式演示成功',
      icon: 'none',
      duration: 2000
    })
  }

  return (
    <View className="min-h-screen bg-background pb-20">
      {/* 用户信息卡片 */}
      <View className="bg-gradient-to-br from-primary to-primary-dark px-4 pt-8 pb-12">
        <View className="flex items-center">
          <View className="relative">
            <Image
              src={userAvatar || 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80'}
              className="w-28 h-28 rounded-full object-cover border-4 border-white border-opacity-30"
              mode="aspectFill"
            />
            <View className="absolute bottom-1 right-1 w-6 h-6 bg-success rounded-full border-2 border-white" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="block text-3xl font-bold text-white">{userName}</Text>
            <View className="flex items-center gap-2 mt-2">
              <View className="bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Text className="block text-white text-base">银龄乐圈会员</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 我的报名区域 */}
      <View className="px-4 -mt-6">
        <View className="bg-white rounded-2xl card-shadow overflow-hidden">
          <View className="flex items-center justify-between px-5 py-5 border-b border-border">
            <View className="flex items-center gap-3">
              <Calendar color="#FF6B00" size={26} />
              <Text className="block text-xl font-bold text-foreground">我的报名</Text>
              <View className="bg-primary bg-opacity-10 rounded-full px-3 py-1">
                <Text className="block text-primary text-base font-medium">{signedActivities.length}</Text>
              </View>
            </View>
          </View>

          {signedActivities.length > 0 ? (
            <View className="px-5 pb-5">
              {signedActivities.map((activity) => (
                <View 
                  key={activity.id}
                  className="flex items-center gap-4 py-4 border-b border-border last:border-0"
                >
                  <Image
                    src={activity.imageUrl}
                    className="w-20 h-20 rounded-xl object-cover"
                    mode="aspectFill"
                  />
                  <View className="flex-1 min-w-0">
                    <Text className="block text-lg font-medium text-foreground truncate">
                      {activity.title}
                    </Text>
                    <Text className="block text-base text-muted-foreground mt-1">
                      {activity.date}
                    </Text>
                  </View>
                  <View className="bg-success bg-opacity-10 rounded-full px-4 py-2">
                    <Text className="block text-success text-base font-medium">已报名</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="px-5 py-10 flex flex-col items-center">
              <Calendar color="#CCCCCC" size={56} />
              <Text className="block text-lg text-muted-foreground mt-4">暂无报名活动</Text>
              <Text className="block text-base text-muted-foreground mt-2">快去活动中心看看吧</Text>
            </View>
          )}
        </View>
      </View>

      {/* 菜单列表 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl card-shadow overflow-hidden">
          {menuItems.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View className="h-px bg-border mx-5" />}
              <View 
                className="flex items-center justify-between px-5 py-5 active:bg-secondary"
                onClick={item.action}
              >
                <View className="flex items-center gap-4">
                  <View className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <item.icon color="#FF6B00" size={24} />
                  </View>
                  <Text className="block text-xl text-foreground">{item.title}</Text>
                </View>
                <View className="w-8 h-8 flex items-center justify-center">
                  <Text className="text-muted-foreground text-2xl">›</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 适老化功能入口 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl card-shadow overflow-hidden">
          <View 
            className="flex items-center justify-between px-5 py-5 active:bg-secondary"
            onClick={handleFontSizeAdjust}
          >
            <View className="flex items-center gap-4">
              <View className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Type color="#FF6B00" size={24} />
              </View>
              <View>
                <Text className="block text-xl text-foreground">大字体模式</Text>
                <Text className="block text-base text-muted-foreground mt-1">点击体验适老化大字效果</Text>
              </View>
            </View>
            <View className="w-8 h-8 flex items-center justify-center">
              <Text className="text-muted-foreground text-2xl">›</Text>
            </View>
          </View>

          <View className="h-px bg-border mx-5" />

          <View className="flex items-center justify-between px-5 py-5">
            <View className="flex items-center gap-4">
              <View className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Bell color="#FF6B00" size={24} />
              </View>
              <View>
                <Text className="block text-xl text-foreground">消息通知</Text>
                <Text className="block text-base text-muted-foreground mt-1">活动报名、活动提醒</Text>
              </View>
            </View>
            <View className="bg-primary rounded-full px-4 py-2">
              <Text className="block text-white text-base font-medium">已开启</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 版本信息 */}
      <View className="mt-10 flex justify-center">
        <Text className="block text-base text-muted-foreground">银龄乐圈 v1.0.0</Text>
      </View>

      {/* 底部留白 */}
      <View className="h-20" />
    </View>
  )
}
