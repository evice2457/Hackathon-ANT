'use client'

import { useState, useEffect } from 'react'
import { Check, LogOut, Pause, PictureInPicture2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BreathingAura from '@/components/BreathingAura'
import FocusStateIndicator from '@/components/FocusStateIndicator'
import { formatTime, useFocusSession } from '@/lib/focus-session'
import { useFloatingCompanion, useNativeClick } from '@/lib/floating-companion'
import { primeAudioOnGesture } from '@/lib/ant-voice'

export default function DeepPresenceView() {
  const { session, pauseSession, resumeSession, completeSession, stopSession, minutesRemaining } =
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

  // Keyboard shortcut listener: Space to toggle Pause/Resume, Escape to dismiss End confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const activeTag = document.activeElement?.tagName.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        if (isPaused) {
          resumeSession()
        } else {
          pauseSession()
        }
      } else if (e.code === 'Escape') {
        if (isConfirmingEnd) {
          setIsConfirmingEnd(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused, isConfirmingEnd, resumeSession, pauseSession])

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12">
      <div className="mb-14">
        <BreathingAura label={formatTime(session.remainingSeconds)} progress={progress} />
      </div>

      <div className="mb-10 max-w-2xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 transition-colors dark:text-slate-400">
          Current Focus
        </p>
        <div className="rounded-2xl border border-cyan-500/20 bg-white/75 px-8 py-6 shadow-xl shadow-cyan-950/5 backdrop-blur-md transition-all dark:bg-gradient-to-br dark:from-slate-800/60 dark:to-slate-900/60 dark:shadow-none">
          <p className="text-2xl font-light text-slate-900 transition-colors dark:text-white">{session.task}</p>
        </div>
      </div>

      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <p className="text-base text-slate-600 transition-colors dark:text-slate-400">
          {isPaused ? 'Taking a pause — resume when you’re ready.' : 'Your AI body double is quietly working alongside you.'}
        </p>
        <FocusStateIndicator state={session.focusState} size="md" />
      </div>

      <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
        {isPaused ? (
          <Button
            onClick={resumeSession}
            className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
          >
            <Play data-icon="inline-start" /> Resume
          </Button>
        ) : (
          <Button
            onClick={pauseSession}
            variant="outline"
            className="h-11 rounded-xl border-slate-200/90 bg-white/70 px-5 text-slate-700 hover:border-cyan-500/50 hover:bg-white/90 hover:text-cyan-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-200"
          >
            <Pause data-icon="inline-start" /> Take a pause
          </Button>
        )}
        <Button
          onClick={completeSession}
          className="h-11 rounded-xl bg-emerald-500 px-5 font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300"
        >
          <Check data-icon="inline-start" /> Completed early
        </Button>
        {floating?.isSupported && (
          <button
            ref={floatButtonRef}
            type="button"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-500/15 px-5 text-sm font-semibold text-cyan-900 transition-colors hover:bg-cyan-500/25 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-100 dark:hover:bg-cyan-400/25"
          >
            <PictureInPicture2 className="size-4 shrink-0" /> Open floating companion
          </button>
        )}
        {isConfirmingEnd ? (
          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-300/60 bg-rose-500/10 px-3 backdrop-blur-md dark:border-rose-400/30 dark:bg-rose-950/40 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-medium text-rose-700 dark:text-rose-200">
              End session?
            </span>
            <button
              onClick={stopSession}
              type="button"
              className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500"
            >
              Yes, end
            </button>
            <button
              onClick={() => setIsConfirmingEnd(false)}
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        ) : (
          <Button
            onClick={() => setIsConfirmingEnd(true)}
            variant="outline"
            className="h-11 rounded-xl border-rose-300/40 bg-rose-400/10 px-5 text-rose-700 hover:bg-rose-400/20 dark:border-rose-300/10 dark:bg-rose-400/[0.04] dark:text-rose-200 dark:hover:bg-rose-400/10"
          >
            <LogOut data-icon="inline-start" /> End now
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium text-cyan-600 dark:text-cyan-400/80">
          {minutesRemaining} min remaining · {isPaused ? 'paused' : 'running'}
        </span>
        <span className="hidden sm:inline text-slate-400 dark:text-slate-600">·</span>
        <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">
          Press <kbd className="rounded border border-slate-300/80 bg-slate-100/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300">Space</kbd> to {isPaused ? 'resume' : 'pause'}
        </span>
      </div>
    </div>
  )
}
