/**
 * 银龄乐圈 - 邻里圈（社区互动）
 * 类似朋友圈的极简版动态展示，支持评论功能
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Input } from '@/components/ui/input'
import { Heart, MessageCircle, Plus } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { getPosts, togglePostLike, getLikedPostIds, type Post } from '@/store/mock-data'
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

export default function Neighborhood() {
  const [posts, setPosts] = useState<Post[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [showComments, setShowComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载动态数据
  const loadPosts = useCallback(() => {
    const allPosts = getPosts()
    const liked = getLikedPostIds()
    setPosts(allPosts)
    setLikedIds(liked)
    
    // 加载评论
    const storedComments = Taro.getStorageSync('postComments') || {}
    setComments(storedComments)
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

  // 切换评论显示
  const toggleCommentSection = (postId: string) => {
    setShowComments(prev => prev === postId ? null : postId)
    setNewComment('')
  }

  // 发送评论
  const handleSendComment = (postId: string) => {
    if (!newComment.trim()) return
    
    const storedComments = Taro.getStorageSync('postComments') || {}
    const postComments = storedComments[postId] || []
    
    const newCommentItem: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      userName: '我',
      userAvatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=60',
      content: newComment.trim(),
      time: '刚刚'
    }
    
    storedComments[postId] = [...postComments, newCommentItem]
    Taro.setStorageSync('postComments', storedComments)
    
    setComments({ ...storedComments })
    setNewComment('')
    
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
        {posts.map((post) => (
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
            {post.images.length > 0 && (
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

            {/* 底部互动栏 */}
            <View className="flex items-center px-5 py-4 border-t border-border">
              <View 
                className="flex items-center gap-3 px-5 py-3 rounded-full transition-colors bg-secondary"
                onClick={() => handleLike(post.id)}
              >
                <Heart 
                  size={24} 
                  color={likedIds.includes(post.id) ? '#EF4444' : '#999999'}
                  filled={likedIds.includes(post.id)}
                />
                <Text className={`block text-lg ${
                  likedIds.includes(post.id) 
                    ? 'text-red-500 font-medium' 
                    : 'text-foreground'
                }`}
                >
                  {post.likes}
                </Text>
              </View>

              {/* 听帖子按钮 */}
              <TTSPlayer text={post.content} showButton />

              <View 
                className="flex items-center gap-3 ml-4 px-5 py-3 rounded-full transition-colors bg-secondary"
                onClick={() => toggleCommentSection(post.id)}
              >
                <MessageCircle size={24} color="#666666" />
                <Text className="block text-lg text-foreground">{post.comments}</Text>
              </View>
            </View>

            {/* 评论区域 */}
            {showComments === post.id && (
              <View className="px-5 pb-4 border-t border-border pt-4">
                {/* 评论列表 */}
                {(comments[post.id] || []).length > 0 ? (
                  <View className="mb-4">
                    {comments[post.id].map((comment) => (
                      <View key={comment.id} className="flex items-start gap-3 mb-3 pb-3 border-b border-border last:border-0">
                        <SafeImage
                          src={comment.userAvatar}
                          className="w-10 h-10 rounded-full"
                          mode="aspectFill"
                        />
                        <View className="flex-1">
                          <View className="flex items-center gap-2">
                            <Text className="block text-lg font-medium text-primary">{comment.userName}</Text>
                            <Text className="block text-sm text-muted-foreground">{comment.time}</Text>
                          </View>
                          <Text className="block text-base text-foreground mt-1 leading-relaxed">
                            {comment.content}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="mb-4 py-4 text-center">
                    <Text className="block text-base text-muted-foreground">暂无评论，快来抢沙发吧~</Text>
                  </View>
                )}

                {/* 评论输入框 */}
                <View className="mt-3">
                  <View className="bg-secondary rounded-2xl px-4 py-3 flex items-center">
                    <View className="flex-1">
                      <Input
                        className="comment-input text-base text-foreground"
                        type="text"
                        placeholder="写下你的评论..."
                        placeholderClass="text-muted-foreground"
                        value={newComment}
                        onInput={(e: any) => setNewComment(e.detail.value)}
                        maxlength={200}
                      />
                    </View>
                    <View 
                      className="ml-3 bg-primary rounded-full px-5 py-2 active:bg-primary"
                      onClick={() => handleSendComment(post.id)}
                    >
                      <Text className="block text-white text-lg font-bold">发送</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
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
