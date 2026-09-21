'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Sparkles, Volume2, VolumeX, ArrowLeft, Camera } from 'lucide-react'
import { useSmileDetector } from '@/lib/use-smile-detector'
import { speakAntDialogue, playAntChime } from '@/lib/ant-voice'

interface SmileRitualViewProps {
  task: string
  durationMinutes: number
  onComplete: () => void
  onCancel: () => void
}

export default function SmileRitualView({
  task,
  durationMinutes,
  onComplete,
  onCancel,
}: SmileRitualViewProps) {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [hasSpokenInitial, setHasSpokenInitial] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const initialDialogue = "Hey, are you ready? Let's smile whenever you're about to start the task!"
  const bubbleDialogue = 'Ready? Give me a smile!'
  const celebrationDialogue = "You look so energetic! Let's start now!!!"

  const onSmileConfirmed = () => {
    setIsFinishing(true)

    if (audioEnabled) {
      playAntChime('celebrate')
      speakAntDialogue(celebrationDialogue)
    }

    // Give the user a brief 1.4s beat to see and hear the mascot's celebration
    setTimeout(() => {
      onComplete()
    }, 1400)
  }

  const {
    isCameraActive,
    cameraError,
    smileProgress,
    isSmiling,
    videoRef,
    canvasRef,
    triggerSimulatedSmile,
  } = useSmileDetector({
    onSmileDetected: onSmileConfirmed,
    enabled: true,
  })

  // Play initial chime and speech on mount
  const hasMountedRef = useRef(false)
  useEffect(() => {
    if (hasMountedRef.current) return
    hasMountedRef.current = true

    const timer = setTimeout(() => {
      if (audioEnabled && !hasSpokenInitial) {
        playAntChime('ready')
        speakAntDialogue(initialDialogue)
        setHasSpokenInitial(true)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [audioEnabled, hasSpokenInitial])

  // Keyboard shortcut listener: Escape to go back to task, Enter to trigger smile/start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        onCancel()
      } else if (e.code === 'Enter') {
        if (!isFinishing) {
          e.preventDefault()
          triggerSimulatedSmile()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, isFinishing, triggerSimulatedSmile])

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
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ArrowLeft className="size-3.5" /> Back to task{' '}
              <span className="hidden sm:inline text-[10px] text-slate-400">(Esc)</span>
            </button>
          </div>

          <div className="justify-self-center inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-700 backdrop-blur-md dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
            <Sparkles className="size-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Ready to Focus</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={toggleAudio}
              type="button"
              title={audioEnabled ? 'Mute ANT voice' : 'Enable ANT voice'}
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
        </div>

        {/* Next Step reinforcement — the task the user is about to begin */}
        <div className="mb-8 w-full">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Your next step
          </p>
          <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-2xl">
            {task}
            <span className="ml-2 align-middle rounded-lg bg-cyan-500/10 px-2.5 py-1 text-sm font-semibold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
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
              <div className="relative rounded-[1.75rem] border-[3px] border-slate-900 bg-white px-5 py-3.5 shadow-xl transition-all duration-300 dark:border-cyan-400/90 dark:bg-[#0c1630]">
                <p className="font-sans text-base font-semibold tracking-tight text-slate-900 dark:text-white md:text-lg leading-relaxed">
                  {isSmiling ? (
                    <span className="text-cyan-600 dark:text-cyan-300 animate-pulse">
                      🎉 {celebrationDialogue}
                    </span>
                  ) : (
                    <span>&ldquo;{bubbleDialogue}&rdquo;</span>
                  )}
                </p>

                {/* Comic Bubble Pointer Tail — points down at ANT */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                  <svg
                    className="h-5 w-7 text-white dark:text-[#0c1630]"
                    viewBox="0 0 36 24"
                    fill="currentColor"
                  >
                    <path d="M0 0 C 12 12, 14 24, 6 24 C 20 20, 28 12, 36 0 Z" />
                  </svg>
                  <svg
                    className="absolute inset-0 h-5 w-7 text-slate-900 dark:text-cyan-400/90 pointer-events-none"
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
                isSmiling ? 'scale-110 -translate-y-3' : 'animate-mascot-float'
              }`}
            >
              <div className="relative h-64 w-60 md:h-[22rem] md:w-80 drop-shadow-[0_18px_36px_rgba(6,182,212,0.32)]">
                <Image
                  src="/ant-mascot-removebg.png"
                  alt="ANT Mascot - Ready to begin"
                  width={440}
                  height={520}
                  priority
                  unoptimized
                  className="size-full object-contain pointer-events-none select-none transition-transform duration-300 hover:scale-105"
                />
              </div>
              {/* Floor shadow */}
              <div className="animate-mascot-shadow mx-auto mt-1.5 h-3 w-36 rounded-[100%] bg-cyan-950/25 blur-[6px] dark:bg-cyan-400/25" />
            </div>
          </div>

          {/* Camera card — the primary interactive element on this screen */}
          <div className="w-full max-w-[380px]">
            <div className="flex flex-col gap-3.5 rounded-2xl border border-cyan-500/20 bg-white/70 p-4 shadow-xl shadow-cyan-950/5 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Camera className="size-4 text-cyan-500 dark:text-cyan-400" />
                  <span>Camera Preview</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isCameraActive ? 'ON' : 'OFF'}</span>
                </div>
              </div>

              {/* Webcam Video Mirror — 4:3, matches the 320×240 capture source */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-cyan-400/60 bg-slate-950 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="size-full object-cover scale-x-[-1]"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Target Face Focus Overlay */}
                <div className="absolute inset-6 rounded-xl border border-dashed border-cyan-400/50 pointer-events-none" />

                {isSmiling && (
                  <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/70 backdrop-blur-xs text-5xl animate-in zoom-in-75">
                    😄
                  </div>
                )}
              </div>

              {/* Ready meter — describes progress without scoring the face */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Ready meter</span>
                  <span className="text-slate-800 dark:text-cyan-200">
                    {isSmiling ? 'Smile detected 😊' : 'Getting ready...'}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-150 rounded-full"
                    style={{ width: `${smileProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cameraError
                    ? 'Camera unavailable — tap the button below to start.'
                    : isSmiling
                      ? 'Starting your session...'
                      : 'Looking for your smile...'}
                </p>
              </div>

              {/* Primary CTA */}
              <button
                onClick={triggerSimulatedSmile}
                disabled={isFinishing}
                type="button"
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-400 disabled:opacity-60"
              >
                {isSmiling ? 'Starting...' : "I'm Ready"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
