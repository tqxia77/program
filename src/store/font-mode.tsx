/**
 * 字体模式管理
 * 提供默认模式和大字体模式切换功能
 * 
 * 字号配置说明：
 * - 默认模式：适合一般视力老年人
 *   xs: 18px, sm: 20px, base: 24px, lg: 28px, xl: 32px, 2xl: 36px, 3xl: 40px
 * 
 * - 大字体模式：适合视力较弱的老年人
 *   xs: 30px, sm: 32px, base: 36px, lg: 40px, xl: 44px, 2xl: 48px, 3xl: 52px
 * 
 * 使用方法：
 * 1. 在页面中导入 useFontMode hook
 * 2. 调用 toggleFontMode() 切换字体模式
 * 3. 调用 isLargeMode() 获取当前模式
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Taro from '@tarojs/taro'

// 字体模式类型
export type FontMode = 'normal' | 'large'

// LocalStorage key
const FONT_MODE_KEY = 'fontMode'

// Context 类型
interface FontModeContextType {
  fontMode: FontMode
  toggleFontMode: () => void
  isLargeMode: () => boolean
}

// 创建 Context
const FontModeContext = createContext<FontModeContextType>({
  fontMode: 'normal',
  toggleFontMode: () => {},
  isLargeMode: () => false
})

// Provider 组件
export function FontModeProvider({ children }: { children: ReactNode }) {
  const [fontMode, setFontMode] = useState<FontMode>('normal')

  // 初始化，从 LocalStorage 读取保存的模式
  useEffect(() => {
    const savedMode = Taro.getStorageSync(FONT_MODE_KEY) as FontMode
    if (savedMode) {
      setFontMode(savedMode)
      // 应用到 body/document
      applyFontMode(savedMode)
    }
  }, [])

  // 应用字体模式到根元素
  const applyFontMode = (mode: FontMode) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('font-mode-normal', 'font-mode-large')
      document.body.classList.add(`font-mode-${mode}`)
    }
  }

  // 切换字体模式
  const toggleFontMode = () => {
    const newMode = fontMode === 'normal' ? 'large' : 'normal'
    setFontMode(newMode)
    Taro.setStorageSync(FONT_MODE_KEY, newMode)
    applyFontMode(newMode)
  }

  // 是否为大字体模式
  const isLargeMode = () => fontMode === 'large'

  return (
    <FontModeContext.Provider value={{ fontMode, toggleFontMode, isLargeMode }}>
      {children}
    </FontModeContext.Provider>
  )
}

// Hook
export function useFontMode() {
  const context = useContext(FontModeContext)
  return context
}
