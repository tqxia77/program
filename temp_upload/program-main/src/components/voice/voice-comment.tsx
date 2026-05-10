/**
 * 语音评论组件
 * 评论输入框支持语音输入转文字
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { RecorderManager, ENV_TYPE } from '@tarojs/taro'
import { Mic, MicOff, MessageCircle } from 'lucide-react-taro'
import './index.css'

// 评论模式
type CommentMode = 'text' | 'voice'

// 语音评论组件属性
interface VoiceCommentProps {
  placeholder?: string
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

// 语音评论组件
export default function VoiceComment({
  placeholder = '写下你的评论...',
  onSubmit,
  maxDuration = 30,
}: VoiceCommentProps) {
  // 评论模式
  const [mode, setMode] = useState<CommentMode>('text')
  // 文本输入
  const [inputText, setInputText] = useState('')
  // 转写文本
  const [transcribedText, setTranscribedText] = useState('')
  // 录音状态
  const [isRecording, setIsRecording] = useState(false)
  // 录音时长
  const [recordTime, setRecordTime] = useState(0)
  // 转写中状态
  const [isConverting, setIsConverting] = useState(false)
  // 录音文件路径
  const audioFilePathRef = useRef<string>('')
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

    setIsRecording(true)
    setRecordTime(0)

    recorderManager?.start({
      duration: maxDuration * 1000,
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

  // 监听录音事件
  useEffect(() => {
    if (!isMiniApp || !recorderManager) return

    recorderManager.onStart(() => {
      console.log('录音开始')
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
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsRecording(false)
      audioFilePathRef.current = res.tempFilePath
      // 自动转写
      convertToText(res.tempFilePath)
    })

    recorderManager.onError((err) => {
      console.error('录音错误:', err)
      setIsRecording(false)
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
      // 示例: POST /api/voice/to-text { audioPath: string } => { text: string }
      
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const mockText = '收到，非常感谢！'
      setTranscribedText(mockText)
    } catch (err) {
      console.error('语音转文字失败:', err)
      Taro.showToast({ title: '转写失败', icon: 'none' })
    } finally {
      setIsConverting(false)
    }
  }

  // 提交评论
  const handleSubmit = () => {
    const textToSubmit = (inputText || transcribedText).trim()
    if (!textToSubmit) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    onSubmit(textToSubmit)
    setInputText('')
    setTranscribedText('')
    setMode('text')
  }

  // 切换到语音模式
  const switchToVoice = () => {
    setMode('voice')
  }

  // 切换到文本模式
  const switchToText = () => {
    setMode('text')
    setTranscribedText('')
  }

  // 渲染H5端提示
  const renderH5Tip = () => (
    <View className="voice-comment-h5 bg-white rounded-xl px-4 py-3 flex items-center gap-3">
      <MessageCircle size={20} color="#999" />
      <Text className="block text-gray-500 flex-1">
        语音评论仅在小程序中可用
      </Text>
      <View className="px-3 py-2 bg-gray-100 rounded-lg">
        <Text className="block text-gray-500 text-sm">文字输入</Text>
      </View>
    </View>
  )

  // 渲染文本输入模式
  const renderTextMode = () => (
    <View className="voice-comment bg-white rounded-xl px-4 py-3">
      <View className="flex items-center gap-3">
        <Input
          className="flex-1 h-10 px-3 bg-gray-50 rounded-xl text-base"
          placeholder={placeholder}
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
        />
        <View
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={switchToVoice}
        >
          <Mic size={20} color="#666" />
        </View>
        <View
          className="px-4 py-2 bg-primary rounded-xl"
          onClick={handleSubmit}
        >
          <Text className="block text-white text-sm">发送</Text>
        </View>
      </View>
    </View>
  )

  // 渲染语音输入模式
  const renderVoiceMode = () => (
    <View className="voice-comment bg-white rounded-xl px-4 py-3">
      {isConverting ? (
        <View className="flex items-center justify-center py-2 gap-2">
          <Text className="block text-gray-400">转写中...</Text>
        </View>
      ) : transcribedText ? (
        <View className="mb-3">
          <View className="bg-primary bg-opacity-10 rounded-xl px-3 py-2">
            <Text className="block text-primary text-sm">{transcribedText}</Text>
          </View>
        </View>
      ) : null}
      
      <View className="flex items-center gap-3">
        <View
          className="voice-button w-10 h-10 rounded-full flex items-center justify-center"
          onClick={switchToText}
        >
          <MessageCircle size={20} color="#666" />
        </View>
        
        {isRecording ? (
          <View className="flex-1 flex items-center gap-2">
            <View className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <Text className="block text-red-500 text-sm">{recordTime}s</Text>
          </View>
        ) : (
          <View
            className="flex-1 h-10 bg-gray-50 rounded-xl flex items-center justify-center"
            onClick={startRecord}
          >
            <Text className="block text-gray-400 text-sm">点击说话</Text>
          </View>
        )}
        
        <View
          className={`voice-button w-10 h-10 rounded-full flex items-center justify-center ${
            isRecording ? 'bg-red-500' : 'bg-primary'
          }`}
          onTouchStart={startRecord}
          onTouchEnd={stopRecord}
        >
          {isRecording ? (
            <MicOff size={20} color="#fff" />
          ) : (
            <Mic size={20} color="#fff" />
          )}
        </View>
        
        <View
          className="px-4 py-2 bg-primary rounded-xl"
          onClick={handleSubmit}
        >
          <Text className="block text-white text-sm">发送</Text>
        </View>
      </View>
    </View>
  )

  return isMiniApp ? (
    mode === 'text' ? renderTextMode() : renderVoiceMode()
  ) : (
    renderH5Tip()
  )
}
