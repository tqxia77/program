/**
 * 银龄乐圈 - 好友列表页面
 * 展示关注列表和粉丝列表
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { SafeImage } from '@/components/safe-image'
import { ChevronLeft, Users } from 'lucide-react-taro'
import { useFontMode } from '@/store/font-mode'
import Taro from '@tarojs/taro'

interface Friend {
  id: string
  userId: string
  userName: string
  userAvatar: string
  role: '老人' | '子女'
  isFollowing: boolean // 是否已关注
  followTime?: string // 关注时间
}

type TabType = 'following' | 'followers'

export default function Friends() {
  const [activeTab, setActiveTab] = useState<TabType>('following')
  const [following, setFollowing] = useState<Friend[]>([])
  const [followers, setFollowers] = useState<Friend[]>([])
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  useEffect(() => {
    // 模拟关注列表数据
    const mockFollowing: Friend[] = [
      {
        id: '1',
        userId: 'user1',
        userName: '王秀英',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
        role: '老人',
        isFollowing: true,
        followTime: '2026-04-15',
      },
      {
        id: '2',
        userId: 'user2',
        userName: '张建国',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        role: '老人',
        isFollowing: true,
        followTime: '2026-04-20',
      },
      {
        id: '3',
        userId: 'user3',
        userName: '李阿姨',
        userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
        role: '老人',
        isFollowing: true,
        followTime: '2026-05-01',
      },
    ]

    // 模拟粉丝列表数据
    const mockFollowers: Friend[] = [
      {
        id: '4',
        userId: 'user4',
        userName: '陈伟',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        role: '子女',
        isFollowing: true,
        followTime: '2026-04-10',
      },
      {
        id: '5',
        userId: 'user5',
        userName: '刘淑芬',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
        role: '老人',
        isFollowing: false,
        followTime: '2026-05-05',
      },
    ]

    setFollowing(mockFollowing)
    setFollowers(mockFollowers)
  }, [])

  // 返回
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 切换关注/取消关注
  const handleToggleFollow = (friend: Friend) => {
    if (friend.isFollowing) {
      // 取消关注
      Taro.showModal({
        title: '取消关注',
        content: `确定取消关注 ${friend.userName} 吗？`,
        success: (res) => {
          if (res.confirm) {
            setFollowing((prev) => prev.filter((f) => f.id !== friend.id))
            setFollowers((prev) =>
              prev.map((f) =>
                f.id === friend.id ? { ...f, isFollowing: false } : f
              )
            )
            Taro.showToast({ title: '已取消关注', icon: 'success' })
          }
        },
      })
    } else {
      // 关注
      setFollowing((prev) => [...prev, { ...friend, isFollowing: true }])
      setFollowers((prev) =>
        prev.map((f) => (f.id === friend.id ? { ...f, isFollowing: true } : f))
      )
      Taro.showToast({ title: '关注成功', icon: 'success' })
    }
  }

  // 查看用户详情
  const handleViewProfile = (_userId: string) => {
    Taro.showToast({ title: '查看用户详情', icon: 'none' })
  }

  const currentList = activeTab === 'following' ? following : followers

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
          <Text className="block text-2xl font-bold text-foreground ml-2">我的关注</Text>
        </View>
      </View>

      {/* Tab切换 */}
      <View className="bg-white border-b border-border px-4">
        <View className="flex">
          <View
            className={`flex-1 py-4 text-center border-b-2 transition-colors ${
              activeTab === 'following'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setActiveTab('following')}
          >
            <Text className="block text-xl font-medium">关注 {following.length}</Text>
          </View>
          <View
            className={`flex-1 py-4 text-center border-b-2 transition-colors ${
              activeTab === 'followers'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            <Text className="block text-xl font-medium">粉丝 {followers.length}</Text>
          </View>
        </View>
      </View>

      {/* 列表内容 */}
      <ScrollView scrollY className="flex-1">
        {currentList.length > 0 ? (
          currentList.map((friend) => (
            <View
              key={friend.id}
              className="flex items-center px-4 py-4 bg-white border-b border-border"
              onClick={() => handleViewProfile(friend.userId)}
            >
              {/* 头像 */}
              <SafeImage
                src={friend.userAvatar}
                className="w-14 h-14 rounded-full"
                mode="aspectFill"
              />

              {/* 用户信息 */}
              <View className="ml-4 flex-1">
                <View className="flex items-center">
                  <Text className="block text-xl font-bold text-foreground">
                    {friend.userName}
                  </Text>
                  <Text
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      friend.role === '老人'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {friend.role}
                  </Text>
                </View>
                {friend.followTime && (
                  <Text className="block text-base text-muted-foreground mt-1">
                    {activeTab === 'following' ? '关注于' : '关注了你'} {friend.followTime}
                  </Text>
                )}
              </View>

              {/* 操作按钮 */}
              <View
                className={`px-4 py-2 rounded-full text-base font-medium ${
                  friend.isFollowing
                    ? 'bg-gray-100 text-muted-foreground'
                    : 'bg-primary text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFollow(friend)
                }}
              >
                <Text
                  className={`block ${
                    friend.isFollowing ? 'text-muted-foreground' : 'text-white'
                  }`}
                >
                  {friend.isFollowing ? '已关注' : '关注'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Users color="#CCCCCC" size={48} />
            </View>
            <Text className="block text-xl text-foreground font-medium">
              {activeTab === 'following' ? '暂无关注' : '暂无粉丝'}
            </Text>
            <Text className="block text-base text-muted-foreground mt-2">
              {activeTab === 'following' ? '快去关注感兴趣的人吧' : '还没有人关注你'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
