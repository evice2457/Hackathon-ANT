'use client'

import { useState, useEffect } from 'react'
import { Check, LogOut, Minimize2, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BreathingAura from '@/components/BreathingAura'

interface DeepPresenceViewProps {
  task: string
  onTakePause: () => void
  onCompleted: () => void
  onDistraction: () => void
  onMinimize?: () => void
  onEnd?: () => void
}

export default function DeepPresenceView({ 
  task, 
  onTakePause, 
  onCompleted,
  onDistraction,
  onMinimize,
  onEnd,
}: DeepPresenceViewProps) {
  const [focusIndex, setFocusIndex] = useState(98)
  const [isMediaPipeActive, setIsMediaPipeActive] = useState(true)

  // Simulate focus index fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setFocusIndex((prev) => {
        const change = Math.random() * 6 - 2
        return Math.max(70, Math.min(100, prev + change))
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
      {/* Breathing Aura */}
      <div className="mb-16">
        <BreathingAura />
      </div>

      {/* Current Task */}
      <div className="text-center mb-12 max-w-2xl">
        <p className="text-slate-400 text-sm uppercase tracking-widest mb-4">Current Focus</p>
        <div className="px-8 py-6 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-500/20 backdrop-blur-sm">
          <p className="text-2xl font-light text-white">{task}</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mb-12 text-center">
        <p className="text-slate-400 text-base mb-4">AI Body Double is quietly working alongside you</p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span>Presence Active</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <Button onClick={onTakePause} variant="outline" className="rounded-xl border-white/10 bg-white/[0.03] px-5 py-5 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200">
          <Pause data-icon="inline-start" /> Take a pause
        </Button>
        <Button onClick={onCompleted} className="rounded-xl bg-emerald-400 px-5 py-5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-300">
          <Check data-icon="inline-start" /> Completed early!
        </Button>
        <Button onClick={onEnd ?? onCompleted} variant="outline" className="rounded-xl border-rose-300/10 bg-rose-400/[0.04] px-5 py-5 text-rose-200 hover:bg-rose-400/10">
          <LogOut data-icon="inline-start" /> End now
        </Button>
        <Button onClick={onMinimize} variant="ghost" className="rounded-xl px-5 py-5 text-slate-400 hover:text-cyan-200">
          <Minimize2 data-icon="inline-start" /> Minimize to Widget
        </Button>
      </div>

      {/* Demo Control */}
      <button
        onClick={onDistraction}
        className="text-xs text-slate-500 hover:text-slate-400 underline"
      >
        [Simulate Distraction] for demo
      </button>

      {/* Footer Status */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-slate-500 px-6 py-4 rounded-xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span>MediaPipe Vision: Local Gaze Detection Active</span>
        </div>
        <div>
          <span className="text-cyan-400 font-medium">Focus Index: {Math.round(focusIndex)}%</span>
        </div>
      </div>
    </div>
  )
}
