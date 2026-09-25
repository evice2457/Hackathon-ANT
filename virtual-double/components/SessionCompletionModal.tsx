'use client'

import { useState, useEffect } from 'react'
import { Check, ClockPlus, MoveRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession, ADD_TIME_SECONDS } from '@/lib/focus-session'
import { createTaskPlan } from '@/lib/task-breakdown'
import { playAntChime } from '@/lib/ant-voice'

interface SessionCompletionModalProps {
  /** "Done" / "Next task" both return the user to task entry. */
  onDone: () => void
  /** "Next task" clears the session and goes back to entry. */
  onNextTask: () => void
  planCompleteTask?: string
}

export default function SessionCompletionModal({
  onDone,
  onNextTask,
  planCompleteTask,
}: SessionCompletionModalProps) {
  const { session, addTime } = useFocusSession()
  const [subSteps, setSubSteps] = useState<string[] | null>(null)

  useEffect(() => {
    playAntChime('complete')
  }, [])

  const handleAddTime = () => {
    addTime(ADD_TIME_SECONDS)
    setSubSteps(null)
  }

  const handleBreakDown = () => {
    const plan = createTaskPlan(session.task, Math.max(5, Math.round(session.durationSeconds / 60)))
    setSubSteps(plan.steps.map((step) => step.title))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 py-12 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#4A202A] bg-gradient-to-br from-[#24121A] to-[#160B0F] shadow-2xl shadow-[#A61C30]/20 backdrop-blur-md">
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
            <Check className="size-7 text-emerald-300" />
          </div>

          <h3 className="mb-3 text-3xl font-light text-white">
            {planCompleteTask ? 'Whole plan complete. ' : 'How did it go? '}
            <span className="font-serif italic font-normal text-[#FBE8A6]">
              You made it through.
            </span>
          </h3>

          <div className="mb-8 rounded-2xl border border-[#4A202A] bg-[#1E0D15] px-5 py-4">
            <p className="text-base font-medium text-[#FAF4EB]">
              {planCompleteTask || session.task || 'Your session'}
            </p>
          </div>

          {subSteps ? (
            <div className="mb-8">
              <p className="mb-3 text-xs uppercase tracking-wider text-[#A89299]">Try a smaller step first</p>
              <ul className="space-y-2">
                {subSteps.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-2.5 rounded-2xl border border-[#4A202A] bg-[#2E1622] px-4 py-3 text-sm text-[#FAF4EB]"
                  >
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-[#FBE8A6]" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={onDone}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 py-6 font-bold text-white shadow-md shadow-emerald-600/20 transition-all dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                <Check data-icon="inline-start" /> Done
              </Button>
              <Button
                onClick={handleAddTime}
                className="rounded-full bg-[#A61C30] hover:bg-[#8F1627] py-6 font-bold text-white shadow-md shadow-[#A61C30]/25 transition-all dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
              >
                <ClockPlus data-icon="inline-start" /> +5 min
              </Button>
              <Button
                onClick={handleBreakDown}
                variant="outline"
                className="rounded-full border-[#4A202A] bg-white/5 py-6 font-semibold text-[#FAF4EB] hover:bg-white/10 hover:border-[#FBE8A6]/40"
              >
                <Sparkles data-icon="inline-start" className="text-[#FBE8A6]" />
                Break it down
              </Button>
              <Button
                onClick={onNextTask}
                variant="outline"
                className="rounded-full border-[#4A202A] bg-white/5 py-6 font-semibold text-[#FAF4EB] hover:bg-white/10 hover:border-[#F39BA9]/40"
              >
                <MoveRight data-icon="inline-start" /> Next task
              </Button>
            </div>
          )}

          {subSteps && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAddTime}
                className="flex-1 rounded-full bg-[#A61C30] hover:bg-[#8F1627] py-5 font-bold text-white shadow-md shadow-[#A61C30]/25 dark:bg-[#C92A43]"
              >
                <ClockPlus data-icon="inline-start" /> +5 min
              </Button>
              <Button
                onClick={onNextTask}
                variant="outline"
                className="flex-1 rounded-full border-[#4A202A] bg-white/5 py-5 font-semibold text-[#FAF4EB] hover:bg-white/10"
              >
                <MoveRight data-icon="inline-start" /> Next task
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
