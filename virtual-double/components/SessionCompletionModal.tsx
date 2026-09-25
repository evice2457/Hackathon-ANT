'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, ClockPlus, Sparkles, MoveRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession } from '@/lib/focus-session'
import { createTaskPlan } from '@/lib/task-breakdown'
import { playAntChime } from '@/lib/ant-voice'
import { useMascotName } from '@/lib/mascot-name'
import { getMascotPresentation } from '@/lib/mascot-presentation'

interface SessionCompletionModalProps {
  onDone: () => void
  onNextTask: () => void
  planCompleteTask?: string
}

export default function SessionCompletionModal({
  onDone,
  onNextTask,
  planCompleteTask,
}: SessionCompletionModalProps) {
  const { session, startSession } = useFocusSession()
  const { mascotName } = useMascotName()
  const mascotPresentation = getMascotPresentation('completion', mascotName)
  const [subSteps, setSubSteps] = useState<string[] | null>(null)

  useEffect(() => {
    playAntChime('complete')
  }, [])

  const handleAddTime = () => {
    startSession(session.task || 'Continued Session', 5 * 60, session.visionEnabled)
  }

  const handleBreakDown = () => {
    const plan = createTaskPlan(session.task, Math.max(5, Math.round(session.durationSeconds / 60)))
    setSubSteps(plan.steps.map((step) => step.title))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 py-12 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] to-[#070F26] shadow-2xl shadow-cyan-950/40 backdrop-blur-md">
        <div className="p-8 sm:p-10">
          <div className="relative mx-auto mb-4 size-36">
            <Image
              src={mascotPresentation.src}
              alt={mascotPresentation.alt}
              fill
              sizes="144px"
              className="object-contain"
            />
          </div>

          <h3 className="mb-2 text-center text-3xl font-light text-white">
            Nice work — you did it!{' '}
            <span className="font-serif italic font-normal text-cyan-300">
              {planCompleteTask ? 'Whole plan complete.' : 'Task complete.'}
            </span>
          </h3>

          <p className="mb-6 text-center text-sm text-slate-300">{mascotName} is celebrating with you.</p>

          <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-[#0E1A38]/80 px-5 py-4">
            <p className="text-base font-medium text-slate-100 text-center">
              {planCompleteTask || session.task || 'Your session'}
            </p>
          </div>

          {subSteps ? (
            <div className="mb-8">
              <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">Try a smaller step first</p>
              <ul className="space-y-2">
                {subSteps.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-2.5 rounded-2xl border border-cyan-500/20 bg-[#0E1A38] px-4 py-3 text-sm text-slate-100"
                  >
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-cyan-400" />
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
                className="rounded-full bg-cyan-500 hover:bg-cyan-400 py-6 font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all"
              >
                <ClockPlus data-icon="inline-start" /> +5 min
              </Button>
              <Button
                onClick={handleBreakDown}
                variant="outline"
                className="rounded-full border-cyan-500/30 bg-white/5 py-6 font-semibold text-slate-200 hover:bg-white/10 hover:border-cyan-400"
              >
                <Sparkles data-icon="inline-start" className="text-cyan-400" />
                Break it down
              </Button>
              <Button
                onClick={onNextTask}
                variant="outline"
                className="rounded-full border-cyan-500/30 bg-white/5 py-6 font-semibold text-slate-200 hover:bg-white/10 hover:border-cyan-400"
              >
                <MoveRight data-icon="inline-start" /> Next task
              </Button>
            </div>
          )}

          {subSteps && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAddTime}
                className="flex-1 rounded-full bg-cyan-500 hover:bg-cyan-400 py-5 font-bold text-slate-950 shadow-md shadow-cyan-500/25"
              >
                <ClockPlus data-icon="inline-start" /> +5 min
              </Button>
              <Button
                onClick={onNextTask}
                variant="outline"
                className="flex-1 rounded-full border-cyan-500/30 bg-white/5 py-5 font-semibold text-slate-200 hover:bg-white/10"
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
