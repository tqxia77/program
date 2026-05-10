/**
 * 银龄乐圈 - 通知设置页面
 * 设置短信/电话提醒开关
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Bell, MessageSquare, Phone, ChevronLeft } from 'lucide-react-taro'
import { Switch } from '@/components/ui/switch'
import { useFontMode } from '@/store/font-mode'
import Taro from '@tarojs/taro'

interface NotificationSettings {
  smsEnabled: boolean  // 短信提醒
  callEnabled: boolean  // 电话提醒
  activityReminder: boolean  // 活动开始提醒
  commentNotice: boolean  // 评论提醒
  followNotice: boolean  // 关注提醒
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    callEnabled: true,
    activityReminder: true,
    commentNotice: true,
    followNotice: true,
  })
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载设置（从本地存储）
  useEffect(() => {
    const savedSettings = Taro.getStorageSync('notificationSettings')
    if (savedSettings) {
      setSettings(savedSettings)
    }
  }, [])

  // 保存设置
  const saveSettings = (newSettings: NotificationSettings) => {
    Taro.setStorageSync('notificationSettings', newSettings)
    Taro.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1500,
    })
  }

  // 切换开关
  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  // 返回
  const handleGoBack = () => {
    Taro.navigateBack()
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
          <Text className="block text-2xl font-bold text-foreground ml-2">通知设置</Text>
        </View>
      </View>

      <ScrollView scrollY className="px-4 py-4" style={{ height: 'calc(100vh - 80px)' }}>
        {/* 提醒方式 */}
        <View className="mb-6">
          <Text className="block text-lg font-bold text-foreground mb-4 px-2">提醒方式</Text>
          <View className="bg-white rounded-2xl card-shadow overflow-hidden">
            {/* 短信提醒 */}
            <View className="flex items-center justify-between px-5 py-5 border-b border-border">
              <View className="flex items-center">
                <View className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MessageSquare color="#3B82F6" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="block text-xl text-foreground font-medium">短信提醒</Text>
                  <Text className="block text-base text-muted-foreground">接收活动短信通知</Text>
                </View>
              </View>
              <Switch 
                checked={settings.smsEnabled}
                onCheckedChange={() => handleToggle('smsEnabled')}
              />
            </View>

            {/* 电话提醒 */}
            <View className="flex items-center justify-between px-5 py-5">
              <View className="flex items-center">
                <View className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Phone color="#10B981" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="block text-xl text-foreground font-medium">电话提醒</Text>
                  <Text className="block text-base text-muted-foreground">接收语音电话提醒</Text>
                </View>
              </View>
              <Switch 
                checked={settings.callEnabled}
                onCheckedChange={() => handleToggle('callEnabled')}
              />
            </View>
          </View>
        </View>

        {/* 通知类型 */}
        <View className="mb-6">
          <Text className="block text-lg font-bold text-foreground mb-4 px-2">通知类型</Text>
          <View className="bg-white rounded-2xl card-shadow overflow-hidden">
            {/* 活动开始提醒 */}
            <View className="flex items-center justify-between px-5 py-5 border-b border-border">
              <View className="flex items-center">
                <View className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Bell color="#F59E0B" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="block text-xl text-foreground font-medium">活动开始提醒</Text>
                  <Text className="block text-base text-muted-foreground">活动开始前发送提醒</Text>
                </View>
              </View>
              <Switch 
                checked={settings.activityReminder}
                onCheckedChange={() => handleToggle('activityReminder')}
              />
            </View>

            {/* 评论提醒 */}
            <View className="flex items-center justify-between px-5 py-5 border-b border-border">
              <View className="flex items-center">
                <View className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <MessageSquare color="#8B5CF6" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="block text-xl text-foreground font-medium">评论提醒</Text>
                  <Text className="block text-base text-muted-foreground">有人评论时通知您</Text>
                </View>
              </View>
              <Switch 
                checked={settings.commentNotice}
                onCheckedChange={() => handleToggle('commentNotice')}
              />
            </View>

            {/* 关注提醒 */}
            <View className="flex items-center justify-between px-5 py-5">
              <View className="flex items-center">
                <View className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                  <Bell color="#EC4899" size={24} />
                </View>
                <View className="ml-4">
                  <Text className="block text-xl text-foreground font-medium">关注提醒</Text>
                  <Text className="block text-base text-muted-foreground">有人关注时通知您</Text>
                </View>
              </View>
              <Switch 
                checked={settings.followNotice}
                onCheckedChange={() => handleToggle('followNotice')}
              />
            </View>
          </View>
        </View>

        {/* 说明 */}
        <View className="bg-blue-50 rounded-2xl p-5">
          <Text className="block text-lg font-medium text-blue-800 mb-2">温馨提示</Text>
          <Text className="block text-base text-blue-700 leading-relaxed">
            关闭电话提醒后，系统将仅通过短信方式通知您。请确保您的手机号保持畅通，以便接收重要通知。
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
