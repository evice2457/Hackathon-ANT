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
    <div className="relative flex size-72 items-center justify-center select-none">
      {/* Outer ambient glow layer */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/35 to-blue-600/25 opacity-70 blur-3xl dark:opacity-75" />

      {/* Progress ring track and indicator */}
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-slate-300/80 transition-colors dark:text-slate-700/60"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-cyan-600 transition-[stroke-dashoffset] duration-1000 ease-linear dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
          strokeDasharray={2 * Math.PI * 46}
          strokeDashoffset={2 * Math.PI * 46 * (1 - Math.min(1, Math.max(0, progress)))}
        />
      </svg>

      {/* Middle rotating decorative ring */}
      <div className="absolute inset-0 animate-[spin_10s_linear_infinite] rounded-full border border-cyan-500/30 opacity-60 dark:border-cyan-400/30 dark:opacity-60" />

      {/* Inner pulsating breathing aura */}
      <div className="absolute inset-2 animate-[pulse_4s_ease-in-out_infinite] rounded-full border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/30 dark:border-cyan-400/60 dark:shadow-[0_0_30px_rgba(6,182,212,0.4)]" />

      {/* Center Countdown Sphere: High Contrast in Dark Mode (Pure deep midnight, no white stripe) */}
      <div className="absolute flex size-36 items-center justify-center rounded-full border transition-all duration-300 backdrop-blur-xl border-cyan-500/30 bg-gradient-to-br from-white via-sky-50 to-slate-100 shadow-xl shadow-cyan-950/10 dark:border-cyan-400/60 dark:bg-[#071329] dark:bg-gradient-to-b dark:from-[#0b1b3d] dark:via-[#071329] dark:to-[#030914] dark:shadow-[0_0_40px_rgba(6,182,212,0.3)] dark:ring-1 dark:ring-cyan-400/40">
        <div className="text-center">
          {/* Numbers: Crisp, bold, high-contrast cyan glow */}
          <div className="font-mono text-3xl font-extrabold tracking-wider text-cyan-950 transition-colors dark:text-cyan-200 dark:drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]">
            {display}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500 transition-colors dark:text-cyan-100/70">
            Just breathe
          </div>
        </div>
      </div>

      {/* Subtle floating particles */}
      <div className="absolute left-1/2 top-7 size-2 -translate-x-1/2 animate-[float_6s_ease-in-out_infinite] rounded-full bg-cyan-500/60 dark:bg-cyan-400/60" />
      <div className="absolute bottom-7 right-7 size-2 animate-[float_7s_ease-in-out_infinite_2s] rounded-full bg-blue-500/60 dark:bg-blue-400/60" />
      <div className="absolute bottom-7 left-7 size-2 animate-[float_5s_ease-in-out_infinite_1s] rounded-full bg-cyan-500/50 dark:bg-cyan-400/50" />
    </div>
  )
}
