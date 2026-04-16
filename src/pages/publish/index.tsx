/**
 * 银龄乐圈 - 发布动态页面
 * 支持发布文字内容和图片
 */

import { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { ChevronLeft, ImagePlus, Send, X } from 'lucide-react-taro'
import { Textarea } from '@/components/ui/textarea'
import Taro from '@tarojs/taro'
import { addLocalPost, getUserProfile } from '../../store/mock-data'

export default function Publish() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)

  // 选择图片
  const handleChooseImage = () => {
    if (images.length >= 9) {
      Taro.showToast({
        title: '最多选择9张图片',
        icon: 'none'
      })
      return
    }

    Taro.chooseImage({
      count: 9 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths as string[]
        setImages(prev => [...prev, ...tempFilePaths])
      }
    })
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 发布动态
  const handlePublish = async () => {
    if (!content.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }

    setIsPublishing(true)

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    const user = getUserProfile()

    // 添加到本地存储
    addLocalPost({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: content.trim(),
      images: images
    })

    setIsPublishing(false)

    // 显示成功提示
    Taro.showToast({
      title: '发布成功！',
      icon: 'success',
      duration: 1500
    })

    // 返回上一页
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  // 获取状态栏高度
  const statusBarHeight = Taro.getStorageSync('statusBarHeight') || 0

  return (
    <View className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <View 
        className="bg-white border-b border-border px-4"
        style={{ paddingTop: statusBarHeight + 'px' }}
      >
        <View className="flex items-center justify-between h-14">
          <View 
            className="w-10 h-10 flex items-center justify-center rounded-full"
            onClick={handleGoBack}
          >
            <ChevronLeft color="#333333" size={28} />
          </View>
          <Text className="text-xl font-bold text-foreground">发布动态</Text>
          <View 
            className={`px-5 py-2 rounded-full text-lg font-medium ${
              content.trim() 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={handlePublish}
          >
            {isPublishing ? '发布中...' : '发布'}
          </View>
        </View>
      </View>

      {/* 内容输入区 */}
      <ScrollView 
        scrollY 
        className="flex-1 px-4 py-4"
      >
        <View className="bg-white rounded-2xl p-4 card-shadow">
          <Textarea
            value={content}
            onInput={(e) => setContent((e.detail as any).value)}
            placeholder="分享今天的新鲜事..."
            className="w-full min-h-48 text-lg text-foreground leading-relaxed bg-transparent"
            maxlength={500}
          />
          
          {/* 字数统计 */}
          <View className="flex justify-end mt-2">
            <Text className="text-sm text-muted-foreground">
              {content.length}/500
            </Text>
          </View>
        </View>

        {/* 图片区域 */}
        <View className="mt-4">
          <Text className="block text-lg font-medium text-foreground mb-3">添加图片</Text>
          
          <View className="flex flex-wrap gap-3">
            {/* 已选择的图片 */}
            {images.map((img, index) => (
              <View key={index} className="relative">
                <Image
                  src={img}
                  className="w-24 h-24 rounded-xl object-cover"
                  mode="aspectFill"
                />
                <View 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black bg-opacity-60 rounded-full flex items-center justify-center"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X color="#FFFFFF" size={14} />
                </View>
              </View>
            ))}

            {/* 添加图片按钮 */}
            {images.length < 9 && (
              <View 
                className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-white"
                onClick={handleChooseImage}
              >
                <ImagePlus color="#999999" size={32} />
                <Text className="block text-sm text-muted-foreground mt-1">
                  {images.length > 0 ? '继续添加' : '点击添加'}
                </Text>
              </View>
            )}
          </View>

          {/* 图片数量提示 */}
          {images.length === 0 && (
            <Text className="block text-sm text-muted-foreground mt-3">
              最多可添加9张图片
            </Text>
          )}
        </View>

        {/* 发布按钮 */}
        <View className="mt-8">
          <View 
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 ${
              content.trim() 
                ? 'bg-primary' 
                : 'bg-muted'
            }`}
            onClick={handlePublish}
          >
            {isPublishing ? (
              <>
                <Send color="#FFFFFF" size={24} />
                <Text className="block text-white text-xl font-bold">发布中...</Text>
              </>
            ) : (
              <>
                <Send color={content.trim() ? '#FFFFFF' : '#999999'} size={24} />
                <Text className={`block text-xl font-bold ${
                  content.trim() ? 'text-white' : 'text-muted-foreground'
                }`}
                >
                  确认发布
                </Text>
              </>
            )}
          </View>
        </View>

        {/* 底部留白 */}
        <View className="h-20" />
      </ScrollView>
    </View>
  )
}
