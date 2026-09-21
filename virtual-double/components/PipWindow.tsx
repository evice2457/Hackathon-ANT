'use client'

import { createPortal } from 'react-dom'
import FloatingMiniWidget from '@/components/FloatingMiniWidget'
import AntCheckIn from '@/components/AntCheckIn'
import type { CheckInState } from '@/lib/check-in'

interface PipWindowProps {
  pipDocument: Document
  /** Close the PiP window + switch presentation back to the main view. */
  onExitPip: () => void
  checkIn: CheckInState | null
  onCheckInAnswerChange: (answer: string) => void
  onCheckInSubmit: () => void
  onCheckInResume: () => void
  onCheckInStayPaused: () => void
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
  onCheckInResume,
  onCheckInStayPaused,
}: PipWindowProps) {
  return createPortal(
    checkIn ? (
      <AntCheckIn
        compact
        checkIn={checkIn}
        onAnswerChange={onCheckInAnswerChange}
        onSubmit={onCheckInSubmit}
        onResume={onCheckInResume}
        onStayPaused={onCheckInStayPaused}
      />
    ) : (
      <FloatingMiniWidget onExitPip={onExitPip} />
    ),
    pipDocument.body,
  )
}
