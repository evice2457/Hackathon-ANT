'use client'

import { useEffect } from 'react'
import { ArrowRight, Play, Send } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import type { CheckInState } from '@/lib/check-in'
import { parseCustomDuration } from '@/lib/ant-ai/recommendation-state'
import { useMascotName } from '@/lib/mascot-name'
import { getMascotPresentation } from '@/lib/mascot-presentation'
import { playAntChime } from '@/lib/ant-voice'

interface AntCheckInProps {
  checkIn: CheckInState
  onAnswerChange: (answer: string) => void
  onSubmit: () => void
  onQuickAction: (answer: string) => void
  onSuggestedTitleChange: (title: string) => void
  onSuggestedMinutesChange: (minutes: string) => void
  onContinueWithStep: () => void
  onResume: () => void
  onEndSession: () => void
  compact?: boolean
}

export default function AntCheckIn({
  checkIn,
  onAnswerChange,
  onSubmit,
  onQuickAction,
  onSuggestedTitleChange,
  onSuggestedMinutesChange,
  onContinueWithStep,
  onResume,
  onEndSession,
  compact = false,
}: AntCheckInProps) {
  const { mascotName } = useMascotName()
  const mascotPresentation = getMascotPresentation('check-in', mascotName)
  const suggestedMinutes = parseCustomDuration(checkIn.suggestedMinutesInput)
  const suggestionValid =
    checkIn.suggestedTitle.trim().length > 0 && suggestedMinutes !== null

  useEffect(() => {
    playAntChime('nudge')
  }, [])

  return (
    <div
      role="region"
      aria-label="ANT distraction check-in"
      className={
        compact
          ? 'flex h-screen w-full flex-col overflow-auto bg-[#070F26] p-3 text-slate-100'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8 backdrop-blur-sm'
      }
    >
      <div
        className={
          compact
            ? 'flex min-h-full flex-col justify-center rounded-3xl border border-cyan-500/25 bg-[#0B132B]/95 p-4 text-slate-100'
            : 'w-full max-w-xl rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-[#0B132B] to-[#070F26] p-7 text-slate-100 shadow-2xl shadow-cyan-950/40'
        }
      >
        <div className="flex items-center gap-3.5">
          <div className={`relative shrink-0 overflow-hidden rounded-full border border-cyan-500/30 bg-[#0E1A38] ${compact ? 'size-11' : 'size-16'}`}>
            <Image src={mascotPresentation.src} alt={mascotPresentation.alt} fill sizes={compact ? '44px' : '64px'} className="object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">{mascotName} check-in</p>
            <h2 className={compact ? 'text-base font-semibold' : 'text-2xl font-semibold text-slate-100'}>{checkIn.prompt}</h2>
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
                  className="rounded-full border border-cyan-500/20 bg-[#0E1A38] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#112248] hover:border-cyan-400/40 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="block text-xs text-slate-400" htmlFor={`check-in-answer-${compact ? 'pip' : 'main'}`}>
              You can type what’s going on or choose a quick answer.
            </label>
            <textarea
              id={`check-in-answer-${compact ? 'pip' : 'main'}`}
              value={checkIn.answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              rows={compact ? 2 : 4}
              autoFocus={!compact}
              className="w-full resize-none rounded-2xl border border-cyan-500/20 bg-[#0E1A38]/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="Anything getting in the way?"
            />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 hover:bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 transition-all">
              <Send className="size-4" /> Get support
            </button>
          </form>
        ) : (
          <div className={compact ? 'mt-3 space-y-3' : 'mt-6 space-y-4'}>
            <p className="rounded-2xl border border-cyan-500/30 bg-[#0E1A38] p-3.5 text-sm leading-relaxed text-slate-100">
              <span className="font-bold text-cyan-300">{mascotName}:</span>{' '}
              {checkIn.support?.message || "No worries. Let's make the next step smaller."}
            </p>

            <div className="space-y-2 rounded-2xl border border-cyan-500/20 bg-[#0E1A38]/80 p-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                Suggested next step
              </label>
              <Input
                value={checkIn.suggestedTitle}
                onChange={(event) => onSuggestedTitleChange(event.target.value)}
                aria-label="Suggested next-step title"
                className="rounded-xl border-cyan-500/20 bg-[#070F26] text-slate-100"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={checkIn.suggestedMinutesInput}
                  onChange={(event) => onSuggestedMinutesChange(event.target.value)}
                  aria-label="Suggested next-step minutes"
                  className={`w-24 rounded-xl border-cyan-500/20 bg-[#070F26] text-slate-100 ${suggestedMinutes === null ? 'border-amber-400' : ''}`}
                />
                <span className="text-xs text-slate-400">minutes</span>
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
                className="flex items-center justify-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 disabled:opacity-45"
              >
                <ArrowRight className="size-3.5" /> Continue with this step
              </button>
              <button
                type="button"
                onClick={onResume}
                className="flex items-center justify-center gap-1.5 rounded-full border border-cyan-500/30 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-slate-100 hover:bg-white/10"
              >
                <Play className="size-3.5" /> Resume current task
              </button>
            </div>

            <button
              type="button"
              onClick={onEndSession}
              className="w-full text-center text-xs text-slate-400 hover:text-rose-400 transition-colors pt-1"
            >
              End session instead
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
