'use client'

import { useState, useEffect } from 'react'
import { Check, LogOut, PictureInPicture2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BreathingAura from '@/components/BreathingAura'
import FocusStateIndicator from '@/components/FocusStateIndicator'
import { formatTime, useFocusSession } from '@/lib/focus-session'
import { useFloatingCompanion, useNativeClick } from '@/lib/floating-companion'
import { primeAudioOnGesture } from '@/lib/ant-voice'

export default function DeepPresenceView() {
  const { session, resumeSession, completeSession, stopSession, minutesRemaining } =
    useFocusSession()
  const floating = useFloatingCompanion()
  const [isConfirmingEnd, setIsConfirmingEnd] = useState(false)

  // Native click: requestWindow() needs the original user activation, which
  // React's synthetic events don't reliably preserve.
  const floatButtonRef = useNativeClick<HTMLButtonElement>(() => floating?.open())

  const isPaused = session.status === 'paused'
  const progress =
    session.durationSeconds > 0
      ? 1 - session.remainingSeconds / session.durationSeconds
      : 0

  // Keep audio keep-alive primed on any user interaction within the countdown view
  useEffect(() => {
    const handleUserInteraction = () => {
      primeAudioOnGesture()
    }
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true })
    window.addEventListener('keydown', handleUserInteraction, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
    }
  }, [])

  // Keyboard shortcut listener: Escape dismisses End confirmation.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const activeTag = document.activeElement?.tagName.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return
      }

      if (e.code === 'Escape') {
        if (isConfirmingEnd) {
          setIsConfirmingEnd(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isConfirmingEnd])

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12">
      <div className="mb-14">
        <BreathingAura label={formatTime(session.remainingSeconds)} progress={progress} />
      </div>

      <div className="mb-10 max-w-2xl text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#A61C30] transition-colors dark:text-[#F39BA9]">
          Current Focus
        </p>
        <div className="rounded-3xl border border-[#EADBCE] bg-white/85 px-8 py-6 shadow-sm backdrop-blur-md transition-all dark:border-[#42202B] dark:bg-[#201016]/85 dark:shadow-none">
          <p className="text-2xl font-light text-[#201416] transition-colors dark:text-[#FAF4EB]">{session.task}</p>
        </div>
      </div>

      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <p className="text-base text-[#614F4D] transition-colors dark:text-[#C5B3B1]">
          {isPaused ? 'Taking a pause — resume when you’re ready.' : 'Your AI body double is quietly working alongside you.'}
        </p>
        <FocusStateIndicator state={session.focusState} size="md" />
      </div>

      <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
        {isPaused && (
          <Button
            onClick={resumeSession}
            className="h-11 rounded-full bg-[#A61C30] hover:bg-[#8F1627] px-6 font-bold text-white shadow-md shadow-[#A61C30]/25 transition-all dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
          >
            <Play data-icon="inline-start" /> Resume
          </Button>
        )}
        <Button
          onClick={completeSession}
          className="h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 font-bold text-white shadow-md shadow-emerald-600/20 transition-all dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-white"
        >
          <Check data-icon="inline-start" /> Completed early
        </Button>
        {floating?.isSupported && (
          <button
            ref={floatButtonRef}
            type="button"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#EADBCE] bg-white/80 px-6 text-sm font-semibold text-[#4A3E3D] transition-colors hover:border-[#A61C30] hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016]/80 dark:text-[#FAF4EB] dark:hover:border-[#C92A43] dark:hover:text-[#F39BA9]"
          >
            <PictureInPicture2 className="size-4 shrink-0" /> Open floating companion
          </button>
        )}
        {isConfirmingEnd ? (
          <div className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-300/80 bg-rose-50 px-4 backdrop-blur-md dark:border-rose-900/60 dark:bg-rose-950/60 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-semibold text-[#A61C30] dark:text-[#F39BA9]">
              End session?
            </span>
            <button
              onClick={stopSession}
              type="button"
              className="rounded-full bg-[#A61C30] px-3.5 py-1 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#8F1627] dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
            >
              Yes, end
            </button>
            <button
              onClick={() => setIsConfirmingEnd(false)}
              type="button"
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-[#786663] transition-colors hover:bg-white/60 dark:text-[#A89299] dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        ) : (
          <Button
            onClick={() => setIsConfirmingEnd(true)}
            variant="outline"
            className="h-11 rounded-full border-rose-200 bg-rose-50/70 px-6 text-sm font-semibold text-[#A61C30] hover:bg-rose-100 hover:text-[#8F1627] dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-[#F39BA9] dark:hover:bg-rose-950/60"
          >
            <LogOut data-icon="inline-start" /> End now
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-[#EADBCE]/80 bg-white/60 text-xs text-[#786663] backdrop-blur-xs dark:border-[#42202B]/80 dark:bg-[#201016]/60 dark:text-[#A89299]">
        <span className="font-semibold text-[#A61C30] dark:text-[#F39BA9]">
          {minutesRemaining} min remaining · {isPaused ? 'paused' : 'running'}
        </span>
      </div>
    </div>
  )
}
