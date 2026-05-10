/**
 * 银龄乐圈 - 报名用户列表页面
 * 查看活动的报名用户（管理端）
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { SafeImage } from '@/components/safe-image'
import { ChevronLeft, Users, UserX } from 'lucide-react-taro'
import { useFontMode } from '@/store/font-mode'
import Taro from '@tarojs/taro'

interface Enrollee {
  id: string
  userId: string
  userName: string
  userAvatar: string
  phone: string
  signUpTime: string
  role: '老人' | '子女'
}

export default function Enrollees() {
  const [enrollees, setEnrollees] = useState<Enrollee[]>([])
  const [activityTitle, setActivityTitle] = useState('')
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  useEffect(() => {
    // 获取活动ID
    const event = Taro.getStorageSync('currentActivity') || {}
    if (event.title) {
      setActivityTitle(event.title)
    }

    // 模拟报名用户数据
    const mockEnrollees: Enrollee[] = [
      {
        id: '1',
        userId: 'user1',
        userName: '王秀英',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
        phone: '138****5678',
        signUpTime: '2026-05-06 09:30',
        role: '老人',
      },
      {
        id: '2',
        userId: 'user2',
        userName: '张建国',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        phone: '139****8765',
        signUpTime: '2026-05-06 10:15',
        role: '老人',
      },
      {
        id: '3',
        userId: 'user3',
        userName: '李阿姨',
        userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
        phone: '137****2345',
        signUpTime: '2026-05-06 11:00',
        role: '老人',
      },
      {
        id: '4',
        userId: 'user4',
        userName: '陈伟',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        phone: '136****9876',
        signUpTime: '2026-05-06 14:20',
        role: '子女',
      },
      {
        id: '5',
        userId: 'user5',
        userName: '刘淑芬',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
        phone: '135****4321',
        signUpTime: '2026-05-07 08:45',
        role: '老人',
      },
    ]
    setEnrollees(mockEnrollees)
  }, [])

  // 返回
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 拨打电话
  const handleCall = (phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone.replace(/\*+/g, ''),
    })
  }

  return (
    <View className={`min-h-screen bg-background ${fontModeClass}`}>
      {/* 顶部导航 */}
      <View className="bg-white border-b border-border px-4 py-4">
        <View className="flex items-center">
          <View
            className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary active:bg-gray-200"
            onClick={handleGoBack}
          >
            <ChevronLeft color="#333333" size={28} />
          </View>
          <Text className="block text-2xl font-bold text-foreground ml-2">报名用户</Text>
        </View>
      </View>

      {/* 统计信息 */}
      <View className="px-4 py-4">
        <View className="bg-white rounded-2xl card-shadow p-5">
          <View className="flex items-center justify-between">
            <View>
              <Text className="block text-base text-muted-foreground">活动名称</Text>
              <Text className="block text-xl font-bold text-foreground mt-1">{activityTitle || '健康养生讲座'}</Text>
            </View>
            <View className="flex items-center gap-2">
              <Users color="#666666" size={20} />
              <Text className="block text-2xl font-bold text-primary">{enrollees.length}</Text>
              <Text className="block text-base text-muted-foreground">人</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 用户列表 */}
      <ScrollView scrollY className="px-4 pb-4" style={{ height: 'calc(100vh - 180px)' }}>
        {enrollees.length > 0 ? (
          enrollees.map((enrollee, index) => (
            <View
              key={enrollee.id}
              className={`bg-white rounded-2xl card-shadow mb-4 p-5 ${index === 0 ? '' : ''}`}
            >
              <View className="flex items-center">
                {/* 序号 */}
                <View className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-4">
                  <Text className="block text-lg font-bold">{index + 1}</Text>
                </View>

                {/* 头像 */}
                <SafeImage
                  src={enrollee.userAvatar}
                  className="w-14 h-14 rounded-full"
                  mode="aspectFill"
                />

                {/* 用户信息 */}
                <View className="ml-4 flex-1">
                  <View className="flex items-center">
                    <Text className="block text-xl font-bold text-foreground">{enrollee.userName}</Text>
                    <Text className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      enrollee.role === '老人' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}
                    >{enrollee.role}</Text>
                  </View>
                  <Text className="block text-base text-muted-foreground mt-1">{enrollee.phone}</Text>
                  <Text className="block text-sm text-gray-400 mt-1">报名时间：{enrollee.signUpTime}</Text>
                </View>

                {/* 拨打电话 */}
                <View
                  className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center active:bg-green-100"
                  onClick={() => handleCall(enrollee.phone)}
                >
                  <Text className="text-green-600 text-2xl">📞</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
              <UserX color="#CCCCCC" size={48} />
            </View>
            <Text className="block text-xl text-foreground font-medium">暂无报名用户</Text>
            <Text className="block text-base text-muted-foreground mt-2">还没有人报名此活动</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
