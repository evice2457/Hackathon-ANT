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
          ? 'flex h-screen w-full flex-col overflow-auto bg-[#160B0F] p-3 text-[#FAF4EB]'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8 backdrop-blur-sm'
      }
    >
      <div
        className={
          compact
            ? 'flex min-h-full flex-col justify-center rounded-3xl border border-[#4A202A] bg-[#24121A]/95 p-4 text-[#FAF4EB]'
            : 'w-full max-w-xl rounded-3xl border border-[#4A202A] bg-gradient-to-br from-[#24121A] to-[#160B0F] p-7 text-[#FAF4EB] shadow-2xl shadow-[#A61C30]/15'
        }
      >
        <div className="flex items-center gap-3.5">
          <div className={`relative shrink-0 overflow-hidden rounded-full border border-[#5A2534] bg-[#2E1622] ${compact ? 'size-11' : 'size-16'}`}>
            <Image src="/ant-mascot-removebg.png" alt={`${mascotName} mascot`} fill sizes={compact ? '44px' : '64px'} className="object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F39BA9]">{mascotName} check-in</p>
            <h2 className={compact ? 'text-base font-semibold' : 'text-2xl font-semibold text-[#FAF4EB]'}>{checkIn.prompt}</h2>
          </div>
        </div>

        {!checkIn.responseShown ? (
          <form
            className={compact ? 'mt-3 space-y-2.5' : 'mt-6 space-y-4'}
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
                  className="rounded-full border border-[#4A202A] bg-[#2E1622] px-3.5 py-2 text-xs font-semibold text-[#FAF4EB] hover:bg-[#3D1D2D] hover:border-[#F39BA9]/40 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="block text-xs text-[#C5B3B1]" htmlFor={`check-in-answer-${compact ? 'pip' : 'main'}`}>
              You can type what’s going on or choose a quick answer.
            </label>
            <textarea
              id={`check-in-answer-${compact ? 'pip' : 'main'}`}
              value={checkIn.answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              rows={compact ? 2 : 4}
              autoFocus={!compact}
              className="w-full resize-none rounded-2xl border border-[#4A202A] bg-[#1E0D15] px-3.5 py-2.5 text-sm text-[#FAF4EB] outline-none placeholder:text-[#8D7B78] focus:border-[#C92A43]"
              placeholder="Anything getting in the way?"
            />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#A61C30] hover:bg-[#8F1627] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#A61C30]/25 transition-all dark:bg-[#C92A43] dark:hover:bg-[#B32038]">
              <Send className="size-4" /> Get support
            </button>
          </form>
        ) : (
          <div className={compact ? 'mt-3 space-y-3' : 'mt-6 space-y-4'}>
            <p className="rounded-2xl border border-[#5A2534] bg-[#2E1622] p-3.5 text-sm leading-relaxed text-[#FAF4EB]">
              <span className="font-bold text-[#F39BA9]">{mascotName}:</span>{' '}
              {checkIn.support?.message || "No worries. Let's make the next step smaller."}
            </p>

            <div className="space-y-2 rounded-2xl border border-[#4A202A] bg-[#1E0D15] p-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#F39BA9]">
                Suggested next step
              </label>
              <Input
                value={checkIn.suggestedTitle}
                onChange={(event) => onSuggestedTitleChange(event.target.value)}
                aria-label="Suggested next-step title"
                className="rounded-xl border-[#4A202A] bg-[#24121A] text-[#FAF4EB]"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={checkIn.suggestedMinutesInput}
                  onChange={(event) => onSuggestedMinutesChange(event.target.value)}
                  aria-label="Suggested next-step minutes"
                  className={`w-24 rounded-xl border-[#4A202A] bg-[#24121A] text-[#FAF4EB] ${suggestedMinutes === null ? 'border-amber-400' : ''}`}
                />
                <span className="text-xs text-[#C5B3B1]">minutes</span>
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
                className="flex items-center justify-center gap-1.5 rounded-full bg-[#A61C30] hover:bg-[#8F1627] px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#A61C30]/20 disabled:opacity-45 dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
              >
                <ArrowRight className="size-3.5" /> Continue with this step
              </button>
              <button
                type="button"
                onClick={onResume}
                className="flex items-center justify-center gap-1.5 rounded-full border border-[#4A202A] bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-[#FAF4EB] hover:bg-white/10"
              >
                <Play className="size-3.5" /> Resume current task
              </button>
            </div>
            <button
              type="button"
              onClick={onEndSession}
              className="flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#C5B3B1] hover:bg-rose-500/10 hover:text-[#F39BA9]"
            >
              <LogOut className="size-3.5" /> End session
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#A89299]">
              <Coffee className="size-3 text-[#FBE8A6]" /> The timer stays paused until you choose.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
