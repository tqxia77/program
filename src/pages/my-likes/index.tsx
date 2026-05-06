/**
 * 银龄乐圈 - 我的点赞页面
 * 展示用户点赞过的帖子
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Heart, MessageCircle, ChevronLeft } from 'lucide-react-taro'
import { SafeImage } from '@/components/safe-image'
import { TTSButton } from '@/components/tts'
import { useFontMode } from '@/store/font-mode'
import Taro from '@tarojs/taro'
import { getPosts, getLikedPostIds } from '@/store/mock-data'

interface Post {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  images: string[]
  likes: number
  comments: number
  publishTime: string
}

export default function MyLikes() {
  const [posts, setPosts] = useState<Post[]>([])
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  useEffect(() => {
    // 获取用户点赞的帖子
    const allPosts = getPosts()
    const liked = getLikedPostIds()
    
    // 过滤出用户点赞的帖子
    const likedPosts = allPosts.filter(post => liked.includes(post.id))
    setPosts(likedPosts)
  }, [])

  // 返回上一页
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
          <Text className="block text-2xl font-bold text-foreground ml-2">我的点赞</Text>
        </View>
      </View>

      {/* 点赞列表 */}
      <ScrollView scrollY className="px-4 py-4" style={{ height: 'calc(100vh - 80px)' }}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <View 
              key={post.id}
              className="bg-white rounded-2xl card-shadow mb-4 overflow-hidden"
            >
              {/* 用户信息 */}
              <View className="flex items-center p-5">
                <SafeImage
                  src={post.userAvatar}
                  className="w-14 h-14 rounded-full"
                  mode="aspectFill"
                />
                <View className="ml-4 flex-1">
                  <Text className="block text-xl font-bold text-foreground">{post.userName}</Text>
                  <Text className="block text-base text-muted-foreground">{post.publishTime}</Text>
                </View>
              </View>

              {/* 文字内容 */}
              <View className="px-5 pb-4">
                <Text className="block text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </Text>
              </View>

              {/* 图片 */}
              {post.images.length > 0 && (
                <View className="px-5 pb-4">
                  <View className={post.images.length === 1 ? 'flex' : 'grid grid-cols-2 gap-2'}>
                    {post.images.map((img, index) => (
                      <SafeImage
                        key={index}
                        src={img}
                        className={`object-cover ${post.images.length === 1 ? 'w-full h-64 rounded-xl' : 'w-full h-44 rounded-xl'}`}
                        mode="aspectFill"
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* 底部互动栏 */}
              <View className="flex items-center justify-between px-5 py-4 border-t border-border">
                <View className="flex items-center gap-4">
                  <View className="flex items-center gap-2">
                    <Heart color="#EF4444" size={22} filled />
                    <Text className="block text-base text-red-500 font-medium">{post.likes}</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <MessageCircle color="#666666" size={22} />
                    <Text className="block text-base text-foreground">{post.comments}</Text>
                  </View>
                </View>
                
                {/* 听帖子按钮 */}
                <TTSButton text={post.content} />
              </View>
            </View>
          ))
        ) : (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Heart color="#CCCCCC" size={48} />
            </View>
            <Text className="block text-xl text-foreground font-medium">暂无点赞内容</Text>
            <Text className="block text-base text-muted-foreground mt-2">去邻里圈看看大家的动态吧</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
