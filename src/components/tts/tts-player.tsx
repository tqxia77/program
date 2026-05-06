/**
 * TTS语音朗读组件（听帖子）
 * 将文本内容转换为语音播放
 */

import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { ENV_TYPE } from '@tarojs/taro'
import { Volume2, Pause, Play, Square } from 'lucide-react-taro'
import './index.css'

// TTS播放状态
type PlayState = 'idle' | 'playing' | 'paused'

// TTS组件属性
interface TTSPlayerProps {
  text: string
  autoPlay?: boolean // 是否自动播放
  showButton?: boolean // 是否显示按钮模式
  className?: string
}

// TTS组件
export default function TTSPlayer({
  text,
  autoPlay = false,
  showButton = true,
  className = '',
}: TTSPlayerProps) {
  // 音频上下文
  const innerAudioContext = Taro.createInnerAudioContext()
  
  // 播放状态
  const [playState, setPlayState] = useState<PlayState>('idle')
  // 加载状态
  const [loading, setLoading] = useState(false)
  
  // 判断是否在小程序环境
  const isMiniApp = Taro.getEnv() === ENV_TYPE.WEAPP || Taro.getEnv() === ENV_TYPE.TT

  // 初始化音频上下文
  useEffect(() => {
    if (!isMiniApp) return

    innerAudioContext.onPlay(() => {
      console.log('TTS播放开始')
      setPlayState('playing')
    })

    innerAudioContext.onPause(() => {
      console.log('TTS播放暂停')
      setPlayState('paused')
    })

    innerAudioContext.onStop(() => {
      console.log('TTS播放停止')
      setPlayState('idle')
    })

    innerAudioContext.onEnded(() => {
      console.log('TTS播放结束')
      setPlayState('idle')
    })

    innerAudioContext.onError((err) => {
      console.error('TTS播放错误:', err)
      setPlayState('idle')
      setLoading(false)
      Taro.showToast({ title: '播放失败', icon: 'none' })
    })

    // 清理
    return () => {
      innerAudioContext.destroy()
    }
  }, [isMiniApp])

  // 自动播放
  useEffect(() => {
    if (autoPlay && text && isMiniApp) {
      handlePlay()
    }
  }, [autoPlay, text])

  // 生成音频URL（需要后端提供TTS服务）
  const generateAudioUrl = async () => {
    // TODO: 替换为实际的TTS服务API
    // 这里应该调用后端的TTS接口，将text转换为语音
    // 示例: POST /api/tts/generate { text: string } => { audioUrl: string }
    const mockUrl = `https://tts.example.com/api/tts?text=${encodeURIComponent(text)}`
    return mockUrl
  }

  // 开始播放
  const handlePlay = async () => {
    if (!isMiniApp) {
      Taro.showToast({ title: '语音播放仅在小程序中可用', icon: 'none' })
      return
    }

    if (!text) {
      Taro.showToast({ title: '没有可朗读的内容', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 生成音频URL
      const url = await generateAudioUrl()
      
      innerAudioContext.src = url
      innerAudioContext.play()
    } catch (err) {
      console.error('TTS生成失败:', err)
      Taro.showToast({ title: '语音生成失败', icon: 'none' })
      setLoading(false)
    }
  }

  // 暂停播放
  const handlePause = () => {
    innerAudioContext.pause()
  }

  // 继续播放
  const handleResume = () => {
    innerAudioContext.play()
  }

  // 停止播放
  const handleStop = () => {
    innerAudioContext.stop()
    setPlayState('idle')
  }

  // H5端提示
  const renderH5Tip = () => (
    <View className="flex items-center gap-2 text-gray-500 text-sm">
      <Volume2 size={18} color="#999" />
      <Text className="block text-gray-500">点击播放语音内容</Text>
    </View>
  )

  // 小程序端按钮
  const renderMiniAppButton = () => {
    const isPlaying = playState === 'playing'
    const isPaused = playState === 'paused'
    
    if (loading) {
      return (
        <View className="flex items-center gap-2">
          <View className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Text className="block text-gray-400">...</Text>
          </View>
        </View>
      )
    }

    if (isPlaying) {
      return (
        <View className="flex items-center gap-2">
          <View
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            onClick={handlePause}
          >
            <Pause size={20} color="#fff" />
          </View>
          <View
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
            onClick={handleStop}
          >
            <Square size={18} color="#666" />
          </View>
        </View>
      )
    }

    if (isPaused) {
      return (
        <View className="flex items-center gap-2">
          <View
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            onClick={handleResume}
          >
            <Play size={20} color="#fff" />
          </View>
          <View
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
            onClick={handleStop}
          >
            <Square size={18} color="#666" />
          </View>
        </View>
      )
    }

    return (
      <View
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
        onClick={handlePlay}
      >
        <Volume2 size={20} color="#fff" />
      </View>
    )
  }

  if (!showButton) {
    return null
  }

  return (
    <View className={`tts-player ${className}`}>
      {isMiniApp ? renderMiniAppButton() : renderH5Tip()}
    </View>
  )
}
