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
      {/* Outer ambient glow layer (Cyan & Sky Blue) */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 via-sky-400/25 to-blue-500/20 opacity-80 blur-3xl dark:from-cyan-400/25 dark:via-sky-400/15 dark:to-blue-600/25" />

      {/* Progress ring track and indicator */}
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-slate-200 transition-colors dark:text-[#0E1A38]"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="text-cyan-500 transition-[stroke-dashoffset] duration-1000 ease-linear dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] dark:drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          strokeDasharray={2 * Math.PI * 46}
          strokeDashoffset={2 * Math.PI * 46 * (1 - Math.min(1, Math.max(0, progress)))}
        />
      </svg>

      {/* Middle rotating decorative ring */}
      <div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full border border-slate-200 opacity-60 dark:border-cyan-500/20 dark:opacity-60" />

      {/* Inner pulsating breathing aura */}
      <div className="absolute inset-2 animate-[pulse_4s_ease-in-out_infinite] rounded-full border-2 border-cyan-500/35 shadow-lg shadow-cyan-500/20 dark:border-cyan-400/40 dark:shadow-[0_0_30px_rgba(6,182,212,0.3)]" />

      {/* Center Countdown Sphere: Crisp Porcelain & Deep Sapphire */}
      <div className="absolute flex size-36 items-center justify-center rounded-full border transition-all duration-300 backdrop-blur-xl border-slate-200 bg-white/90 shadow-lg shadow-cyan-500/5 dark:border-cyan-500/30 dark:bg-[#0B132B] dark:shadow-[0_0_35px_rgba(6,182,212,0.2)] dark:ring-1 dark:ring-cyan-500/30">
        <div className="text-center">
          {/* Numbers: Crisp, bold, high-contrast typography */}
          <div className="font-mono text-3xl font-extrabold tracking-wider text-slate-900 transition-colors dark:text-slate-100">
            {display}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500 transition-colors dark:text-slate-400">
            Just breathe
          </div>
        </div>
      </div>

      {/* Subtle floating ambient particles */}
      <div className="absolute left-1/2 top-7 size-2 -translate-x-1/2 animate-[float_6s_ease-in-out_infinite] rounded-full bg-cyan-400/50" />
      <div className="absolute bottom-7 right-7 size-2 animate-[float_7s_ease-in-out_infinite_2s] rounded-full bg-sky-300/80 dark:bg-sky-400/50" />
      <div className="absolute bottom-7 left-7 size-2 animate-[float_5s_ease-in-out_infinite_1s] rounded-full bg-blue-400/60 dark:bg-cyan-500/50" />
    </div>
  )
}
