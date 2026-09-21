'use client'

import { useState } from 'react'
import { Coffee, Sparkles, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession } from '@/lib/focus-session'
import { requestTaskBreakdown } from '@/lib/task-breakdown'

/**
 * Gentle, non-judgmental check-in shown after the user has been
 * "possibly_distracted" past the threshold (see useDistractionWatch).
 */
export default function DistractionNudgeModal({ onDismiss }: { onDismiss: () => void }) {
  const { session, pauseSession } = useFocusSession()
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false)
  const [subSteps, setSubSteps] = useState<string[] | null>(null)

  const handleKeepGoing = () => {
    // Dismiss only this nudge episode; vision remains the source of truth.
    onDismiss()
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

  const handleTakeBreak = () => {
    onDismiss()
    pauseSession()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 py-12 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-slate-800/95 to-slate-900/95 shadow-2xl shadow-amber-950/20 backdrop-blur-md">
        <div className="p-10">
          <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-amber-500/40 bg-gradient-to-br from-amber-500/25 to-orange-500/15">
            <Waves className="size-7 text-amber-300" />
          </div>

          <h3 className="mb-3 text-3xl font-light text-white">
            Still with me?{' '}
            <span className="font-serif italic font-normal text-amber-200">No rush.</span>
          </h3>

          <p className="mb-8 text-base leading-relaxed text-slate-300">
            Looks like you paused for a moment. That&apos;s completely okay — want to keep going, make the
            step smaller, or take a quick break?
          </p>

          {subSteps ? (
            <div>
              <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Here&apos;s a smaller step</p>
              <ul className="mb-6 space-y-2">
                {subSteps.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-700/40 bg-slate-800/40 px-4 py-3 text-sm text-slate-200"
                  >
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-300" />
                    {step}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleKeepGoing}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400"
              >
                Keep going
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleKeepGoing}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-6 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400"
              >
                Keep going
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={handleBreakDown}
                  disabled={isLoadingBreakdown}
                  variant="outline"
                  className="flex-1 rounded-xl border-slate-600 px-6 py-5 font-semibold text-slate-200 hover:border-amber-400/40 hover:bg-slate-700/50 hover:text-white"
                >
                  <Sparkles data-icon="inline-start" />
                  {isLoadingBreakdown ? 'Breaking it down…' : 'Break it down'}
                </Button>
                <Button
                  onClick={handleTakeBreak}
                  variant="outline"
                  className="flex-1 rounded-xl border-slate-600 px-6 py-5 font-semibold text-slate-200 hover:border-cyan-400/40 hover:bg-slate-700/50 hover:text-white"
                >
                  <Coffee data-icon="inline-start" /> Take a short break
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
