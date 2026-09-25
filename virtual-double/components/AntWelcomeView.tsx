'use client'

import { ArrowRight, LayoutDashboard, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { useMascotName } from '@/lib/mascot-name'
import { primeAudioOnGesture } from '@/lib/ant-voice'

interface AntWelcomeViewProps {
  onStart: () => void
  onOpenDashboard?: () => void
  onOpenChat?: () => void
}

export default function AntWelcomeView({ onStart, onOpenDashboard, onOpenChat }: AntWelcomeViewProps) {
  const { mascotName } = useMascotName()

  const handleStart = () => {
    primeAudioOnGesture()
    onStart()
  }

  return (
    <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
      {/* Borderless Floating Hero Layout — Content breathes directly on the background */}
      <div className="relative w-full max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        {/* Hero Grid: Editorial Typography Left + Animated ANT Mascot Right */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Editorial Display Typography */}
          <div className="flex flex-col items-start text-left lg:col-span-7">
            {/* Kicker / Subtitle (Clean italic serif, no sparkles) */}
            <p className="mb-2 text-base font-serif italic text-cyan-500 dark:text-cyan-400 sm:text-lg lg:text-xl">
              The gentle art of mastering your focus
            </p>

            {/* Main Headline */}
            <h1 className="mb-5 text-4xl font-normal tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl font-serif">
              Flow state <br className="hidden sm:inline" />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400">
                by design.
              </span>
            </h1>

            <p className="mb-8 max-w-lg text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Meet <strong className="font-semibold text-slate-900 dark:text-cyan-300">{mascotName}</strong> — your judgment-free cognitive body doubler. Break through procrastination, maintain deep presence, and recover momentum gracefully.
            </p>

            {/* Action Buttons: Solid Pill + Outline Pill */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 px-7 py-3.5 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>ENTER FLOW SESSION</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {onOpenDashboard && (
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 dark:border-cyan-500/30 dark:bg-cyan-950/20 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-800 dark:text-cyan-200 transition-all duration-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-slate-950 dark:hover:text-white backdrop-blur-sm"
                >
                  <LayoutDashboard className="size-4 text-cyan-600 dark:text-cyan-400" />
                  <span>VIEW DASHBOARD</span>
                </button>
              )}

              {onOpenChat && (
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40 px-5 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all duration-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-300 backdrop-blur-sm"
                >
                  <MessageSquare className="size-4 text-cyan-600 dark:text-cyan-400" />
                  <span>CONSULT ANT</span>
                </button>
              )}
            </div>

            {/* Clean Feature Line (No emojis) */}
            <div className="mt-10 flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/80 dark:border-cyan-500/15 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-500" />
                <span>Camera Smile Ritual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-500" />
                <span>Automatic Mini PiP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-500" />
                <span>Distraction Recovery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Mascot Showcase */}
          <div className="relative flex flex-col items-center justify-center lg:col-span-5">
            {/* Ambient Radial Soft Glow behind Mascot */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none dark:bg-cyan-400/10" />

            <div
              onClick={handleStart}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              aria-label={`${mascotName} mascot - Click to Start Focus`}
              className="animate-mascot-float group relative cursor-pointer select-none transition-transform hover:scale-105 flex flex-col items-center"
            >
              {/* Animated Ant Mascot */}
              <div className="relative h-64 w-60 sm:h-80 sm:w-72 md:h-96 md:w-84 flex items-center justify-center drop-shadow-[0_20px_45px_rgba(6,182,212,0.25)]">
                <Image
                  src="/ant-waving.webp"
                  alt={`${mascotName} - AI Cognitive Body Doubler Animated Mascot`}
                  width={440}
                  height={520}
                  priority
                  unoptimized
                  className="size-full object-contain pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Floating Speech Pill (Clean, without emojis) */}
              <div className="mt-3 whitespace-nowrap rounded-full border border-slate-200 bg-white/95 dark:border-cyan-500/30 dark:bg-[#0B132B]/95 px-5 py-2 text-xs font-semibold text-slate-800 dark:text-cyan-200 shadow-lg shadow-cyan-950/20 backdrop-blur-md transition-all group-hover:scale-105 group-hover:border-cyan-400">
                Ready to conquer together?
              </div>
            </div>

            {/* Hovering Floor Shadow */}
            <div className="animate-mascot-shadow mt-4 h-3.5 w-44 rounded-[100%] bg-cyan-950/40 blur-[8px] dark:bg-cyan-900/40" />
          </div>
        </div>
      </div>
    </div>
  )
}
