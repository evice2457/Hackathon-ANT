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
        bg-white/85 backdrop-blur-xl dark:bg-[#201016]/90
        border border-[#EADBCE] dark:border-[#42202B]
        shadow-sm dark:shadow-2xl
        p-8 md:p-10 ${className}`}
    >
      {/* Subtle Top Specular Reflection Gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A61C30]/30 to-transparent dark:via-[#F39BA9]/30"
        aria-hidden="true"
      />

      {/* Header: Status Pill + Time Badge */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Visual Anchor Tag */}
        <div className="flex items-center gap-2 rounded-full border border-[#E8D5CE] bg-[#F7ECE8] px-3.5 py-1.5 backdrop-blur-md dark:border-[#52232B] dark:bg-[#32141A]">
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
          <span className="text-xs font-bold uppercase tracking-wider text-[#A61C30] dark:text-[#F39BA9]">
            {isRunning ? 'Deep Work · Focused' : 'Session Paused'}
          </span>
        </div>

        {/* Time Allocation */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#614F4D] dark:text-[#C5B3B1]">
          <Clock className="size-3.5 text-[#A61C30] dark:text-[#F39BA9]" aria-hidden="true" />
          <span>{allocatedMinutes} min sprint</span>
        </div>
      </div>

      {/* Primary Focus Title */}
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-semibold tracking-tight text-[#201416] transition-colors dark:text-[#FAF4EB] md:text-3xl">
          {taskTitle}
        </h3>
        <p className="text-sm font-normal leading-relaxed text-[#614F4D] transition-colors dark:text-[#C5B3B1]">
          One single goal. Everything else can wait until the timer rings.
        </p>
      </div>

      {/* Single Next Micro-Step Card */}
      <div className="mb-8 rounded-2xl border border-[#EADBCE] bg-[#FDFBF7] p-5 transition-colors dark:border-[#42202B] dark:bg-[#1A0B10]/80">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A61C30] dark:text-[#F39BA9]">
          <Target className="size-4" aria-hidden="true" />
          <span>Immediate Next Micro-Step</span>
        </div>
        <p className="text-base font-medium text-[#201416] dark:text-[#FAF4EB]">
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
            className="rounded-full border-[#EADBCE] bg-white px-4 py-2 text-xs font-semibold text-[#4A3E3D] shadow-2xs transition-all hover:border-[#A61C30] hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016] dark:text-[#FAF4EB] dark:hover:border-[#C92A43] dark:hover:text-[#F39BA9]"
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
            className="rounded-full border-[#EADBCE] bg-[#FBE8A6]/40 px-4 py-2 text-xs font-semibold text-[#614F4D] transition-all hover:bg-[#FBE8A6]/70 dark:border-[#42202B] dark:bg-[#3A1823] dark:text-[#FBE8A6]"
          >
            <Sparkles className="mr-1.5 size-3.5 text-[#A61C30] dark:text-[#FBE8A6]" aria-hidden="true" />
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
