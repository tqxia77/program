/**
 * 银龄乐圈 - 子女绑定设置页面
 * 支持添加子女手机号和名称
 */

import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { ChevronLeft, Plus, User, Phone, Trash2 } from 'lucide-react-taro'
import { Input } from '@/components/ui/input'
import Taro from '@tarojs/taro'

// 子女信息类型
interface ChildInfo {
  id: string
  name: string
  phone: string
}

export default function ChildBinding() {
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  // 获取状态栏高度
  const statusBarHeight = Taro.getStorageSync('statusBarHeight') || 0

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  // 显示添加表单
  const handleShowAddForm = () => {
    setShowAddForm(true)
    setNewName('')
    setNewPhone('')
  }

  // 取消添加
  const handleCancelAdd = () => {
    setShowAddForm(false)
    setNewName('')
    setNewPhone('')
  }

  // 添加子女
  const handleAddChild = () => {
    if (!newName.trim()) {
      Taro.showToast({
        title: '请输入子女姓名',
        icon: 'none',
        duration: 1500
      })
      return
    }
    if (!newPhone.trim()) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 1500
      })
      return
    }
    // 简单验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(newPhone.trim())) {
      Taro.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 1500
      })
      return
    }

    const newChild: ChildInfo = {
      id: `child_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim()
    }

    setChildren([...children, newChild])
    setShowAddForm(false)
    setNewName('')
    setNewPhone('')

    Taro.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 1500
    })
  }

  // 删除子女
  const handleDeleteChild = (childId: string) => {
    Taro.showModal({
      title: '删除确认',
      content: '确定要解除与该子女的绑定吗？',
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setChildren(children.filter(child => child.id !== childId))
          Taro.showToast({
            title: '已解除绑定',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }

  return (
    <View className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <View 
        className="bg-white border-b border-border px-5"
        style={{ paddingTop: statusBarHeight + 'px' }}
      >
        <View className="flex items-center justify-between h-16">
          <View 
            className="w-12 h-12 flex items-center justify-center rounded-full"
            onClick={handleGoBack}
          >
            <ChevronLeft color="#333333" size={30} />
          </View>
          <Text className="text-2xl font-bold text-foreground">子女绑定设置</Text>
          <View className="w-16" />
        </View>
      </View>

      {/* 内容区域 */}
      <View className="flex-1 px-5 py-6">
        {/* 说明文字 */}
        <View className="bg-primary bg-opacity-10 rounded-2xl p-5 mb-6">
          <Text className="block text-lg text-foreground leading-relaxed">
            绑定子女账号后，您的活动报名、安全提醒等信息将同步通知给绑定的子女，让他们也能关心您的社区生活。
          </Text>
        </View>

        {/* 已绑定列表 */}
        {children.length > 0 && (
          <View className="mb-6">
            <Text className="block text-xl font-bold text-foreground mb-4">
              已绑定子女 ({children.length})
            </Text>
            <View className="bg-white rounded-2xl card-shadow overflow-hidden">
              {children.map((child, index) => (
                <View key={child.id}>
                  {index > 0 && <View className="h-px bg-border mx-5" />}
                  <View className="flex items-center px-5 py-5">
                    <View className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                      <User color="#FF6B00" size={28} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="block text-xl font-medium text-foreground">{child.name}</Text>
                      <View className="flex items-center gap-2 mt-1">
                        <Phone color="#999999" size={16} />
                        <Text className="block text-base text-muted-foreground">{child.phone}</Text>
                      </View>
                    </View>
                    <View 
                      className="w-12 h-12 bg-error bg-opacity-10 rounded-full flex items-center justify-center"
                      onClick={() => handleDeleteChild(child.id)}
                    >
                      <Trash2 color="#E53935" size={22} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 添加表单 */}
        {showAddForm ? (
          <View className="bg-white rounded-2xl card-shadow p-5">
            <Text className="block text-xl font-bold text-foreground mb-5">添加子女信息</Text>
            
            {/* 姓名 */}
            <View className="mb-5">
              <Text className="block text-lg font-medium text-foreground mb-3">子女姓名</Text>
              <View className="bg-secondary rounded-2xl px-4 py-4">
                <Input
                  value={newName}
                  onInput={(e: any) => setNewName(e.detail.value)}
                  placeholder="请输入子女姓名"
                  maxlength={20}
                  className="text-xl"
                />
              </View>
            </View>

            {/* 手机号 */}
            <View className="mb-6">
              <Text className="block text-lg font-medium text-foreground mb-3">手机号码</Text>
              <View className="bg-secondary rounded-2xl px-4 py-4">
                <Input
                  type="number"
                  value={newPhone}
                  onInput={(e: any) => setNewPhone(e.detail.value)}
                  placeholder="请输入手机号码"
                  maxlength={11}
                  className="text-xl"
                />
              </View>
              <Text className="block text-sm text-muted-foreground mt-2">
                请确保手机号码正确，子女将收到绑定邀请
              </Text>
            </View>

            {/* 按钮 */}
            <View className="flex gap-4">
              <View 
                className="flex-1 py-4 rounded-2xl bg-secondary text-center"
                onClick={handleCancelAdd}
              >
                <Text className="block text-xl font-medium text-foreground">取消</Text>
              </View>
              <View 
                className="flex-1 py-4 rounded-2xl bg-primary text-center active:bg-primary"
                onClick={handleAddChild}
              >
                <Text className="block text-xl font-medium text-white">确认添加</Text>
              </View>
            </View>
          </View>
        ) : (
          <View 
            className="bg-primary rounded-2xl p-5 flex items-center justify-center active:bg-primary"
            onClick={handleShowAddForm}
          >
            <Plus color="#FFFFFF" size={28} />
            <Text className="block text-xl font-bold text-white ml-3">添加子女</Text>
          </View>
        )}

        {/* 空状态 */}
        {children.length === 0 && !showAddForm && (
          <View className="flex flex-col items-center py-12">
            <User color="#CCCCCC" size={64} />
            <Text className="block text-lg text-muted-foreground mt-4">暂无绑定子女</Text>
            <Text className="block text-base text-muted-foreground mt-2">点击上方按钮添加子女信息</Text>
          </View>
        )}
      </View>
    </View>
  )
}
