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
  'Review 3 priority emails',
  'Outline key bullet points',
  'Finish draft introduction',
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
          <h2 className="mb-4 text-4xl font-light tracking-tight text-[#201416] transition-colors dark:text-[#FAF4EB] md:text-5xl">
            What will you{' '}
            <span className="font-serif italic font-normal text-[#A61C30] dark:text-[#F39BA9]">
              focus on
            </span>{' '}
            next?
          </h2>
          <p className="text-base text-[#614F4D] transition-colors dark:text-[#C5B3B1]">
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
              className="flex-1 rounded-full border-[#EADBCE] bg-white/85 px-6 py-7 text-lg text-[#201416] placeholder:text-[#8D7B78] shadow-xs backdrop-blur-md transition-all focus:border-[#A61C30]/60 focus:ring-[#A61C30]/20 dark:border-[#42202B] dark:bg-[#201016]/80 dark:text-[#FAF4EB] dark:placeholder:text-[#A89299] dark:shadow-none"
            />
            <button
              type="button"
              onClick={() => {
                if (minutes !== null) startWith(input, minutes)
              }}
              disabled={!canStart}
              className="rounded-full bg-[#A61C30] px-7 font-semibold text-white shadow-md shadow-[#A61C30]/25 transition-all hover:bg-[#8F1627] hover:shadow-[#A61C30]/40 disabled:opacity-45 disabled:shadow-none dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
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
                  ? 'border-[#A61C30] bg-[#A61C30] text-white animate-pulse shadow-md shadow-[#A61C30]/40 hover:bg-[#8F1627]'
                  : 'border-[#EADBCE] bg-white/80 text-[#4A3E3D] hover:border-[#A61C30]/50 hover:bg-white hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016]/80 dark:text-[#FAF4EB] dark:hover:border-[#C92A43] dark:hover:text-[#F39BA9]'
              }`}
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>
          </div>

          {/* Speech Feedback message */}
          {isListening && (
            <p className="mt-2.5 inline-flex items-center gap-2 text-xs font-semibold text-[#A61C30] dark:text-[#F39BA9] animate-pulse">
              <span className="size-2 rounded-full bg-[#A61C30] dark:bg-[#F39BA9] animate-ping" />
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
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#614F4D] transition-colors dark:text-[#C5B3B1]">
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
                    ? 'border-[#A61C30] bg-[#A61C30] text-white shadow-md shadow-[#A61C30]/25 dark:border-[#C92A43] dark:bg-[#C92A43] dark:text-white'
                    : 'border-[#EADBCE] bg-white/70 text-[#4A3E3D] hover:border-[#A61C30]/50 hover:bg-white/90 hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016]/60 dark:text-[#D1C0BE] dark:hover:border-[#C92A43]/50 dark:hover:text-[#F39BA9]'
                }`}
              >
                {preset} min
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-full border border-[#EADBCE] bg-white/70 px-3.5 py-1.5 backdrop-blur-md dark:border-[#42202B] dark:bg-[#201016]/60">
              <Input
                type="number"
                min={1}
                max={180}
                value={customMinutes ?? ''}
                onChange={(e) => handleCustomMinutes(e.target.value)}
                placeholder="Custom"
                className="h-7 w-16 border-0 bg-transparent p-0 text-center text-sm text-[#201416] placeholder:text-[#8D7B78] focus-visible:ring-0 dark:text-[#FAF4EB] dark:placeholder:text-[#A89299]"
              />
              <span className="text-xs font-medium text-[#614F4D] dark:text-[#C5B3B1]">min</span>
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
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E8D5CE] bg-[#F7ECE8] px-4 py-2 text-xs font-bold text-[#A61C30] transition-colors hover:bg-[#F3DFDA] disabled:opacity-45 dark:border-[#52232B] dark:bg-[#32141A] dark:text-[#F39BA9]"
          >
            <ListChecks className="size-3.5" /> Break down task
          </button>
        </div>

        {taskPlan && (
          <div className="mb-10 rounded-3xl border border-[#EADBCE] bg-white/85 p-6 shadow-xs backdrop-blur-md dark:border-[#42202B] dark:bg-[#201016]/85">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A61C30] dark:text-[#F39BA9]">
                  Step-by-step plan
                </p>
                <p className="mt-1 text-sm text-[#614F4D] dark:text-[#C5B3B1]">
                  Edit the steps or time before you begin.
                </p>
              </div>
              <span className="rounded-full bg-[#F7ECE8] px-3 py-1 text-xs font-semibold text-[#A61C30] dark:bg-[#32141A] dark:text-[#F39BA9]">
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
                  <div key={step.id} className="flex items-start gap-2.5 rounded-2xl border border-[#EADBCE]/80 bg-white/90 p-3 dark:border-[#42202B]/80 dark:bg-[#26131B]/70">
                    <span className="mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F7ECE8] text-xs font-bold text-[#A61C30] dark:bg-[#32141A] dark:text-[#F39BA9]">
                      {index + 1}
                    </span>
                    <Input
                      value={step.title}
                      onChange={(event) => updateStepTitle(step.id, event.target.value)}
                      aria-label={`Step ${index + 1} title`}
                      className="flex-1 rounded-xl border-[#EADBCE] dark:border-[#42202B]"
                    />
                    <div>
                      <Input
                        type="number"
                        min={1}
                        max={180}
                        value={stepMinuteInputs[step.id] ?? ''}
                        onChange={(event) => updateStepMinutes(step.id, event.target.value)}
                        aria-label={`Step ${index + 1} minutes`}
                        className={`w-20 text-center rounded-xl ${stepMinutesValid ? 'border-[#EADBCE] dark:border-[#42202B]' : 'border-amber-500'}`}
                      />
                      {!stepMinutesValid && <span className="mt-1 block text-[10px] text-amber-600">1–180 min</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      aria-label={`Remove step ${index + 1}`}
                      className="mt-1 rounded-full p-2 text-[#786663] hover:bg-rose-500/10 hover:text-rose-600 dark:text-[#A89299]"
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
                className="rounded-full border border-[#EADBCE] bg-white/80 px-5 py-3 text-sm font-semibold text-[#4A3E3D] hover:border-[#A61C30]/50 hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016]/60 dark:text-[#FAF4EB]"
              >
                Start full task — {minutes} min
              </button>
              <button
                type="button"
                onClick={startStepByStep}
                disabled={!planIsValid}
                className="rounded-full bg-[#A61C30] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#A61C30]/25 hover:bg-[#8F1627] disabled:opacity-45 dark:bg-[#C92A43] dark:hover:bg-[#B32038]"
              >
                Start step-by-step
              </button>
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#614F4D] transition-colors dark:text-[#C5B3B1]">
              Quick suggestions (Click to fill)
            </p>
            {input && (
              <button
                type="button"
                onClick={() => updateTask('')}
                className="text-[11px] text-[#786663] hover:text-[#A61C30] transition-colors dark:text-[#A89299]"
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
                  className={`rounded-full border px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 backdrop-blur-md text-center truncate ${
                    isSelected
                      ? 'border-[#A61C30] bg-[#F7ECE8] text-[#A61C30] shadow-xs dark:border-[#C92A43] dark:bg-[#32141A] dark:text-[#F39BA9] ring-1 ring-[#A61C30]/30'
                      : 'border-[#EADBCE] bg-white/70 text-[#4A3E3D] shadow-2xs hover:border-[#A61C30]/50 hover:bg-white hover:text-[#A61C30] dark:border-[#42202B] dark:bg-[#201016]/70 dark:text-[#D1C0BE] dark:hover:border-[#C92A43]/50 dark:hover:text-[#F39BA9]'
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
