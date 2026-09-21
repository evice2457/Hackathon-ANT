'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import MicroCommitmentView from '@/components/MicroCommitmentView'
import DeepPresenceView from '@/components/DeepPresenceView'
import DistractionNudgeModal from '@/components/DistractionNudgeModal'
import FloatingMiniWidget from '@/components/FloatingMiniWidget'
import SessionCompletionModal from '@/components/SessionCompletionModal'
import PipWindow from '@/components/PipWindow'
import VisionMonitor from '@/components/VisionMonitor'
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

  const { isSupported: pipSupported, pipDocument, openPip: openPipWindow, closePip } = useDocumentPictureInPicture({
    // If the user closes the PiP window manually (native close button), fall
    // back to the in-page full view. The session itself is untouched.
    onPipClose: () => {
      expandToFull()
    },
  })

  const isIdle = session.status === 'idle'
  const isCompleted = session.status === 'completed'

  const handleFloatWidget = () => {
    // openPip must run from the user gesture. Only switch presentation mode
    // once the window has actually been created, so the portal has a target.
    void openPipWindow().then((opened) => {
      if (opened) setPipMode()
    })
  }

  const handleExitPip = () => {
    closePip()
    expandToFull()
  }

  return (
    <div className={`min-h-screen bg-[#0B132B] text-foreground ${isDarkMode ? 'dark' : ''}`}>
      <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main>
        {isIdle && <MicroCommitmentView />}

        {!isIdle && !isCompleted && displayMode === 'full' && (
          <DeepPresenceView pipSupported={pipSupported} onFloatWidget={handleFloatWidget} />
        )}

        {!isIdle && !isCompleted && displayMode === 'widget' && <FloatingMiniWidget mode="inline" />}

        {nudgeVisible && <DistractionNudgeModal onDismiss={dismissNudge} />}

        {isCompleted && (
          <SessionCompletionModal onDone={stopSession} onNextTask={stopSession} />
        )}
      </main>

      <VisionMonitor pipDocument={pipDocument} />

      {/* Document PiP surface — same provider, portal into the PiP document. */}
      {!isIdle && displayMode === 'pip' && pipDocument && (
        <PipWindow pipDocument={pipDocument} onExitPip={handleExitPip} />
      )}
    </div>
  )
}
