'use client'

import { Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useMascotName } from '@/lib/mascot-name'

interface AntWelcomeViewProps {
  onStart: () => void
}

export default function AntWelcomeView({ onStart }: AntWelcomeViewProps) {
  const { mascotName } = useMascotName()

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-8 text-center animate-in fade-in duration-500">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Subtitle Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-700 backdrop-blur-md dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
          <Sparkles className="size-3.5 animate-pulse text-cyan-500 dark:text-cyan-400" />
          <span>AI Cognitive Body Doubler</span>
        </div>

        {/* Main Headline */}
        <h1 className="mb-2 text-4xl font-light tracking-tight text-slate-900 transition-colors dark:text-white md:text-5xl lg:text-6xl">
          Hello, this is{' '}
          <span className="font-serif italic font-semibold text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            {mascotName}
          </span>
          .
        </h1>
        <p className="max-w-md text-base text-slate-600 transition-colors dark:text-slate-300 md:text-lg">
          Your gentle, judgment-free coworker. Ready to break down barriers and get into your flow?
        </p>

        {/* Mascot Showcase: Isolated Animated Ant (No background frame, fully transparent) */}
        <div className="relative my-6 flex flex-col items-center justify-center">
          {/* Subtle Ambient Radial Glow behind the Mascot */}
          <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-cyan-500/15 via-sky-400/10 to-transparent blur-3xl pointer-events-none dark:from-cyan-400/20 dark:via-blue-500/15" />

          {/* Floating Mascot Container */}
          <div
            onClick={onStart}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onStart()}
            aria-label={`${mascotName} mascot - Click to Get Started`}
            className="animate-mascot-float group relative cursor-pointer select-none transition-transform hover:scale-105 flex flex-col items-center"
          >
            {/* Directly Rendered Animated Transparent Ant Mascot */}
            <div className="relative h-72 w-64 md:h-88 md:w-76 flex items-center justify-center drop-shadow-[0_15px_35px_rgba(6,182,212,0.35)]">
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

            {/* Floating Speech Pill */}
            <div className="mt-3 whitespace-nowrap rounded-full border border-cyan-400/50 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-lg backdrop-blur-md transition-all group-hover:scale-105 dark:border-cyan-400/40 dark:bg-[#0B132B]/90 dark:text-cyan-200">
              👋 I&apos;m here to double with you!
            </div>
          </div>

          {/* Hovering Floor Shadow with inverse scale animation */}
          <div className="animate-mascot-shadow mt-3 h-4 w-44 rounded-[100%] bg-cyan-950/25 blur-[7px] dark:bg-cyan-400/25" />
        </div>

        {/* Prominent GET STARTED Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onStart}
            type="button"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-9 py-4 text-lg font-bold tracking-wide text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.03] hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/45 active:scale-[0.98]"
          >
            <span>Let&apos;s GET STARTED!</span>
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <p className="text-xs text-slate-500 transition-colors dark:text-slate-400">
            Support, not surveillance · Recovery over punishment
          </p>
        </div>
      </div>
    </div>
  )
}
