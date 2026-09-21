'use client'

import { useRef, useState } from 'react'
import { GripVertical, Maximize2, Pause, Play, X } from 'lucide-react'
import { useFocusSession, formatTime } from '@/lib/focus-session'
import FocusStateIndicator from '@/components/FocusStateIndicator'

interface FloatingMiniWidgetProps {
  /**
   * "inline" — floats inside the VirtualDouble page (draggable, fixed position).
   * "pip" — rendered inside a Document Picture-in-Picture window; the native
   * window is the movable surface, so drag/fixed positioning are disabled.
   */
  mode?: 'inline' | 'pip'
  /** Rendered inside the PiP window: return to the main VirtualDouble view. */
  onExitPip?: () => void
}

/**
 * Persistent control surface for an active session. It reads the shared
 * FocusSession — it owns no timer of its own, so minimizing/expanding/floating
 * never resets the countdown.
 */
export default function FloatingMiniWidget({ mode = 'inline', onExitPip }: FloatingMiniWidgetProps = {}) {
  const { session, pauseSession, resumeSession, expandToFull, stopSession } = useFocusSession()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const offset = useRef({ x: 0, y: 0 })

  const isPip = mode === 'pip'

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setIsDragging(true)
    offset.current = { x: event.clientX - position.x, y: event.clientY - position.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setPosition({ x: event.clientX - offset.current.x, y: event.clientY - offset.current.y })
  }

  const endDrag = () => setIsDragging(false)

  const handleExpand = () => {
    if (isPip) {
      onExitPip?.()
      return
    }
    expandToFull()
  }

  const isPaused = session.status === 'paused'

  return (
    <div
      aria-label="Active focus session widget"
      className={
        isPip
          ? 'flex h-screen w-full select-none flex-col justify-center bg-[#0B132B] p-3'
          : 'fixed right-6 top-24 z-50 w-[248px] select-none rounded-2xl border border-cyan-400/25 bg-[#101d38]/95 p-4 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl'
      }
      style={isPip ? undefined : { transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div className="flex items-start gap-3">
        {!isPip && (
          <div
            aria-label="Drag widget"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            className={`mt-0.5 cursor-grab text-slate-500 active:cursor-grabbing ${isDragging ? 'text-cyan-300' : ''}`}
          >
            <GripVertical className="size-4" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <FocusStateIndicator state={session.focusState} />

          <p className="mt-2 truncate text-sm font-medium text-white">
            {session.task || 'Your next small step'}
          </p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className={`font-mono font-light tracking-tight text-cyan-100 ${isPip ? 'text-4xl' : 'text-2xl'}`}>
              {formatTime(session.remainingSeconds)}
            </span>
            <span className="text-[11px] text-slate-400">
              {isPaused ? 'Paused' : session.status === 'completed' ? 'Complete' : 'Body doubling'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPaused ? (
          <button
            onClick={resumeSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <Play className="size-3.5" /> Resume
          </button>
        ) : (
          <button
            onClick={pauseSession}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            <Pause className="size-3.5" /> Pause
          </button>
        )}
        <button
          onClick={handleExpand}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20"
        >
          <Maximize2 className="size-3.5" /> {isPip ? 'Return' : 'Expand'}
        </button>
        <button
          onClick={stopSession}
          aria-label="End session"
          className="flex items-center justify-center rounded-lg bg-rose-400/10 px-2.5 py-2 text-rose-200 transition-colors hover:bg-rose-400/20"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
