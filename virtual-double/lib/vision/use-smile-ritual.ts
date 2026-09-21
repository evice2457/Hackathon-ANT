'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ritualSmileProgress, SMILE_RITUAL_VISION_CONFIG } from '@/lib/vision/smile-ritual'
import { useVisionMonitor } from '@/lib/vision/use-vision-monitor'
import type { VisionObservation } from '@/lib/vision/types'

interface UseSmileRitualOptions {
  enabled?: boolean
  onSmileDetected?: () => void
}

const ignoreFocusState = () => {}

export function useSmileRitual({ enabled = true, onSmileDetected }: UseSmileRitualOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const onSmileDetectedRef = useRef(onSmileDetected)
  const hasTriggeredRef = useRef(false)
  const [smileProgress, setSmileProgress] = useState(0)
  const [isSmiling, setIsSmiling] = useState(false)

  useEffect(() => {
    onSmileDetectedRef.current = onSmileDetected
  }, [onSmileDetected])

  const confirmSmile = useCallback(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true
    setSmileProgress(100)
    setIsSmiling(true)
    onSmileDetectedRef.current?.()
  }, [])

  const handleObservation = useCallback(
    (observation: VisionObservation) => {
      setSmileProgress(ritualSmileProgress(observation.smileScore))
      if (observation.smileGesture) confirmSmile()
    },
    [confirmSmile],
  )

  const diagnostics = useVisionMonitor({
    enabled: enabled && !isSmiling,
    videoRef,
    config: SMILE_RITUAL_VISION_CONFIG,
    onStateChange: ignoreFocusState,
    onObservation: handleObservation,
  })

  return {
    isCameraActive: diagnostics.status === 'running',
    cameraError: diagnostics.error ?? null,
    smileProgress,
    isSmiling,
    videoRef,
  }
}
