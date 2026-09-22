'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, ClockPlus, MoveRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession, ADD_TIME_SECONDS } from '@/lib/focus-session'
import { createTaskPlan } from '@/lib/task-breakdown'
import { playAntChime } from '@/lib/ant-voice'
import { useMascotName } from '@/lib/mascot-name'
import { getMascotPresentation } from '@/lib/mascot-presentation'

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
  const { mascotName } = useMascotName()
  const mascotPresentation = getMascotPresentation('completion', mascotName)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-12 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-slate-800/95 to-slate-900/95 shadow-2xl shadow-emerald-950/30 backdrop-blur-md">
        <div className="p-10">
          <div className="relative mx-auto mb-4 size-36">
            <Image
              src={mascotPresentation.src}
              alt={mascotPresentation.alt}
              fill
              sizes="144px"
              className="object-contain"
            />
          </div>

          <h3 className="mb-3 text-center text-3xl font-light text-white">
            Nice work — you did it!{' '}
            <span className="font-serif italic font-normal text-emerald-200">
              {planCompleteTask ? 'That whole plan is complete.' : 'That task is complete.'}
            </span>
          </h3>

          <p className="mb-6 text-center text-sm text-slate-300">{mascotName} is celebrating with you.</p>

          <div className="mb-8 rounded-2xl border border-slate-700/40 bg-slate-800/40 px-5 py-4">
            <p className="text-base font-medium text-white">
              {planCompleteTask || session.task || 'Your session'}
            </p>
          </div>

          {subSteps ? (
            <div className="mb-8">
              <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Try a smaller step first</p>
              <ul className="space-y-2">
                {subSteps.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-700/40 bg-slate-800/40 px-4 py-3 text-sm text-slate-200"
                  >
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={onDone}
                className="rounded-xl bg-emerald-500 px-6 py-6 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300"
              >
                <Check data-icon="inline-start" /> Done
              </Button>
              <Button
                onClick={handleAddTime}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-6 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
              >
                <ClockPlus data-icon="inline-start" /> +5 min
              </Button>
              <Button
                onClick={handleBreakDown}
                variant="outline"
                className="rounded-xl border-slate-600 px-6 py-6 font-semibold text-slate-200 hover:border-emerald-400/40 hover:bg-slate-700/50 hover:text-white"
              >
                <Sparkles data-icon="inline-start" />
                Break it down
              </Button>
              <Button
                onClick={onNextTask}
                variant="outline"
                className="rounded-xl border-slate-600 px-6 py-6 font-semibold text-slate-200 hover:border-cyan-400/40 hover:bg-slate-700/50 hover:text-white"
              >
                <MoveRight data-icon="inline-start" /> Next task
              </Button>
            </div>
          )}

          {subSteps && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAddTime}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-5 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
              >
                <ClockPlus data-icon="inline-start" /> +5 min
              </Button>
              <Button
                onClick={onNextTask}
                variant="outline"
                className="flex-1 rounded-xl border-slate-600 px-6 py-5 font-semibold text-slate-200 hover:bg-slate-700/50"
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
