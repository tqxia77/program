/**
 * 银龄乐圈 - 邻里圈（社区互动）
 * 类似朋友圈的极简版动态展示
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Heart, MessageCircle, Plus } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { getPosts, togglePostLike, getLikedPostIds, type Post } from '../../store/mock-data'

export default function Neighborhood() {
  const [posts, setPosts] = useState<Post[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])

  // 加载动态数据
  const loadPosts = useCallback(() => {
    const allPosts = getPosts()
    const liked = getLikedPostIds()
    setPosts(allPosts)
    setLikedIds(liked)
  }, [])

  useEffect(() => {
    loadPosts()
    
    // 监听页面显示，刷新数据
    const page = Taro.getCurrentPages().pop()
    if (page) {
      page.onShow = () => {
        loadPosts()
      }
    }
  }, [loadPosts])

  // 点赞/取消点赞
  const handleLike = (postId: string) => {
    const isLiked = togglePostLike(postId)
    setLikedIds(prev => 
      isLiked 
        ? [...prev, postId]
        : prev.filter(id => id !== postId)
    )
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, likes: isLiked ? p.likes + 1 : p.likes - 1, isLiked }
        : p
    ))
  }

  // 跳转到发布页面
  const handlePublish = () => {
    Taro.navigateTo({
      url: '/pages/publish/index'
    })
  }

  return (
    <View className="min-h-screen bg-background pb-20">
      {/* 页面标题 */}
      <View className="bg-white border-b border-border px-5 py-5">
        <Text className="block text-3xl font-bold text-foreground">邻里圈</Text>
        <Text className="block text-lg text-muted-foreground mt-1">分享生活，结识邻里</Text>
      </View>

      {/* 动态列表 */}
      <ScrollView
        scrollY
        className="px-4 pt-4"
      >
        {posts.map((post) => (
          <View 
            key={post.id}
            className="bg-white rounded-2xl card-shadow mb-4 overflow-hidden"
          >
            {/* 用户信息 */}
            <View className="flex items-center p-5">
              <Image
                src={post.userAvatar}
                className="w-16 h-16 rounded-full object-cover"
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
                    <Image
                      key={index}
                      src={img}
                      className={`object-cover ${post.images.length === 1 ? 'w-full h-72 rounded-xl' : 'w-full h-48 rounded-xl'}`}
                      mode="aspectFill"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* 底部互动栏 */}
            <View className="flex items-center px-5 py-4 border-t border-border">
              <View 
                className={`flex items-center gap-3 px-5 py-3 rounded-full transition-colors ${
                  likedIds.includes(post.id) 
                    ? 'bg-primary' 
                    : 'bg-secondary'
                }`}
                onClick={() => handleLike(post.id)}
              >
                <Heart 
                  size={24} 
                  color={likedIds.includes(post.id) ? '#FF6B00' : '#666666'}
                />
                <Text className={`block text-lg ${
                  likedIds.includes(post.id) 
                    ? 'text-white font-medium' 
                    : 'text-foreground'
                }`}
                >
                  {post.likes}
                </Text>
              </View>

              <View className="flex items-center gap-3 ml-5 px-5 py-3 rounded-full bg-secondary">
                <MessageCircle size={24} color="#666666" />
                <Text className="block text-lg text-foreground">{post.comments}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* 空状态 */}
        {posts.length === 0 && (
          <View className="flex flex-col items-center justify-center py-24">
            <Text className="block text-2xl text-muted-foreground mb-2">暂无动态</Text>
            <Text className="block text-base text-muted-foreground">点击右下角按钮发布第一条动态</Text>
          </View>
        )}

        {/* 底部留白 */}
        <View className="h-24" />
      </ScrollView>

      {/* 右下角悬浮发布按钮 */}
      <View 
        className="fixed right-6 bottom-24 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg active:bg-primary"
        onClick={handlePublish}
        style={{ boxShadow: '0 6px 20px rgba(255, 107, 0, 0.5)' }}
      >
        <Plus color="#FFFFFF" size={40} strokeWidth={3} />
      </View>
    </View>
  )
}
