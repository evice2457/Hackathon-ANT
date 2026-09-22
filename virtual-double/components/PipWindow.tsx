'use client'

import { createPortal } from 'react-dom'
import FloatingMiniWidget from '@/components/FloatingMiniWidget'
import AntCheckIn from '@/components/AntCheckIn'
import StepTransitionView from '@/components/StepTransitionView'
import type { CheckInState } from '@/lib/check-in'
import type { TaskStep } from '@/lib/task-breakdown'

interface PipWindowProps {
  pipDocument: Document
  /** Close the PiP window + switch presentation back to the main view. */
  onExitPip: () => void
  checkIn: CheckInState | null
  onCheckInAnswerChange: (answer: string) => void
  onCheckInSubmit: () => void
  onCheckInQuickAction: (answer: string) => void
  onCheckInSuggestedTitleChange: (title: string) => void
  onCheckInSuggestedMinutesChange: (minutes: string) => void
  onCheckInContinueWithStep: () => void
  onCheckInResume: () => void
  onCheckInEndSession: () => void
  stepTransition?: {
    completedStepNumber: number
    totalSteps: number
    nextStep: TaskStep
    onContinue: () => void
    onEndPlan: () => void
  } | null
}

/**
 * Renders the existing FloatingMiniWidget inside the Document PiP window's
 * document via a React portal. No FocusSessionProvider is created here — the
 * widget stays connected to the main app's provider, so the session, timer
 * and focus state are shared (there is exactly one source of truth).
 */
export default function PipWindow({
  pipDocument,
  onExitPip,
  checkIn,
  onCheckInAnswerChange,
  onCheckInSubmit,
  onCheckInQuickAction,
  onCheckInSuggestedTitleChange,
  onCheckInSuggestedMinutesChange,
  onCheckInContinueWithStep,
  onCheckInResume,
  onCheckInEndSession,
  stepTransition,
}: PipWindowProps) {
  return createPortal(
    checkIn ? (
      <AntCheckIn
        compact
        checkIn={checkIn}
        onAnswerChange={onCheckInAnswerChange}
        onSubmit={onCheckInSubmit}
        onQuickAction={onCheckInQuickAction}
        onSuggestedTitleChange={onCheckInSuggestedTitleChange}
        onSuggestedMinutesChange={onCheckInSuggestedMinutesChange}
        onContinueWithStep={onCheckInContinueWithStep}
        onResume={onCheckInResume}
        onEndSession={onCheckInEndSession}
      />
    ) : stepTransition ? (
      <StepTransitionView compact {...stepTransition} />
    ) : (
      <FloatingMiniWidget onExitPip={onExitPip} />
    ),
    pipDocument.body,
  )
}
