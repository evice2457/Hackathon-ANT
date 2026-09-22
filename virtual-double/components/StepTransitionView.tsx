'use client'

import Image from 'next/image'
import { ArrowRight, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TaskStep } from '@/lib/task-breakdown'
import { useMascotName } from '@/lib/mascot-name'
import { getMascotPresentation } from '@/lib/mascot-presentation'

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
  const mascotPresentation = getMascotPresentation('step-transition', mascotName)

  return (
    <div className={`flex items-center justify-center ${compact ? 'h-screen bg-[#0B132B] p-3 text-white' : 'min-h-[calc(100vh-80px)] px-6 py-12'}`}>
      <div className={`w-full max-w-xl border border-cyan-500/20 text-center shadow-xl backdrop-blur-md ${compact ? 'rounded-2xl bg-slate-900/90 p-4' : 'rounded-3xl bg-white/75 p-8 dark:bg-slate-900/70'}`}>
        <div className={`relative mx-auto ${compact ? 'size-20' : 'size-32'}`}>
          <Image
            src={mascotPresentation.src}
            alt={mascotPresentation.alt}
            fill
            sizes={compact ? '80px' : '128px'}
            className="object-contain"
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
          {mascotName} · Step {completedStepNumber} of {totalSteps}
        </p>
        <h2 className={`${compact ? 'mt-2 text-xl text-white' : 'mt-4 text-3xl text-slate-900 dark:text-white'} font-light`}>
          Nice — one piece done.
        </h2>
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.08] p-5 text-left">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Next</p>
          <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white">{nextStep.title}</p>
          <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">{nextStep.minutes} min</p>
        </div>
        <p className={`text-sm text-slate-300 ${compact ? 'mt-3' : 'mt-5 text-slate-600 dark:text-slate-300'}`}>
          The timer is stopped. Continue whenever you feel ready.
        </p>
        <div className={`${compact ? 'mt-4' : 'mt-7'} grid gap-3 sm:grid-cols-2`}>
          <Button onClick={onContinue} className="rounded-xl bg-cyan-500 py-6 font-semibold text-white hover:bg-cyan-400">
            Continue when ready <ArrowRight data-icon="inline-end" />
          </Button>
          <Button onClick={onEndPlan} variant="outline" className="rounded-xl py-6">
            <LogOut data-icon="inline-start" /> End plan
          </Button>
        </div>
      </div>
    </div>
  )
}
