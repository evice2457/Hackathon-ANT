'use client'

import Image from 'next/image'
import { Coffee, Play, Send } from 'lucide-react'
import { CHECK_IN_RESPONSE, type CheckInState } from '@/lib/check-in'
import { useMascotName } from '@/lib/mascot-name'

interface AntCheckInProps {
  checkIn: CheckInState
  compact?: boolean
  onAnswerChange: (answer: string) => void
  onSubmit: () => void
  onResume: () => void
  onStayPaused: () => void
}

export default function AntCheckIn({
  checkIn,
  compact = false,
  onAnswerChange,
  onSubmit,
  onResume,
  onStayPaused,
}: AntCheckInProps) {
  const { mascotName } = useMascotName()

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

        {!checkIn.responseShown ? (
          <form
            className={compact ? 'mt-3 space-y-2' : 'mt-6 space-y-4'}
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <label className="block text-xs text-slate-300" htmlFor={`check-in-answer-${compact ? 'pip' : 'main'}`}>
              You can share as much or as little as you want.
            </label>
            <textarea
              id={`check-in-answer-${compact ? 'pip' : 'main'}`}
              value={checkIn.answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              rows={compact ? 2 : 4}
              autoFocus={!compact}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              placeholder="What’s going on?"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400"
            >
              <Send className="size-4" /> Tell {mascotName}
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
