'use client'

import { Maximize2, Play } from 'lucide-react'
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
  const { session, resumeSession } = useFocusSession()

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
      className="flex h-screen w-full select-none flex-col justify-center bg-slate-50 dark:bg-[#070F26] p-3 text-slate-900 dark:text-slate-100 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <FocusStateIndicator state={session.focusState} />

          <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {session.task || 'Your next small step'}
          </p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-4xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400">
              {formatTime(session.remainingSeconds)}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isPaused ? 'Paused' : session.status === 'completed' ? 'Complete' : 'Body doubling'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPaused && (
          <button
            onClick={resumeSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-cyan-400"
          >
            <Play className="size-3.5" /> Resume
          </button>
        )}
        <button
          onClick={handleReturn}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-cyan-500 hover:text-cyan-600 dark:border-cyan-500/30 dark:bg-[#0B132B] dark:text-slate-100 dark:hover:border-cyan-400"
        >
          <Maximize2 className="size-3.5" /> Return
        </button>
      </div>
    </div>
  )
}
