'use client'

import { Check, LogOut, Minimize2, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BreathingAura from '@/components/BreathingAura'
import FocusStateIndicator from '@/components/FocusStateIndicator'
import { formatTime, useFocusSession } from '@/lib/focus-session'

export default function DeepPresenceView() {
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
        <p className="mb-4 text-sm uppercase tracking-widest text-slate-400">Current Focus</p>
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-8 py-6 backdrop-blur-sm">
          <p className="text-2xl font-light text-white">{session.task}</p>
        </div>
      </div>

      <div className="mb-10 flex flex-col items-center gap-3">
        <p className="text-base text-slate-400">
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
            className="rounded-xl border-white/10 bg-white/[0.03] px-5 py-5 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200"
          >
            <Pause data-icon="inline-start" /> Take a pause
          </Button>
        )}
        <Button
          onClick={completeSession}
          className="rounded-xl bg-emerald-400 px-5 py-5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-300"
        >
          <Check data-icon="inline-start" /> Completed early
        </Button>
        <Button
          onClick={minimizeToWidget}
          className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-5 font-semibold text-cyan-200 hover:bg-cyan-400/20"
        >
          <Minimize2 data-icon="inline-start" /> Minimize to widget
        </Button>
        <Button
          onClick={stopSession}
          variant="outline"
          className="rounded-xl border-rose-300/10 bg-rose-400/[0.04] px-5 py-5 text-rose-200 hover:bg-rose-400/10"
        >
          <LogOut data-icon="inline-start" /> End now
        </Button>
      </div>

      <FocusStateDebugControls />

      <div className="px-6 py-4 text-xs text-slate-500">
        <span className="text-cyan-400/80">
          {minutesRemaining} min remaining · {isPaused ? 'paused' : 'running'}
        </span>
      </div>
    </div>
  )
}

/**
 * DEVELOPMENT / DEMO ONLY.
 * Lets us simulate what the computer-vision teammate will drive via
 * setFocusState(...). Remove or gate behind a flag before shipping.
 */
function FocusStateDebugControls() {
  const { setFocusState } = useFocusSession()
  const states = [
    ['Focused', 'focused'],
    ['Possibly distracted', 'possibly_distracted'],
    ['Away', 'away'],
  ] as const

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Dev · focus state
      </span>
      {states.map(([label, value]) => (
        <button
          key={value}
          onClick={() => setFocusState(value)}
          className="rounded-lg bg-slate-800/60 px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-cyan-200"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
