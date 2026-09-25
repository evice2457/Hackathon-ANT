'use client'

import { ArrowRight, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TaskStep } from '@/lib/task-breakdown'
import { useMascotName } from '@/lib/mascot-name'

interface StepTransitionViewProps {
  completedStepNumber: number
  totalSteps: number
  nextStep: TaskStep
  onContinue: () => void
  onEndPlan: () => void
  compact?: boolean
}

export default function StepTransitionView({
  completedStepNumber,
  totalSteps,
  nextStep,
  onContinue,
  onEndPlan,
  compact = false,
}: StepTransitionViewProps) {
  const { mascotName } = useMascotName()

  return (
    <div className={`flex items-center justify-center ${compact ? 'h-screen bg-[#070F26] p-3 text-slate-100' : 'min-h-[calc(100vh-80px)] px-6 py-12'}`}>
      <div className={`w-full max-w-xl text-center shadow-sm backdrop-blur-md ${compact ? 'rounded-3xl border border-cyan-500/20 bg-[#0B132B]/95 p-4' : 'rounded-3xl border border-slate-200 bg-white/85 p-8 dark:border-cyan-500/25 dark:bg-[#0B132B]/85'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
          {mascotName} · Step {completedStepNumber} of {totalSteps}
        </p>
        <h2 className={`${compact ? 'mt-2 text-xl text-slate-100' : 'mt-4 text-3xl text-slate-900 dark:text-slate-100'} font-light`}>
          Nice — one piece done.
        </h2>
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-50/60 p-5 text-left dark:border-cyan-500/30 dark:bg-cyan-950/40">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Next</p>
          <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{nextStep.title}</p>
          <p className="mt-1 text-sm font-semibold text-cyan-600 dark:text-cyan-400">{nextStep.minutes} min</p>
        </div>
        <p className={`text-sm ${compact ? 'mt-3 text-slate-400' : 'mt-5 text-slate-600 dark:text-slate-400'}`}>
          The timer is stopped. Continue whenever you feel ready.
        </p>
        <div className={`${compact ? 'mt-4' : 'mt-7'} grid gap-3 sm:grid-cols-2`}>
          <Button onClick={onContinue} className="rounded-full bg-cyan-500 hover:bg-cyan-400 py-6 font-bold text-slate-950 shadow-md shadow-cyan-500/25">
            Continue when ready <ArrowRight data-icon="inline-end" />
          </Button>
          <Button onClick={onEndPlan} variant="outline" className="rounded-full border-slate-200 bg-white/80 py-6 font-semibold text-slate-700 hover:bg-slate-100 dark:border-cyan-500/30 dark:bg-[#0B132B] dark:text-slate-100">
            <LogOut data-icon="inline-start" /> End plan
          </Button>
        </div>
      </div>
    </div>
  )
}
