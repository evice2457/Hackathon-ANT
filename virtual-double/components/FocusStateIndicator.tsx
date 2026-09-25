'use client'

import type { FocusState } from '@/lib/focus-session'
import { cn } from '@/lib/utils'

const FOCUS_STATE_META: Record<FocusState, { label: string; dot: string; text: string }> = {
  focused: { label: 'Focused', dot: 'bg-emerald-500 dark:bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-200' },
  possibly_distracted: { label: 'Checking in…', dot: 'bg-amber-500 dark:bg-amber-400', text: 'text-amber-700 dark:text-amber-200' },
  away: { label: 'Away', dot: 'bg-slate-500 dark:bg-slate-400', text: 'text-slate-600 dark:text-slate-300' },
}

interface FocusStateIndicatorProps {
  state: FocusState
  className?: string
  size?: 'sm' | 'md'
}

/**
 * Subtle, non-alarming focus-state pill. No flashing — the dot only pulses
 * while genuinely focused.
 */
export default function FocusStateIndicator({ state, className, size = 'sm' }: FocusStateIndicatorProps) {
  const meta = FOCUS_STATE_META[state]
  const dotSize = size === 'md' ? 'size-2.5' : 'size-2'

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full border border-[#EADBCE] bg-white/70 px-3.5 py-1 backdrop-blur-xs dark:border-[#42202B] dark:bg-[#201016]/70', className)}>
      <span className="relative flex">
        {state === 'focused' && (
          <span className={cn('absolute inline-flex animate-ping rounded-full opacity-50', meta.dot, dotSize)} />
        )}
        <span className={cn('relative inline-flex rounded-full', meta.dot, dotSize)} />
      </span>
      <span className={cn('font-semibold', meta.text, size === 'md' ? 'text-sm' : 'text-[11px]')}>
        {meta.label}
      </span>
    </div>
  )
}
