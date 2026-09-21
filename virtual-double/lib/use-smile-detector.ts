'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseSmileDetectorOptions {
  onSmileDetected?: () => void
  enabled?: boolean
}

export function useSmileDetector({
  onSmileDetected,
  enabled = true,
}: UseSmileDetectorOptions = {}) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [smileProgress, setSmileProgress] = useState(0)
  const [isSmiling, setIsSmiling] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const onSmileDetectedRef = useRef(onSmileDetected)
  onSmileDetectedRef.current = onSmileDetected

  const hasTriggeredRef = useRef(false)
  const progressRef = useRef(0)

  // Trigger smile confirmed
  const triggerSmileSuccess = useCallback(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true
    setIsSmiling(true)
    setSmileProgress(100)
    onSmileDetectedRef.current?.()
  }, [])

  // Start webcam
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let isCancelled = false

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera API not available in this browser')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
          },
          audio: false,
        })

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        setIsCameraActive(true)
        setCameraError(null)
      } catch (err) {
        if (!isCancelled) {
          console.warn('Webcam permission error or no camera:', err)
          setCameraError(
            err instanceof Error ? err.message : 'Webcam could not be opened',
          )
          setIsCameraActive(false)
        }
      }
    }

    startCamera()

    return () => {
      isCancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [enabled])

  // Real-time Computer Vision Smile Analysis Loop
  useEffect(() => {
    if (!isCameraActive || isSmiling) return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let lastTime = performance.now()

    const detectFrame = () => {
      const now = performance.now()
      // Run analysis at ~15-20 FPS for optimal performance
      if (now - lastTime >= 50 && video.readyState >= 2) {
        lastTime = now

        const w = (canvas.width = 160)
        const h = (canvas.height = 120)
        ctx.drawImage(video, 0, 0, w, h)

        const frame = ctx.getImageData(0, 0, w, h)
        const data = frame.data

        // 1. Analyze lower face region (where mouth and smile occur: rows h*0.55 to h*0.88, cols w*0.25 to w*0.75)
        const rowStart = Math.floor(h * 0.52)
        const rowEnd = Math.floor(h * 0.88)
        const colStart = Math.floor(w * 0.25)
        const colEnd = Math.floor(w * 0.75)

        let mouthRegionBrightness = 0
        let redDominance = 0
        let horizontalSpanCount = 0
        let totalCount = 0

        for (let y = rowStart; y < rowEnd; y++) {
          let leftCol = -1
          let rightCol = -1

          for (let x = colStart; x < colEnd; x++) {
            const idx = (y * w + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]

            // Brightness / luminance
            const lum = 0.299 * r + 0.587 * g + 0.114 * b
            mouthRegionBrightness += lum
            totalCount++

            // Lip contrast detection: lips have higher red ratio (r - g)
            const lipMetric = r - (g + b) / 2
            if (lipMetric > 15 || (lum > 140 && Math.abs(r - g) < 20)) {
              // teeth or lip boundary
              if (leftCol === -1) leftCol = x
              rightCol = x
              redDominance += lipMetric
            }
          }

          if (leftCol !== -1 && rightCol > leftCol) {
            horizontalSpanCount = Math.max(horizontalSpanCount, rightCol - leftCol)
          }
        }

        const avgBrightness = totalCount > 0 ? mouthRegionBrightness / totalCount : 0
        // When smiling:
        // 1. Mouth width spreads horizontally (horizontalSpanCount increases relative to mouth zone)
        // 2. Teeth visibility significantly boosts luminance in the center mouth region (> 120)
        // 3. Contrast increases
        const widthRatio = horizontalSpanCount / (colEnd - colStart) // 0 to 1
        const smileEvidence =
          (widthRatio > 0.42 ? 0.45 : widthRatio * 0.8) +
          (avgBrightness > 115 ? 0.35 : 0.1) +
          (redDominance > 1500 ? 0.2 : 0.05)

        const detected = smileEvidence > 0.55

        if (detected) {
          // Rapid progress accumulation upon smile
          progressRef.current = Math.min(100, progressRef.current + 18)
        } else {
          // Slow decay when resting
          progressRef.current = Math.max(0, progressRef.current - 5)
        }

        setSmileProgress(Math.round(progressRef.current))

        if (progressRef.current >= 100) {
          triggerSmileSuccess()
          return
        }
      }

      if (!hasTriggeredRef.current) {
        animFrameRef.current = requestAnimationFrame(detectFrame)
      }
    }

    animFrameRef.current = requestAnimationFrame(detectFrame)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isCameraActive, isSmiling, triggerSmileSuccess])

  return {
    isCameraActive,
    cameraError,
    smileProgress,
    isSmiling,
    videoRef,
    canvasRef,
    triggerSimulatedSmile: triggerSmileSuccess,
  }
}
