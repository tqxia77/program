/**
 * 银龄乐圈 - 好友请求页面
 * 对接后端API：好友请求列表、同意、拒绝
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { SafeImage } from '@/components/safe-image'
import { ChevronLeft, UserPlus, Check, X, MessageCircle } from 'lucide-react-taro'
import { useFontMode } from '@/store/font-mode'
import { Network } from '@/network'
import Taro from '@tarojs/taro'

interface FriendRequest {
  id: string
  userId: string
  userName: string
  userAvatar: string
  role: '老人' | '子女'
  message?: string
  requestTime: string
}

// Mock数据
const mockRequests: FriendRequest[] = [
  {
    id: '1',
    userId: 'user1',
    userName: '赵阿姨',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    role: '老人',
    message: '您好，我也是社区的居民，想认识一下！',
    requestTime: '2026-05-07 10:30',
  },
  {
    id: '2',
    userId: 'user2',
    userName: '孙先生',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    role: '子女',
    message: '我爸和您是一个舞蹈队的',
    requestTime: '2026-05-07 09:15',
  },
  {
    id: '3',
    userId: 'user3',
    userName: '周奶奶',
    userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
    role: '老人',
    requestTime: '2026-05-06 16:45',
  },
]

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载好友请求列表 - 对接后端API
  const loadData = useCallback(async () => {
    setLoading(true)
    
    try {
      const res = await Network.request({
        url: '/api/friend-requests',
        method: 'GET'
      })
      
      if (res.data.code === 200 && res.data.data) {
        const data = res.data.data
        const list = Array.isArray(data) ? data : (data.list || [])
        
        setRequests(list.map((r: any) => ({
          id: r.id,
          userId: r.fromUser?.id || r.userId || '',
          userName: r.fromUser?.nickname || r.fromUser?.name || '用户',
          userAvatar: r.fromUser?.avatar || '',
          role: (r.fromUser?.role === 'elder' || r.fromUser?.role === '老人') ? '老人' : '子女',
          message: r.message || '',
          requestTime: r.createdAt || r.requestTime || ''
        })))
      }
    } catch (e) {
      console.log('获取好友请求API失败，使用Mock数据')
      setRequests(mockRequests)
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 返回
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 同意好友请求 - 对接后端API
  const handleAccept = async (request: FriendRequest) => {
    Taro.showModal({
      title: '添加好友',
      content: `确定同意 ${request.userName} 的好友申请吗？`,
      success: async (res) => {
        if (res.confirm) {
          // 先更新UI
          setRequests((prev) => prev.filter((r) => r.id !== request.id))
          
          try {
            // 调用后端API
            await Network.request({
              url: `/api/friend-requests/${request.id}/accept`,
              method: 'POST'
            })
            Taro.showToast({ title: '已添加好友', icon: 'success' })
          } catch (e) {
            console.log('同意好友请求API失败')
            // 回滚
            loadData()
            Taro.showToast({ title: '操作失败', icon: 'error' })
          }
        }
      },
    })
  }

  // 拒绝好友请求 - 对接后端API
  const handleReject = async (request: FriendRequest) => {
    Taro.showModal({
      title: '拒绝申请',
      content: `确定拒绝 ${request.userName} 的好友申请吗？`,
      success: async (res) => {
        if (res.confirm) {
          // 先更新UI
          setRequests((prev) => prev.filter((r) => r.id !== request.id))
          
          try {
            // 调用后端API
            await Network.request({
              url: `/api/friend-requests/${request.id}/reject`,
              method: 'POST'
            })
            Taro.showToast({ title: '已拒绝', icon: 'none' })
          } catch (e) {
            console.log('拒绝好友请求API失败')
            // 回滚
            loadData()
            Taro.showToast({ title: '操作失败', icon: 'error' })
          }
        }
      },
    })
  }

  // 查看用户资料
  const handleViewProfile = (_userId: string) => {
    Taro.showToast({ title: '查看用户资料', icon: 'none' })
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
          <Text className="block text-2xl font-bold text-foreground ml-2">好友请求</Text>
          {requests.length > 0 && (
            <View className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
              <Text className="block text-white text-sm">{requests.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 列表内容 */}
      <ScrollView scrollY className="flex-1">
        {loading ? (
          <View className="flex flex-col items-center justify-center py-20">
            <Text className="block text-lg text-muted-foreground">加载中...</Text>
          </View>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <View key={request.id} className="bg-white border-b border-border">
              <View
                className="flex items-center px-4 py-4"
                onClick={() => handleViewProfile(request.userId)}
              >
                {/* 头像 */}
                <SafeImage
                  src={request.userAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80'}
                  className="w-14 h-14 rounded-full"
                  mode="aspectFill"
                />

                {/* 用户信息 */}
                <View className="ml-4 flex-1">
                  <View className="flex items-center">
                    <Text className="block text-xl font-bold text-foreground">
                      {request.userName}
                    </Text>
                    <Text
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        request.role === '老人'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {request.role}
                    </Text>
                  </View>
                  <Text className="block text-base text-muted-foreground mt-1">
                    {request.requestTime}
                  </Text>
                  {request.message && (
                    <View className="flex items-center mt-2">
                      <MessageCircle color="#999999" size={16} />
                      <Text className="block text-base text-muted-foreground ml-2">
                        {request.message}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 操作按钮 */}
              <View className="flex px-4 pb-4">
                {/* 拒绝按钮 */}
                <View
                  className="flex-1 flex items-center justify-center py-3 mr-2 rounded-full bg-gray-100"
                  onClick={() => handleReject(request)}
                >
                  <X color="#666666" size={20} />
                  <Text className="block text-base text-muted-foreground ml-2">拒绝</Text>
                </View>
                {/* 同意按钮 */}
                <View
                  className="flex-1 flex items-center justify-center py-3 ml-2 rounded-full bg-primary"
                  onClick={() => handleAccept(request)}
                >
                  <Check color="#ffffff" size={20} />
                  <Text className="block text-base text-white ml-2">同意</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
              <UserPlus color="#CCCCCC" size={48} />
            </View>
            <Text className="block text-xl text-foreground font-medium">暂无好友请求</Text>
            <Text className="block text-base text-muted-foreground mt-2">
              当有人申请添加你为好友时，会在这里显示
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
