'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import InteractiveBackground from '@/components/InteractiveBackground'
import MicroCommitmentView from '@/components/MicroCommitmentView'
import DeepPresenceView from '@/components/DeepPresenceView'
import DistractionNudgeModal from '@/components/DistractionNudgeModal'
import FloatingMiniWidget from '@/components/FloatingMiniWidget'
import SessionCompletionModal from '@/components/SessionCompletionModal'
import PipWindow from '@/components/PipWindow'
import { FocusSessionProvider, useFocusSession } from '@/lib/focus-session'
import { useDistractionWatch } from '@/lib/use-distraction-watch'
import { useDocumentPictureInPicture } from '@/lib/use-document-pip'

export default function Page() {
  return (
    <FocusSessionProvider>
      <AppShell />
    </FocusSessionProvider>
  )
}

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const { session, displayMode, stopSession, expandToFull, openPip: setPipMode } = useFocusSession()
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

  const { isSupported: pipSupported, pipDocument, openPip: openPipWindow, closePip } = useDocumentPictureInPicture({
    onPipClose: () => {
      expandToFull()
    },
  })

  const isIdle = session.status === 'idle'
  const isCompleted = session.status === 'completed'

  const handleFloatWidget = () => {
    void openPipWindow().then((opened) => {
      if (opened) setPipMode()
    })
  }

  const handleExitPip = () => {
    closePip()
    expandToFull()
  }

  return (
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

          {!isIdle && !isCompleted && displayMode === 'full' && (
            <DeepPresenceView pipSupported={pipSupported} onFloatWidget={handleFloatWidget} />
          )}

          {!isIdle && !isCompleted && displayMode === 'widget' && <FloatingMiniWidget mode="inline" />}

          {nudgeVisible && <DistractionNudgeModal />}

          {isCompleted && (
            <SessionCompletionModal onDone={stopSession} onNextTask={stopSession} />
          )}
        </main>
      </div>

      {/* Document PiP surface — same provider, portal into the PiP document. */}
      {!isIdle && displayMode === 'pip' && pipDocument && (
        <PipWindow pipDocument={pipDocument} onExitPip={handleExitPip} />
      )}
    </div>
  )
}
