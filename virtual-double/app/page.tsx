'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import MicroCommitmentView from '@/components/MicroCommitmentView'
import DeepPresenceView from '@/components/DeepPresenceView'
import DistractionNudgeModal from '@/components/DistractionNudgeModal'
import SessionCompletionModal from '@/components/SessionCompletionModal'
import PipWindow from '@/components/PipWindow'
import { FocusSessionProvider, useFocusSession } from '@/lib/focus-session'
import { useDistractionWatch } from '@/lib/use-distraction-watch'
import { useDocumentPictureInPicture } from '@/lib/use-document-pip'
import { FloatingCompanionProvider, type FloatingCompanionApi } from '@/lib/floating-companion'

export default function Page() {
  return (
    <FocusSessionProvider>
      <AppShell />
    </FocusSessionProvider>
  )
}

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const { session, stopSession } = useFocusSession()
  const { nudgeVisible, dismissNudge } = useDistractionWatch()

  const { isSupported: pipSupported, pipDocument, openPip: openPipWindow, closePip } = useDocumentPictureInPicture()

  const isIdle = session.status === 'idle'
  const isCompleted = session.status === 'completed'

  // The floating companion is opened from the Start button's NATIVE click
  // handler (see MicroCommitmentView) so requestWindow() runs inside the real
  // user gesture. This callback is exposed via context for that purpose.
  const floating: FloatingCompanionApi = {
    isSupported: pipSupported,
    isOpen: Boolean(pipDocument),
    open: () => {
      void openPipWindow()
    },
    close: () => {
      closePip()
    },
  }

  const handleExitPip = () => {
    closePip()
  }

  return (
    <FloatingCompanionProvider value={floating}>
      <div className={`min-h-screen bg-[#0B132B] text-foreground ${isDarkMode ? 'dark' : ''}`}>
        <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

        <main>
          {isIdle && <MicroCommitmentView />}

          {/* The main view stays on screen for the whole session — the PiP
              window is an additional surface, not a replacement for it. */}
          {!isIdle && !isCompleted && <DeepPresenceView />}

          {nudgeVisible && <DistractionNudgeModal />}

          {isCompleted && <SessionCompletionModal onDone={stopSession} onNextTask={stopSession} />}
        </main>

        <FocusStateDemoBar onDismissNudge={dismissNudge} />

        {/* Document PiP surface — same provider, portal into the PiP document. */}
        {pipDocument && <PipWindow pipDocument={pipDocument} onExitPip={handleExitPip} />}
      </div>
    </FloatingCompanionProvider>
  )
}

/**
 * DEVELOPMENT / DEMO ONLY.
 * Simulates what the computer-vision teammate will drive via setFocusState().
 * Safe to keep during the hackathon; delete before shipping.
 */
function FocusStateDemoBar({ onDismissNudge }: { onDismissNudge: () => void }) {
  const { session, setFocusState } = useFocusSession()
  const states = [
    ['Focused', 'focused'],
    ['Possibly distracted', 'possibly_distracted'],
    ['Away', 'away'],
  ] as const

  return (
    <nav
      aria-label="Developer demo controls"
      className="fixed bottom-5 left-1/2 z-40 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/10 bg-[#101d38]/90 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Dev</span>
      {states.map(([label, value]) => (
        <button
          key={value}
          onClick={() => {
            setFocusState(value)
            if (value !== 'possibly_distracted') onDismissNudge()
          }}
          className={`rounded-xl px-3 py-2 text-[11px] font-medium transition-colors ${
            session.focusState === value ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
