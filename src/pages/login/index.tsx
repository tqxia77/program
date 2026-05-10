/**
 * 用户登录页面
 * 微信一键授权登录 + 角色选择
 */

import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { useAuthStore, UserRole } from '@/store/auth'
import { useFontMode } from '@/store/font-mode'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import './index.css'

// 默认头像
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'

export default function LoginPage() {
  const { login, loading, setLoading } = useAuthStore()
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'
  
  // 选择角色状态
  const [showRoleSelect, setShowRoleSelect] = useState(false)
  const [tempUserInfo, setTempUserInfo] = useState<{
    nickname: string
    avatar: string
    role?: UserRole
  }>({
    nickname: '',
    avatar: DEFAULT_AVATAR,
  })

  // 微信一键登录（获取用户信息）
  const handleWechatLogin = async () => {
    setLoading(true)
    try {
      // 小程序环境获取用户信息
      if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP || Taro.getEnv() === Taro.ENV_TYPE.TT) {
        // 获取用户信息
        const profileRes = await Taro.getUserProfile({
          desc: '用于完善您的个人资料'
        })
        
        if (profileRes.userInfo) {
          setTempUserInfo({
            nickname: profileRes.userInfo.nickName,
            avatar: profileRes.userInfo.avatarUrl || DEFAULT_AVATAR,
          })
          setShowRoleSelect(true)
        }
      } else {
        // H5环境模拟
        setTempUserInfo({
          nickname: '新用户',
          avatar: DEFAULT_AVATAR,
        })
        setShowRoleSelect(true)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      Taro.showToast({ title: '获取用户信息失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 选择角色
  const handleSelectRole = async (role: UserRole) => {
    if (!tempUserInfo.nickname) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 调用后端微信登录API
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: {
          nickname: tempUserInfo.nickname,
          avatar: tempUserInfo.avatar || DEFAULT_AVATAR,
          role: role
        }
      })
      
      console.log('登录响应:', res.data)
      
      if (res.data.code === 200 && res.data.data.token) {
        // 登录成功，保存用户信息
        const userInfo = {
          id: res.data.data.user?.id || `user_${Date.now()}`,
          nickname: tempUserInfo.nickname,
          avatar: tempUserInfo.avatar || DEFAULT_AVATAR,
          role: role,
          createdAt: new Date().toISOString(),
        }
        
        login(res.data.data.token, userInfo)
        Taro.showToast({ title: '登录成功', icon: 'success' })
        Taro.switchTab({ url: '/pages/index/index' })
      } else {
        // 后端未启动或返回错误，使用模拟登录
        console.log('后端未响应，使用模拟登录')
        const mockToken = `token_${Date.now()}`
        const mockUserInfo = {
          id: `user_${Date.now()}`,
          nickname: tempUserInfo.nickname,
          avatar: tempUserInfo.avatar || DEFAULT_AVATAR,
          role: role,
          createdAt: new Date().toISOString(),
        }
        login(mockToken, mockUserInfo)
        Taro.showToast({ title: '登录成功（模拟）', icon: 'success' })
        Taro.switchTab({ url: '/pages/index/index' })
      }
    } catch (error) {
      console.error('登录失败，使用模拟登录:', error)
      // 后端连接失败，使用模拟登录
      const mockToken = `token_${Date.now()}`
      const mockUserInfo = {
        id: `user_${Date.now()}`,
        nickname: tempUserInfo.nickname,
        avatar: tempUserInfo.avatar || DEFAULT_AVATAR,
        role: role,
        createdAt: new Date().toISOString(),
      }
      login(mockToken, mockUserInfo)
      Taro.showToast({ title: '登录成功（模拟）', icon: 'success' })
      Taro.switchTab({ url: '/pages/index/index' })
    } finally {
      setLoading(false)
    }
  }

  // 快速体验登录（比赛展示用，无需后端）
  const handleQuickLogin = async () => {
    setLoading(true)
    try {
      // 模拟登录，直接保存用户信息
      const mockToken = `demo_token_${Date.now()}`
      const mockUserInfo = {
        id: `demo_user_${Date.now()}`,
        nickname: '银龄用户',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
        role: 'elder' as UserRole,
        createdAt: new Date().toISOString(),
      }
      
      login(mockToken, mockUserInfo)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      
      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 500)
    } catch (error) {
      console.error('快速登录失败:', error)
      Taro.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 跳过登录（游客模式）
  const handleSkipLogin = () => {
    const guestToken = `guest_${Date.now()}`
    const guestUserInfo = {
      id: `guest_${Date.now()}`,
      nickname: '游客',
      avatar: DEFAULT_AVATAR,
      role: 'elder' as UserRole,
      createdAt: new Date().toISOString(),
    }
    login(guestToken, guestUserInfo)
    Taro.switchTab({ url: '/pages/index/index' })
  }

  // 角色选择弹窗
  if (showRoleSelect) {
    return (
      <View className={`min-h-screen bg-white flex flex-col items-center justify-center p-8 ${fontModeClass}`}>
        {/* 用户头像预览 */}
        <Image
          className="w-24 h-24 rounded-full mb-6"
          src={tempUserInfo.avatar}
          mode="aspectFill"
        />
        <Text className="block text-2xl font-bold text-gray-800 mb-2">
          {tempUserInfo.nickname}
        </Text>
        <Text className="block text-base text-gray-500 mb-10">
          请选择您的身份
        </Text>

        {/* 角色选择 */}
        <View className="w-full space-y-4">
          <Button
            className="w-full bg-orange-500 text-white py-4 rounded-2xl text-lg font-medium"
            onClick={() => handleSelectRole('elder')}
            disabled={loading}
          >
            <Text>我是社区老人</Text>
          </Button>
          
          <Button
            className="w-full bg-blue-500 text-white py-4 rounded-2xl text-lg font-medium"
            onClick={() => handleSelectRole('community')}
            disabled={loading}
          >
            <Text>我是社区工作人员</Text>
          </Button>
          
          <Button
            className="w-full bg-green-500 text-white py-4 rounded-2xl text-lg font-medium"
            onClick={() => handleSelectRole('child')}
            disabled={loading}
          >
            <Text>我是子女（帮父母操作）</Text>
          </Button>
        </View>

        <Button
          className="mt-6 text-gray-400 text-base"
          onClick={() => setShowRoleSelect(false)}
          variant="ghost"
        >
          <Text>返回上一步</Text>
        </Button>
      </View>
    )
  }

  // 登录页面
  return (
    <View className={`min-h-screen bg-white flex flex-col items-center justify-center p-8 ${fontModeClass}`}>
      {/* Logo区域 */}
      <View className="mb-12 text-center">
        <View className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Text className="text-5xl">👴</Text>
        </View>
        <Text className="block text-3xl font-bold text-gray-800 mb-2">
          银龄乐圈
        </Text>
        <Text className="block text-base text-gray-500">
          社区老年人的温暖家园
        </Text>
      </View>

      {/* 登录按钮区域 */}
      <View className="w-full space-y-4">
        {/* 微信一键登录 */}
        <Button
          className="w-full bg-green-500 text-white py-4 rounded-2xl flex items-center justify-center gap-3"
          onClick={handleWechatLogin}
          disabled={loading}
        >
          <Text className="text-xl">V</Text>
          <Text className="text-lg font-medium">微信一键登录</Text>
        </Button>

        {/* 快速体验（比赛展示用） */}
        <Button
          className="w-full bg-orange-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2"
          onClick={handleQuickLogin}
          disabled={loading}
        >
          <Text className="text-lg font-medium">快速体验（无需微信）</Text>
        </Button>

        {/* 跳过登录 */}
        <Button
          className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl"
          onClick={handleSkipLogin}
        >
          <Text className="text-base">暂不登录，游客体验</Text>
        </Button>
      </View>

      {/* 底部说明 */}
      <View className="mt-12 text-center">
        <Text className="block text-xs text-gray-400 mb-2">
          登录即表示同意
        </Text>
        <View className="flex gap-2 justify-center">
          <Text className="text-xs text-blue-500">《用户协议》</Text>
          <Text className="text-xs text-gray-400">和</Text>
          <Text className="text-xs text-blue-500">《隐私政策》</Text>
        </View>
      </View>
    </View>
  )
}
