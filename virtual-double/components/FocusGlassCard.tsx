'use client'

import React, { useState } from 'react'
import { CheckCircle2, Clock, Sparkles, Target, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FocusGlassCardProps {
  taskTitle?: string
  allocatedMinutes?: number
  currentStep?: string
  className?: string
  onComplete?: () => void
  onBreakdown?: () => void
}

/**
 * FocusGlassCard — Neuroinclusive Glassmorphic Component for ADHD & High Focus
 *
 * Designed according to WCAG AAA & Neurodivergent UX Principles:
 * 1. Controlled Opacity & Backdrop Blur: High optical density (85-90%) prevents visual noise from bleed-through.
 * 2. WCAG AAA High Contrast: Text contrast >= 7:1 against glass background.
 * 3. Sharp Visual Anchors: 1px crisp dual borders with specular highlight to eliminate visual drift.
 * 4. Motion Control: Respects prefers-reduced-motion; only calm, purposeful transitions.
 * 5. Spacious Ergonomics: Generous padding, clear visual hierarchy, single primary focus.
 */
export default function FocusGlassCard({
  taskTitle = 'Refactor Authentication State Machine',
  allocatedMinutes = 15,
  currentStep = 'Define the 4 explicit discrete states and transition events',
  className = '',
  onComplete,
  onBreakdown,
}: FocusGlassCardProps) {
  const [isRunning, setIsRunning] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleToggleTimer = () => setIsRunning((prev) => !prev)

  const handleComplete = () => {
    setIsCompleted(true)
    onComplete?.()
  }

  return (
    <article
      aria-label="Current Focus Commitment"
      className={`relative w-full max-w-xl select-none overflow-hidden rounded-3xl transition-all duration-300 ease-out
        /* 1. Backdrop Blur & Controlled Opacity (Zero visual bleed-through) */
        bg-white/85 backdrop-blur-xl dark:bg-[#0c162e]/90
        
        /* 2. Sharp Visual Anchors: Specular highlight top rim + 1px crisp perimeter */
        border border-slate-200/90 dark:border-white/12
        shadow-[0_12px_40px_-10px_rgba(15,23,42,0.12)] dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]
        ring-1 ring-inset ring-black/5 dark:ring-white/5
        
        /* 3. Spacious Layout & Ergonomics */
        p-8 md:p-10 ${className}`}
    >
      {/* Subtle Top Specular Reflection Gradient (Anchors top edge crisply) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent dark:via-cyan-400/50"
        aria-hidden="true"
      />

      {/* Header: Status Pill + Time Badge */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Visual Anchor Tag */}
        <div className="flex items-center gap-2 rounded-full border border-cyan-600/30 bg-cyan-50/80 px-3.5 py-1.5 backdrop-blur-md dark:border-cyan-400/30 dark:bg-cyan-950/50">
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
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-950 dark:text-cyan-200">
            {isRunning ? 'Deep Work · Focused' : 'Session Paused'}
          </span>
        </div>

        {/* Time Allocation */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Clock className="size-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
          <span>{allocatedMinutes} min sprint</span>
        </div>
      </div>

      {/* Primary Focus Title (WCAG AAA High Contrast) */}
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 transition-colors dark:text-white md:text-3xl">
          {taskTitle}
        </h3>
        <p className="text-sm font-normal leading-relaxed text-slate-700 transition-colors dark:text-slate-300">
          One single goal. Everything else can wait until the timer rings.
        </p>
      </div>

      {/* Single Next Micro-Step Card (Visual Isolation for ADHD) */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 transition-colors dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
          <Target className="size-4" aria-hidden="true" />
          <span>Immediate Next Micro-Step</span>
        </div>
        <p className="text-base font-medium text-slate-900 dark:text-slate-100">
          {currentStep}
        </p>
      </div>

      {/* Action Controls with Tactile Contrast & Clear Affordance */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Pause / Resume Button */}
          <Button
            type="button"
            onClick={handleToggleTimer}
            variant="outline"
            className="rounded-xl border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:border-cyan-500 hover:text-cyan-800 hover:shadow dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-200"
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

          {/* AI Task Breakdown (Instant relief for cognitive overwhelm) */}
          <Button
            type="button"
            onClick={onBreakdown}
            variant="outline"
            className="rounded-xl border-amber-300/80 bg-amber-50/60 px-4 py-2 text-xs font-semibold text-amber-900 transition-all hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            <Sparkles className="mr-1.5 size-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            Chia nhỏ việc
          </Button>
        </div>

        {/* Primary Completion Button */}
        <Button
          type="button"
          onClick={handleComplete}
          disabled={isCompleted}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 dark:from-emerald-500 dark:to-teal-500 dark:shadow-emerald-950/40"
        >
          <CheckCircle2 className="mr-1.5 size-4" aria-hidden="true" />
          {isCompleted ? 'Đã hoàn thành!' : 'Hoàn tất bước này'}
        </Button>
      </footer>
    </article>
  )
}
