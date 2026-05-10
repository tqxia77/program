/**
 * 银龄乐圈 - 帖子详情页面
 * 对接后端API：帖子详情、点赞、评论、关注
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Input } from '@/components/ui/input'
import { SafeImage } from '@/components/safe-image'
import { TTSPlayer } from '@/components/tts'
import { VoiceComment } from '@/components/voice'
import { Heart, MessageCircle, Share2, ChevronLeft, Send, UserPlus, UserCheck } from 'lucide-react-taro'
import { useFontMode } from '@/store/font-mode'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { getPosts, getLikedPostIds, getUserProfile } from '@/store/mock-data'

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  voiceText?: string
  isVoice?: boolean
  createTime: string
}

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

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [commentText, setCommentText] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'
  const currentUser = getUserProfile()

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
    // 获取帖子ID
    const id = Taro.getStorageSync('currentPostId')
    
    const loadPostData = async () => {
      setLoading(true)
      
      if (id) {
        try {
          // 调用后端API获取帖子详情
          const res = await Network.request({
            url: `/api/posts/${id}`,
            method: 'GET'
          })
          
          console.log('帖子详情API响应:', res.data)
          
          if (res.data.code === 200 && res.data.data) {
            const postData = res.data.data
            const formattedPost: Post = {
              id: postData.id,
              userId: postData.userId,
              userName: postData.author?.nickname || postData.userName || '用户',
              userAvatar: postData.author?.avatar || postData.userAvatar || '',
              content: postData.content,
              images: postData.images || [],
              likes: postData.likeCount || 0,
              comments: postData.commentCount || 0,
              publishTime: formatTime(postData.createdAt)
            }
            setPost(formattedPost)
            
            // 获取评论列表
            try {
              const commentsRes = await Network.request({
                url: `/api/posts/${id}/comments`,
                method: 'GET'
              })
              
              if (commentsRes.data.code === 200 && commentsRes.data.data) {
                const commentList = Array.isArray(commentsRes.data.data) 
                  ? commentsRes.data.data 
                  : commentsRes.data.data.list || []
                
                setComments(commentList.map((c: any) => ({
                  id: c.id,
                  userId: c.userId,
                  userName: c.author?.nickname || c.userName || '用户',
                  userAvatar: c.author?.avatar || c.userAvatar || '',
                  content: c.content || '',
                  voiceText: c.voiceText,
                  isVoice: !!c.voiceText,
                  createTime: formatTime(c.createdAt)
                })))
              }
            } catch (e) {
              console.log('获取评论列表失败')
            }
          }
        } catch (error) {
          console.log('帖子详情API失败，使用Mock数据:', error)
          // 降级到Mock数据
          const posts = getPosts()
          const foundPost = posts.find(p => p.id === id)
          if (foundPost) {
            setPost(foundPost)
          }
        }
      } else {
        // 从URL参数获取
        const pages = Taro.getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const postId = (currentPage as any).options?.id || id
        
        if (postId) {
          try {
            const res = await Network.request({
              url: `/api/posts/${postId}`,
              method: 'GET'
            })
            
            if (res.data.code === 200 && res.data.data) {
              const postData = res.data.data
              setPost({
                id: postData.id,
                userId: postData.userId,
                userName: postData.author?.nickname || '用户',
                userAvatar: postData.author?.avatar || '',
                content: postData.content,
                images: postData.images || [],
                likes: postData.likeCount || 0,
                comments: postData.commentCount || 0,
                publishTime: formatTime(postData.createdAt)
              })
            }
          } catch (error) {
            console.log('帖子详情API失败')
          }
        }
      }
      
      // 加载点赞状态
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
        setLikedIds(getLikedPostIds())
      }
      
      setLoading(false)
    }
    
    loadPostData()
  }, [])

  // 返回
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 点赞 - 对接后端API
  const handleLike = async () => {
    if (!post) return
    
    const isCurrentlyLiked = likedIds.includes(post.id)
    
    // 先更新UI
    setLikedIds(prev => 
      isCurrentlyLiked 
        ? prev.filter(id => id !== post.id)
        : [...prev, post.id]
    )
    setPost({
      ...post,
      likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
    })
    
    try {
      // 调用后端API
      if (isCurrentlyLiked) {
        await Network.request({
          url: `/api/posts/${post.id}/like`,
          method: 'DELETE'
        })
      } else {
        await Network.request({
          url: `/api/posts/${post.id}/like`,
          method: 'POST'
        })
      }
    } catch (error) {
      console.log('点赞API失败，回滚状态')
      setLikedIds(prev => 
        isCurrentlyLiked 
          ? [...prev, post.id]
          : prev.filter(id => id !== post.id)
      )
      setPost({
        ...post,
        likes: isCurrentlyLiked ? post.likes + 1 : post.likes - 1,
      })
    }
  }

  // 关注 - 对接后端API
  const handleFollow = async () => {
    if (!post) return
    
    const newFollowingState = !isFollowing
    
    // 先更新UI
    setIsFollowing(newFollowingState)
    
    try {
      // 调用后端API
      if (newFollowingState) {
        await Network.request({
          url: `/api/users/${post.userId}/follow`,
          method: 'POST'
        })
        Taro.showToast({ title: '关注成功', icon: 'success' })
      } else {
        await Network.request({
          url: `/api/users/${post.userId}/follow`,
          method: 'DELETE'
        })
        Taro.showToast({ title: '已取消关注', icon: 'success' })
      }
    } catch (error) {
      console.log('关注API失败，回滚状态')
      setIsFollowing(!newFollowingState)
      Taro.showToast({ title: '操作失败', icon: 'error' })
    }
  }

  // 发送评论 - 对接后端API
  const handleSendComment = async () => {
    if (!commentText.trim() || !post) return
    
    const tempComment: Comment = {
      id: `temp_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
      createTime: '刚刚'
    }
    
    // 先显示到UI
    setComments([...comments, tempComment])
    setCommentText('')
    setPost({
      ...post,
      comments: post.comments + 1,
    })
    
    try {
      // 调用后端API
      await Network.request({
        url: `/api/posts/${post.id}/comments`,
        method: 'POST',
        data: { content: commentText.trim() }
      })
      
      Taro.showToast({ title: '评论成功', icon: 'success' })
    } catch (error) {
      console.log('评论API失败')
      Taro.showToast({ title: '评论失败', icon: 'error' })
    }
  }

  // 处理语音评论 - 对接后端API
  const handleVoiceComment = async (text: string) => {
    if (!post) return
    
    const tempComment: Comment = {
      id: `temp_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: '',
      voiceText: text,
      isVoice: true,
      createTime: '刚刚'
    }
    
    // 先显示到UI
    setComments([...comments, tempComment])
    setPost({
      ...post,
      comments: post.comments + 1,
    })
    
    try {
      // 调用后端API
      await Network.request({
        url: `/api/posts/${post.id}/comments`,
        method: 'POST',
        data: { content: '', voiceText: text }
      })
      
      Taro.showToast({ title: '评论成功', icon: 'success' })
    } catch (error) {
      console.log('语音评论API失败')
    }
  }

  // 分享
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
    })
  }

  if (loading) {
    return (
      <View className={`min-h-screen bg-background flex items-center justify-center ${fontModeClass}`}>
        <Text className="block text-lg text-muted-foreground">加载中...</Text>
      </View>
    )
  }

  if (!post) {
    return (
      <View className={`min-h-screen bg-background flex items-center justify-center ${fontModeClass}`}>
        <Text className="block text-lg text-muted-foreground">帖子不存在</Text>
      </View>
    )
  }

  return (
    <View className={`min-h-screen bg-background ${fontModeClass}`}>
      {/* 顶部导航 */}
      <View className="bg-white border-b border-border px-4 py-4 sticky top-0 z-50">
        <View className="flex items-center">
          <View 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary active:bg-gray-200"
            onClick={handleGoBack}
          >
            <ChevronLeft color="#333333" size={28} />
          </View>
          <Text className="block text-2xl font-bold text-foreground ml-2">帖子详情</Text>
        </View>
      </View>

      <ScrollView scrollY className="pb-24" style={{ height: 'calc(100vh - 140px)' }}>
        {/* 用户信息 */}
        <View className="bg-white px-5 py-5">
          <View className="flex items-center">
            <SafeImage
              src={post.userAvatar}
              className="w-14 h-14 rounded-full"
              mode="aspectFill"
            />
            <View className="ml-4 flex-1">
              <Text className="block text-xl font-bold text-foreground">{post.userName}</Text>
              <Text className="block text-base text-muted-foreground">{post.publishTime}</Text>
            </View>
            {!isFollowing && post.userId !== currentUser.id && (
              <View 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full active:opacity-80"
                onClick={handleFollow}
              >
                <UserPlus color="#FFFFFF" size={18} />
                <Text className="block text-base font-medium">关注</Text>
              </View>
            )}
            {isFollowing && post.userId !== currentUser.id && (
              <View className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-muted-foreground rounded-full">
                <UserCheck color="#666666" size={18} />
                <Text className="block text-base font-medium">已关注</Text>
              </View>
            )}
          </View>
        </View>

        {/* 文字内容 */}
        <View className="bg-white px-5 pb-5">
          <View className="flex items-start justify-between">
            <Text className="block text-lg text-foreground leading-relaxed whitespace-pre-wrap flex-1">
              {post.content}
            </Text>
            {/* 听帖子按钮 */}
            <TTSPlayer text={post.content} />
          </View>
        </View>

        {/* 图片 */}
        {post.images && post.images.length > 0 && (
          <View className="bg-white px-5 pb-5">
            <View className={post.images.length === 1 ? '' : 'grid grid-cols-2 gap-2'}>
              {post.images.map((img, index) => (
                <SafeImage
                  key={index}
                  src={img}
                  className={`object-cover ${post.images.length === 1 ? 'w-full h-80 rounded-xl' : 'w-full h-44 rounded-xl'}`}
                  mode="aspectFill"
                />
              ))}
            </View>
          </View>
        )}

        {/* 互动栏 */}
        <View className="bg-white px-5 py-4 border-t border-border">
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-8">
              {/* 点赞 */}
              <View 
                className="flex items-center gap-2 py-2 px-4 rounded-full bg-secondary active:bg-gray-200"
                onClick={handleLike}
              >
                <Heart 
                  color={likedIds.includes(post.id) ? '#EF4444' : '#666666'} 
                  size={24}
                />
                <Text className={`block text-lg font-medium ${likedIds.includes(post.id) ? 'text-red-500' : 'text-foreground'}`}>
                  {post.likes}
                </Text>
              </View>

              {/* 评论 */}
              <View className="flex items-center gap-2">
                <MessageCircle color="#666666" size={24} />
                <Text className="block text-lg text-foreground">{post.comments}</Text>
              </View>
            </View>

            {/* 分享 */}
            <View 
              className="flex items-center gap-2 py-2 px-4 rounded-full bg-secondary active:bg-gray-200"
              onClick={handleShare}
            >
              <Share2 color="#666666" size={24} />
              <Text className="block text-lg text-foreground">分享</Text>
            </View>
          </View>
        </View>

        {/* 评论列表 */}
        <View className="mt-4 px-4">
          <Text className="block text-xl font-bold text-foreground mb-4 px-2">评论 ({comments.length})</Text>
          
          {comments.length === 0 ? (
            <View className="bg-white rounded-2xl p-10 text-center">
              <Text className="block text-base text-muted-foreground">暂无评论，快来抢沙发吧</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} className="bg-white rounded-2xl p-5 mb-4">
                <View className="flex items-start">
                  <SafeImage
                    src={comment.userAvatar}
                    className="w-12 h-12 rounded-full"
                    mode="aspectFill"
                  />
                  <View className="ml-3 flex-1">
                    <View className="flex items-center justify-between">
                      <Text className="block text-lg font-bold text-foreground">{comment.userName}</Text>
                      <Text className="block text-sm text-muted-foreground">{comment.createTime}</Text>
                    </View>
                    
                    {/* 评论内容 */}
                    {comment.isVoice && comment.voiceText ? (
                      <View className="mt-2 bg-blue-50 rounded-xl p-4">
                        <Text className="block text-base text-blue-700 italic">{`"${comment.voiceText}"`}</Text>
                        <View className="mt-2 flex items-center gap-2">
                          <View className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          <Text className="block text-sm text-blue-500">语音输入</Text>
                        </View>
                      </View>
                    ) : (
                      <Text className="block text-base text-foreground mt-2 leading-relaxed">
                        {comment.content}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 底部评论输入栏 */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-4 z-50">
        <View className="flex items-center gap-3">
          <View className="flex-1 bg-gray-100 rounded-full px-5 py-3 flex items-center">
            <Input
              className="flex-1 text-base bg-transparent"
              placeholder="写评论..."
              value={commentText}
              onInput={(e: any) => setCommentText(e.detail.value)}
              onConfirm={handleSendComment}
            />
            {/* 语音评论 */}
            <VoiceComment onSubmit={handleVoiceComment} />
          </View>
          
          {/* 发送按钮 */}
          <View 
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              commentText.trim() ? 'bg-primary active:opacity-80' : 'bg-gray-200'
            }`}
            onClick={handleSendComment}
          >
            <Send color="#FFFFFF" size={22} />
          </View>
        </View>
      </View>
    </View>
  )
}
