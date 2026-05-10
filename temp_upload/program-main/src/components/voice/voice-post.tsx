/**
 * 语音发帖组件
 * 按住说话按钮，录音后自动转文字
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { RecorderManager, ENV_TYPE } from '@tarojs/taro'
import { Mic, Send, Trash2 } from 'lucide-react-taro'
import './index.css'

// 录音状态
type RecordState = 'idle' | 'recording' | 'recorded' | 'converting'

// 语音发帖组件属性
interface VoicePostProps {
  onSubmit: (text: string) => void
  maxDuration?: number // 最大录音时长（秒）
}

// 录音管理器Hook
function useRecorderManager() {
  const recorderManager = useRef<RecorderManager | null>(null)

  useEffect(() => {
    recorderManager.current = Taro.getRecorderManager()
  }, [])

  return recorderManager.current
}

// 语音发帖组件
export default function VoicePost({
  onSubmit,
  maxDuration = 60,
}: VoicePostProps) {
  // 录音状态
  const [recordState, setRecordState] = useState<RecordState>('idle')
  // 录音时长
  const [recordTime, setRecordTime] = useState(0)
  // 转写文本
  const [transcribedText, setTranscribedText] = useState<string>('')
  // 转写中状态
  const [isConverting, setIsConverting] = useState(false)
  // 计时器
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const recorderManager = useRecorderManager()

  // 判断是否在小程序环境
  const isMiniApp = Taro.getEnv() === ENV_TYPE.WEAPP || Taro.getEnv() === ENV_TYPE.TT

  // 开始录音
  const startRecord = () => {
    if (!isMiniApp) {
      Taro.showToast({ title: '录音功能仅在小程序中可用', icon: 'none' })
      return
    }

    setRecordState('recording')
    setRecordTime(0)

    recorderManager?.start({
      duration: maxDuration * 1000, // 转换为毫秒
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
    })
  }

  // 停止录音
  const stopRecord = () => {
    if (!isMiniApp) return
    recorderManager?.stop()
  }

  // 监听录音开始
  useEffect(() => {
    if (!isMiniApp || !recorderManager) return

    recorderManager.onStart(() => {
      console.log('录音开始')
      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= maxDuration) {
            stopRecord()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    })

    recorderManager.onStop((res) => {
      console.log('录音结束', res)
      // 停止计时
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      const { tempFilePath } = res
      setRecordState('recorded')
      
      // 自动转写
      convertToText(tempFilePath)
    })

    recorderManager.onError((err) => {
      console.error('录音错误:', err)
      setRecordState('idle')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      Taro.showToast({ title: '录音失败', icon: 'none' })
    })

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isMiniApp, recorderManager])

  // 语音转文字
  const convertToText = async (_filePath: string) => {
    setIsConverting(true)
    try {
      // TODO: 替换为实际的语音转文字API
      // 这里应该调用后端的语音识别接口
      // 示例: POST /api/voice/to-text { audioPath: string } => { text: string }
      
      // 模拟转写延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // 模拟转写结果
      const mockText = '这是模拟的语音转文字结果，实际使用时需要调用后端API进行语音识别。'
      setTranscribedText(mockText)
    } catch (err) {
      console.error('语音转文字失败:', err)
      Taro.showToast({ title: '转写失败', icon: 'none' })
      setTranscribedText('')
    } finally {
      setIsConverting(false)
    }
  }

  // 提交发布
  const handleSubmit = () => {
    const textToSubmit = transcribedText.trim()
    if (!textToSubmit) {
      Taro.showToast({ title: '请先说话或输入文字', icon: 'none' })
      return
    }
    onSubmit(textToSubmit)
    // 重置状态
    setTranscribedText('')
    setRecordState('idle')
    setRecordTime(0)
  }

  // 重新录音
  const handleReset = () => {
    setTranscribedText('')
    setRecordState('idle')
    setRecordTime(0)
  }

  // H5端提示
  const renderH5Tip = () => (
    <View className="voice-post-h5">
      <View className="bg-white rounded-2xl p-4">
        <View className="flex items-center gap-3">
          <Mic size={24} color="#999" />
          <Text className="block text-gray-500">
            语音发帖功能仅在小程序中可用
          </Text>
        </View>
      </View>
    </View>
  )

  // 小程序端UI
  const renderMiniAppUI = () => {
    // 空闲状态 - 显示按住说话按钮
    if (recordState === 'idle') {
      return (
        <View className="voice-post">
          <View className="bg-white rounded-2xl p-4">
            <View className="flex flex-col items-center gap-4">
              <Text className="block text-lg text-gray-700 font-medium">
                按住下方按钮说话
              </Text>
              <View
                className="voice-button w-20 h-20 rounded-full bg-primary flex items-center justify-center"
                onTouchStart={startRecord}
                onTouchEnd={stopRecord}
                onLongPress={startRecord}
              >
                <Mic size={32} color="#fff" />
              </View>
              <Text className="block text-sm text-gray-400">
                长按说话，松开自动转文字
              </Text>
            </View>
          </View>
        </View>
      )
    }

    // 录音中状态
    if (recordState === 'recording') {
      return (
        <View className="voice-post">
          <View className="bg-white rounded-2xl p-4">
            <View className="flex flex-col items-center gap-4">
              <View className="voice-button w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                <Mic size={32} color="#fff" />
              </View>
              <Text className="block text-xl text-red-500 font-bold">
                录音中 {recordTime}s
              </Text>
              <Text className="block text-sm text-gray-400">
                松开手指停止录音
              </Text>
            </View>
          </View>
        </View>
      )
    }

    // 已录音状态 - 显示转写结果
    if (recordState === 'recorded' || recordState === 'converting') {
      return (
        <View className="voice-post">
          <View className="bg-white rounded-2xl p-4">
            <View className="flex items-center gap-3 mb-3">
              <Mic size={20} color="#1890ff" />
              <Text className="block text-gray-700 font-medium">语音转文字</Text>
            </View>
            
            {isConverting ? (
              <View className="flex items-center justify-center py-4">
                <Text className="block text-gray-400">转写中...</Text>
              </View>
            ) : (
              <>
                <View className="bg-gray-50 rounded-xl p-3 mb-4 min-h-24">
                  <Text className="block text-gray-700">
                    {transcribedText || '转写失败，请重试'}
                  </Text>
                </View>
                
                <View className="flex gap-3">
                  <View
                    className="flex-1 bg-gray-100 rounded-xl py-3 flex items-center justify-center gap-2"
                    onClick={handleReset}
                  >
                    <Trash2 size={18} color="#666" />
                    <Text className="block text-gray-600">重新录音</Text>
                  </View>
                  <View
                    className="flex-1 bg-primary rounded-xl py-3 flex items-center justify-center gap-2"
                    onClick={handleSubmit}
                  >
                    <Send size={18} color="#fff" />
                    <Text className="block text-white">发布</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )
    }

    return null
  }

  return isMiniApp ? renderMiniAppUI() : renderH5Tip()
}
