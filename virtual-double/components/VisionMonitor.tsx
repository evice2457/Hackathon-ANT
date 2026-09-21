'use client'

import { useEffect, useRef } from 'react'
import { useFocusSession } from '@/lib/focus-session'
import { useVisionMonitor } from '@/lib/vision/use-vision-monitor'

const SHOW_DEBUG = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VISION_DEBUG !== '0'

function degrees(value: number | undefined): string {
  return value === undefined ? '—' : `${value.toFixed(1)}°`
}

function score(value: number | undefined): string {
  return value === undefined ? '—' : value.toFixed(2)
}

export default function VisionMonitor({ pipDocument }: { pipDocument?: Document | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { session, setFocusState } = useFocusSession()
  const enabled = session.status === 'running' && session.visionEnabled

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.setAttribute('autopictureinpicture', 'true')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(video as any).autoPictureInPicture = true

    // When vision is disabled (e.g. Start without camera), provide a fallback canvas stream
    // so Chrome recognizes the element as an active playing video stream for Automatic PiP
    if (!enabled && typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 16
        canvas.height = 16
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#0B132B'
          ctx.fillRect(0, 0, 16, 16)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = (canvas as any).captureStream?.(5)
        if (stream && !video.srcObject) {
          video.srcObject = stream
          video.play().catch(() => {})
        }
      } catch {}
    }
  }, [enabled])

  const diagnostics = useVisionMonitor({
    enabled,
    videoRef,
    onStateChange: setFocusState,
    captureDiagnostics: SHOW_DEBUG,
    schedulingWindow: pipDocument?.defaultView ?? null,
    classifyLookingAway: false,
  })

  const observation = diagnostics.observation
  const hasError = enabled && diagnostics.error

  return (
    <>
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden
        className="fixed bottom-0 right-0 size-2 opacity-[0.01] pointer-events-none -z-50"
      />

      {hasError && (
        <aside
          role="status"
          className="fixed bottom-5 right-5 z-40 max-w-sm rounded-xl border border-amber-400/25 bg-slate-950/95 px-4 py-3 text-xs text-amber-100 shadow-xl"
        >
          <span className="font-semibold">Camera monitor unavailable.</span> {diagnostics.error}
        </aside>
      )}

      {SHOW_DEBUG && enabled && (
        <aside className="fixed bottom-5 left-5 z-40 w-64 rounded-xl border border-cyan-400/20 bg-slate-950/95 p-4 font-mono text-[11px] leading-5 text-slate-300 shadow-xl">
          <div className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
            Vision · development only
          </div>
          <div>status: {diagnostics.status}</div>
          <div>face: {observation ? (observation.facePresent ? 'present' : 'absent') : '—'}</div>
          <div>calibration: {observation?.poseCalibration.status ?? '—'}</div>
          <div>neutral P/Y: {degrees(observation?.poseCalibration.neutralPitch)} / {degrees(observation?.poseCalibration.neutralYaw)}</div>
          <div>delta P/Y: {degrees(observation?.poseCalibration.pitchDelta)} / {degrees(observation?.poseCalibration.yawDelta)}</div>
          <div>pitch: {degrees(observation?.headPose?.pitch)}</div>
          <div>yaw: {degrees(observation?.headPose?.yaw)}</div>
          <div>roll: {degrees(observation?.headPose?.roll)}</div>
          <div>headDown: {String(observation?.headDown ?? false)}</div>
          <div>lookingAway: {String(observation?.lookingAway ?? false)}</div>
          <div>eyes L/R: {score(observation?.eyes?.leftOpen)} / {score(observation?.eyes?.rightOpen)}</div>
          <div>smile: {score(observation?.smileScore)}</div>
          <div>smile gesture: {String(observation?.smileGesture ?? false)}</div>
          <div>vision FPS: {diagnostics.fps.toFixed(1)}</div>
          <div>inference: {diagnostics.inferenceMs.toFixed(1)} ms</div>
          <div>derived: {diagnostics.derivedState}</div>
        </aside>
      )}
    </>
  )
}
