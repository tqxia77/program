/**
 * 银龄乐圈 - 个人中心
 * 展示用户信息，支持报名管理、动态管理、资料编辑
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { Calendar, Settings, Users, MessageCircle, Type, Bell, ChevronRight, Heart, Pencil, X, CalendarPlus } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { 
  getUserProfile, 
  getSignedActivities, 
  getUserPosts, 
  removeSignedActivityId,
  deleteUserPost,
  type Activity, 
  type Post 
} from '../../store/mock-data'
import { useFontMode } from '../../store/font-mode'
import { SafeImage } from '../../components/safe-image'

export default function Profile() {
  const [userName, setUserName] = useState('银龄用户')
  const [userAvatar, setUserAvatar] = useState('')
  const [signedActivities, setSignedActivities] = useState<Activity[]>([])
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [showMyPosts, setShowMyPosts] = useState(false)
  
  // 字体模式
  const { toggleFontMode, isLargeMode, fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 加载用户数据和报名记录
  const loadUserData = useCallback(() => {
    const user = getUserProfile()
    setUserName(user.name)
    setUserAvatar(user.avatar)

    const signed = getSignedActivities()
    setSignedActivities(signed)

    const posts = getUserPosts()
    setUserPosts(posts)
  }, [])

  useEffect(() => {
    loadUserData()
    
    // 监听页面显示，刷新数据
    const page = Taro.getCurrentPages().pop()
    if (page) {
      page.onShow = () => {
        loadUserData()
      }
    }
  }, [loadUserData])

  // 切换显示我的动态
  const toggleMyPosts = () => {
    setShowMyPosts(prev => !prev)
  }

  // 取消报名
  const handleCancelSignUp = (activityId: string, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '取消报名',
      content: '确定要取消报名吗？',
      confirmText: '确定取消',
      cancelText: '保留报名',
      success: (res) => {
        if (res.confirm) {
          removeSignedActivityId(activityId)
          loadUserData()
          Taro.showToast({
            title: '已取消报名',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }

  // 删除动态
  const handleDeletePost = (postId: string, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '删除动态',
      content: '确定要删除这条动态吗？',
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          deleteUserPost(postId)
          loadUserData()
          Taro.showToast({
            title: '已删除',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }

  // 跳转到编辑资料页面
  const handleEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/edit-profile/index'
    })
  }

  // 跳转到子女绑定页面
  const handleChildBinding = () => {
    Taro.navigateTo({
      url: '/pages/child-binding/index'
    })
  }

  // 跳转到管理员活动管理页面
  const handleAdminActivities = () => {
    Taro.navigateTo({
      url: '/pages/admin/activities/index'
    })
  }

  // 跳转到我的点赞页面
  const handleMyLikes = () => {
    Taro.navigateTo({
      url: '/pages/my-likes/index'
    })
  }

  // 跳转到通知设置页面
  const handleNotificationSettings = () => {
    Taro.navigateTo({
      url: '/pages/notification-settings/index'
    })
  }

  // 大字体调节
  const handleFontSizeAdjust = () => {
    toggleFontMode()
    const mode = isLargeMode() ? '默认' : '大字体'
    Taro.showToast({
      title: `已切换为${mode}模式`,
      icon: 'none',
      duration: 1500
    })
  }

  return (
    <View className={`min-h-screen bg-background pb-20 ${fontModeClass}`}>
      {/* 用户信息卡片 */}
      <View className="bg-gradient-to-br from-primary to-primary-dark px-4 pt-8 pb-12">
        <View className="flex items-center">
          <View className="relative">
            <SafeImage
              src={userAvatar || 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=60'}
              className="w-28 h-28 rounded-full"
              mode="aspectFill"
            />

          </View>
          <View className="ml-4 flex-1">
            <Text className="block text-3xl font-bold text-white">{userName}</Text>
            <View className="flex items-center gap-2 mt-2">
              <View className="bg-white bg-opacity-20 rounded-full px-4 py-2">
                <Text className="block text-white text-base">银龄乐圈会员</Text>
              </View>
            </View>
          </View>
          {/* 编辑资料按钮 */}
          <View 
            className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            onClick={handleEditProfile}
          >
            <Pencil color="#FFFFFF" size={24} />
          </View>
        </View>
      </View>

      {/* 我的报名区域 */}
      <View className="px-4 -mt-6">
        <View className="bg-white rounded-2xl card-shadow overflow-hidden">
          <View className="flex items-center justify-between px-5 py-5 border-b border-border">
            <View className="flex items-center gap-3">
              <Calendar color="#FF6B00" size={26} />
              <Text className="block text-xl font-bold text-foreground">我的报名</Text>
              <View className="bg-primary bg-opacity-10 rounded-full px-3 py-1">
                <Text className="block text-primary text-base font-medium">{signedActivities.length}</Text>
              </View>
            </View>
          </View>

          {signedActivities.length > 0 ? (
            <View className="px-5 pb-5">
              {signedActivities.map((activity) => (
                <View 
                  key={activity.id}
                  className="flex items-center gap-4 py-4 border-b border-border last:border-0"
                >
                  <SafeImage
                    src={activity.imageUrl}
                    className="w-20 h-20 rounded-xl"
                    mode="aspectFill"
                  />
                  <View className="flex-1 min-w-0">
                    <Text className="block text-lg font-medium text-foreground truncate">
                      {activity.title}
                    </Text>
                    <Text className="block text-base text-muted-foreground mt-1">
                      {activity.date}
                    </Text>
                  </View>
                  <View 
                    className="bg-error bg-opacity-10 rounded-full px-4 py-2 active:bg-opacity-20"
                    onClick={(e) => handleCancelSignUp(activity.id, e)}
                  >
                    <Text className="block text-error text-base font-medium">取消报名</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="px-5 py-10 flex flex-col items-center">
              <Calendar color="#CCCCCC" size={56} />
              <Text className="block text-lg text-muted-foreground mt-4">暂无报名活动</Text>
              <Text className="block text-base text-muted-foreground mt-2">快去活动中心看看吧</Text>
            </View>
          )}
        </View>
      </View>

      {/* 我的动态区域 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl card-shadow overflow-hidden">
          <View 
            className="flex items-center justify-between px-5 py-5 border-b border-border active:bg-secondary"
            onClick={toggleMyPosts}
          >
            <View className="flex items-center gap-3">
              <MessageCircle color="#FF6B00" size={26} />
              <Text className="block text-xl font-bold text-foreground">我的动态</Text>
              <View className="bg-primary bg-opacity-10 rounded-full px-3 py-1">
                <Text className="block text-primary text-base font-medium">{userPosts.length}</Text>
              </View>
            </View>
            <View 
              className={`transition-transform ${showMyPosts ? 'rotate-90' : ''}`}
            >
              <ChevronRight color="#999999" size={24} />
            </View>
          </View>

          {/* 我的动态列表 */}
          {showMyPosts && (
            <View className="px-5 pb-5">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <View 
                    key={post.id}
                    className="py-4 border-b border-border last:border-0"
                  >
                    <View className="flex items-start gap-3 mb-2">
                      <View className="flex-1">
                        <View className="flex items-center gap-3 mb-2">
                          <SafeImage
                            src={post.userAvatar}
                            className="w-10 h-10 rounded-full"
                            mode="aspectFill"
                          />
                          <View className="flex-1">
                            <Text className="block text-base font-medium text-foreground">{post.userName}</Text>
                            <Text className="block text-sm text-muted-foreground">{post.publishTime}</Text>
                          </View>
                        </View>
                        <Text className="block text-base text-foreground leading-relaxed mb-2">
                          {post.content}
                        </Text>
                        {post.images.length > 0 && (
                          <View className="flex gap-2 flex-wrap mb-2">
                            {post.images.map((img, index) => (
                              <SafeImage
                                key={index}
                                src={img}
                                className="w-20 h-20 rounded-lg"
                                mode="aspectFill"
                              />
                            ))}
                          </View>
                        )}
                        <View className="flex items-center gap-4">
                          <View className="flex items-center gap-2">
                            <Heart color="#FF6B00" size={18} />
                            <Text className="block text-sm text-muted-foreground">{post.likes}</Text>
                          </View>
                          <View className="flex items-center gap-2">
                            <MessageCircle color="#FF6B00" size={18} />
                            <Text className="block text-sm text-muted-foreground">{post.comments}</Text>
                          </View>
                        </View>
                      </View>
                      {/* 删除按钮 */}
                      <View 
                        className="w-10 h-10 bg-error bg-opacity-10 rounded-full flex items-center justify-center"
                        onClick={(e) => handleDeletePost(post.id, e)}
                      >
                        <X color="#E53935" size={20} />
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-8 flex flex-col items-center">
                  <MessageCircle color="#CCCCCC" size={48} />
                  <Text className="block text-base text-muted-foreground mt-3">还没有发布过动态</Text>
                  <Text className="block text-sm text-muted-foreground mt-1">快去邻里圈发布第一条动态吧</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 菜单列表 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl card-shadow overflow-hidden">
          {[
            { 
              id: 'edit-profile', 
              title: '编辑资料', 
              icon: Pencil,
              action: handleEditProfile
            },
            { 
              id: 'admin-activities', 
              title: '活动管理', 
              icon: CalendarPlus,
              action: handleAdminActivities
            },
            { 
              id: 'binding', 
              title: '子女绑定设置', 
              icon: Users,
              action: handleChildBinding
            },
            { 
              id: 'my-likes', 
              title: '我的点赞', 
              icon: Heart,
              action: handleMyLikes
            },
            { 
              id: 'notification-settings', 
              title: '通知设置', 
              icon: Bell,
              action: handleNotificationSettings
            },
            { 
              id: 'settings', 
              title: '系统设置', 
              icon: Settings 
            }
          ].map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View className="h-px bg-border mx-5" />}
              <View 
                className="flex items-center justify-between px-5 py-5 active:bg-secondary"
                onClick={item.action}
              >
                <View className="flex items-center gap-4">
                  <View className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <item.icon color="#FF6B00" size={24} />
                  </View>
                  <Text className="block text-xl text-foreground">{item.title}</Text>
                </View>
                <ChevronRight color="#999999" size={24} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 适老化功能入口 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl card-shadow overflow-hidden">
          <View 
            className="flex items-center justify-between px-5 py-5 active:bg-secondary"
            onClick={handleFontSizeAdjust}
          >
            <View className="flex items-center gap-4">
              <View className={`w-14 h-14 rounded-full flex items-center justify-center ${isLargeMode() ? 'bg-primary' : 'bg-secondary'}`}>
                <Type color={isLargeMode() ? '#FFFFFF' : '#FF6B00'} size={26} />
              </View>
              <View>
                <Text className="block text-xl text-foreground">字体大小</Text>
                <Text className="block text-base text-muted-foreground mt-1">
                  {isLargeMode() ? '当前：大字体模式' : '当前：默认模式'}
                </Text>
              </View>
            </View>
            <View className="flex items-center">
              <View className={`px-4 py-2 rounded-full mr-2 ${isLargeMode() ? 'bg-primary' : 'bg-secondary'}`}>
                <Text className={`block text-lg font-medium ${isLargeMode() ? 'text-white' : 'text-foreground'}`}>
                  {isLargeMode() ? '大' : '标准'}
                </Text>
              </View>
              <ChevronRight color="#999999" size={24} />
            </View>
          </View>

          <View className="h-px bg-border mx-5" />

          <View className="flex items-center justify-between px-5 py-5">
            <View className="flex items-center gap-4">
              <View className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Bell color="#FF6B00" size={24} />
              </View>
              <View>
                <Text className="block text-xl text-foreground">消息通知</Text>
                <Text className="block text-base text-muted-foreground mt-1">活动报名、活动提醒</Text>
              </View>
            </View>
            <View className="bg-primary rounded-full px-4 py-2">
              <Text className="block text-white text-base font-medium">已开启</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 版本信息 */}
      <View className="mt-10 flex justify-center">
        <Text className="block text-base text-muted-foreground">银龄乐圈 v1.0.0</Text>
      </View>

      {/* 底部留白 */}
      <View className="h-20" />
    </View>
  )
}
