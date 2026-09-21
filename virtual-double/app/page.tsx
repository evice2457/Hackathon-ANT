'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import InteractiveBackground from '@/components/InteractiveBackground'
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

  // Sync theme with HTML root class and localStorage
  useEffect(() => {
    const saved = localStorage.getItem('virtualdouble.theme')
    if (saved === 'light') {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    } else {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('virtualdouble.theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('virtualdouble.theme', 'light')
      }
      return next
    })
  }

  const { isSupported: pipSupported, pipDocument, openPip: openPipWindow, closePip } = useDocumentPictureInPicture()

  const isIdle = session.status === 'idle'
  const isCompleted = session.status === 'completed'

  // The floating companion is opened from the session view button's NATIVE
  // click handler (see DeepPresenceView) so requestWindow() runs inside the
  // real user gesture. This API is exposed via context for that purpose.
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
      <div className={`relative min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark text-white' : 'text-slate-900'}`}>
        {/* Mountain Landscape Background with Parallax and Particles */}
        <InteractiveBackground isDarkMode={isDarkMode} />

        {/* Main Content Layer */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onDismissNudge={dismissNudge}
          />

          <main className="flex-1">
            {isIdle && <MicroCommitmentView />}

            {/* The main view stays on screen for the whole session — the PiP
                window is an additional surface, not a replacement for it. */}
            {!isIdle && !isCompleted && <DeepPresenceView />}

            {nudgeVisible && <DistractionNudgeModal />}

            {isCompleted && (
              <SessionCompletionModal onDone={stopSession} onNextTask={stopSession} />
            )}
          </main>
        </div>

        {/* Document PiP surface — same provider, portal into the PiP document. */}
        {pipDocument && <PipWindow pipDocument={pipDocument} onExitPip={handleExitPip} />}
      </div>
    </FloatingCompanionProvider>
  )
}
