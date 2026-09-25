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
const BUBBLE_DIALOGUE = 'Ready? Give me a smile!'
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

  // Keyboard shortcuts: Escape returns to task entry, Enter starts without waiting for a smile.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        onCancel()
      } else if (e.code === 'Enter' && !isFinishing) {
        e.preventDefault()
        finishRitual(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, isFinishing, finishRitual])

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
      <div className="w-full max-w-[900px] flex flex-col items-center text-center">
        {/* Top Header: Back · Badge · Sound */}
        <div className="mb-6 grid w-full grid-cols-3 items-center">
          <div className="flex justify-start">
            <button
              onClick={onCancel}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EADBCE] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#4A3E3D] shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016]/80 dark:text-[#D1C0BE] dark:hover:text-[#F39BA9]"
            >
              <ArrowLeft className="size-3.5" /> Back to task{' '}
              <span className="hidden sm:inline text-[10px] text-[#8D7B78]">(Esc)</span>
            </button>
          </div>

          <div className="justify-self-center inline-flex items-center gap-2 rounded-full border border-[#E8D5CE] bg-[#F7ECE8]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A61C30] backdrop-blur-md dark:border-[#52232B] dark:bg-[#32141A]/90 dark:text-[#F39BA9]">
            <span className="text-[10px]">✦</span>
            <span>Ready to Focus</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={toggleAudio}
              type="button"
              title={audioEnabled ? `Mute ${mascotName} voice` : `Enable ${mascotName} voice`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EADBCE] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#4A3E3D] shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016]/80 dark:text-[#D1C0BE] dark:hover:text-[#F39BA9]"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="size-3.5 text-[#A61C30] dark:text-[#F39BA9]" /> Sound on
                </>
              ) : (
                <>
                  <VolumeX className="size-3.5 text-[#8D7B78]" /> Sound off
                </>
              )}
            </button>
          </div>
        </div>

        {/* Next Step reinforcement — the task the user is about to begin */}
        <div className="mb-8 w-full">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61C30] dark:text-[#F39BA9]">
            Your next step
          </p>
          <p className="text-xl font-semibold tracking-tight text-[#201416] dark:text-[#FAF4EB] md:text-2xl">
            {task}
            <span className="ml-2.5 align-middle rounded-full bg-[#F7ECE8] px-3 py-1 text-xs font-bold text-[#A61C30] dark:bg-[#32141A] dark:text-[#F39BA9]">
              {durationMinutes} min
            </span>
          </p>
        </div>

        {/* Main Stage: ANT (companion) + Camera (the interaction) side by side, centered as a unit */}
        <div className="flex w-full flex-col items-center gap-10 md:flex-row md:items-start md:justify-center">
          {/* Left column: Speech bubble on top of the ANT mascot */}
          <div className="flex w-full max-w-[380px] flex-col items-center gap-4 md:w-auto md:-translate-x-6">
            {/* Speech bubble — tail points down toward ANT */}
            <div className="relative max-w-[19rem] px-4 z-20">
              <div className="relative rounded-[2rem] border-[3px] border-[#201416] bg-white px-5 py-3.5 shadow-xl transition-all duration-300 dark:border-[#C92A43] dark:bg-[#221017]">
                <p className="font-sans text-base font-semibold tracking-tight text-[#201416] dark:text-[#FAF4EB] md:text-lg leading-relaxed">
                  {isFinishing || isSmiling ? (
                    <span className="text-[#A61C30] dark:text-[#F39BA9] animate-pulse font-bold">
                      🎉 {CELEBRATION_DIALOGUE}
                    </span>
                  ) : (
                    <span>&ldquo;{BUBBLE_DIALOGUE}&rdquo;</span>
                  )}
                </p>

                {/* Comic Bubble Pointer Tail — points down at ANT */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                  <svg
                    className="h-5 w-7 text-white dark:text-[#221017]"
                    viewBox="0 0 36 24"
                    fill="currentColor"
                  >
                    <path d="M0 0 C 12 12, 14 24, 6 24 C 20 20, 28 12, 36 0 Z" />
                  </svg>
                  <svg
                    className="absolute inset-0 h-5 w-7 text-[#201416] dark:text-[#C92A43] pointer-events-none"
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

            <div
              className={`relative transition-all duration-500 select-none ${
                isFinishing || isSmiling ? 'scale-110 -translate-y-3' : 'animate-mascot-float'
              }`}
            >
              <div className="relative h-64 w-60 md:h-[22rem] md:w-80 drop-shadow-[0_18px_36px_rgba(166,28,48,0.22)]">
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
              <div className="animate-mascot-shadow mx-auto mt-1.5 h-3 w-36 rounded-[100%] bg-[#3D141C]/20 blur-[6px] dark:bg-[#C92A43]/25" />
            </div>
          </div>

          {/* Camera card — the primary interactive element on this screen */}
          <div className="w-full max-w-[380px]">
            <div className="flex flex-col gap-3.5 rounded-3xl border border-[#EADBCE] bg-white/85 p-5 shadow-sm backdrop-blur-md dark:border-[#42202B] dark:bg-[#201016]/85">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A3E3D] dark:text-[#FAF4EB]">
                  <Camera className="size-4 text-[#A61C30] dark:text-[#F39BA9]" />
                  <span>Camera Preview</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{isCameraActive ? 'ON' : 'OFF'}</span>
                </div>
              </div>

              {/* Webcam Video Mirror — 4:3, matches the 320×240 capture source */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-[#EADBCE] bg-[#160B0F] shadow-inner dark:border-[#42202B]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="size-full object-cover scale-x-[-1]"
                />

                {/* Target Face Focus Overlay */}
                <div className="absolute inset-6 rounded-xl border border-dashed border-[#A61C30]/50 pointer-events-none dark:border-[#F39BA9]/50" />

                {isSmiling && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#160B0F]/70 backdrop-blur-xs text-5xl animate-in zoom-in-75">
                    😄
                  </div>
                )}
              </div>

              {/* Ready meter — describes progress without scoring the face */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#614F4D] dark:text-[#C5B3B1]">
                  <span>Ready meter</span>
                  <span className="font-bold text-[#A61C30] dark:text-[#F39BA9]">
                    {isSmiling ? 'Smile detected 😊' : 'Getting ready...'}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5ECE5] dark:bg-[#2A141D]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FBE8A6] via-[#E8929E] to-[#A61C30] transition-all duration-150 rounded-full dark:to-[#C92A43]"
                    style={{ width: `${smileProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[#786663] dark:text-[#A89299]">
                  {cameraError
                    ? 'Camera unavailable — tap the button below to start.'
                    : isSmiling
                      ? 'Starting your session...'
                      : 'Looking for your smile...'}
                </p>
              </div>

              {/* Primary CTA — starts the session without waiting for camera/smile detection */}
              <button
                onClick={() => finishRitual(false)}
                disabled={isFinishing}
                type="button"
                className="w-full rounded-full bg-[#A61C30] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#A61C30]/25 transition-all hover:bg-[#8F1627] hover:shadow-[#A61C30]/40 disabled:opacity-60 dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
              >
                {isFinishing ? 'Starting...' : "I'm Ready"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
