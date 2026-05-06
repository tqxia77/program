/**
 * 活动排序组件
 * 支持按时间排序和按距离排序
 */

import { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { ENV_TYPE } from '@tarojs/taro'
import { Clock, MapPin, RefreshCw } from 'lucide-react-taro'
import './index.css'

// 排序类型
export type SortType = 'time' | 'distance'

// 排序选项
export interface SortOption {
  type: SortType
  label: string
  icon: React.ReactNode
}

// 用户位置
export interface UserLocation {
  latitude: number
  longitude: number
}

// 排序组件属性
interface ActivitySorterProps {
  value: SortType
  onChange: (type: SortType) => void
  onLocationChange?: (location: UserLocation) => void
  className?: string
}

export default function ActivitySorter({
  value,
  onChange,
  onLocationChange,
  className = '',
}: ActivitySorterProps) {
  // 定位状态
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  // 用户位置
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  // 错误信息
  const [errorMsg, setErrorMsg] = useState('')

  // 判断是否在小程序环境
  const currentEnv = Taro.getEnv()
  const isMiniApp = currentEnv === ENV_TYPE.WEAPP || currentEnv === ENV_TYPE.TT

  // 排序选项
  const sortOptions: SortOption[] = [
    {
      type: 'time',
      label: '按时间',
      icon: <Clock size={18} color="#666666" />,
    },
    {
      type: 'distance',
      label: '按距离',
      icon: <MapPin size={18} color="#666666" />,
    },
  ]

  // 获取用户位置
  const getLocation = useCallback(() => {
    if (!isMiniApp) {
      setErrorMsg('定位功能仅在小程序中可用')
      setLocationStatus('error')
      return
    }

    setLocationStatus('loading')
    setErrorMsg('')

    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('获取位置成功:', res)
        const location = {
          latitude: res.latitude,
          longitude: res.longitude,
        }
        setUserLocation(location)
        setLocationStatus('success')
        onLocationChange?.(location)
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        setErrorMsg('定位失败，请开启位置权限')
        setLocationStatus('error')
      },
    })
  }, [isMiniApp, onLocationChange])

  // 切换排序方式
  const handleSortChange = useCallback((type: SortType) => {
    onChange(type)
    
    // 如果切换到距离排序且还没有位置，则获取位置
    if (type === 'distance' && !userLocation) {
      getLocation()
    }
  }, [onChange, userLocation, getLocation])

  // 重新定位
  const handleRefreshLocation = useCallback(() => {
    getLocation()
  }, [getLocation])

  // 打开位置设置
  const handleOpenSetting = useCallback(() => {
    Taro.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          getLocation()
        }
      },
    })
  }, [getLocation])

  // H5降级提示
  if (!isMiniApp) {
    return (
      <View className={`activity-sorter ${className}`}>
        <View className="sort-tabs bg-white flex rounded-lg overflow-hidden border border-gray-200">
          {sortOptions.map((option) => (
            <View
              key={option.type}
              className={`sort-tab flex-1 py-3 flex items-center justify-center gap-2 ${
                value === option.type ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
              }`}
              onClick={() => onChange(option.type)}
            >
              {option.icon}
              <Text>{option.label}</Text>
            </View>
          ))}
        </View>
        <View className="mt-2 px-2">
          <Text className="text-xs text-gray-400">按距离排序请在微信小程序中使用</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`activity-sorter ${className}`}>
      {/* 排序选项 */}
      <View className="sort-tabs bg-white flex rounded-lg overflow-hidden border border-gray-200">
        {sortOptions.map((option) => (
          <View
            key={option.type}
            className={`sort-tab flex-1 py-3 flex items-center justify-center gap-2 ${
              value === option.type ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
            }`}
            onClick={() => handleSortChange(option.type)}
          >
            {option.icon}
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>

      {/* 距离提示 */}
      {value === 'distance' && (
        <View className="mt-2">
          {locationStatus === 'loading' && (
            <View className="flex items-center gap-2 px-2">
              <RefreshCw size={14} color="#999999" className="animate-spin" />
              <Text className="text-xs text-gray-500">正在获取您的位置...</Text>
            </View>
          )}
          
          {locationStatus === 'success' && userLocation && (
            <View className="flex items-center justify-between px-2">
              <Text className="text-xs text-green-600">已获取位置</Text>
              <View 
                className="text-xs text-orange-500 flex items-center gap-1"
                onClick={handleRefreshLocation}
              >
                <RefreshCw size={12} color="#FF9500" />
                <Text>重新定位</Text>
              </View>
            </View>
          )}
          
          {locationStatus === 'error' && (
            <View className="flex items-center justify-between px-2">
              <Text className="text-xs text-red-500">{errorMsg}</Text>
              <View 
                className="text-xs text-orange-500"
                onClick={errorMsg.includes('权限') ? handleOpenSetting : handleRefreshLocation}
              >
                <Text>{errorMsg.includes('权限') ? '去开启' : '重试'}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

// 活动卡片距离显示组件
interface DistanceTagProps {
  distance?: number // 距离（米）
  className?: string
}

export function DistanceTag({ distance, className = '' }: DistanceTagProps) {
  if (!distance) return null

  // 格式化距离
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  return (
    <View className={`distance-tag ${className}`}>
      <MapPin size={12} color="#666666" />
      <Text>{formatDistance(distance)}</Text>
    </View>
  )
}
