'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { reconcileElapsedSeconds } from '@/lib/session-clock'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FocusState = 'focused' | 'possibly_distracted' | 'away'

export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface FocusSession {
  task: string
  durationSeconds: number
  remainingSeconds: number
  status: SessionStatus
  focusState: FocusState
  visionEnabled: boolean
}

/** Duration presets offered on the task-entry screen. */
export const DURATION_PRESETS = [5, 10, 15, 25, 50] as const
export const DEFAULT_DURATION_MINUTES = 15

/** Seconds added by the "+5 min" action. */
export const ADD_TIME_SECONDS = 5 * 60

const STORAGE_KEY = 'virtualdouble.session.v1'

interface PersistedSnapshot {
  session: FocusSession
  /** Epoch ms when the running timer was last reconciled; used to catch up after refresh. */
  savedAt: number
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'start'; task: string; durationSeconds: number; visionEnabled: boolean }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'complete' }
  | { type: 'addTime'; seconds: number }
  | { type: 'tick'; seconds: number }
  | { type: 'setFocusState'; state: FocusState }
  | { type: 'setCurrentTask'; task: string }
  | { type: 'restore'; snapshot: PersistedSnapshot }
interface State {
  session: FocusSession
}

const idleSession: FocusSession = {
  task: '',
  durationSeconds: DEFAULT_DURATION_MINUTES * 60,
  remainingSeconds: DEFAULT_DURATION_MINUTES * 60,
  status: 'idle',
  focusState: 'focused',
  visionEnabled: true,
}

const initialState: State = { session: idleSession }

function reducer(state: State, action: Action): State {
  const { session } = state

  switch (action.type) {
    case 'start': {
      const next: FocusSession = {
        task: action.task,
        durationSeconds: action.durationSeconds,
        remainingSeconds: action.durationSeconds,
        status: 'running',
        focusState: 'focused',
        visionEnabled: action.visionEnabled,
      }
      return { session: next }
    }

    case 'pause':
      if (session.status !== 'running') return state
      return { ...state, session: { ...session, status: 'paused', focusState: 'focused' } }

    case 'resume':
      if (session.status !== 'paused') return state
      return { ...state, session: { ...session, status: 'running', focusState: 'focused' } }

    case 'stop':
      return { session: idleSession }

    case 'complete':
      if (session.status === 'idle') return state
      return {
        ...state,
        session: { ...session, status: 'completed', remainingSeconds: 0, focusState: 'focused' },
      }

    case 'addTime': {
      // Adding time from a completed session resumes it.
      const wasCompleted = session.status === 'completed'
      return {
        ...state,
        session: {
          ...session,
          remainingSeconds: session.remainingSeconds + action.seconds,
          durationSeconds: session.durationSeconds + action.seconds,
          status: wasCompleted ? 'running' : session.status,
          focusState: wasCompleted ? 'focused' : session.focusState,
        },
      }
    }

    case 'tick': {
      if (session.status !== 'running') return state
      const remaining = Math.max(0, session.remainingSeconds - action.seconds)
      if (remaining === 0) {
        return {
          ...state,
          session: { ...session, remainingSeconds: 0, status: 'completed', focusState: 'focused' },
        }
      }
      return { ...state, session: { ...session, remainingSeconds: remaining } }
    }

    case 'setFocusState':
      if (session.status !== 'running') return state
      if (session.focusState === action.state) return state
      return { ...state, session: { ...session, focusState: action.state } }

    case 'setCurrentTask':
      return { ...state, session: { ...session, task: action.task } }

    case 'restore': {
      const restored = action.snapshot.session
      // Catch the timer up for time elapsed while the page was closed, but only
      // while it was actually running.
      if (restored.status === 'running') {
        const elapsed = Math.floor((Date.now() - action.snapshot.savedAt) / 1000)
        const remaining = Math.max(0, restored.remainingSeconds - elapsed)
        return {
          session: {
            ...restored,
            remainingSeconds: remaining,
            status: remaining === 0 ? 'completed' : 'running',
            focusState: 'focused',
            visionEnabled: restored.visionEnabled !== false,
          },
        }
      }
      return {
        session:
          restored.status === 'paused' || restored.status === 'completed'
            ? { ...restored, focusState: 'focused', visionEnabled: restored.visionEnabled !== false }
            : { ...restored, visionEnabled: restored.visionEnabled !== false },
      }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface FocusSessionContextValue {
  session: FocusSession
  /** Whole minutes remaining, rounded up so the last minute shows "1" not "0". */
  minutesRemaining: number
  startSession: (task: string, durationSeconds: number, visionEnabled?: boolean) => void
  pauseSession: () => void
  resumeSession: () => void
  stopSession: () => void
  completeSession: () => void
  addTime: (seconds: number) => void
  setFocusState: (state: FocusState) => void
  setCurrentTask: (task: string) => void
}

const FocusSessionContext = createContext<FocusSessionContextValue | null>(null)

export function FocusSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { session } = state

  // Do not persist the initial idle state before saved state has been restored.
  const [hasHydrated, setHasHydrated] = useState(false)

  // ---- Hydrate from localStorage once on mount --------------------------
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as PersistedSnapshot
      if (parsed?.session && typeof parsed.session.remainingSeconds === 'number') {
        dispatch({ type: 'restore', snapshot: parsed })
      }
    } catch {
      // Ignore corrupt storage — fall back to a clean idle session.
    } finally {
      setHasHydrated(true)
    }
  }, [])

  // ---- Persist on any change --------------------------------------------
  useEffect(() => {
    if (!hasHydrated) return
    try {
      const payload: PersistedSnapshot = { session, savedAt: Date.now() }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Storage may be unavailable (private mode); the session still works in-memory.
    }
  }, [hasHydrated, session])

  // ---- The single ticking clock -----------------------------------------
  // One interval owned by the provider. Every consumer just reads `session`.
  const lastClockTimestampRef = useRef<number | null>(null)
  const reconcileRunningClock = useCallback(() => {
    const currentTimestamp = Date.now()
    const previousTimestamp = lastClockTimestampRef.current ?? currentTimestamp
    const reconciliation = reconcileElapsedSeconds(previousTimestamp, currentTimestamp)
    lastClockTimestampRef.current = reconciliation.reconciledAt
    if (reconciliation.elapsedSeconds > 0) {
      dispatch({ type: 'tick', seconds: reconciliation.elapsedSeconds })
    }
  }, [])

  useEffect(() => {
    if (session.status !== 'running') {
      lastClockTimestampRef.current = null
      return
    }

    lastClockTimestampRef.current = Date.now()
    const interval = setInterval(() => {
      reconcileRunningClock()
    }, 1000)
    return () => clearInterval(interval)
  }, [reconcileRunningClock, session.status])

  const startSession = useCallback((task: string, durationSeconds: number, visionEnabled = true) => {
    dispatch({ type: 'start', task, durationSeconds, visionEnabled })
  }, [])
  const pauseSession = useCallback(() => {
    reconcileRunningClock()
    dispatch({ type: 'pause' })
  }, [reconcileRunningClock])
  const resumeSession = useCallback(() => dispatch({ type: 'resume' }), [])
  const stopSession = useCallback(() => dispatch({ type: 'stop' }), [])
  const completeSession = useCallback(() => dispatch({ type: 'complete' }), [])
  const addTime = useCallback((seconds: number) => dispatch({ type: 'addTime', seconds }), [])
  const setFocusState = useCallback((next: FocusState) => dispatch({ type: 'setFocusState', state: next }), [])
  const setCurrentTask = useCallback((task: string) => dispatch({ type: 'setCurrentTask', task }), [])

  const minutesRemaining = Math.ceil(session.remainingSeconds / 60)

  const value = useMemo<FocusSessionContextValue>(
    () => ({
      session,
      minutesRemaining,
      startSession,
      pauseSession,
      resumeSession,
      stopSession,
      completeSession,
      addTime,
      setFocusState,
      setCurrentTask,
    }),
    [
      session,
      minutesRemaining,
      startSession,
      pauseSession,
      resumeSession,
      stopSession,
      completeSession,
      addTime,
      setFocusState,
      setCurrentTask,
    ],
  )

  return <FocusSessionContext.Provider value={value}>{children}</FocusSessionContext.Provider>
}

export function useFocusSession(): FocusSessionContextValue {
  const ctx = useContext(FocusSessionContext)
  if (!ctx) {
    throw new Error('useFocusSession must be used within a <FocusSessionProvider>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
