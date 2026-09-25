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
      {/* Outer ambient glow layer (Crimson, Butter & Rose) */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#A61C30]/20 via-[#FBE8A6]/25 to-[#E8929E]/20 opacity-80 blur-3xl dark:from-[#C92A43]/25 dark:via-[#FBE8A6]/10 dark:to-[#8F1627]/25" />

      {/* Progress ring track and indicator */}
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-[#EADBCE] transition-colors dark:text-[#381822]"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="text-[#A61C30] transition-[stroke-dashoffset] duration-1000 ease-linear dark:text-[#F39BA9] drop-shadow-[0_0_8px_rgba(166,28,48,0.4)] dark:drop-shadow-[0_0_10px_rgba(243,155,169,0.5)]"
          strokeDasharray={2 * Math.PI * 46}
          strokeDashoffset={2 * Math.PI * 46 * (1 - Math.min(1, Math.max(0, progress)))}
        />
      </svg>

      {/* Middle rotating decorative ring */}
      <div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full border border-[#EADBCE] opacity-60 dark:border-[#42202B]/60 dark:opacity-60" />

      {/* Inner pulsating breathing aura */}
      <div className="absolute inset-2 animate-[pulse_4s_ease-in-out_infinite] rounded-full border-2 border-[#A61C30]/35 shadow-lg shadow-[#A61C30]/20 dark:border-[#C92A43]/40 dark:shadow-[0_0_30px_rgba(201,42,67,0.3)]" />

      {/* Center Countdown Sphere: High Contrast Porcelain Cream & Deep Velvet Plum */}
      <div className="absolute flex size-36 items-center justify-center rounded-full border transition-all duration-300 backdrop-blur-xl border-[#EADBCE] bg-gradient-to-br from-white via-[#FAF7F2] to-[#F5ECE3] shadow-lg shadow-[#A61C30]/5 dark:border-[#52232F] dark:bg-[#1C0B12] dark:bg-gradient-to-b dark:from-[#251019] dark:via-[#1C0B12] dark:to-[#12070A] dark:shadow-[0_0_35px_rgba(201,42,67,0.2)] dark:ring-1 dark:ring-[#C92A43]/30">
        <div className="text-center">
          {/* Numbers: Crisp, bold, high-contrast typography */}
          <div className="font-mono text-3xl font-extrabold tracking-wider text-[#201416] transition-colors dark:text-[#FAF4EB]">
            {display}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#786663] transition-colors dark:text-[#C5B3B1]">
            Just breathe
          </div>
        </div>
      </div>

      {/* Subtle floating ambient particles */}
      <div className="absolute left-1/2 top-7 size-2 -translate-x-1/2 animate-[float_6s_ease-in-out_infinite] rounded-full bg-[#A61C30]/50 dark:bg-[#F39BA9]/50" />
      <div className="absolute bottom-7 right-7 size-2 animate-[float_7s_ease-in-out_infinite_2s] rounded-full bg-[#FBE8A6]/80 dark:bg-[#FBE8A6]/50" />
      <div className="absolute bottom-7 left-7 size-2 animate-[float_5s_ease-in-out_infinite_1s] rounded-full bg-[#E8929E]/60 dark:bg-[#C92A43]/50" />
    </div>
  )
}
