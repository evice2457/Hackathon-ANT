'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import type { FocusState } from '@/lib/focus-session'
import { DEFAULT_VISION_CONFIG, type VisionConfig } from '@/lib/vision/config'
import { getFaceLandmarker } from '@/lib/vision/face-landmarker'
import { VisionSignalExtractor } from '@/lib/vision/signals'
import { VisionBehaviorClassifier } from '@/lib/vision/temporal-filter'
import type { VisionDiagnostics, VisionStatus } from '@/lib/vision/types'

interface UseVisionMonitorOptions {
  enabled: boolean
  videoRef: RefObject<HTMLVideoElement | null>
  config?: VisionConfig
  onStateChange: (state: FocusState) => void
  onObservation?: (observation: NonNullable<VisionDiagnostics['observation']>) => void
  captureDiagnostics?: boolean
  /** Visible window whose animation clock should drive inference (for Document PiP). */
  schedulingWindow?: Window | null
  /** Keep yaw observable while optionally excluding it from focus-state classification. */
  classifyLookingAway?: boolean
}

interface SchedulerController {
  reschedule: () => void
}

const INITIAL_DIAGNOSTICS: VisionDiagnostics = {
  status: 'disabled',
  observation: null,
  derivedState: 'focused',
  fps: 0,
  inferenceMs: 0,
}

function cameraError(error: unknown): { status: VisionStatus; message: string } {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return { status: 'camera_denied', message: 'Camera access was not allowed. Enable it in browser site settings.' }
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return { status: 'camera_unavailable', message: 'No available camera was found.' }
    }
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return { status: 'camera_unavailable', message: 'The camera is busy or unavailable to this browser.' }
    }
  }
  return { status: 'error', message: error instanceof Error ? error.message : 'Vision monitoring could not start.' }
}

export function useVisionMonitor({
  enabled,
  videoRef,
  config = DEFAULT_VISION_CONFIG,
  onStateChange,
  onObservation,
  captureDiagnostics = false,
  schedulingWindow,
  classifyLookingAway = true,
}: UseVisionMonitorOptions): VisionDiagnostics {
  const [diagnostics, setDiagnostics] = useState<VisionDiagnostics>(INITIAL_DIAGNOSTICS)
  const onStateChangeRef = useRef(onStateChange)
  const onObservationRef = useRef(onObservation)
  const schedulingWindowRef = useRef<Window | null>(null)
  const schedulerControllerRef = useRef<SchedulerController | null>(null)

  useEffect(() => {
    onStateChangeRef.current = onStateChange
    onObservationRef.current = onObservation
  }, [onStateChange, onObservation])

  useEffect(() => {
    schedulingWindowRef.current = schedulingWindow ?? window
    schedulerControllerRef.current?.reschedule()
  }, [schedulingWindow])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let stream: MediaStream | null = null
    let animationFrame = 0
    let animationFrameWindow: Window | null = null
    let visibilityDocument: Document | null = null
    let lastInferenceAt = 0
    let framesThisWindow = 0
    let fpsWindowStartedAt = performance.now()
    let measuredFps = 0
    let lastProcessedAt = 0
    let lastEmittedState: FocusState | null = null
    const minimumIntervalMs = 1_000 / config.inferenceFps
    const classifier = new VisionBehaviorClassifier(config)
    const extractor = new VisionSignalExtractor(config)

    const cancelScheduledFrame = () => {
      if (animationFrame && animationFrameWindow) {
        animationFrameWindow.cancelAnimationFrame(animationFrame)
      }
      animationFrame = 0
      animationFrameWindow = null
    }

    let processFrame: () => void = () => {}
    let scheduleFrame = () => {}

    const handleVisibilityChange = () => {
      const activeDocument = schedulingWindowRef.current?.document ?? document
      if (activeDocument.visibilityState !== 'visible') {
        cancelScheduledFrame()
        classifier.reset('focused')
        extractor.reset()
        lastProcessedAt = 0
        lastInferenceAt = 0
        lastEmittedState = 'focused'
        onStateChangeRef.current('focused')
        return
      }

      scheduleFrame()
    }

    const bindVisibilityDocument = () => {
      visibilityDocument?.removeEventListener('visibilitychange', handleVisibilityChange)
      visibilityDocument = schedulingWindowRef.current?.document ?? document
      visibilityDocument.addEventListener('visibilitychange', handleVisibilityChange)
    }

    scheduleFrame = () => {
      if (cancelled || animationFrame) return
      const targetWindow = schedulingWindowRef.current ?? window
      animationFrameWindow = targetWindow
      animationFrame = targetWindow.requestAnimationFrame(() => {
        animationFrame = 0
        animationFrameWindow = null
        processFrame()
      })
    }

    schedulerControllerRef.current = {
      reschedule: () => {
        cancelScheduledFrame()
        bindVisibilityDocument()
        handleVisibilityChange()
      },
    }

    const stop = () => {
      cancelled = true
      if (schedulerControllerRef.current) schedulerControllerRef.current = null
      cancelScheduledFrame()
      visibilityDocument?.removeEventListener('visibilitychange', handleVisibilityChange)
      visibilityDocument = null
      stream?.getTracks().forEach((track) => track.stop())
      const video = videoRef.current
      if (video) {
        video.pause()
        video.srcObject = null
      }
    }

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setDiagnostics({
            ...INITIAL_DIAGNOSTICS,
            status: 'unsupported',
            error: 'Camera access is unavailable. Use HTTPS or localhost in a supported browser.',
          })
          return
        }
        setDiagnostics((previous) => ({ ...previous, status: 'loading_model', error: undefined }))
        const landmarker = await getFaceLandmarker(config)
        if (cancelled) return

        setDiagnostics((previous) => ({ ...previous, status: 'requesting_camera' }))
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15, max: 15 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        const video = videoRef.current
        if (!video) throw new Error('Camera preview was not mounted.')
        video.srcObject = stream
        await video.play()
        if (cancelled) return

        setDiagnostics((previous) => ({ ...previous, status: 'running', error: undefined }))

        processFrame = () => {
          if (cancelled) return
          scheduleFrame()
          const now = performance.now()
          const activeDocument = schedulingWindowRef.current?.document ?? document
          if (activeDocument.visibilityState !== 'visible' || now - lastInferenceAt < minimumIntervalMs) return
          if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.currentTime === 0) return

          if (lastProcessedAt > 0 && now - lastProcessedAt > 1_000) {
            // Do not count time spent in a sleeping/background tab toward a
            // behavior dwell threshold.
            classifier.reset(classifier.currentState)
          }
          if (now <= lastInferenceAt) return
          lastProcessedAt = now
          lastInferenceAt = now
          const inferenceStartedAt = performance.now()
          let result
          try {
            result = landmarker.detectForVideo(video, now)
          } catch {
            return
          }
          const inferenceMs = performance.now() - inferenceStartedAt
          const observation = extractor.extract(result, now)
          const classificationObservation = classifyLookingAway
            ? observation
            : { ...observation, lookingAway: false }
          const derivedState = classifier.update(classificationObservation)
          onObservationRef.current?.(observation)
          if (derivedState !== lastEmittedState) {
            lastEmittedState = derivedState
            onStateChangeRef.current(derivedState)
          }

          framesThisWindow += 1
          const fpsElapsed = now - fpsWindowStartedAt
          if (fpsElapsed >= 1_000) {
            measuredFps = (framesThisWindow * 1_000) / fpsElapsed
            framesThisWindow = 0
            fpsWindowStartedAt = now
          }

          if (captureDiagnostics) {
            setDiagnostics({ status: 'running', observation, derivedState, fps: measuredFps, inferenceMs })
          }
        }

        bindVisibilityDocument()
        handleVisibilityChange()
      } catch (error) {
        if (cancelled) return
        const detail = cameraError(error)
        setDiagnostics({ ...INITIAL_DIAGNOSTICS, status: detail.status, error: detail.message })
        stream?.getTracks().forEach((track) => track.stop())
      }
    }

    void start()
    return stop
  }, [enabled, videoRef, config, captureDiagnostics, classifyLookingAway])

  return enabled ? diagnostics : INITIAL_DIAGNOSTICS
}
