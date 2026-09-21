'use client'

import { Maximize2, Pause, Play, X } from 'lucide-react'
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
  const { session, pauseSession, resumeSession, stopSession } = useFocusSession()

  const isPaused = session.status === 'paused'

  return (
    <div
      aria-label="Floating focus companion"
      className="flex h-screen w-full select-none flex-col justify-center bg-[#0B132B] p-3"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <FocusStateIndicator state={session.focusState} />

          <p className="mt-2 truncate text-sm font-medium text-white">
            {session.task || 'Your next small step'}
          </p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-4xl font-light tracking-tight text-cyan-100">
              {formatTime(session.remainingSeconds)}
            </span>
            <span className="text-[11px] text-slate-400">
              {isPaused ? 'Paused' : session.status === 'completed' ? 'Complete' : 'Body doubling'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPaused ? (
          <button
            onClick={resumeSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <Play className="size-3.5" /> Resume
          </button>
        ) : (
          <button
            onClick={pauseSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            <Pause className="size-3.5" /> Pause
          </button>
        )}
        <button
          onClick={onExitPip}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20"
        >
          <Maximize2 className="size-3.5" /> Return
        </button>
        <button
          onClick={stopSession}
          aria-label="End session"
          className="flex items-center justify-center rounded-lg bg-rose-400/10 px-2.5 py-2 text-rose-200 transition-colors hover:bg-rose-400/20"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
