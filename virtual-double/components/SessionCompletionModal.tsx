'use client'

import { useState } from 'react'
import { Check, ClockPlus, MoveRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession, ADD_TIME_SECONDS } from '@/lib/focus-session'
import { requestTaskBreakdown } from '@/lib/task-breakdown'

interface SessionCompletionModalProps {
  /** "Done" / "Next task" both return the user to task entry. */
  onDone: () => void
  /** "Next task" clears the session and goes back to entry. */
  onNextTask: () => void
}

export default function SessionCompletionModal({ onDone, onNextTask }: SessionCompletionModalProps) {
  const { session, addTime } = useFocusSession()
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false)
  const [subSteps, setSubSteps] = useState<string[] | null>(null)

  const handleAddTime = () => {
    addTime(ADD_TIME_SECONDS)
    setSubSteps(null)
  }

  const handleBreakDown = async () => {
    setIsLoadingBreakdown(true)
    try {
      const steps = await requestTaskBreakdown(session.task)
      setSubSteps(steps)
    } finally {
      setIsLoadingBreakdown(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-12 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-slate-800/95 to-slate-900/95 shadow-2xl shadow-emerald-950/30 backdrop-blur-md">
        <div className="p-10">
          <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-emerald-500/40 bg-gradient-to-br from-emerald-500/25 to-teal-500/15">
            <Check className="size-7 text-emerald-300" />
          </div>

          <h3 className="mb-3 text-3xl font-light text-white">
            How did it go?{' '}
            <span className="font-serif italic font-normal text-emerald-200">You made it through.</span>
          </h3>

          <div className="mb-8 rounded-2xl border border-slate-700/40 bg-slate-800/40 px-5 py-4">
            <p className="text-base font-medium text-white">{session.task || 'Your session'}</p>
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
                disabled={isLoadingBreakdown}
                variant="outline"
                className="rounded-xl border-slate-600 px-6 py-6 font-semibold text-slate-200 hover:border-emerald-400/40 hover:bg-slate-700/50 hover:text-white"
              >
                <Sparkles data-icon="inline-start" />
                {isLoadingBreakdown ? 'Breaking it down…' : 'Break it down'}
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
