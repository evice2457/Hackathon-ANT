'use client'

import { useRef, useState } from 'react'
import { Check, GripVertical, Minimize2, Pause, Sparkles, X } from 'lucide-react'

interface FloatingMiniWidgetProps {
  task: string
  onExpand: () => void
  onBreakDown: () => void
  onEnd: () => void
}

export default function FloatingMiniWidget({ task, onExpand, onBreakDown, onEnd }: FloatingMiniWidgetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const offset = useRef({ x: 0, y: 0 })

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

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Expand VirtualDouble focus widget"
      onClick={onExpand}
      onKeyDown={(event) => event.key === 'Enter' && onExpand()}
      className="group fixed right-6 top-24 z-50 w-[248px] cursor-pointer select-none rounded-2xl border border-cyan-400/25 bg-[#101d38]/95 p-4 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl transition-all hover:border-cyan-300/50 hover:shadow-cyan-500/15"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div className="flex items-start gap-3">
        <div
          aria-label="Drag widget"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onClick={(event) => event.stopPropagation()}
          className={`mt-0.5 cursor-grab text-slate-500 active:cursor-grabbing ${isDragging ? 'text-cyan-300' : ''}`}
        >
          <GripVertical className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-300 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">AI Active</span>
          </div>
          <p className="truncate text-sm font-medium text-white">{task || 'Your next small step'}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Body doubling quietly</span>
            <span className="font-mono text-cyan-200">11:42</span>
          </div>
        </div>
        <Minimize2 className="size-3.5 text-slate-500 transition-colors group-hover:text-cyan-300" />
      </div>
      <div className="mt-3 flex max-h-0 gap-2 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-12 group-hover:opacity-100">
        <button onClick={(event) => { event.stopPropagation(); onBreakDown() }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-400/10 px-2 py-2 text-[11px] font-medium text-amber-200 hover:bg-amber-400/20">
          <Sparkles className="size-3.5" /> Break down
        </button>
        <button onClick={(event) => { event.stopPropagation(); onEnd() }} className="flex items-center justify-center rounded-lg bg-rose-400/10 px-2.5 py-2 text-rose-200 hover:bg-rose-400/20" aria-label="End session">
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export { Check, Pause }
