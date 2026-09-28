'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  Send,
  Bot,
  User,
  Zap,
  ArrowRight,
  GripVertical,
  Minus,
  Maximize2,
} from 'lucide-react'
import Image from 'next/image'
import { useMascotName } from '@/lib/mascot-name'

interface ChatMessage {
  id: string
  sender: 'ant' | 'user'
  text: string
  timestamp: string
  suggestedAction?: {
    label: string
    task?: string
    durationMinutes?: number
  }
}

interface ChatWithAntModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyAction?: (task: string, durationMinutes: number) => void
}

export default function ChatWithAntModal({
  isOpen,
  onClose,
  onApplyAction,
}: ChatWithAntModalProps) {
  const { mascotName } = useMascotName()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ant',
      text: `Hello! I'm ${mascotName}, your cognitive body doubler. What task are you working on right now? I can help you decompose complex objectives, recommend optimal sprint intervals, or calibrate focus strategies.`,
      timestamp: 'Just now',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Resizable Width State (Defaults to 460px, adjustable between 340px and 860px)
  const [drawerWidth, setDrawerWidth] = useState<number>(460)
  const [isDragging, setIsDragging] = useState(false)
  const isResizingRef = useRef(false)

  // Restore preferred width from localStorage if saved
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('virtualdouble_chat_drawer_width')
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10)
        if (!isNaN(parsed) && parsed >= 340 && parsed <= 900) {
          setDrawerWidth(parsed)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Mouse drag handler for horizontal width resizing
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizingRef.current = true
    setIsDragging(true)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return
      const newWidth = window.innerWidth - moveEvent.clientX
      const minW = 340
      const maxW = Math.min(880, window.innerWidth - 60)
      const clamped = Math.max(minW, Math.min(maxW, newWidth))
      setDrawerWidth(clamped)
      try {
        localStorage.setItem('virtualdouble_chat_drawer_width', clamped.toString())
      } catch {}
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [])

  if (!isOpen) return null

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend ?? inputValue).trim()
    if (!query) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    }
    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputValue('')
    setIsTyping(true)

    // Executive Simulated AI Consultation
    setTimeout(() => {
      let replyText = ''
      let action: ChatMessage['suggestedAction'] | undefined = undefined

      const lower = query.toLowerCase()
      if (lower.includes('break') || lower.includes('chia nhỏ') || lower.includes('complex')) {
        replyText = `When approaching large, ambiguous tasks, working memory experiences cognitive friction. Here is an evidence-based micro-commitment breakdown:

1. Phase 1 (5 mins): Frictionless initiation — inspect requirements and create file stubs.
2. Phase 2 (25 mins): Core technical execution — implement the primary functional logic.
3. Phase 3 (15 mins): Hardening & verification — execute test passes and polish visual details.

Would you like to initiate Phase 1 as a focused sprint?`
        action = {
          label: 'Apply 25-Min Initiation Sprint',
          task: 'Phase 1: Core Logic Architecture',
          durationMinutes: 25,
        }
      } else if (lower.includes('duration') || lower.includes('thời gian') || lower.includes('sprint') || lower.includes('optimal')) {
        replyText = `Based on Ultradian Rhythm research:
• Complex Logic & Engineering: 25 to 35-minute sprints sustain peak dopamine and flow state without cognitive fatigue.
• Operational & Communications: 15-minute high-velocity sprints.
• Continuous work past 50 minutes without a micro-break increases error rates by up to 40%.`
        action = {
          label: 'Set 30-Minute Focus Block',
          task: 'Focused 30-Minute Sprint',
          durationMinutes: 30,
        }
      } else if (lower.includes('distract') || lower.includes('xao nhãng') || lower.includes('restore')) {
        replyText = `Distraction is a biological signal of cognitive friction or fatigue, not a personal failing.

Immediate 3-step recalibration:
1. Gaze shift: Look 20 feet away for 20 seconds to relax ocular muscles.
2. Micro-commitment: Shrink your next physical action to something that takes under 2 minutes.
3. Audio anchor: Activate Tokyo Midnight Rain or Binaural Alpha soundscapes in the Recovery tab.`
        action = {
          label: 'Start 10-Min Micro Sprint',
          task: 'Quick Momentum Reset',
          durationMinutes: 10,
        }
      } else {
        replyText = `I have logged this focus intent. In high-performance work, clarity precedes momentum. Break this into one single tangible output for the next 25 minutes, and I will track your persistence alongside you.`
        action = {
          label: 'Start 25-Min Focus Sprint',
          task: query.length > 50 ? `${query.slice(0, 47)}...` : query,
          durationMinutes: 25,
        }
      }

      const botMsg: ChatMessage = {
        id: `ant-${Date.now()}`,
        sender: 'ant',
        text: replyText,
        timestamp: 'Just now',
        suggestedAction: action,
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 700)
  }

  // Clean, professional prompt chips without emojis
  const promptChips = [
    'Break down a complex task',
    'Optimal sprint duration for coding',
    'Overcome distraction & restore focus',
    'Recommended audio for deep logic',
  ]

  return (
    /* Non-blocking fixed container: pointer-events-none allows clicks through to website */
    <aside
      aria-label="ANT Cognitive Assistant Drawer"
      className="pointer-events-none fixed top-0 right-0 bottom-0 z-40 flex justify-end font-sans"
    >
      {/* Executive Slide-over Drawer with pointer-events-auto */}
      <div
        style={{ width: `${drawerWidth}px` }}
        className={`pointer-events-auto relative flex h-full flex-col border-l border-slate-200 dark:border-cyan-500/25 bg-white/95 dark:bg-[#070F26]/95 text-slate-900 dark:text-slate-100 shadow-2xl backdrop-blur-2xl transition-[width] ${
          isDragging ? 'transition-none select-none' : 'duration-150'
        }`}
      >
        {/* Horizontal Drag Resize Handle (Left Edge) */}
        <div
          onMouseDown={startResizing}
          title="Drag left/right to resize chat width (<->)"
          className={`group absolute top-0 -left-2 bottom-0 w-4 cursor-ew-resize select-none flex items-center justify-center z-50 transition-colors ${
            isDragging ? 'bg-cyan-500/30' : 'hover:bg-cyan-500/20'
          }`}
        >
          <div className="flex h-12 w-1.5 items-center justify-center rounded-full bg-slate-300 dark:bg-cyan-500/40 group-hover:bg-cyan-500 transition-colors shadow-xs">
            <span className="sr-only">Resize Chat Width</span>
          </div>
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-cyan-500/15 px-5 py-3.5 bg-slate-50/80 dark:bg-[#0B132B]/80">
          <div className="flex items-center gap-3">
            <div className="relative size-9 overflow-hidden rounded-full border border-slate-200 dark:border-cyan-500/30 bg-slate-100 dark:bg-[#0B132B] shadow-sm">
              <Image
                src="/ant-mascot.png"
                alt="ANT Agent"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{mascotName}</h3>
                <span className="rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300 px-2 py-0.5 text-[10px] font-semibold">
                  Cognitive Copilot
                </span>
              </div>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Docked & Resizable • Multi-task Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Preset Width Toggle */}
            <button
              type="button"
              onClick={() => setDrawerWidth((prev) => (prev > 500 ? 380 : 640))}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title={drawerWidth > 500 ? 'Narrow view (380px)' : 'Expanded view (640px)'}
            >
              <Maximize2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Close chat drawer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Clean Prompt Chips */}
        <div className="border-b border-slate-200/80 dark:border-cyan-500/10 bg-slate-50/50 dark:bg-[#0B132B]/50 px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
          {promptChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="shrink-0 rounded-full border border-slate-200 bg-white text-slate-700 dark:border-cyan-500/20 dark:bg-slate-900/60 dark:text-cyan-300 px-3 py-1 text-xs font-medium hover:border-cyan-500 hover:text-cyan-600 dark:hover:border-cyan-400 dark:hover:bg-cyan-950/40 transition-all shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'border border-cyan-500/30 bg-[#0E1A38] text-cyan-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-xs shadow-xs'
                    : 'border border-slate-200 bg-slate-50/90 text-slate-800 dark:border-cyan-500/20 dark:bg-[#0E1A38]/90 dark:text-slate-100 rounded-tl-xs shadow-xs whitespace-pre-line'
                }`}
              >
                {msg.text}

                {/* Structured 1-Click Action Card */}
                {msg.suggestedAction && (
                  <div className="mt-3 border-t border-slate-200 dark:border-cyan-500/20 pt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (msg.suggestedAction?.task && msg.suggestedAction?.durationMinutes && onApplyAction) {
                          onApplyAction(msg.suggestedAction.task, msg.suggestedAction.durationMinutes)
                          onClose()
                        }
                      }}
                      className="inline-flex w-full items-center justify-between rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm transition-all"
                    >
                      <span className="flex items-center gap-1.5">
                        <Zap className="size-3" />
                        {msg.suggestedAction.label}
                      </span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-cyan-400/80">
              <span className="size-1.5 rounded-full bg-cyan-500 animate-ping" />
              <span>{mascotName} is formulating tactical advice...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 dark:border-cyan-500/15 p-3.5 bg-slate-50/70 dark:bg-[#0B132B]/70">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for task breakdown, optimal duration..."
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-[#070F26] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all disabled:opacity-40"
              title="Send message"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
