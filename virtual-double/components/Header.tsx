'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession, type FocusState } from '@/lib/focus-session'

interface HeaderProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onDismissNudge?: () => void
}

export default function Header({ isDarkMode, onToggleDarkMode, onDismissNudge }: HeaderProps) {
  const { session, setFocusState } = useFocusSession()

  const focusStates: { label: string; value: FocusState }[] = [
    { label: 'Focused', value: 'focused' },
    { label: 'Possibly distracted', value: 'possibly_distracted' },
    { label: 'Away', value: 'away' },
  ]

  const handleStateClick = (state: FocusState) => {
    setFocusState(state)
    if (state !== 'possibly_distracted' && onDismissNudge) {
      onDismissNudge()
    }
  }

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 backdrop-blur-md ${
        isDarkMode
          ? 'border-b border-white/10 bg-[#070f26]/60 shadow-lg shadow-black/10'
          : 'border-b border-slate-200/80 bg-white/60 shadow-sm shadow-slate-200/50'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30">
            <span className="text-lg font-bold text-white">V</span>
          </div>
          <div className="flex flex-col">
            <h1
              className={`text-xl font-semibold tracking-tight transition-colors ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              VirtualDouble
            </h1>
            <p
              className={`text-xs transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium'
              }`}
            >
              AI Cognitive Body Doubler
            </p>
          </div>
        </div>

        {/* Focus State Controller (Focused | Possibly distracted | Away) */}
        <nav
          aria-label="Focus state controls"
          className={`flex items-center gap-1 rounded-2xl p-1 transition-all backdrop-blur-xl ${
            isDarkMode
              ? 'border border-white/10 bg-[#101d38]/80 shadow-inner'
              : 'border border-slate-200/90 bg-white/80 shadow-inner'
          }`}
        >
          {focusStates.map(({ label, value }) => {
            const isActive = session.focusState === value

            let activeClass = ''
            if (isActive) {
              if (value === 'focused') {
                activeClass = isDarkMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm shadow-emerald-950/40'
                  : 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 shadow-sm font-semibold'
              } else if (value === 'possibly_distracted') {
                activeClass = isDarkMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-950/40'
                  : 'bg-amber-500/15 text-amber-800 border border-amber-500/30 shadow-sm font-semibold'
              } else {
                activeClass = isDarkMode
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm shadow-cyan-950/40'
                  : 'bg-cyan-600/15 text-cyan-900 border border-cyan-500/30 shadow-sm font-semibold'
              }
            } else {
              activeClass = isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 border border-transparent'
            }

            return (
              <button
                key={value}
                onClick={() => handleStateClick(value)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${activeClass}`}
              >
                {label}
              </button>
            )
          })}
        </nav>

        {/* Theme Toggle Button (Light/Dark mode) */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
            className={`size-9 rounded-xl transition-all duration-200 ${
              isDarkMode
                ? 'border border-white/10 bg-slate-800/60 text-amber-300 hover:bg-slate-700/70 hover:text-amber-200 shadow-sm'
                : 'border border-slate-200/90 bg-white/80 text-slate-700 hover:bg-slate-100 hover:text-cyan-700 shadow-sm'
            }`}
          >
            {isDarkMode ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
