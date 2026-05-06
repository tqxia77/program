/**
 * 银龄乐圈 - 帖子详情页面
 * 展示帖子完整内容和互动功能
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Input } from '@/components/ui/input'
import { SafeImage } from '@/components/safe-image'
import { TTSButton } from '@/components/tts'
import { VoiceComment } from '@/components/voice'
import { Heart, MessageCircle, Share2, ChevronLeft, Send, UserPlus, UserCheck } from 'lucide-react-taro'
import { useFontMode } from '@/store/font-mode'
import Taro from '@tarojs/taro'
import { getPosts, getUserProfile, getLikedPostIds, saveLikedPostId, removeLikedPostId } from '@/store/mock-data'

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  voiceText?: string  // 语音转文字内容
  isVoice?: boolean   // 是否为语音输入
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
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'
  const currentUser = getUserProfile()

  useEffect(() => {
    // 获取帖子ID
    const event = Taro.getStorageSync('currentPost') || {}
    if (event.id) {
      const posts = getPosts()
      const foundPost = posts.find(p => p.id === event.id)
      if (foundPost) {
        setPost(foundPost)
      }
    }
    
    // 加载点赞状态
    setLikedIds(getLikedPostIds())
    
    // 模拟评论数据
    const mockComments: Comment[] = [
      {
        id: '1',
        userId: 'user2',
        userName: '李阿姨',
        userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
        content: '这个活动太好了，我也想参加！',
        createTime: '2小时前',
      },
      {
        id: '2',
        userId: 'user3',
        userName: '王建国',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        content: '',
        voiceText: '报名了报名了，明天见！',
        isVoice: true,
        createTime: '1小时前',
      },
    ]
    setComments(mockComments)
  }, [])

  // 返回
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 点赞
  const handleLike = () => {
    if (!post) return
    
    let newLikedIds: string[]
    if (likedIds.includes(post.id)) {
      newLikedIds = removeLikedPostId(post.id)
    } else {
      newLikedIds = saveLikedPostId(post.id)
    }
    setLikedIds(newLikedIds)
    
    // 更新帖子点赞数
    setPost({
      ...post,
      likes: likedIds.includes(post.id) ? post.likes - 1 : post.likes + 1,
    })
  }

  // 关注
  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    Taro.showToast({
      title: isFollowing ? '已取消关注' : '关注成功',
      icon: 'success',
    })
  }

  // 发送评论
  const handleSendComment = () => {
    if (!commentText.trim()) return
    
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentText,
      createTime: '刚刚',
    }
    
    setComments([...comments, newComment])
    setCommentText('')
    
    // 更新评论数
    if (post) {
      setPost({
        ...post,
        comments: post.comments + 1,
      })
    }
  }

  // 处理语音评论
  const handleVoiceComment = (text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: '',
      voiceText: text,
      isVoice: true,
      createTime: '刚刚',
    }
    
    setComments([...comments, newComment])
    
    if (post) {
      setPost({
        ...post,
        comments: post.comments + 1,
      })
    }
  }

  // 分享
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
    })
  }

  if (!post) {
    return (
      <View className={`min-h-screen bg-background flex items-center justify-center ${fontModeClass}`}>
        <Text className="block text-lg text-muted-foreground">加载中...</Text>
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
            <TTSButton text={post.content} />
          </View>
        </View>

        {/* 图片 */}
        {post.images.length > 0 && (
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
                  filled={likedIds.includes(post.id)}
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
          
          {comments.map((comment) => (
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
          ))}
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
              onInput={(e) => setCommentText(e.detail.value)}
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
