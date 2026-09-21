'use client'

import { useState, useEffect, useRef } from 'react'
import { Moon, Sun, Pencil, Check } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onDismissNudge?: () => void
}

export default function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  const [mascotName, setMascotName] = useState('VirtualDouble')
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('VirtualDouble')
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Load custom mascot name from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ant_mascot_name')
      if (saved && saved.trim()) {
        setMascotName(saved.trim())
        setTempName(saved.trim())
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, [])

  // Auto-focus and select text when entering editing mode
  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }
  }, [isEditingName])

  const handleSaveName = () => {
    const finalName = tempName.trim() || 'VirtualDouble'
    setMascotName(finalName)
    setTempName(finalName)
    setIsEditingName(false)
    try {
      localStorage.setItem('ant_mascot_name', finalName)
      window.dispatchEvent(new CustomEvent('mascot-name-change', { detail: finalName }))
    } catch {
      // Ignore localStorage access issues
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
        {/* Logo and Customizable Title */}
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-cyan-400/50 bg-[#0B132B] shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/20">
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
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') {
                        setTempName(mascotName)
                        setIsEditingName(false)
                      }
                    }}
                    maxLength={24}
                    className={`h-7 rounded-lg border px-2 text-base font-semibold outline-none transition-colors ${
                      isDarkMode
                        ? 'border-cyan-400/50 bg-slate-900/90 text-white focus:ring-1 focus:ring-cyan-400'
                        : 'border-cyan-500/60 bg-white text-slate-900 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    title="Save name"
                    className="rounded-lg p-1 text-cyan-500 hover:bg-cyan-500/10"
                  >
                    <Check className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempName(mascotName)
                    setIsEditingName(true)
                  }}
                  title="Click to rename your companion"
                  className="group flex items-center gap-1.5 text-left rounded-lg transition-colors hover:opacity-90"
                >
                  <h1
                    className={`text-xl font-semibold tracking-tight transition-colors ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {mascotName}
                  </h1>
                  <Pencil className="size-3 text-slate-400 opacity-40 transition-opacity group-hover:opacity-100 group-hover:text-cyan-500" />
                </button>
              )}
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
