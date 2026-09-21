'use client'

import { Check, LogOut, Minimize2, Pause, PictureInPicture2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BreathingAura from '@/components/BreathingAura'
import FocusStateIndicator from '@/components/FocusStateIndicator'
import { formatTime, useFocusSession } from '@/lib/focus-session'

interface DeepPresenceViewProps {
  /** Whether Document PiP is supported in this browser. */
  pipSupported?: boolean
  /** Opens the Document PiP window; should start the PiP presentation. */
  onFloatWidget?: () => void
}

export default function DeepPresenceView({ pipSupported = false, onFloatWidget }: DeepPresenceViewProps = {}) {
  const { session, pauseSession, resumeSession, completeSession, stopSession, minimizeToWidget, minutesRemaining } =
    useFocusSession()

  const isPaused = session.status === 'paused'
  const progress =
    session.durationSeconds > 0
      ? 1 - session.remainingSeconds / session.durationSeconds
      : 0

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
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-5 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
          >
            <Play data-icon="inline-start" /> Resume
          </Button>
        ) : (
          <Button
            onClick={pauseSession}
            variant="outline"
            className="rounded-xl border-slate-200/90 bg-white/70 px-5 py-5 text-slate-700 hover:border-cyan-500/50 hover:bg-white/90 hover:text-cyan-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-200"
          >
            <Pause data-icon="inline-start" /> Take a pause
          </Button>
        )}
        <Button
          onClick={completeSession}
          className="rounded-xl bg-emerald-500 px-5 py-5 font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
        >
          <Check data-icon="inline-start" /> Completed early
        </Button>
        <Button
          onClick={minimizeToWidget}
          className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-5 font-semibold text-cyan-800 hover:bg-cyan-500/20 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/20"
        >
          <Minimize2 data-icon="inline-start" /> Minimize to widget
        </Button>
        {pipSupported && onFloatWidget && (
          <Button
            onClick={onFloatWidget}
            className="rounded-xl border border-cyan-500/50 bg-cyan-500/15 px-5 py-5 font-semibold text-cyan-900 hover:bg-cyan-500/25 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-100 dark:hover:bg-cyan-400/25"
          >
            <PictureInPicture2 data-icon="inline-start" /> Float Widget
          </Button>
        )}
        <Button
          onClick={stopSession}
          variant="outline"
          className="rounded-xl border-rose-300/40 bg-rose-400/10 px-5 py-5 text-rose-700 hover:bg-rose-400/20 dark:border-rose-300/10 dark:bg-rose-400/[0.04] dark:text-rose-200 dark:hover:bg-rose-400/10"
        >
          <LogOut data-icon="inline-start" /> End now
        </Button>
      </div>

      <div className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium text-cyan-600 dark:text-cyan-400/80">
          {minutesRemaining} min remaining · {isPaused ? 'paused' : 'running'}
        </span>
      </div>
    </div>
  )
}
