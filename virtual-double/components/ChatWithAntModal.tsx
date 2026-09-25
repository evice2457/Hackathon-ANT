'use client'

import { useState, useRef, useEffect } from 'react'
import {
  X,
  Send,
  Bot,
  User,
  Zap,
  ArrowRight,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

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
        replyText = `Distraction is a biological signal of task friction, not a lack of willpower. Recommended protocol:
1. Keep the Document PiP Companion floating in view as an external anchor.
2. Apply the '10-Second Pause' — whenever an impulse arises to open another tab, breathe once and check in with ANT.
3. Use the Camera Smile Ritual to trigger positive neuro-association before diving in.`
      } else if (lower.includes('sound') || lower.includes('nhạc') || lower.includes('audio') || lower.includes('music')) {
        replyText = `Acoustic calibration for cognitive performance:
• Deep Logic / Math: Ambient Drone & Brown Noise (shields working memory from transient sounds).
• Engineering / Coding: Binaural Alpha Waves at 10Hz (calm neural alertness).
• Creative / Writing: Minimalist Neo-Classical Piano (promotes free associative thinking).
You can preview each soundscape live in the Recovery tab.`
      } else {
        replyText = `I have logged your focus context: "${query}". The single most effective strategy is committing to just 5 minutes. Once initiation threshold is crossed, attentional inertia will naturally carry you into flow.`
        action = {
          label: 'Start 10-Min Micro Sprint',
          task: query.slice(0, 40),
          durationMinutes: 10,
        }
      }

      const antMsg: ChatMessage = {
        id: `ant-${Date.now()}`,
        sender: 'ant',
        text: replyText,
        timestamp: 'Just now',
        suggestedAction: action,
      }
      setMessages((prev) => [...prev, antMsg])
      setIsTyping(false)
    }, 750)
  }

  // Clean, professional prompt chips without emojis
  const promptChips = [
    'Break down a complex task',
    'Optimal sprint duration for coding',
    'Overcome distraction & restore focus',
    'Recommended audio for deep logic',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      {/* Executive Slide-over Drawer */}
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-[#070F26] text-slate-900 dark:text-slate-100 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-cyan-500/15 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-full border border-slate-200 dark:border-cyan-500/30 bg-slate-100 dark:bg-[#0B132B] shadow-sm">
              <Image
                src="/ant-mascot.png"
                alt="ANT Agent"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{mascotName}</h3>
                <span className="rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300 px-2 py-0.5 text-[10px] font-semibold">
                  Cognitive Assistant
                </span>
              </div>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Active Companion • Ready to consult
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close consultation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Clean Prompt Chips */}
        <div className="border-b border-slate-200/80 dark:border-cyan-500/10 bg-slate-50/70 dark:bg-[#0B132B]/50 px-4 py-3 overflow-x-auto no-scrollbar flex items-center gap-2">
          {promptChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="shrink-0 rounded-full border border-slate-200 bg-white text-slate-700 dark:border-cyan-500/20 dark:bg-slate-900/60 dark:text-cyan-300 px-3 py-1.5 text-xs font-medium hover:border-cyan-500 hover:text-cyan-600 dark:hover:border-cyan-400 dark:hover:bg-cyan-950/40 transition-all shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`size-8 shrink-0 rounded-full flex items-center justify-center text-xs ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 dark:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : 'border border-slate-200 bg-slate-50/90 text-slate-800 dark:border-cyan-500/20 dark:bg-[#0B132B]/90 dark:text-slate-200'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.suggestedAction && onApplyAction && (
                  <div className="mt-3.5 border-t border-slate-200 dark:border-cyan-500/20 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (msg.suggestedAction?.task && msg.suggestedAction.durationMinutes) {
                          onApplyAction(
                            msg.suggestedAction.task,
                            msg.suggestedAction.durationMinutes,
                          )
                          onClose()
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-all shadow-xs"
                    >
                      <Zap className="size-3 text-slate-950" />
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                )}

                <div className="mt-1.5 text-[10px] text-slate-400 text-right font-mono">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 p-2">
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-cyan-500 animate-bounce" />
                <span className="size-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {mascotName} is synthesizing advice...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 dark:border-cyan-500/20 bg-slate-50/80 dark:bg-[#0B132B]/90 p-4">
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
              placeholder={`Ask ${mascotName} about task breakdown, duration or flow...`}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-cyan-500/30 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="size-10 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-slate-950 font-bold transition-all disabled:opacity-40 shadow-sm"
              title="Send message"
            >
              <Send className="size-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
