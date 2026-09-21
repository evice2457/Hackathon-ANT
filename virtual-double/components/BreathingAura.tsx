'use client'

import { formatTime } from '@/lib/focus-session'

interface BreathingAuraProps {
  /** Seconds remaining, rendered as the central countdown. */
  remainingSeconds?: number
  /** 0–1, how far through the session we are (drives the progress ring). */
  progress?: number
  label?: string
}

export default function BreathingAura({ remainingSeconds, progress = 0, label }: BreathingAuraProps) {
  const display = label ?? (remainingSeconds !== undefined ? formatTime(remainingSeconds) : '15:00')

  return (
    <div className="relative flex size-64 items-center justify-center">
      {/* Outer glow layer */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/20 opacity-60 blur-3xl" />

      {/* Progress ring */}
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-700/40" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-cyan-400/70 transition-[stroke-dashoffset] duration-1000 ease-linear"
          strokeDasharray={2 * Math.PI * 46}
          strokeDashoffset={2 * Math.PI * 46 * (1 - Math.min(1, Math.max(0, progress)))}
        />
      </svg>

      {/* Middle animated ring */}
      <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full border-2 border-cyan-500/40 opacity-50" />

      {/* Inner breathing ring */}
      <div className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite] rounded-full border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/50" />

      {/* Center circle */}
      <div className="absolute flex size-32 items-center justify-center rounded-full border border-cyan-500/30 bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner">
        <div className="text-center">
          <div className="font-mono text-2xl font-light tracking-tight text-cyan-200">{display}</div>
          <div className="mt-1 text-xs text-slate-400">Just breathe</div>
        </div>
      </div>

      {/* Subtle floating particles */}
      <div className="absolute left-1/2 top-8 size-2 -translate-x-1/2 animate-[float_6s_ease-in-out_infinite] rounded-full bg-cyan-400/40" />
      <div className="absolute bottom-8 right-8 size-2 animate-[float_7s_ease-in-out_infinite_2s] rounded-full bg-blue-400/40" />
      <div className="absolute bottom-8 left-8 size-2 animate-[float_5s_ease-in-out_infinite_1s] rounded-full bg-cyan-400/30" />
    </div>
  )
}
