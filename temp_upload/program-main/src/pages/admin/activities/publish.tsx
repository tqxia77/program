/**
 * 银龄乐圈 - 活动发布/编辑页面
 * 支持创建新活动和编辑已有活动
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Image as ImageIcon } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { SafeImage } from '@/components/safe-image'
import { useFontMode } from '@/store/font-mode'

// 分类选项
const CATEGORIES = ['文体娱乐', '健康养生', '社区服务'] as const
type Category = typeof CATEGORIES[number]

// 表单数据接口
interface ActivityForm {
  title: string
  category: Category
  imageUrl: string
  date: string
  time: string
  location: string
  description: string
  capacity: number
}

export default function PublishActivity() {
  const [form, setForm] = useState<ActivityForm>({
    title: '',
    category: '文体娱乐',
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: 30
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { fontMode } = useFontMode()
  const fontModeClass = fontMode === 'large' ? 'font-mode-large' : 'font-mode-normal'

  // 预设图片选项
  const PRESET_IMAGES = [
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&q=80',
    'https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=800&q=80',
  ]

  // 加载编辑数据
  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const id = (currentPage as any).options?.id
    
    if (id) {
      setEditingId(id)
      loadActivity(id)
    }
  }, [])

  const loadActivity = async (id: string) => {
    try {
      console.log('[PublishActivity] 加载活动:', id)
      const res = await Network.request({
        url: `/api/activities/${id}`,
        method: 'GET'
      })
      console.log('[PublishActivity] 响应:', res.data)
      
      if (res.data?.code === 200) {
        const activity = res.data.data
        setForm({
          title: activity.title || '',
          category: activity.category || '文体娱乐',
          imageUrl: activity.imageUrl || '',
          date: activity.date || '',
          time: activity.time || '',
          location: activity.location || '',
          description: activity.description || '',
          capacity: activity.capacity || 30
        })
      }
    } catch (error) {
      console.error('[PublishActivity] 加载失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }

  // 更新表单字段
  const updateField = (field: keyof ActivityForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // 选择图片
  const selectImage = (url: string) => {
    updateField('imageUrl', url)
  }

  // 验证表单
  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入活动标题', icon: 'none' })
      return false
    }
    if (!form.date) {
      Taro.showToast({ title: '请选择活动日期', icon: 'none' })
      return false
    }
    if (!form.time) {
      Taro.showToast({ title: '请输入活动时间', icon: 'none' })
      return false
    }
    if (!form.location.trim()) {
      Taro.showToast({ title: '请输入活动地点', icon: 'none' })
      return false
    }
    if (!form.description.trim()) {
      Taro.showToast({ title: '请输入活动描述', icon: 'none' })
      return false
    }
    if (form.capacity <= 0) {
      Taro.showToast({ title: '请输入有效的人数上限', icon: 'none' })
      return false
    }
    return true
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setSubmitting(true)
    try {
      const url = editingId ? `/api/activities/${editingId}` : '/api/activities'
      const method = editingId ? 'PUT' : 'POST'
      
      console.log('[PublishActivity] 提交表单:', { url, method, form })
      const res = await Network.request({
        url,
        method,
        data: form
      })
      console.log('[PublishActivity] 响应:', res.data)
      
      if (res.data?.code === 200) {
        Taro.showToast({ 
          title: editingId ? '修改成功' : '发布成功', 
          icon: 'success' 
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('[PublishActivity] 提交失败:', error)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  // 返回
  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className={`min-h-screen bg-background ${fontModeClass}`}>
      {/* 页面标题 */}
      <View className="bg-white border-b border-border px-5 py-5">
        <View className="flex items-center justify-between">
          <Text className="block text-3xl font-bold text-foreground">
            {editingId ? '编辑活动' : '发布活动'}
          </Text>
          <View 
            className="px-4 py-2 rounded-full bg-secondary"
            onClick={handleBack}
          >
            <Text className="block text-foreground text-base">取消</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className="px-4 py-4" style={{ height: 'calc(100vh - 120px)' }}>
        {/* 活动标题 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">活动标题 *</Text>
          <View className="bg-white rounded-xl px-4 py-3">
            <Input
              className="w-full text-lg"
              placeholder="请输入活动标题"
              value={form.title}
              onInput={(e: any) => updateField('title', e.detail.value)}
              maxlength={100}
            />
          </View>
        </View>

        {/* 活动分类 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">活动分类 *</Text>
          <View className="flex gap-3">
            {CATEGORIES.map((cat) => (
              <View
                key={cat}
                className={`px-4 py-3 rounded-full text-base font-medium ${
                  form.category === cat 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-foreground border border-border'
                }`}
                onClick={() => updateField('category', cat)}
              >
                <Text className="block">{cat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 活动图片 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">活动封面图 *</Text>
          <View className="bg-white rounded-xl p-4">
            {/* 当前选中的图片 */}
            {form.imageUrl && (
              <SafeImage
                src={form.imageUrl}
                className="w-full h-48 rounded-xl mb-3"
                mode="aspectFill"
              />
            )}
            {/* 图片选择 */}
            <Text className="block text-base text-muted-foreground mb-2">选择封面图：</Text>
            <ScrollView scrollX>
              <View className="flex gap-3">
                {PRESET_IMAGES.map((url, index) => (
                  <View
                    key={index}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      form.imageUrl === url ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => selectImage(url)}
                  >
                    <SafeImage src={url} className="w-full h-full" mode="aspectFill" />
                    {form.imageUrl === url && (
                      <View className="absolute inset-0 bg-primary bg-opacity-30 flex items-center justify-center">
                        <Text className="block text-white text-sm">已选</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* 活动日期 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">活动日期 *</Text>
          <View className="bg-white rounded-xl px-4 py-3 flex items-center">
            <Calendar color="#999999" size={24} />
            <View className="ml-3 flex-1">
              <Input
                className="w-full text-lg"
                placeholder="请输入日期，如：2026-05-15"
                value={form.date}
                onInput={(e: any) => updateField('date', e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 活动时间 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">活动时间 *</Text>
          <View className="bg-white rounded-xl px-4 py-3 flex items-center">
            <Clock color="#999999" size={24} />
            <View className="ml-3 flex-1">
              <Input
                className="w-full text-lg"
                placeholder="请输入时间，如：09:00 - 11:00"
                value={form.time}
                onInput={(e: any) => updateField('time', e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 活动地点 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">活动地点 *</Text>
          <View className="bg-white rounded-xl px-4 py-3 flex items-center">
            <MapPin color="#999999" size={24} />
            <View className="ml-3 flex-1">
              <Input
                className="w-full text-lg"
                placeholder="请输入活动地点"
                value={form.location}
                onInput={(e: any) => updateField('location', e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 人数上限 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">人数上限 *</Text>
          <View className="bg-white rounded-xl px-4 py-3 flex items-center">
            <ImageIcon color="#999999" size={24} />
            <View className="ml-3 flex-1">
              <Input
                className="w-full text-lg"
                type="number"
                placeholder="请输入人数上限"
                value={form.capacity.toString()}
                onInput={(e: any) => updateField('capacity', parseInt(e.detail.value) || 0)}
              />
            </View>
          </View>
        </View>

        {/* 活动描述 */}
        <View className="mb-6">
          <Text className="block text-lg font-medium text-foreground mb-2">活动描述 *</Text>
          <View className="bg-white rounded-xl p-4">
            <Textarea
              style={{ width: '100%', minHeight: '150px', backgroundColor: 'transparent' }}
              placeholder="请输入活动详细描述..."
              value={form.description}
              onInput={(e: any) => updateField('description', e.detail.value)}
              maxlength={2000}
            />
            <Text className="block text-right text-sm text-muted-foreground mt-2">
              {form.description.length}/2000
            </Text>
          </View>
        </View>

        {/* 提交按钮 */}
        <View className="mb-8">
          <Button
            className="w-full bg-primary text-white text-lg py-4 rounded-xl"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Text className="block text-white text-xl font-bold">
              {submitting ? '提交中...' : (editingId ? '保存修改' : '发布活动')}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}
