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
 * 修改字号请在 src/app.css 中修改对应的 CSS 变量
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
    if (savedMode === 'large' || savedMode === 'normal') {
      setFontMode(savedMode)
    }
  }, [])

  // 应用字体模式
  const applyFontMode = (mode: FontMode) => {
    // 保存到本地存储
    Taro.setStorageSync(FONT_MODE_KEY, mode)
  }

  // 切换字体模式
  const toggleFontMode = () => {
    const newMode = fontMode === 'normal' ? 'large' : 'normal'
    setFontMode(newMode)
    applyFontMode(newMode)
    
    // 通知所有页面刷新
    Taro.eventCenter.trigger('fontModeChange', newMode)
    
    // 显示切换提示
    Taro.showToast({
      title: `已切换为${newMode === 'large' ? '大字体' : '默认'}模式`,
      icon: 'none',
      duration: 1500
    })
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
