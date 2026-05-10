/**
 * 银龄乐圈 - 邻里圈（社区互动）
 * 对接后端API：帖子列表、点赞、评论
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Input } from '@/components/ui/input'
import { Heart, MessageCircle, Plus } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { getPosts as getMockPosts, getLikedPostIds as getMockLikedIds } from '@/store/mock-data'
import { SafeImage } from '@/components/safe-image'
import { TTSPlayer } from '@/components/tts'
import { useFontMode } from '@/store/font-mode'

// 评论类型
interface Comment {
  id: string
  postId: string
  userName: string
  userAvatar: string
  content: string
  time: string
}

// 帖子类型（与后端接口对应）
interface Post {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  images: string[]
  voiceText?: string
  publishTime: string
  likes: number
  comments: number
  isLiked: boolean
}

export default function Neighborhood() {
  const [posts, setPosts] = useState<Post[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [showComments, setShowComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载动态数据 - 对接后端API
  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      // 调用后端API获取帖子列表
      const res = await Network.request({
        url: '/api/posts',
        method: 'GET'
      })
      
      console.log('帖子列表API响应:', res.data)
      
      if (res.data.code === 200 && res.data.data) {
        // 后端返回的是分页格式，取list字段
        const postList = Array.isArray(res.data.data) 
          ? res.data.data 
          : res.data.data.list || []
        
        // 转换后端数据格式为前端格式
        const formattedPosts: Post[] = postList.map((post: any) => ({
          id: post.id,
          userName: post.author?.nickname || post.userName || '用户',
          userAvatar: post.author?.avatar || post.userAvatar || 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=60',
          content: post.content,
          images: post.images || [],
          publishTime: formatTime(post.createdAt),
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          isLiked: false
        }))
        
        setPosts(formattedPosts)
        
        // 获取点赞状态
        try {
          const likeRes = await Network.request({
            url: '/api/user/likes',
            method: 'GET'
          })
          if (likeRes.data.code === 200 && likeRes.data.data) {
            const likedList = Array.isArray(likeRes.data.data) 
              ? likeRes.data.data 
              : likeRes.data.data.list || []
            setLikedIds(likedList.map((p: any) => p.id))
          }
        } catch (e) {
          console.log('获取点赞列表失败，使用Mock数据')
        }
      }
    } catch (error) {
      console.log('帖子列表API失败，使用Mock数据:', error)
      // API失败时降级到Mock数据
      setPosts(getMockPosts() as Post[])
      setLikedIds(getMockLikedIds())
    }
    
    // 加载本地评论（评论暂用本地存储）
    const storedComments = Taro.getStorageSync('postComments') || {}
    setComments(storedComments)
    setLoading(false)
  }, [])

  // 格式化时间
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '刚刚'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    return date.toLocaleDateString()
  }

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

  // 点赞/取消点赞 - 对接后端API
  const handleLike = async (postId: string) => {
    const isCurrentlyLiked = likedIds.includes(postId)
    
    // 先更新UI
    setLikedIds(prev => 
      isCurrentlyLiked 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, likes: isCurrentlyLiked ? p.likes - 1 : p.likes + 1, isLiked: !isCurrentlyLiked }
        : p
    ))
    
    try {
      // 调用后端API
      if (isCurrentlyLiked) {
        await Network.request({
          url: `/api/posts/${postId}/like`,
          method: 'DELETE'
        })
      } else {
        await Network.request({
          url: `/api/posts/${postId}/like`,
          method: 'POST'
        })
      }
    } catch (error) {
      console.log('点赞API失败，回滚状态')
      // 回滚UI
      setLikedIds(prev => 
        isCurrentlyLiked 
          ? [...prev, postId]
          : prev.filter(id => id !== postId)
      )
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, likes: isCurrentlyLiked ? p.likes + 1 : p.likes - 1, isLiked: isCurrentlyLiked }
          : p
      ))
    }
  }

  // 切换评论显示
  const toggleCommentSection = (postId: string) => {
    setShowComments(prev => prev === postId ? null : postId)
    setNewComment('')
  }

  // 发送评论 - 对接后端API
  const handleSendComment = async (postId: string) => {
    if (!newComment.trim()) return
    
    const tempComment: Comment = {
      id: `temp_${Date.now()}`,
      postId,
      userName: '我',
      userAvatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=60',
      content: newComment.trim(),
      time: '刚刚'
    }
    
    // 先显示到UI
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), tempComment]
    }))
    setNewComment('')
    
    try {
      // 调用后端API
      await Network.request({
        url: `/api/posts/${postId}/comments`,
        method: 'POST',
        data: { content: newComment.trim() }
      })
      
      // 更新帖子评论数
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, comments: p.comments + 1 }
          : p
      ))
      
      Taro.showToast({
        title: '评论成功',
        icon: 'success',
        duration: 1500
      })
    } catch (error) {
      console.log('评论API失败:', error)
      Taro.showToast({
        title: '评论失败',
        icon: 'error',
        duration: 1500
      })
    }
  }

  // 跳转到发布页面
  const handlePublish = () => {
    Taro.navigateTo({
      url: '/pages/publish/index'
    })
  }

  // 跳转到帖子详情
  const handlePostClick = (postId: string) => {
    Taro.navigateTo({
      url: `/pages/post-detail/index?id=${postId}`
    })
  }

  return (
    <View className={`min-h-screen bg-background pb-20 ${fontModeClass}`}>
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
        {loading && posts.length === 0 ? (
          <View className="flex items-center justify-center py-20">
            <Text className="block text-lg text-muted-foreground">加载中...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <Text className="block text-lg text-muted-foreground">暂无动态</Text>
            <Text className="block text-base text-muted-foreground mt-2">快来发布第一条动态吧</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View 
              key={post.id}
              className="bg-white rounded-2xl card-shadow mb-4 overflow-hidden"
            >
              {/* 用户信息 */}
              <View className="flex items-center p-5">
                <SafeImage
                  src={post.userAvatar}
                  className="w-16 h-16 rounded-full"
                  mode="aspectFill"
                />
                <View className="ml-4 flex-1">
                  <Text className="block text-xl font-bold text-foreground">{post.userName}</Text>
                  <Text className="block text-base text-muted-foreground">{post.publishTime}</Text>
                </View>
                <View onClick={() => handlePostClick(post.id)}>
                  <Text className="block text-base text-primary">查看详情</Text>
                </View>
              </View>

              {/* 文字内容 */}
              <View className="px-5 pb-2">
                <Text className="block text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </Text>
              </View>

              {/* 图片 */}
              {post.images && post.images.length > 0 && (
                <View className="px-5 pb-4">
                  <View className={post.images.length === 1 ? 'flex' : 'grid grid-cols-2 gap-2'}>
                    {post.images.map((img, index) => (
                      <SafeImage
                        key={index}
                        src={img}
                        className={`object-cover ${post.images.length === 1 ? 'w-full h-72 rounded-xl' : 'w-full h-48 rounded-xl'}`}
                        mode="aspectFill"
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* 语音文字（如果有） */}
              {post.voiceText && (
                <View className="px-5 pb-4">
                  <View className="bg-gray-50 rounded-xl p-4">
                    <View className="flex items-center">
                      <Text className="block text-base text-muted-foreground flex-1">
                        📝 {post.voiceText}
                      </Text>
                      <TTSPlayer text={post.content} />
                    </View>
                  </View>
                </View>
              )}

              {/* 操作栏 */}
              <View className="flex items-center border-t border-border px-5 py-4">
                {/* 点赞 */}
                <View 
                  className="flex items-center flex-1"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart 
                    size={24} 
                    color={likedIds.includes(post.id) ? '#ef4444' : '#666'} 
                  />
                  <Text className="block text-base ml-2 text-muted-foreground">
                    {post.likes}
                  </Text>
                </View>

                {/* 评论 */}
                <View 
                  className="flex items-center flex-1"
                  onClick={() => toggleCommentSection(post.id)}
                >
                  <MessageCircle size={24} color="#666" />
                  <Text className="block text-base ml-2 text-muted-foreground">
                    {post.comments}
                  </Text>
                </View>

                {/* 听帖子 */}
                <View className="flex-1 flex justify-end">
                  <TTSPlayer text={post.content} />
                </View>
              </View>

              {/* 评论区 */}
              {showComments === post.id && (
                <View className="border-t border-border px-5 py-4 bg-gray-50">
                  {/* 评论列表 */}
                  {comments[post.id]?.map((comment) => (
                    <View key={comment.id} className="flex items-start mb-4">
                      <SafeImage
                        src={comment.userAvatar}
                        className="w-10 h-10 rounded-full"
                        mode="aspectFill"
                      />
                      <View className="ml-3 flex-1">
                        <View className="flex items-center">
                          <Text className="block text-base font-medium text-foreground">
                            {comment.userName}
                          </Text>
                          <Text className="block text-sm text-muted-foreground ml-3">
                            {comment.time}
                          </Text>
                        </View>
                        <Text className="block text-base text-foreground mt-1">
                          {comment.content}
                        </Text>
                      </View>
                    </View>
                  ))}
                  
                  {(!comments[post.id] || comments[post.id].length === 0) && (
                    <Text className="block text-base text-muted-foreground text-center py-4">
                      暂无评论，快来抢沙发吧
                    </Text>
                  )}

                  {/* 输入框 */}
                  <View className="flex items-center mt-4 bg-white rounded-full px-4 py-2">
                    <View className="flex-1">
                      <Input
                        className="w-full bg-transparent text-base"
                        placeholder="写评论..."
                        value={newComment}
                        onInput={(e: any) => setNewComment(e.detail.value)}
                      />
                    </View>
                    <View 
                      className="ml-3 px-4 py-2 bg-primary rounded-full"
                      onClick={() => handleSendComment(post.id)}
                    >
                      <Text className="block text-base text-primary-foreground">发送</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* 发布按钮 */}
      <View 
        className="fixed right-5 bottom-24 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg"
        onClick={handlePublish}
      >
        <Plus size={28} color="#fff" />
      </View>
    </View>
  )
}
