'use client'

import { useState } from 'react'
import { Target, Sparkles, Pause, Play, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FocusGlassCardProps {
  taskTitle: string
  currentStep: string
  allocatedMinutes: number
  onBreakdown?: () => void
  onToggleTimer?: () => void
  onComplete?: () => void
  className?: string
}

export default function FocusGlassCard({
  taskTitle,
  currentStep,
  allocatedMinutes,
  onBreakdown,
  onToggleTimer,
  onComplete,
  className = '',
}: FocusGlassCardProps) {
  const [isRunning, setIsRunning] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleToggleTimer = () => {
    setIsRunning(!isRunning)
    onToggleTimer?.()
  }

  const handleComplete = () => {
    setIsCompleted(true)
    onComplete?.()
  }

  return (
    <article
      aria-label="Current Focus Session"
      className={`relative overflow-hidden rounded-3xl
        border border-slate-200 dark:border-cyan-500/20
        bg-white/85 dark:bg-[#0B132B]/85
        backdrop-blur-xl
        shadow-sm dark:shadow-2xl
        p-8 md:p-10 ${className}`}
    >
      {/* Subtle Top Specular Reflection Gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        aria-hidden="true"
      />

      {/* Header: Status Pill + Time Badge */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Visual Anchor Tag */}
        <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 backdrop-blur-md">
          <span className="relative flex size-2">
            <span
              className={`size-full rounded-full ${
                isRunning
                  ? 'bg-emerald-500 motion-safe:animate-ping dark:bg-emerald-400'
                  : 'bg-amber-500 dark:bg-amber-400'
              }`}
            />
            <span
              className={`absolute inset-0 size-full rounded-full ${
                isRunning ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-amber-600 dark:bg-amber-400'
              }`}
            />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            {isRunning ? 'Deep Work · Focused' : 'Session Paused'}
          </span>
        </div>

        {/* Time Allocation */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Clock className="size-3.5 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
          <span>{allocatedMinutes} min sprint</span>
        </div>
      </div>

      {/* Primary Focus Title */}
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 transition-colors dark:text-slate-100 md:text-3xl">
          {taskTitle}
        </h3>
        <p className="text-sm font-normal leading-relaxed text-slate-600 transition-colors dark:text-slate-400">
          One single goal. Everything else can wait until the timer rings.
        </p>
      </div>

      {/* Single Next Micro-Step Card */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-colors dark:border-cyan-500/20 dark:bg-[#0E1A38]/70">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          <Target className="size-4" aria-hidden="true" />
          <span>Immediate Next Micro-Step</span>
        </div>
        <p className="text-base font-medium text-slate-900 dark:text-slate-100">
          {currentStep}
        </p>
      </div>

      {/* Action Controls with Capsule Buttons */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Pause / Resume Button */}
          <Button
            type="button"
            onClick={handleToggleTimer}
            variant="outline"
            className="rounded-full border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-cyan-500 hover:text-cyan-600 dark:border-cyan-500/30 dark:bg-[#0B132B] dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          >
            {isRunning ? (
              <>
                <Pause className="mr-1.5 size-3.5" aria-hidden="true" /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="mr-1.5 size-3.5" aria-hidden="true" /> Tiếp tục
              </>
            )}
          </Button>

          {/* AI Task Breakdown */}
          <Button
            type="button"
            onClick={onBreakdown}
            variant="outline"
            className="rounded-full border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-900/40"
          >
            <Sparkles className="mr-1.5 size-3.5 text-cyan-400" aria-hidden="true" />
            Chia nhỏ việc
          </Button>
        </div>

        {/* Primary Completion Button */}
        <Button
          type="button"
          onClick={handleComplete}
          disabled={isCompleted}
          className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          <CheckCircle2 className="mr-1.5 size-4" aria-hidden="true" />
          {isCompleted ? 'Đã hoàn thành!' : 'Hoàn tất bước này'}
        </Button>
      </footer>
    </article>
  )
}
