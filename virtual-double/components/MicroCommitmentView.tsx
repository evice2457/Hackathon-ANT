'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEFAULT_DURATION_MINUTES, DURATION_PRESETS, useFocusSession } from '@/lib/focus-session'

const SUGGESTION_PILLS = [
  'Finish the introduction slide',
  'Review 3 priority emails',
  'Outline 3 main bullet points',
  'Plan next sprint backlog',
  'Write test cases',
]

export default function MicroCommitmentView() {
  const { startSession } = useFocusSession()
  const [input, setInput] = useState('')
  const [minutes, setMinutes] = useState<number>(DEFAULT_DURATION_MINUTES)
  const [customMinutes, setCustomMinutes] = useState('')

  const trimmed = input.trim()
  const canStart = Boolean(trimmed) && Number.isFinite(minutes) && minutes > 0

  const startWith = (task: string, durationMinutes: number) => {
    if (!task.trim() || durationMinutes <= 0) return
    startSession(task.trim(), Math.round(durationMinutes * 60))
  }

  const handleCustomMinutes = (value: string) => {
    setCustomMinutes(value)
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      setMinutes(parsed)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Headline */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-light text-white md:text-5xl">
            What small step{' '}
            <span className="font-serif italic font-normal text-cyan-300">will you conquer</span> in the next{' '}
            {minutes || 15} minutes?
          </h2>
          <p className="text-base text-slate-400">Break it down. Keep it simple. Just one thing.</p>
        </div>

        {/* Input Area */}
        <div className="mb-8">
          <div className="relative flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  startWith(input, minutes)
                }
              }}
              placeholder="Tell me what you’ll do..."
              className="flex-1 rounded-2xl border-slate-700/50 bg-slate-800/50 px-6 py-7 text-lg text-white placeholder-slate-500 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
            <Button
              onClick={() => startWith(input, minutes)}
              disabled={!canStart}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 font-semibold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:shadow-none"
            >
              Start with Me
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Voice input (coming soon)"
              disabled
              title="Voice input — coming soon"
              className="border-slate-700/50 bg-slate-800/30 text-slate-400"
            >
              <Mic className="size-5" />
            </Button>
          </div>
        </div>

        {/* Duration picker */}
        <div className="mb-10">
          <p className="mb-4 text-xs uppercase tracking-wide text-slate-500">Session length</p>
          <div className="flex flex-wrap items-center gap-3">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setMinutes(preset)
                  setCustomMinutes('')
                }}
                className={`rounded-xl border px-5 py-3 text-sm transition-all duration-200 ${
                  minutes === preset && !customMinutes
                    ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                    : 'border-slate-700/50 bg-slate-800/40 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300'
                }`}
              >
                {preset} min
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <Input
                type="number"
                min={1}
                max={180}
                value={customMinutes}
                onChange={(e) => handleCustomMinutes(e.target.value)}
                placeholder="Custom"
                className="h-8 w-20 border-0 bg-transparent p-0 text-center text-sm text-white placeholder-slate-500 focus-visible:ring-0"
              />
              <span className="text-sm text-slate-400">min</span>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div>
          <p className="mb-4 text-xs uppercase tracking-wide text-slate-500">Quick suggestions</p>
          <div className="flex flex-wrap gap-3">
            {SUGGESTION_PILLS.map((pill) => (
              <button
                key={pill}
                onClick={() => startWith(pill, minutes)}
                className="rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 text-sm text-slate-300 transition-all duration-200 hover:border-cyan-500/50 hover:bg-slate-700/60 hover:text-cyan-300"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
