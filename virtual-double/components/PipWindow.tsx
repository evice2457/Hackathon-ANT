'use client'

import { createPortal } from 'react-dom'
import FloatingMiniWidget from '@/components/FloatingMiniWidget'

interface PipWindowProps {
  pipDocument: Document
  /** Close the PiP window + switch presentation back to the main view. */
  onExitPip: () => void
}

/**
 * Renders the existing FloatingMiniWidget inside the Document PiP window's
 * document via a React portal. No FocusSessionProvider is created here — the
 * widget stays connected to the main app's provider, so the session, timer
 * and focus state are shared (there is exactly one source of truth).
 */
export default function PipWindow({ pipDocument, onExitPip }: PipWindowProps) {
  return createPortal(<FloatingMiniWidget onExitPip={onExitPip} />, pipDocument.body)
}
