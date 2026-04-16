/**
 * 图片组件封装
 * 自动处理加载失败，提供默认占位图
 */

import { useState } from 'react'
import { Image } from '@tarojs/components'

interface SafeImageProps {
  src: string
  className?: string
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'
  defaultSrc?: string
  onClick?: () => void
}

// 默认占位图
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=60'

export function SafeImage({ 
  src, 
  className, 
  mode = 'aspectFill', 
  defaultSrc = DEFAULT_PLACEHOLDER,
  onClick
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || defaultSrc)
  const [hasError, setHasError] = useState(false)

  // 当src变化时重置状态
  if (src !== imgSrc && !hasError) {
    setImgSrc(src)
    setHasError(false)
  }

  const handleError = () => {
    if (!hasError && imgSrc !== defaultSrc) {
      setImgSrc(defaultSrc)
      setHasError(true)
    }
  }

  const handleLoad = () => {
    setHasError(false)
  }

  return (
    <Image
      src={imgSrc}
      className={className}
      mode={mode}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
    />
  )
}
