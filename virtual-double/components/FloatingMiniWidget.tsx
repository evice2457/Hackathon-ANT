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
      className="flex h-screen w-full select-none flex-col justify-center bg-[#FAF7F2] dark:bg-[#160B0F] p-3 text-[#201416] dark:text-[#FAF4EB] transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <FocusStateIndicator state={session.focusState} />

          <p className="mt-2 truncate text-sm font-semibold text-[#201416] dark:text-[#FAF4EB]">
            {session.task || 'Your next small step'}
          </p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-4xl font-extrabold tracking-tight text-[#A61C30] dark:text-[#F39BA9]">
              {formatTime(session.remainingSeconds)}
            </span>
            <span className="text-[11px] font-medium text-[#786663] dark:text-[#A89299]">
              {isPaused ? 'Paused' : session.status === 'completed' ? 'Complete' : 'Body doubling'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPaused && (
          <button
            onClick={resumeSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#A61C30] px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#8F1627] dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
          >
            <Play className="size-3.5" /> Resume
          </button>
        )}
        <button
          onClick={handleReturn}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#EADBCE] bg-white/80 px-3 py-2 text-xs font-semibold text-[#4A3E3D] shadow-2xs transition-colors hover:border-[#A61C30] hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016] dark:text-[#FAF4EB] dark:hover:border-[#C92A43]"
        >
          <Maximize2 className="size-3.5" /> Return
        </button>
      </div>
    </div>
  )
}
