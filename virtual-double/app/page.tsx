'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import MicroCommitmentView from '@/components/MicroCommitmentView'
import DeepPresenceView from '@/components/DeepPresenceView'
import DistractionNudgeModal from '@/components/DistractionNudgeModal'
import FloatingMiniWidget from '@/components/FloatingMiniWidget'

export type ViewState = 'initial' | 'focus' | 'nudge' | 'widget'

export default function Page() {
  const [viewState, setViewState] = useState<ViewState>('initial')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [currentTask, setCurrentTask] = useState('')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleStartTask = (task: string) => {
    setCurrentTask(task)
    setViewState('focus')
  }

  const handleShowNudge = () => {
    setViewState('nudge')
  }

  const handleResumeTask = () => {
    setViewState('focus')
  }

  const handleEndTask = () => {
    setCurrentTask('')
    setViewState('initial')
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-foreground transition-colors">
      {viewState === 'widget' && (
        <FloatingMiniWidget
          task={currentTask}
          onExpand={() => setViewState('focus')}
          onBreakDown={() => setViewState('nudge')}
          onEnd={handleEndTask}
        />
      )}
      <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      
      <main className="flex-1">
        {viewState === 'initial' && (
          <MicroCommitmentView onStartTask={handleStartTask} onSimulateDistraction={() => setViewState('nudge')} />
        )}
        
        {viewState === 'focus' && (
          <DeepPresenceView 
            task={currentTask} 
            onTakePause={handleShowNudge}
            onCompleted={() => setViewState('initial')}
            onDistraction={handleShowNudge}
            onMinimize={() => setViewState('widget')}
            onEnd={handleEndTask}
          />
        )}
        
        {viewState === 'nudge' && (
          <DistractionNudgeModal 
            onBreakDown={handleResumeTask}
            onKeepGoing={handleResumeTask}
            onClose={() => setViewState('focus')}
          />
        )}
      </main>

      <nav aria-label="Developer demo controls" className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-[#101d38]/90 p-1.5 shadow-2xl backdrop-blur-xl">
        {[
          ['Micro-Input', 'initial'],
          ['Focus Screen', 'focus'],
          ['Gentle Check-in', 'nudge'],
          ['Floating Widget', 'widget'],
        ].map(([label, state]) => (
          <button key={state} onClick={() => setViewState(state as ViewState)} className={`rounded-xl px-3 py-2 text-[11px] font-medium transition-colors ${viewState === state ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-500 hover:text-slate-200'}`}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
