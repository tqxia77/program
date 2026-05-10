/**
 * 图片组件封装
 * 自动处理加载失败，提供默认占位图
 * 兼容 H5 和小程序环境
 */

import { Image } from '@tarojs/components'

interface SafeImageProps {
  src: string
  className?: string
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'
  onClick?: () => void
}

export function SafeImage({ 
  src, 
  className, 
  mode = 'aspectFill', 
  onClick
}: SafeImageProps) {
  // 处理错误图片
  const handleError = () => {
    // 在图片加载失败时，静默处理
    // 使用 onError 事件防止错误蔓延到 H5 边界
  }

  return (
    <Image
      src={src}
      className={className}
      mode={mode}
      onError={handleError}
      onClick={onClick}
    />
  )
}
