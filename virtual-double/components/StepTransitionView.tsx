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
    <div className={`flex items-center justify-center ${compact ? 'h-screen bg-[#160B0F] p-3 text-[#FAF4EB]' : 'min-h-[calc(100vh-80px)] px-6 py-12'}`}>
      <div className={`w-full max-w-xl text-center shadow-sm backdrop-blur-md ${compact ? 'rounded-3xl border border-[#42202B] bg-[#24121A]/95 p-4' : 'rounded-3xl border border-[#EADBCE] bg-white/85 p-8 dark:border-[#42202B] dark:bg-[#201016]/85'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A61C30] dark:text-[#F39BA9]">
          {mascotName} · Step {completedStepNumber} of {totalSteps}
        </p>
        <h2 className={`${compact ? 'mt-2 text-xl text-[#FAF4EB]' : 'mt-4 text-3xl text-[#201416] dark:text-[#FAF4EB]'} font-light`}>
          Nice — one piece done.
        </h2>
        <div className="mt-6 rounded-2xl border border-[#E8D5CE] bg-[#F7ECE8]/60 p-5 text-left dark:border-[#52232B] dark:bg-[#2A141D]">
          <p className="text-xs uppercase tracking-wider text-[#786663] dark:text-[#A89299]">Next</p>
          <p className="mt-2 text-lg font-medium text-[#201416] dark:text-[#FAF4EB]">{nextStep.title}</p>
          <p className="mt-1 text-sm font-semibold text-[#A61C30] dark:text-[#F39BA9]">{nextStep.minutes} min</p>
        </div>
        <p className={`text-sm ${compact ? 'mt-3 text-[#A89299]' : 'mt-5 text-[#614F4D] dark:text-[#C5B3B1]'}`}>
          The timer is stopped. Continue whenever you feel ready.
        </p>
        <div className={`${compact ? 'mt-4' : 'mt-7'} grid gap-3 sm:grid-cols-2`}>
          <Button onClick={onContinue} className="rounded-full bg-[#A61C30] hover:bg-[#8F1627] py-6 font-bold text-white shadow-md shadow-[#A61C30]/25 dark:bg-[#C92A43] dark:hover:bg-[#B32038]">
            Continue when ready <ArrowRight data-icon="inline-end" />
          </Button>
          <Button onClick={onEndPlan} variant="outline" className="rounded-full border-[#EADBCE] bg-white/80 py-6 font-semibold text-[#4A3E3D] hover:bg-[#F5ECE5] dark:border-[#42202B] dark:bg-[#201016] dark:text-[#FAF4EB]">
            <LogOut data-icon="inline-start" /> End plan
          </Button>
        </div>
      </div>
    </div>
  )
}
