/**
 * 银龄乐圈 - 编辑资料页面
 * 支持编辑头像、用户名、性别、年龄、个性签名
 */

import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { ChevronLeft, Camera } from 'lucide-react-taro'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Taro from '@tarojs/taro'
import { getUserProfile, saveUserProfile, type UserProfile } from '../../store/mock-data'

export default function EditProfile() {
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [signature, setSignature] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // 加载用户资料
    const user = getUserProfile()
    setNickname(user.name)
    setAvatar(user.avatar)
    // 如果用户资料中有其他字段也可以加载
    setGender((user as any).gender || '')
    setAge((user as any).age || '')
    setSignature((user as any).signature || '')
  }, [])

  // 获取状态栏高度
  const statusBarHeight = Taro.getStorageSync('statusBarHeight') || 0

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 选择头像
  const handleChooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        setAvatar(tempFilePath)
      }
    })
  }

  // 保存资料
  const handleSave = async () => {
    if (!nickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 1500
      })
      return
    }

    setIsSaving(true)

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 保存用户资料
    const userProfile: UserProfile & { gender?: string; age?: string; signature?: string } = {
      id: 'my001',
      name: nickname.trim(),
      avatar: avatar,
      gender: gender,
      age: age,
      signature: signature
    }

    saveUserProfile(userProfile as UserProfile)

    setIsSaving(false)

    Taro.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    })

    // 返回上一页
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  // 图片加载失败处理（兼容H5和小程序）
  const handleImageError = (e: any) => {
    try {
      const target = e?.target || e?.srcElement
      if (target && target.src) {
        target.src = 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80'
      }
    } catch (err) {
      // 静默处理错误
    }
  }

  return (
    <View className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <View 
        className="bg-white border-b border-border px-5"
        style={{ paddingTop: statusBarHeight + 'px' }}
      >
        <View className="flex items-center justify-between h-16">
          <View 
            className="w-12 h-12 flex items-center justify-center rounded-full"
            onClick={handleGoBack}
          >
            <ChevronLeft color="#333333" size={30} />
          </View>
          <Text className="text-2xl font-bold text-foreground">编辑资料</Text>
          <View 
            className={`px-5 py-2 rounded-full text-lg font-medium ${
              nickname.trim() 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={handleSave}
          >
            {isSaving ? '保存中...' : '保存'}
          </View>
        </View>
      </View>

      {/* 表单内容 */}
      <View className="flex-1 px-5 py-6">
        {/* 头像 */}
        <View className="flex flex-col items-center mb-8">
          <View 
            className="relative"
            onClick={handleChooseAvatar}
          >
            <Image
              src={avatar || 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80'}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary border-opacity-20"
              mode="aspectFill"
              onError={handleImageError}
            />
            <View className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-2 border-white">
              <Camera color="#FFFFFF" size={20} />
            </View>
          </View>
          <Text className="block text-base text-muted-foreground mt-3">点击更换头像</Text>
        </View>

        {/* 昵称 */}
        <View className="mb-5">
          <Text className="block text-lg font-medium text-foreground mb-3">昵称</Text>
          <View className="bg-white rounded-2xl px-5 py-4 card-shadow">
            <Input
              value={nickname}
              onInput={(e: any) => setNickname(e.detail.value)}
              placeholder="请输入昵称"
              maxlength={20}
              className="text-xl"
            />
          </View>
        </View>

        {/* 性别 */}
        <View className="mb-5">
          <Text className="block text-lg font-medium text-foreground mb-3">性别</Text>
          <View className="flex gap-4">
            <View 
              className={`flex-1 py-4 rounded-2xl text-center text-xl font-medium transition-all ${
                gender === '男' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-foreground border-2 border-border card-shadow'
              }`}
              onClick={() => setGender('男')}
            >
              <Text className={`block ${gender === '男' ? 'text-white' : 'text-foreground'}`}>男</Text>
            </View>
            <View 
              className={`flex-1 py-4 rounded-2xl text-center text-xl font-medium transition-all ${
                gender === '女' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-foreground border-2 border-border card-shadow'
              }`}
              onClick={() => setGender('女')}
            >
              <Text className={`block ${gender === '女' ? 'text-white' : 'text-foreground'}`}>女</Text>
            </View>
          </View>
        </View>

        {/* 年龄 */}
        <View className="mb-5">
          <Text className="block text-lg font-medium text-foreground mb-3">年龄</Text>
          <View className="bg-white rounded-2xl px-5 py-4 card-shadow">
            <Input
              type="number"
              value={age}
              onInput={(e: any) => setAge(e.detail.value)}
              placeholder="请输入年龄"
              maxlength={3}
              className="text-xl"
            />
          </View>
        </View>

        {/* 个性签名 */}
        <View className="mb-5">
          <Text className="block text-lg font-medium text-foreground mb-3">个性签名</Text>
          <View className="bg-white rounded-2xl px-5 py-4 card-shadow">
            <Textarea
              value={signature}
              onInput={(e: any) => setSignature((e.detail as any).value)}
              placeholder="介绍一下自己吧..."
              maxlength={100}
              className="w-full min-h-28 text-lg text-foreground leading-relaxed bg-transparent"
            />
            <View className="flex justify-end mt-2">
              <Text className="text-base text-muted-foreground">
                {signature.length}/100
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
