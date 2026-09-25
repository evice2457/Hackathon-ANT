'use client'

import { useState, useRef, useEffect } from 'react'
import { ListChecks, Mic, MicOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEFAULT_DURATION_MINUTES, DURATION_PRESETS, useFocusSession } from '@/lib/focus-session'
import { primeAudioOnGesture } from '@/lib/ant-voice'
import {
  hasInvalidCustomDuration,
  parseCustomDuration,
  selectCustomDuration,
  selectPresetDuration,
  type DurationSelection,
} from '@/lib/ant-ai/recommendation-state'
import { createTaskPlan, type TaskPlan } from '@/lib/task-breakdown'

const SUGGESTION_PILLS = [
  'Implement user authentication flow',
  'Write the quarterly project report',
  'Research React server components',
]

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternativeLike | undefined
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

interface MicroCommitmentViewProps {
  onInitiateRitual?: (task: string, durationMinutes: number) => void
  onInitiatePlan?: (plan: TaskPlan) => void
}

export default function MicroCommitmentView({
  onInitiateRitual,
  onInitiatePlan,
}: MicroCommitmentViewProps = {}) {
  const { startSession } = useFocusSession()
  const [input, setInput] = useState('')
  const [duration, setDuration] = useState<DurationSelection>({
    minutes: DEFAULT_DURATION_MINUTES,
    source: 'default',
    customMinutes: null,
  })
  const [taskPlan, setTaskPlan] = useState<TaskPlan | null>(null)
  const [stepMinuteInputs, setStepMinuteInputs] = useState<Record<string, string>>({})

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

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

  const updateTask = (value: string) => {
    setInput(value)
    setTaskPlan(null)
    setStepMinuteInputs({})
  }

  const chooseManualDuration = (minutes: number) => {
    setDuration(selectPresetDuration(minutes))
    setTaskPlan(null)
    setStepMinuteInputs({})
  }

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

    const speechWindow = window as SpeechRecognitionWindow
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition isn't supported in this browser. You can type your task instead.")
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

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || '')
          .join('')
        if (transcript.trim()) {
          updateTask(transcript.trim())
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error)
          setSpeechError("Couldn't access speech recognition. Check your microphone permission or type your task instead.")
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (error: unknown) {
      console.warn('Failed to start speech recognition:', error)
      setSpeechError("Couldn't access speech recognition. Check your microphone permission or type your task instead.")
      setIsListening(false)
    }
  }

  const trimmed = input.trim()
  const { minutes, customMinutes } = duration
  const customDurationInvalid = hasInvalidCustomDuration(duration)
  const canStart = Boolean(trimmed) && minutes !== null && !customDurationInvalid

  // Starts or stages a session.
  const startWith = (task: string, durationMinutes: number) => {
    if (!task.trim() || durationMinutes <= 0) return
    primeAudioOnGesture()
    if (onInitiateRitual) {
      onInitiateRitual(task.trim(), durationMinutes)
    } else {
      startSession(task.trim(), Math.round(durationMinutes * 60))
    }
  }

  const handleCustomMinutes = (value: string) => {
    setDuration(selectCustomDuration(value))
    setTaskPlan(null)
    setStepMinuteInputs({})
  }

  const handleBreakDown = () => {
    if (!canStart || minutes === null) return
    const plan = createTaskPlan(trimmed, minutes)
    setTaskPlan(plan)
    setStepMinuteInputs(
      Object.fromEntries(plan.steps.map((step) => [step.id, String(step.minutes)])),
    )
  }

  const updateStepTitle = (id: string, title: string) => {
    setTaskPlan((current) =>
      current
        ? { ...current, steps: current.steps.map((step) => (step.id === id ? { ...step, title } : step)) }
        : current,
    )
  }

  const updateStepMinutes = (id: string, value: string) => {
    setStepMinuteInputs((current) => ({ ...current, [id]: value }))
    const parsed = parseCustomDuration(value)
    if (parsed === null) return
    setTaskPlan((current) =>
      current
        ? {
            ...current,
            steps: current.steps.map((step) =>
              step.id === id ? { ...step, minutes: parsed } : step,
            ),
          }
        : current,
    )
  }

  const removeStep = (id: string) => {
    setTaskPlan((current) =>
      current ? { ...current, steps: current.steps.filter((step) => step.id !== id) } : current,
    )
    setStepMinuteInputs((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const planIsValid = Boolean(
    taskPlan?.steps.length &&
      taskPlan.steps.every(
        (step) =>
          step.title.trim() && parseCustomDuration(stepMinuteInputs[step.id] ?? '') !== null,
      ),
  )

  const startStepByStep = () => {
    if (!taskPlan || !planIsValid || !onInitiatePlan) return
    const editedPlan: TaskPlan = {
      ...taskPlan,
      steps: taskPlan.steps.map((step) => ({
        ...step,
        title: step.title.trim(),
        minutes: parseCustomDuration(stepMinuteInputs[step.id]) ?? step.minutes,
      })),
    }
    onInitiatePlan(editedPlan)
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Headline */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-light tracking-tight text-slate-900 transition-colors dark:text-slate-100 md:text-5xl">
            What will you{' '}
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              focus on
            </span>{' '}
            next?
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
              onChange={(e) => updateTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && canStart && minutes !== null) {
                  startWith(input, minutes)
                }
              }}
              placeholder="Tell me what you’ll do..."
              className="flex-1 rounded-full border-slate-200 bg-white/85 px-6 py-7 text-lg text-slate-900 placeholder:text-slate-400 shadow-xs backdrop-blur-md transition-all focus:border-cyan-500/60 focus:ring-cyan-500/20 dark:border-cyan-500/30 dark:bg-[#0B132B]/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none"
            />
            <button
              type="button"
              onClick={() => {
                if (minutes !== null) startWith(input, minutes)
              }}
              disabled={!canStart}
              className="rounded-full bg-cyan-500 px-7 font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition-all hover:bg-cyan-400 hover:shadow-cyan-500/40 disabled:opacity-45 disabled:shadow-none"
            >
              Start with ANT
            </button>
            <Button
              size="icon"
              type="button"
              onClick={toggleSpeechRecognition}
              aria-label={isListening ? 'Stop listening' : 'Speak your task'}
              title={isListening ? 'Listening... click to stop' : 'Speak your task'}
              className={`h-auto self-stretch w-14 shrink-0 rounded-full transition-all ${
                isListening
                  ? 'border-cyan-500 bg-cyan-500 text-slate-950 animate-pulse shadow-md shadow-cyan-500/40 hover:bg-cyan-400'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:border-cyan-500/50 hover:bg-white hover:text-cyan-600 dark:border-cyan-500/30 dark:bg-[#0B132B]/80 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300'
              }`}
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>
          </div>

          {/* Speech Feedback message */}
          {isListening && (
            <p className="mt-2.5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 animate-pulse">
              <span className="size-2 rounded-full bg-cyan-500 animate-ping" />
              Listening… Say your task and I&apos;ll fill it in above.
            </p>
          )}
          {speechError && (
            <p className="mt-2.5 text-xs text-amber-700 dark:text-amber-400">
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
                  chooseManualDuration(preset)
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 backdrop-blur-md ${
                  minutes === preset && customMinutes === null
                    ? 'border-cyan-500 bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950 font-bold'
                    : 'border-slate-200 bg-white/70 text-slate-700 hover:border-cyan-500/50 hover:bg-white/90 hover:text-cyan-600 dark:border-cyan-500/20 dark:bg-[#0B132B]/60 dark:text-slate-300 dark:hover:border-cyan-400/50 dark:hover:text-cyan-300'
                }`}
              >
                {preset} min
              </button>
            ))}
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 backdrop-blur-md ${
                customMinutes !== null
                  ? 'border-cyan-500 bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950 font-bold'
                  : 'border-slate-200 bg-white/70 text-slate-700 hover:border-cyan-500/50 hover:bg-white/90 hover:text-cyan-600 dark:border-cyan-500/20 dark:bg-[#0B132B]/60 dark:text-slate-300 dark:hover:border-cyan-400/50 dark:hover:text-cyan-300'
              }`}
            >
              <input
                type="number"
                min={1}
                max={180}
                value={customMinutes ?? ''}
                onChange={(e) => handleCustomMinutes(e.target.value)}
                placeholder="Custom"
                className={`w-14 bg-transparent p-0 text-center text-sm font-semibold outline-none focus:outline-none placeholder:font-normal ${
                  customMinutes !== null
                    ? 'text-slate-950 placeholder:text-slate-700'
                    : 'text-slate-800 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500'
                }`}
              />
              <span
                className={`text-xs ${
                  customMinutes !== null
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}
              >
                min
              </span>
            </div>
          </div>
          {customDurationInvalid && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
              Enter a duration between 1 and 180 minutes.
            </p>
          )}
          <button
            type="button"
            onClick={handleBreakDown}
            disabled={!canStart}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-900/40 disabled:opacity-45"
          >
            <ListChecks className="size-3.5" /> Break down task
          </button>
        </div>

        {taskPlan && (
          <div className="mb-10 rounded-3xl border border-cyan-500/20 bg-white/85 p-6 shadow-xs backdrop-blur-md dark:border-cyan-500/25 dark:bg-[#0B132B]/85">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Step-by-step plan
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Edit the steps or time before you begin.
                </p>
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                {taskPlan.steps.reduce(
                  (total, step) => total + (parseCustomDuration(stepMinuteInputs[step.id] ?? '') ?? 0),
                  0,
                )}{' '}
                min total
              </span>
            </div>

            <div className="space-y-3">
              {taskPlan.steps.map((step, index) => {
                const stepMinutesValid = parseCustomDuration(stepMinuteInputs[step.id] ?? '') !== null
                return (
                  <div key={step.id} className="flex items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 dark:border-cyan-500/20 dark:bg-[#0E1A38]/70">
                    <span className="mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                      {index + 1}
                    </span>
                    <Input
                      value={step.title}
                      onChange={(event) => updateStepTitle(step.id, event.target.value)}
                      aria-label={`Step ${index + 1} title`}
                      className="flex-1 rounded-xl border-slate-200 dark:border-cyan-500/20"
                    />
                    <div>
                      <Input
                        type="number"
                        min={1}
                        max={180}
                        value={stepMinuteInputs[step.id] ?? ''}
                        onChange={(event) => updateStepMinutes(step.id, event.target.value)}
                        aria-label={`Step ${index + 1} minutes`}
                        className={`w-20 text-center rounded-xl ${stepMinutesValid ? 'border-slate-200 dark:border-cyan-500/20' : 'border-amber-500'}`}
                      />
                      {!stepMinutesValid && <span className="mt-1 block text-[10px] text-amber-600">1–180 min</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      aria-label={`Remove step ${index + 1}`}
                      className="mt-1 rounded-full p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 dark:text-slate-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => minutes !== null && startWith(input, minutes)}
                disabled={!canStart}
                className="rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-cyan-500/50 hover:text-cyan-600 dark:border-cyan-500/20 dark:bg-[#0B132B]/60 dark:text-slate-200"
              >
                Start full task — {minutes} min
              </button>
              <button
                type="button"
                onClick={startStepByStep}
                disabled={!planIsValid}
                className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 hover:bg-cyan-400 disabled:opacity-45"
              >
                Start step-by-step
              </button>
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors dark:text-slate-400">
              Quick suggestions (Click to fill)
            </p>
            {input && (
              <button
                type="button"
                onClick={() => updateTask('')}
                className="text-[11px] text-slate-400 hover:text-cyan-500 transition-colors dark:text-slate-500"
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
                  onClick={() => updateTask(pill)}
                  className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 backdrop-blur-md text-center break-words cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-xs dark:border-cyan-400 dark:bg-cyan-950/60 dark:text-cyan-300 ring-1 ring-cyan-500/30'
                      : 'border-slate-200 bg-white/70 text-slate-700 shadow-2xs hover:border-cyan-500/50 hover:bg-white hover:text-cyan-600 dark:border-cyan-500/20 dark:bg-[#0B132B]/70 dark:text-slate-300 dark:hover:border-cyan-400/50 dark:hover:text-cyan-300'
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

