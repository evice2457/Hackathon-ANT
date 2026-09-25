'use client'

import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, Pencil, Check } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useMascotName } from '@/lib/mascot-name'

interface HeaderProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  const { mascotName, setMascotName } = useMascotName()
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(mascotName)
  const nameInputRef = useRef<HTMLInputElement>(null)

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
  }
  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 backdrop-blur-md ${
        isDarkMode
          ? 'border-b border-[#3D1A25] bg-[#160B0F]/80 shadow-sm'
          : 'border-b border-[#EADBCE] bg-[#FAF7F2]/80 shadow-xs'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo and Customizable Title */}
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[#EADBCE] bg-white shadow-sm ring-2 ring-[#A61C30]/15 dark:border-[#42202B] dark:bg-[#201016] dark:ring-[#C92A43]/20">
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
                    className={`h-7 rounded-full border px-3 text-base font-semibold outline-none transition-colors ${
                      isDarkMode
                        ? 'border-[#C92A43]/60 bg-[#25121B] text-[#FAF4EB] focus:ring-1 focus:ring-[#C92A43]'
                        : 'border-[#A61C30]/50 bg-white text-[#201416] focus:ring-1 focus:ring-[#A61C30]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    title="Save name"
                    className="rounded-full p-1 text-[#A61C30] hover:bg-[#A61C30]/10 dark:text-[#F39BA9]"
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
                    className={`text-xl font-bold tracking-tight transition-colors ${
                      isDarkMode ? 'text-[#FAF4EB]' : 'text-[#201416]'
                    }`}
                  >
                    {mascotName}
                  </h1>
                  <Pencil className="size-3 text-[#786663] opacity-40 transition-opacity group-hover:opacity-100 group-hover:text-[#A61C30] dark:text-[#A89299]" />
                </button>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E8D5CE] bg-[#F7ECE8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#A61C30] dark:border-[#52232B] dark:bg-[#32141A] dark:text-[#F39BA9]">
                <span className="text-[9px]">✦</span> ANT
              </span>
            </div>
            <p
              className={`text-xs transition-colors ${
                isDarkMode ? 'text-[#A89299]' : 'text-[#786663] font-medium'
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
            className={`size-9 rounded-full transition-all duration-200 ${
              isDarkMode
                ? 'border border-[#42202B] bg-[#24121A] text-[#FBE8A6] hover:bg-[#341824] hover:text-[#FBE8A6] shadow-xs'
                : 'border border-[#EADBCE] bg-white/90 text-[#4A3E3D] hover:bg-[#F5ECE5] hover:text-[#A61C30] shadow-xs'
            }`}
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
