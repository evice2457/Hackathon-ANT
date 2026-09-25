'use client'

import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, Pencil, Check, Target, LayoutDashboard, Sparkles, MessageSquareHeart } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useMascotName } from '@/lib/mascot-name'

export type NavTab = 'focus' | 'dashboard' | 'recovery'

interface HeaderProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  onOpenChat: () => void
  isChatOpen: boolean
  isSessionActive: boolean
}

export default function Header({
  isDarkMode,
  onToggleDarkMode,
  currentTab,
  onSelectTab,
  onOpenChat,
  isChatOpen,
  isSessionActive,
}: HeaderProps) {
  const { mascotName, setMascotName } = useMascotName()
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(mascotName)
  const nameInputRef = useRef<HTMLInputElement>(null)

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
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 backdrop-blur-md ${
        isDarkMode
          ? 'border-b border-[#0E1A38] bg-[#070F26]/85 shadow-sm'
          : 'border-b border-[#E2E8F0] bg-white/85 shadow-xs'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Mascot Name */}
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-sky-200/50 bg-white shadow-sm ring-2 ring-cyan-500/20 dark:border-cyan-500/30 dark:bg-[#0B132B] dark:ring-cyan-400/20">
            <Image
              src="/ant-mascot.png"
              alt={`${mascotName} mascot`}
              fill
              className="object-cover object-center"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
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
                    className={`h-7 rounded-full border px-3 text-sm font-semibold outline-none transition-colors ${
                      isDarkMode
                        ? 'border-cyan-500/60 bg-[#0B132B] text-slate-100 focus:ring-1 focus:ring-cyan-400'
                        : 'border-sky-500/50 bg-white text-slate-900 focus:ring-1 focus:ring-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    title="Save name"
                    className="rounded-full p-1 text-cyan-600 hover:bg-cyan-500/10 dark:text-cyan-400"
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
                    className={`text-lg font-bold tracking-tight transition-colors ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {mascotName}
                  </h1>
                  <Pencil className="size-3 text-slate-400 opacity-40 transition-opacity group-hover:opacity-100 group-hover:text-cyan-500 dark:text-slate-500" />
                </button>
              )}
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:border-cyan-500/30 dark:bg-cyan-950/50 dark:text-cyan-300">
                ANT
              </span>
            </div>
            <p
              className={`text-xs transition-colors hidden sm:block ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium'
              }`}
            >
              AI Cognitive Body Doubler
            </p>
          </div>
        </div>

        {/* Editorial Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('focus')}
            className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'focus'
                ? isDarkMode
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Target className="size-3.5" />
            <span>Focus</span>
            {isSessionActive && (
              <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'dashboard'
                ? isDarkMode
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <LayoutDashboard className="size-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('recovery')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'recovery'
                ? isDarkMode
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>Recovery</span>
          </button>
        </nav>

        {/* Action Controls: Chat with ANT & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Ask ANT Agent Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              isChatOpen
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-102'
                : isDarkMode
                ? 'border border-cyan-500/40 bg-[#0B132B] text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40'
                : 'border border-sky-300 bg-white text-sky-700 hover:border-sky-400 hover:bg-sky-50/80 shadow-2xs'
            }`}
            title="Chat directly with ANT companion"
          >
            <MessageSquareHeart className="size-3.5" />
            <span className="hidden sm:inline">Ask ANT</span>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
            </span>
          </button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
            className={`size-9 rounded-full transition-all duration-200 ${
              isDarkMode
                ? 'border border-[#0E1A38] bg-[#0B132B] text-cyan-300 hover:bg-[#112248] hover:text-cyan-200 shadow-xs'
                : 'border border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100 hover:text-sky-600 shadow-xs'
            }`}
          >
            {isDarkMode ? <Sun className="size-4 text-cyan-300" /> : <Moon className="size-4 text-slate-700" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
