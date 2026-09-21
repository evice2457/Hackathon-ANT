'use client'

import { Maximize2, Pause, Play } from 'lucide-react'
import { useFocusSession, formatTime } from '@/lib/focus-session'
import FocusStateIndicator from '@/components/FocusStateIndicator'

interface FloatingMiniWidgetProps {
  /** Return to the main VirtualDouble view (closes the PiP window). */
  onExitPip?: () => void
}

/**
 * The floating companion surface, rendered inside the Document PiP window via
 * a portal. It reads the shared FocusSession and owns no timer of its own, so
 * the countdown never resets when the window opens or closes.
 */
export default function FloatingMiniWidget({ onExitPip }: FloatingMiniWidgetProps = {}) {
  const { session, pauseSession, resumeSession } = useFocusSession()

  const isPaused = session.status === 'paused'

  const handleReturn = () => {
    try {
      if (typeof window !== 'undefined') {
        window.opener?.focus?.()
        window.focus?.()
      }
    } catch (e) {
      console.warn('Could not focus main window:', e)
    }
    onExitPip?.()
  }

  return (
    <div
      aria-label="Floating focus companion"
      className="flex h-screen w-full select-none flex-col justify-center bg-slate-50 dark:bg-[#0B132B] p-3 text-slate-900 dark:text-white transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <FocusStateIndicator state={session.focusState} />

          <p className="mt-2 truncate text-sm font-semibold text-slate-800 dark:text-white">
            {session.task || 'Your next small step'}
          </p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-4xl font-light tracking-tight text-cyan-700 dark:text-cyan-100">
              {formatTime(session.remainingSeconds)}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isPaused ? 'Paused' : session.status === 'completed' ? 'Complete' : 'Body doubling'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPaused ? (
          <button
            onClick={resumeSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-200 transition-colors hover:bg-cyan-500/20"
          >
            <Play className="size-3.5" /> Resume
          </button>
        ) : (
          <button
            onClick={pauseSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-200/80 dark:bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-300/80 dark:hover:bg-white/10"
          >
            <Pause className="size-3.5" /> Pause
          </button>
        )}
        <button
          onClick={handleReturn}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-200 transition-colors hover:bg-cyan-500/20"
        >
          <Maximize2 className="size-3.5" /> Return
        </button>
      </div>
    </div>
  )
}
