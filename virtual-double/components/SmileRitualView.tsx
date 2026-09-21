'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Sparkles, Volume2, VolumeX, ArrowLeft, Camera } from 'lucide-react'
import { useSmileRitual } from '@/lib/vision/use-smile-ritual'
import { speakAntDialogue, playAntChime, primeAudioOnGesture, startAudioKeepAlive } from '@/lib/ant-voice'
import { useMascotName } from '@/lib/mascot-name'

interface SmileRitualViewProps {
  task: string
  durationMinutes: number
  onComplete: (cameraOptIn: boolean) => void
  onCancel: () => void
}

const INITIAL_DIALOGUE = "Hey, are you ready? Let's smile whenever you're about to start the task!"
const CELEBRATION_DIALOGUE = "Nice — we're ready. Let's start now!"

export default function SmileRitualView({
  task,
  durationMinutes,
  onComplete,
  onCancel,
}: SmileRitualViewProps) {
  const { mascotName } = useMascotName()
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [hasSpokenInitial, setHasSpokenInitial] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completionStartedRef = useRef(false)

  const finishRitual = useCallback((cameraOptIn: boolean) => {
    if (completionStartedRef.current) return
    completionStartedRef.current = true
    setIsFinishing(true)

    // Synchronously prime and start audio keep-alive within the user interaction/gesture
    primeAudioOnGesture()
    startAudioKeepAlive()

    if (audioEnabled) {
      playAntChime('celebrate')
      speakAntDialogue(CELEBRATION_DIALOGUE)
    }

    // Give the user a full 3.4s beat (~2s longer) to hear the complete celebration dialogue before transition
    completionTimerRef.current = setTimeout(() => {
      onComplete(cameraOptIn)
    }, 3400)
  }, [audioEnabled, onComplete])

  const onSmileConfirmed = useCallback(() => finishRitual(true), [finishRitual])

  const {
    isCameraActive,
    cameraError,
    smileProgress,
    isSmiling,
    videoRef,
  } = useSmileRitual({
    onSmileDetected: onSmileConfirmed,
    enabled: !isFinishing,
  })

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
    }
  }, [])

  // Play initial chime and speech on mount
  const hasMountedRef = useRef(false)
  useEffect(() => {
    if (hasMountedRef.current) return
    hasMountedRef.current = true

    const timer = setTimeout(() => {
      if (audioEnabled && !hasSpokenInitial) {
        playAntChime('ready')
        speakAntDialogue(INITIAL_DIALOGUE)
        setHasSpokenInitial(true)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [audioEnabled, hasSpokenInitial])

  // Keyboard shortcut listener: Escape returns to task entry.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const toggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      return next
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-8 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        {/* Top Header Badge & Back Button */}
        <div className="mb-6 flex w-full items-center justify-between">
          <button
            onClick={onCancel}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
          >
            <ArrowLeft className="size-3.5" /> Back to task <span className="hidden sm:inline text-[10px] text-slate-400">(Esc)</span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-700 backdrop-blur-md dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
            <Sparkles className="size-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Positive Start Ritual</span>
          </div>

          <button
            onClick={toggleAudio}
            type="button"
            title={audioEnabled ? `Mute ${mascotName} voice` : `Enable ${mascotName} voice`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="size-3.5 text-cyan-500" /> Sound on
              </>
            ) : (
              <>
                <VolumeX className="size-3.5 text-slate-400" /> Sound off
              </>
            )}
          </button>
        </div>

        {/* Comic Speech Bubble (Authentic Comic Style with dark border and tail) */}
        <div className="relative mb-6 max-w-xl px-4 z-20">
          <div className="relative rounded-[2.25rem] border-[3.5px] border-slate-900 bg-white px-8 py-6 shadow-2xl transition-all duration-300 dark:border-cyan-400/90 dark:bg-[#0c1630]">
            <p className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl leading-relaxed">
              {isFinishing ? (
                <span className="text-cyan-600 dark:text-cyan-300 animate-pulse">
                  🎉 {CELEBRATION_DIALOGUE}
                </span>
              ) : (
                <span>
                  {INITIAL_DIALOGUE}
                </span>
              )}
            </p>

            {/* Comic Bubble Pointer Tail */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 pointer-events-none">
              <svg
                className="h-6 w-9 text-white dark:text-[#0c1630]"
                viewBox="0 0 36 24"
                fill="currentColor"
              >
                <path d="M0 0 C 12 12, 14 24, 6 24 C 20 20, 28 12, 36 0 Z" />
              </svg>
              {/* Tail border stroke */}
              <svg
                className="absolute inset-0 h-6 w-9 text-slate-900 dark:text-cyan-400/90 pointer-events-none"
                viewBox="0 0 36 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              >
                <path d="M0 0 C 12 12, 14 24, 6 24 C 20 20, 28 12, 36 0" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Stage: Mascot ANT + Live Camera Detection */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 my-4 w-full">
          {/* Mascot ANT (using ant-mascot-removebg.png) */}
          <div className="flex flex-col items-center">
            <div
              className={`relative transition-all duration-500 select-none ${
                isFinishing ? 'scale-110 -translate-y-4' : 'animate-mascot-float'
              }`}
            >
              <div className="relative h-64 w-56 md:h-76 md:w-64 drop-shadow-[0_20px_40px_rgba(6,182,212,0.35)]">
                <Image
                  src="/ant-mascot-removebg.png"
                  alt={`${mascotName} mascot - Ready to begin`}
                  width={440}
                  height={520}
                  priority
                  unoptimized
                  className="size-full object-contain pointer-events-none select-none transition-transform duration-300 hover:scale-105"
                />
              </div>
              {/* Floor shadow */}
              <div className="animate-mascot-shadow mx-auto mt-2 h-3.5 w-36 rounded-[100%] bg-cyan-950/25 blur-[6px] dark:bg-cyan-400/25" />
            </div>
          </div>

          {/* Computer Vision Live Smile Detector Box */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-500/20 bg-white/70 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60">
            {/* Webcam Video Mirror */}
            <div className="relative size-36 md:size-40 overflow-hidden rounded-2xl border-2 border-cyan-400/60 bg-slate-950 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="size-full object-cover scale-x-[-1]"
              />
              {/* Target Face Focus Overlay */}
              <div className="absolute inset-3 rounded-xl border border-dashed border-cyan-400/50 pointer-events-none" />

              {/* Status pill */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-cyan-200 backdrop-blur-sm">
                <span
                  className={`size-1.5 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-300'}`}
                />
                <Camera className="size-3" />
                <span>{isCameraActive ? 'MediaPipe ready' : 'Starting camera'}</span>
              </div>

              {isSmiling && (
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/70 backdrop-blur-xs text-3xl animate-in zoom-in-75">
                  😄
                </div>
              )}
            </div>

            {/* Smile Progress Meter Bar */}
            <div className="w-48 flex flex-col gap-1.5 text-center">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-cyan-200">
                <span>Smile Meter</span>
                <span>
                  {smileProgress}% {smileProgress >= 80 ? '😄' : smileProgress >= 40 ? '😊' : '🙂'}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-150 rounded-full"
                  style={{ width: `${smileProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {cameraError
                  ? 'Camera unavailable — click below to start!'
                  : 'Give a warm smile to launch!'}
              </p>
            </div>

            {/* Accessible fallback: camera/model failure never blocks starting. */}
            <button
              onClick={() => finishRitual(false)}
              disabled={isFinishing}
              type="button"
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-400 disabled:opacity-60"
            >
              {isFinishing ? 'Starting…' : 'Start without camera'}
            </button>
          </div>
        </div>

        {/* Selected Task Context */}
        <div className="mt-4 rounded-xl border border-slate-200/60 bg-white/40 px-5 py-2.5 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.02]">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Next micro-step:{' '}
            <strong className="text-slate-800 dark:text-cyan-200 font-semibold">{task}</strong>{' '}
            ({durationMinutes} min)
          </span>
        </div>
      </div>
    </div>
  )
}
