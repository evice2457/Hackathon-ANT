'use client'

import { Shield, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/50 backdrop-blur-md bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-white">VirtualDouble</h1>
            <p className="text-xs text-slate-400">AI Cognitive Body Doubler</p>
          </div>
        </div>

        {/* Privacy Badge & Theme Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">100% On-Device AI</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
