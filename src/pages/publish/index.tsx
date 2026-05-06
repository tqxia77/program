/**
 * 银龄乐圈 - 发布动态页面
 * 支持发布文字内容、语音和图片
 */

import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { addLocalPost, getUserProfile } from '@/store/mock-data'
import { useFontMode } from '@/store/font-mode'
import { VoicePost } from '@/components/voice'
import { ImagePicker } from '@/components/image-picker'

export default function Publish() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [voiceText, setVoiceText] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 语音识别结果回调
  const handleVoiceResult = (text: string) => {
    setVoiceText(prev => prev + text)
    if (text) {
      setContent(prev => prev + text)
    }
  }

  // 选择图片
  const handleImagesChange = (newImages: any[]) => {
    setImages(newImages.map((img: any) => typeof img === 'string' ? img : img.url))
  }

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 发布动态
  const handlePublish = async () => {
    if (!content.trim() && images.length === 0) {
      Taro.showToast({
        title: '请输入内容或添加图片',
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
      content: content.trim() || (voiceText ? `[语音内容]${voiceText}` : ''),
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
    <View className={`min-h-screen bg-background flex flex-col ${fontModeClass}`}>
      {/* 顶部导航栏 */}
      <View 
        className="bg-white border-b border-border"
        style={{ paddingTop: statusBarHeight + 'px' }}
      >
        <View className="flex items-center justify-between px-4 py-4">
          <View 
            className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary"
            onClick={handleGoBack}
          >
            <ChevronLeft size={28} color="#333333" />
          </View>
          <Text className="block text-2xl font-bold text-foreground">发布动态</Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView scrollY className="flex-1">
        <View className="p-5">
          {/* 文字输入区域 */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <View className="bg-gray-50 rounded-xl p-3">
              <Text 
                className="block text-lg text-foreground leading-relaxed min-h-32"
                style={{ minHeight: '128px' }}
              >
                {content || '说点什么吧...'}
              </Text>
            </View>
            <Textarea
              value={content}
              onInput={(e: any) => setContent(e.detail.value)}
              placeholder="说点什么吧..."
              className="mt-3 bg-transparent text-lg"
              style={{ 
                backgroundColor: 'transparent',
                minHeight: '120px'
              }}
              maxlength={500}
            />
            <View className="flex justify-end mt-2">
              <Text className="text-base text-muted-foreground">{content.length}/500</Text>
            </View>
          </View>

          {/* 语音发帖组件 */}
          <View className="mb-4">
            <Text className="block text-lg font-medium text-foreground mb-3">按住说话</Text>
            <VoicePost 
              onSubmit={handleVoiceResult}
            />
          </View>

          {/* 图片上传组件 */}
          <View className="mb-4">
            <Text className="block text-lg font-medium text-foreground mb-3">添加图片（可选，最多9张）</Text>
            <ImagePicker
              images={images.map((url, idx) => ({ id: `img-${idx}`, url }))}
              onChange={handleImagesChange}
              maxCount={9}
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部发布按钮 */}
      <View className="bg-white border-t border-border p-4 pb-8">
        <View 
          className={`flex items-center justify-center py-4 rounded-xl ${
            isPublishing 
              ? 'bg-gray-300' 
              : 'bg-primary active:bg-orange-600'
          }`}
          onClick={isPublishing ? undefined : handlePublish}
        >
          <Text className="block text-xl font-bold text-white">
            {isPublishing ? '发布中...' : '发布'}
          </Text>
        </View>
      </View>
    </View>
  )
}
