'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEFAULT_DURATION_MINUTES, DURATION_PRESETS, useFocusSession } from '@/lib/focus-session'

const SUGGESTION_PILLS = [
  'Review 3 priority emails',
  'Outline key bullet points',
  'Finish draft introduction',
]

interface MicroCommitmentViewProps {
  onInitiateRitual?: (task: string, durationMinutes: number) => void
}

export default function MicroCommitmentView({ onInitiateRitual }: MicroCommitmentViewProps = {}) {
  const { startSession } = useFocusSession()
  const [input, setInput] = useState('')
  const [minutes, setMinutes] = useState<number>(DEFAULT_DURATION_MINUTES)
  const [customMinutes, setCustomMinutes] = useState('')

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const toggleSpeechRecognition = () => {
    setSpeechError(null)

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
      setIsListening(false)
      return
    }

    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechError('Trình duyệt chưa hỗ trợ Web Speech Recognition. Bạn vui lòng gõ task trực tiếp.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = navigator.language || 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0]?.transcript || '')
          .join('')
        if (transcript.trim()) {
          setInput(transcript.trim())
        }
      }

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error)
          setSpeechError(`Microphone: ${event.error}`)
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err)
      setSpeechError('Không thể truy cập microphone. Vui lòng cấp quyền micro cho trình duyệt.')
      setIsListening(false)
    }
  }

  const trimmed = input.trim()
  const canStart = Boolean(trimmed) && Number.isFinite(minutes) && minutes > 0

  // Starts or stages a session.
  const startWith = (task: string, durationMinutes: number) => {
    if (!task.trim() || durationMinutes <= 0) return
    if (onInitiateRitual) {
      onInitiateRitual(task.trim(), durationMinutes)
    } else {
      startSession(task.trim(), Math.round(durationMinutes * 60))
    }
  }

  const handleCustomMinutes = (value: string) => {
    setCustomMinutes(value)
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      setMinutes(parsed)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Headline */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-light tracking-tight text-slate-900 transition-colors dark:text-white md:text-5xl">
            What small step{' '}
            <span className="font-serif italic font-normal text-cyan-600 dark:text-cyan-300">
              will you conquer
            </span>{' '}
            in the next {minutes || 15} minutes?
          </h2>
          <p className="text-base text-slate-600 transition-colors dark:text-slate-400">
            Break it down. Keep it simple. Just one thing.
          </p>
        </div>

        {/* Input Area */}
        <div className="mb-8">
          <div className="relative flex items-stretch gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  startWith(input, minutes)
                }
              }}
              placeholder="Tell me what you’ll do..."
              className="flex-1 rounded-2xl border-slate-300/80 bg-white/75 px-6 py-7 text-lg text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-md transition-all focus:border-cyan-500/60 focus:ring-cyan-500/20 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 dark:shadow-none"
            />
            <button
              type="button"
              onClick={() => startWith(input, minutes)}
              disabled={!canStart}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-7 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:shadow-none"
            >
              Start with Me
            </button>
            <Button
              size="icon"
              type="button"
              onClick={toggleSpeechRecognition}
              aria-label={isListening ? 'Stop listening' : 'Voice input (Click to speak task)'}
              title={isListening ? 'Listening... click to stop' : 'Click to speak your task'}
              className={`h-auto self-stretch w-14 shrink-0 rounded-2xl transition-all ${
                isListening
                  ? 'border-rose-500 bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 hover:bg-rose-600'
                  : 'border-slate-200/90 bg-white/70 text-slate-700 hover:border-cyan-500/50 hover:bg-white hover:text-cyan-600 dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300'
              }`}
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>
          </div>

          {/* Speech Feedback message */}
          {isListening && (
            <p className="mt-2.5 inline-flex items-center gap-2 text-xs font-semibold text-rose-500 dark:text-rose-400 animate-pulse">
              <span className="size-2 rounded-full bg-rose-500 animate-ping" />
              Đang lắng nghe giọng nói... Hãy nói task của bạn (sẽ tự động điền vào ô trên).
            </p>
          )}
          {speechError && (
            <p className="mt-2.5 text-xs text-amber-600 dark:text-amber-400">
              {speechError}
            </p>
          )}
        </div>

        {/* Duration picker */}
        <div className="mb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors dark:text-slate-400">
            Session length
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setMinutes(preset)
                  setCustomMinutes('')
                }}
                className={`rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-200 backdrop-blur-md ${
                  minutes === preset && !customMinutes
                    ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-800 shadow-sm dark:border-cyan-400/60 dark:bg-cyan-400/15 dark:text-cyan-200'
                    : 'border-slate-200/90 bg-white/60 text-slate-700 hover:border-cyan-500/50 hover:bg-white/80 hover:text-cyan-700 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300'
                }`}
              >
                {preset} min
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/60 px-3 py-2 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
              <Input
                type="number"
                min={1}
                max={180}
                value={customMinutes}
                onChange={(e) => handleCustomMinutes(e.target.value)}
                placeholder="Custom"
                className="h-8 w-20 border-0 bg-transparent p-0 text-center text-sm text-slate-900 placeholder-slate-400 focus-visible:ring-0 dark:text-white dark:placeholder-slate-500"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">min</span>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Pills (Compact single row, fills input on click) */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors dark:text-slate-400">
              Quick suggestions (Click to fill)
            </p>
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear input
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUGGESTION_PILLS.map((pill) => {
              const isSelected = input === pill
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setInput(pill)}
                  className={`rounded-xl border px-3.5 py-3 text-xs sm:text-sm font-medium transition-all duration-200 backdrop-blur-md text-center truncate ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/15 text-cyan-800 shadow-sm dark:border-cyan-400 dark:bg-cyan-400/20 dark:text-cyan-200 ring-1 ring-cyan-400/40'
                      : 'border-slate-200/90 bg-white/60 text-slate-700 shadow-sm hover:border-cyan-500/50 hover:bg-white/90 hover:text-cyan-800 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-cyan-500/50 dark:hover:bg-slate-700/60 dark:hover:text-cyan-300'
                  }`}
                  title={pill}
                >
                  {pill}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
