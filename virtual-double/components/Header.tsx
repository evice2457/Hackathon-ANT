'use client'

import { Moon, Sun } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
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
          <div className="relative size-10 overflow-hidden rounded-full border border-cyan-400/50 bg-[#0B132B] shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/20">
            <Image
              src="/ant-mascot.png"
              alt="ANT Mascot"
              fill
              className="object-cover object-center"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1
                className={`text-xl font-semibold tracking-tight transition-colors ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                VirtualDouble
              </h1>
              <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                ANT
              </span>
            </div>
            <p
              className={`text-xs transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium'
              }`}
            >
              AI Cognitive Body Doubler
            </p>
          </div>
        </div>

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
