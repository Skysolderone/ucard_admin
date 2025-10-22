"use client"

import { useState, useEffect, useRef } from "react"
import heic2any from "heic2any"

interface HeicImageProps {
  src: string
  alt: string
  className?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

export function HeicImage({ src, alt, className, onError }: HeicImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const convertedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // 清理之前的blob URL
    if (convertedUrlRef.current) {
      URL.revokeObjectURL(convertedUrlRef.current)
      convertedUrlRef.current = null
    }

    // 只有URL中明确包含.heic或.heif扩展名时才进行转换
    const isHeicUrl = src && /\.(heic|heif)(\?|$)/i.test(src)

    if (!isHeicUrl) {
      // 非HEIC格式，直接使用原始src
      setImageSrc(src)
      setLoading(false)
      setError(false)
      return
    }

    // 是HEIC格式，需要转换
    const convertHeicImage = async () => {
      setLoading(true)
      setImageSrc('') // 清空imageSrc，避免img标签请求原始URL
      setError(false)

      try {
        // 获取HEIC图片数据（只请求一次）
        const response = await fetch(src)
        const blob = await response.blob()

        // 转换为JPEG
        const convertedBlob = await heic2any({
          blob,
          toType: "image/jpeg",
          quality: 0.9
        })

        // heic2any可能返回Blob或Blob数组
        const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        const url = URL.createObjectURL(resultBlob)
        convertedUrlRef.current = url
        setImageSrc(url)
      } catch (err) {
        console.error('HEIC转换失败:', err)
        setError(true)
        setImageSrc(src) // 转换失败时使用原图
      } finally {
        setLoading(false)
      }
    }

    convertHeicImage()

    // 清理函数
    return () => {
      if (convertedUrlRef.current) {
        URL.revokeObjectURL(convertedUrlRef.current)
        convertedUrlRef.current = null
      }
    }
  }, [src])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setError(true)
    if (onError) {
      onError(e)
    }
  }

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">图片加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}
