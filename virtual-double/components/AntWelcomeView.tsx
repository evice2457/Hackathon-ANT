'use client'

import { Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useMascotName } from '@/lib/mascot-name'
import { primeAudioOnGesture } from '@/lib/ant-voice'

interface AntWelcomeViewProps {
  onStart: () => void
}

export default function AntWelcomeView({ onStart }: AntWelcomeViewProps) {
  const { mascotName } = useMascotName()

  const handleStart = () => {
    primeAudioOnGesture()
    onStart()
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-8 text-center animate-in fade-in duration-500">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Subtitle Badge (Editorial Tag) */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8D5CE] bg-[#F7ECE8]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A61C30] backdrop-blur-md dark:border-[#52232B] dark:bg-[#32141A]/90 dark:text-[#F39BA9]">
          <span className="text-[10px]">✦</span>
          <span>AI Cognitive Body Doubler</span>
        </div>

        {/* Main Headline */}
        <h1 className="mb-3 text-4xl font-light tracking-tight text-[#201416] transition-colors dark:text-[#FAF4EB] md:text-5xl lg:text-6xl">
          Hello, this is{' '}
          <span className="font-serif italic font-normal text-[#A61C30] dark:text-[#F39BA9]">
            {mascotName}
          </span>
          .
        </h1>
        <p className="max-w-md text-base text-[#614F4D] transition-colors dark:text-[#C5B3B1] md:text-lg">
          Your gentle, judgment-free coworker. Ready to break down barriers and get into your flow?
        </p>

        {/* Mascot Showcase: Isolated Animated Ant */}
        <div className="relative my-6 flex flex-col items-center justify-center">
          {/* Subtle Ambient Radial Glow behind the Mascot (Warm Crimson & Butter) */}
          <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#A61C30]/15 via-[#FBE8A6]/12 to-transparent blur-3xl pointer-events-none dark:from-[#C92A43]/20 dark:via-[#FBE8A6]/10" />

          {/* Floating Mascot Container */}
          <div
            onClick={handleStart}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            aria-label={`${mascotName} mascot - Click to Get Started`}
            className="animate-mascot-float group relative cursor-pointer select-none transition-transform hover:scale-105 flex flex-col items-center"
          >
            {/* Directly Rendered Animated Transparent Ant Mascot */}
            <div className="relative h-72 w-64 md:h-88 md:w-76 flex items-center justify-center drop-shadow-[0_15px_35px_rgba(166,28,48,0.22)]">
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
            <div className="mt-3 whitespace-nowrap rounded-full border border-[#EADBCE] bg-white/95 px-5 py-2 text-xs font-semibold text-[#201416] shadow-sm backdrop-blur-md transition-all group-hover:scale-105 dark:border-[#42202B] dark:bg-[#201016]/95 dark:text-[#F39BA9]">
              👋 I&apos;m here to double with you!
            </div>
          </div>

          {/* Hovering Floor Shadow with inverse scale animation */}
          <div className="animate-mascot-shadow mt-3 h-3.5 w-44 rounded-[100%] bg-[#3D141C]/20 blur-[7px] dark:bg-[#C92A43]/25" />
        </div>

        {/* Prominent GET STARTED Button (Includio Capsule CTA) */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStart}
            type="button"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#A61C30] hover:bg-[#8F1627] px-9 py-4 text-lg font-bold tracking-wide text-white shadow-lg shadow-[#A61C30]/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-[#A61C30]/40 active:scale-[0.98] dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
          >
            <span>Let&apos;s GET STARTED!</span>
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <div className="inline-flex items-center rounded-full border border-[#EADBCE]/80 bg-white/60 px-4 py-1.5 text-xs text-[#786663] backdrop-blur-xs transition-colors dark:border-[#42202B]/80 dark:bg-[#201016]/60 dark:text-[#A89299]">
            Support, not surveillance · Recovery over punishment
          </div>
        </div>
      </div>
    </div>
  )
}
