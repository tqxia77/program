/**
 * 用户认证状态管理
 * 管理用户登录状态、Token、用户信息
 */

import Taro from '@tarojs/taro'
import { create } from 'zustand'

// 用户角色类型
export type UserRole = 'elder' | 'community' | 'child'

// 用户信息接口
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
  role: UserRole
  createdAt: string
}

// 认证状态接口
interface AuthState {
  isLoggedIn: boolean
  token: string | null
  userInfo: UserInfo | null
  loading: boolean
}

// 认证操作接口
interface AuthActions {
  // 设置Token
  setToken: (token: string) => void
  // 设置用户信息
  setUserInfo: (userInfo: UserInfo) => void
  // 设置加载状态
  setLoading: (loading: boolean) => void
  // 登录成功
  login: (token: string, userInfo: UserInfo) => void
  // 登出
  logout: () => void
  // 从本地存储恢复状态
  restoreAuth: () => void
  // 获取Token
  getToken: () => string | null
}

const AUTH_TOKEN_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // 初始状态
  isLoggedIn: false,
  token: null,
  userInfo: null,
  loading: true,

  // 设置Token
  setToken: (token: string) => {
    Taro.setStorageSync(AUTH_TOKEN_KEY, token)
    set({ token, isLoggedIn: true })
  },

  // 设置用户信息
  setUserInfo: (userInfo: UserInfo) => {
    Taro.setStorageSync(USER_INFO_KEY, userInfo)
    set({ userInfo })
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ loading })
  },

  // 登录成功
  login: (token: string, userInfo: UserInfo) => {
    Taro.setStorageSync(AUTH_TOKEN_KEY, token)
    Taro.setStorageSync(USER_INFO_KEY, userInfo)
    set({ token, userInfo, isLoggedIn: true, loading: false })
  },

  // 登出
  logout: () => {
    Taro.removeStorageSync(AUTH_TOKEN_KEY)
    Taro.removeStorageSync(USER_INFO_KEY)
    set({ token: null, userInfo: null, isLoggedIn: false, loading: false })
  },

  // 从本地存储恢复状态
  restoreAuth: () => {
    try {
      const token = Taro.getStorageSync(AUTH_TOKEN_KEY)
      const userInfo = Taro.getStorageSync(USER_INFO_KEY) as UserInfo | undefined
      
      if (token && userInfo) {
        set({ token, userInfo, isLoggedIn: true, loading: false })
      } else {
        set({ loading: false })
      }
    } catch (error) {
      console.error('恢复认证状态失败:', error)
      set({ loading: false })
    }
  },

  // 获取Token
  getToken: () => {
    return get().token
  },
}))

// 导出网络请求Token获取函数
export const getAuthToken = () => {
  return Taro.getStorageSync(AUTH_TOKEN_KEY)
}
