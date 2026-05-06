/**
 * 图片选择器组件
 * 支持选择、预览、删除图片，最多9张
 */

import { useState, useCallback } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Plus, X, Eye } from 'lucide-react-taro'
import './index.css'

// 图片项
interface ImageItem {
  id: string
  url: string
  tempPath?: string // 本地临时路径
  uploading?: boolean
  uploadProgress?: number
}

// 图片选择器属性
interface ImagePickerProps {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  maxCount?: number // 最大图片数量，默认9
  disabled?: boolean
  showUploadButton?: boolean // 是否显示上传按钮
}

// 预设封面图片（用于测试）
const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80',
  'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80',
]

export default function ImagePicker({
  images,
  onChange,
  maxCount = 9,
  disabled = false,
  showUploadButton = true,
}: ImagePickerProps) {
  // 预览图片
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  // 选择本地图片
  const handleSelectFromAlbum = useCallback(async () => {
    if (disabled) return
    if (images.length >= maxCount) {
      Taro.showToast({ title: `最多选择${maxCount}张图片`, icon: 'none' })
      return
    }

    try {
      const res = await Taro.chooseImage({
        count: maxCount - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      if (res.tempFilePaths) {
        const newImages: ImageItem[] = res.tempFilePaths.map((path, index) => ({
          id: `local_${Date.now()}_${index}`,
          url: path,
          tempPath: path,
          uploading: true,
          uploadProgress: 0,
        }))

        // 添加新图片
        const updatedImages = [...images, ...newImages]
        onChange(updatedImages)

        // 逐个上传
        for (let i = 0; i < newImages.length; i++) {
          await uploadImage(images.length + i, res.tempFilePaths[i])
        }
      }
    } catch (error) {
      console.error('选择图片失败:', error)
      Taro.showToast({ title: '选择图片失败', icon: 'none' })
    }
  }, [disabled, images, maxCount, onChange])

  // 上传单张图片（TODO: 调用后端API）
  const uploadImage = async (index: number, tempPath: string) => {
    try {
      // TODO: 调用后端图片上传API
      // const res = await Network.uploadFile({
      //   url: '/api/upload/image',
      //   filePath: tempPath,
      //   name: 'image',
      // })

      // 模拟上传延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 模拟上传成功，生成URL
      const uploadedUrl = tempPath // 实际应从API返回

      // 更新图片状态
      const updatedImages = images.map((img, i) => {
        if (i === index) {
          return {
            ...img,
            url: uploadedUrl,
            uploading: false,
            uploadProgress: 100,
          }
        }
        return img
      })
      onChange(updatedImages)

    } catch (error) {
      console.error('上传图片失败:', error)
      // 更新为上传失败状态
      const updatedImages = images.map((img, i) => {
        if (i === index) {
          return {
            ...img,
            uploading: false,
          }
        }
        return img
      })
      onChange(updatedImages)
      Taro.showToast({ title: '图片上传失败', icon: 'none' })
    }
  }

  // 删除图片
  const handleDelete = useCallback((index: number) => {
    if (disabled) return
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }, [disabled, images, onChange])

  // 预览图片
  const handlePreview = useCallback((index: number) => {
    const urls = images.map((img) => img.url)
    Taro.previewImage({
      urls,
      current: urls[index],
    })
  }, [images])

  // 选择预设图片（测试用）
  const handleSelectPreset = useCallback(() => {
    if (images.length >= maxCount) {
      Taro.showToast({ title: `最多选择${maxCount}张图片`, icon: 'none' })
      return
    }

    // 显示预设图片选择（可用ActionSheet或Modal）
    Taro.showActionSheet({
      itemList: PRESET_IMAGES.map((_, i) => `预设图片 ${i + 1}`),
      success: (res) => {
        const newImage: ImageItem = {
          id: `preset_${Date.now()}`,
          url: PRESET_IMAGES[res.tapIndex],
        }
        onChange([...images, newImage])
      },
    })
  }, [disabled, images, maxCount, onChange])

  return (
    <View className="image-picker-container">
      {/* 已选择的图片 */}
      <View className="image-grid">
        {images.map((image, index) => (
          <View key={image.id} className="image-item">
            <Image
              className="image-preview"
              src={image.url}
              mode="aspectFill"
              onClick={() => handlePreview(index)}
            />
            
            {/* 上传中遮罩 */}
            {image.uploading && (
              <View className="upload-mask">
                <Text className="text-white text-sm">上传中...</Text>
              </View>
            )}
            
            {/* 删除按钮 */}
            {!disabled && !image.uploading && (
              <View 
                className="delete-button"
                onClick={() => handleDelete(index)}
              >
                <X size={14} color="#fff" />
              </View>
            )}
            
            {/* 预览按钮 */}
            {!disabled && (
              <View 
                className="preview-button"
                onClick={() => handlePreview(index)}
              >
                <Eye size={14} color="#fff" />
              </View>
            )}
          </View>
        ))}

        {/* 添加按钮 */}
        {!disabled && showUploadButton && images.length < maxCount && (
          <View className="add-button" onClick={handleSelectFromAlbum}>
            <Plus size={32} color="#999" />
            <Text className="block text-xs text-gray-400 mt-1">添加图片</Text>
          </View>
        )}
      </View>

      {/* 图片数量提示 */}
      <View className="image-tip flex justify-between items-center mt-3">
        <Text className="text-xs text-gray-400">
          {images.length}/{maxCount} 张图片
        </Text>
        
        {/* 预设图片按钮（开发调试用） */}
        {!disabled && (
          <Button 
            size="mini" 
            className="bg-gray-100 text-gray-500"
            onClick={handleSelectPreset}
          >
            选择预设图片
          </Button>
        )}
      </View>

      {/* 图片预览（自定义，备用） */}
      {previewIndex !== null && (
        <View className="custom-preview" onClick={() => setPreviewIndex(null)}>
          <Image
            className="preview-image"
            src={images[previewIndex].url}
            mode="aspectFit"
          />
          <View className="preview-close" onClick={() => setPreviewIndex(null)}>
            <X size={24} color="#fff" />
          </View>
        </View>
      )}
    </View>
  )
}
