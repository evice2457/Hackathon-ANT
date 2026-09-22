'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { ArrowRight, Coffee, LogOut, Play, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { parseSupportMinutes } from '@/lib/ant-support'
import type { CheckInState } from '@/lib/check-in'
import { useMascotName } from '@/lib/mascot-name'
import { playAntChime } from '@/lib/ant-voice'

interface AntCheckInProps {
  checkIn: CheckInState
  compact?: boolean
  onAnswerChange: (answer: string) => void
  onSubmit: () => void
  onQuickAction: (answer: string) => void
  onSuggestedTitleChange: (title: string) => void
  onSuggestedMinutesChange: (minutes: string) => void
  onContinueWithStep: () => void
  onResume: () => void
  onEndSession: () => void
}

export default function AntCheckIn({
  checkIn,
  compact = false,
  onAnswerChange,
  onSubmit,
  onQuickAction,
  onSuggestedTitleChange,
  onSuggestedMinutesChange,
  onContinueWithStep,
  onResume,
  onEndSession,
}: AntCheckInProps) {
  const { mascotName } = useMascotName()
  const suggestedMinutes = parseSupportMinutes(checkIn.suggestedMinutesInput)
  const suggestionValid = Boolean(checkIn.suggestedTitle.trim()) && suggestedMinutes !== null

  useEffect(() => {
    playAntChime('nudge')
  }, [])

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
          <div className={`relative shrink-0 overflow-hidden rounded-full bg-cyan-400/10 ${compact ? 'size-11' : 'size-16'}`}>
            <Image src="/ant-mascot-removebg.png" alt={`${mascotName} mascot`} fill sizes={compact ? '44px' : '64px'} className="object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{mascotName} check-in</p>
            <h2 className={compact ? 'text-base font-semibold' : 'text-2xl font-semibold'}>{checkIn.prompt}</h2>
          </div>
        </div>

        {!checkIn.responseShown ? (
          <form
            className={compact ? 'mt-3 space-y-2' : 'mt-6 space-y-4'}
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                ['I’m tired', 'I feel tired'],
                ['I’m stuck', 'I feel stuck'],
                ['It’s too much', 'This feels overwhelming and too much'],
                ['Just thinking', 'I am just thinking'],
              ].map(([label, answer]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onQuickAction(answer)}
                  className="rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="block text-xs text-slate-300" htmlFor={`check-in-answer-${compact ? 'pip' : 'main'}`}>
              You can type what’s going on or choose a quick answer.
            </label>
            <textarea
              id={`check-in-answer-${compact ? 'pip' : 'main'}`}
              value={checkIn.answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              rows={compact ? 2 : 4}
              autoFocus={!compact}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              placeholder="Anything getting in the way?"
            />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400">
              <Send className="size-4" /> Get support
            </button>
          </form>
        ) : (
          <div className={compact ? 'mt-3 space-y-3' : 'mt-6 space-y-4'}>
            <p className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] p-3 text-sm leading-relaxed text-cyan-50">
              <span className="font-semibold">{mascotName}:</span>{' '}
              {checkIn.support?.message || "No worries. Let's make the next step smaller."}
            </p>

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300">
                Suggested next step
              </label>
              <Input
                value={checkIn.suggestedTitle}
                onChange={(event) => onSuggestedTitleChange(event.target.value)}
                aria-label="Suggested next-step title"
                className="border-white/10 bg-white/[0.06] text-white"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={checkIn.suggestedMinutesInput}
                  onChange={(event) => onSuggestedMinutesChange(event.target.value)}
                  aria-label="Suggested next-step minutes"
                  className={`w-24 border-white/10 bg-white/[0.06] text-white ${suggestedMinutes === null ? 'border-amber-400' : ''}`}
                />
                <span className="text-xs text-slate-300">minutes</span>
              </div>
              {suggestedMinutes === null && (
                <p className="text-xs text-amber-300">Enter a duration between 1 and 180 minutes.</p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onContinueWithStep}
                disabled={!suggestionValid}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-cyan-400 disabled:opacity-45"
              >
                <ArrowRight className="size-3.5" /> Continue with this step
              </button>
              <button
                type="button"
                onClick={onResume}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Play className="size-3.5" /> Resume current task
              </button>
            </div>
            <button
              type="button"
              onClick={onEndSession}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut className="size-3.5" /> End session
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Coffee className="size-3" /> The timer stays paused until you choose.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
