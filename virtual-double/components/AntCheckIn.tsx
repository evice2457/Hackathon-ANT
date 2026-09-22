'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Coffee, ListChecks, Loader2, Play, Send, Sparkles, Lightbulb, ArrowRight } from 'lucide-react'
import { CHECK_IN_RESPONSE, type CheckInState } from '@/lib/check-in'
import { useMascotName } from '@/lib/mascot-name'
import { playAntChime } from '@/lib/ant-voice'
import { requestTaskBreakdown } from '@/lib/task-breakdown'

interface AntCheckInProps {
  checkIn: CheckInState
  compact?: boolean
  task: string
  onAnswerChange: (answer: string) => void
  onSubmit: () => void
  onResume: () => void
  onStayPaused: () => void
  onTakeBreak: () => void
}

export default function AntCheckIn({
  checkIn,
  compact = false,
  task,
  onAnswerChange,
  onSubmit,
  onResume,
  onStayPaused,
  onTakeBreak,
}: AntCheckInProps) {
  const { mascotName } = useMascotName()
  const [steps, setSteps] = useState<string[] | null>(null)
  const [isBreakingDown, setIsBreakingDown] = useState(false)

  useEffect(() => {
    playAntChime('nudge')
  }, [])

  const handleBreakDown = async () => {
    setIsBreakingDown(true)
    try {
      const result = await requestTaskBreakdown(task)
      setSteps(result)
    } finally {
      setIsBreakingDown(false)
    }
  }

  return (
    <section
      aria-label={`${mascotName} check-in`}
      className={
        compact
          ? 'flex h-screen w-full flex-col overflow-auto bg-[#0B132B] p-3 text-white'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-5 py-8 backdrop-blur-sm'
      }
    >
      <div
        className={
          compact
            ? 'flex min-h-full flex-col justify-center rounded-2xl border border-cyan-400/20 bg-slate-900/90 p-3'
            : 'w-full max-w-xl rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-slate-800 to-slate-950 p-7 text-white shadow-2xl shadow-cyan-950/30'
        }
      >
        <div className="flex items-center gap-3">
          <div className={`relative shrink-0 overflow-hidden rounded-full bg-cyan-400/10 ${compact ? 'size-12' : 'size-16'}`}>
            <Image src="/ant-mascot-removebg.png" alt={`${mascotName} mascot`} fill sizes={compact ? '48px' : '64px'} className="object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{mascotName} check-in</p>
            <h2 className={compact ? 'text-base font-semibold' : 'text-2xl font-semibold'}>{checkIn.prompt}</h2>
          </div>
        </div>

        {steps !== null ? (
          <div className={compact ? 'mt-3' : 'mt-6'}>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
              <Sparkles className="size-3.5" /> Small steps
            </p>
            <ol className={`space-y-2 ${compact ? 'mt-2' : 'mt-3'}`}>
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="flex gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] p-3 text-sm leading-relaxed text-cyan-50"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[11px] font-semibold text-cyan-200">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={onResume}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-cyan-400 ${compact ? 'mt-3' : 'mt-5'}`}
            >
              <Play className="size-3.5" /> Back to it
            </button>
          </div>
        ) : !checkIn.responseShown ? (
          <form
            className={compact ? 'mt-3 space-y-2' : 'mt-6 space-y-4'}
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onTakeBreak}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <Coffee className="size-3.5" /> Take a Short Break
              </button>
              <button
                type="button"
                onClick={handleBreakDown}
                disabled={isBreakingDown}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
              >
                {isBreakingDown ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ListChecks className="size-3.5" />
                )}
                Break Down My Task
              </button>
              <button
                type="button"
                onClick={onResume}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <Lightbulb className="size-3.5" /> I’m Just Thinking
              </button>
              <button
                type="button"
                onClick={onResume}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <ArrowRight className="size-3.5" /> Keep Working
              </button>
            </div>
            <label className="block text-xs text-slate-300" htmlFor={`check-in-answer-${compact ? 'pip' : 'main'}`}>
              You can type what’s going on, or choose a quick action below.
            </label>
            <textarea
              id={`check-in-answer-${compact ? 'pip' : 'main'}`}
              value={checkIn.answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              rows={compact ? 2 : 4}
              autoFocus={!compact}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              placeholder="What’s making this hard right now?"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400"
            >
              <Send className="size-4" /> Get Support
            </button>
          </form>
        ) : (
          <div className={compact ? 'mt-3' : 'mt-6'}>
            <p className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] p-3 text-sm leading-relaxed text-cyan-50">
              {CHECK_IN_RESPONSE}
            </p>
            <div className={`flex gap-2 ${compact ? 'mt-3' : 'mt-5'}`}>
              <button
                type="button"
                onClick={onResume}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-cyan-400"
              >
                <Play className="size-3.5" /> Resume session
              </button>
              <button
                type="button"
                onClick={onStayPaused}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Coffee className="size-3.5" /> Stay paused
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
