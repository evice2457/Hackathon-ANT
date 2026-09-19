'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SUGGESTION_PILLS = [
  'Draft API function scaffold',
  'Review 3 priority emails',
  'Outline 3 main bullet points',
  'Plan next sprint backlog',
  'Write test cases',
]

interface MicroCommitmentViewProps {
  onStartTask: (task: string) => void
  onSimulateDistraction: () => void
}

export default function MicroCommitmentView({ onStartTask, onSimulateDistraction }: MicroCommitmentViewProps) {
  const [input, setInput] = useState('')

  const handleStart = () => {
    if (input.trim()) {
      onStartTask(input)
    }
  }

  const handleSuggestion = (pill: string) => {
    onStartTask(pill)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Headline */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            What small step <span className="font-serif italic font-normal text-cyan-300">will you conquer</span> in the next 15 minutes?
          </h2>
          <p className="text-slate-400 text-base">Break it down. Keep it simple. Just one thing.</p>
        </div>

        {/* Input Area */}
        <div className="mb-10">
          <div className="relative flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleStart()
                }
              }}
              placeholder="Tell me what you&apos;ll do..."
              className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 text-lg py-7 px-6 rounded-2xl backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
            <Button
              onClick={handleStart}
              disabled={!input.trim()}
              className="px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              Start with Me
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 bg-slate-800/30"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Quick suggestions</p>
          <div className="flex flex-wrap gap-3">
            {SUGGESTION_PILLS.map((pill) => (
              <button
                key={pill}
                onClick={() => handleSuggestion(pill)}
                className="px-4 py-3 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-sm rounded-xl transition-all duration-200"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Control */}
        <div className="mt-16 text-center">
          <button
            onClick={onSimulateDistraction}
            className="text-xs text-slate-500 hover:text-slate-400 underline"
          >
            [Simulate Distraction] for demo
          </button>
        </div>
      </div>
    </div>
  )
}
