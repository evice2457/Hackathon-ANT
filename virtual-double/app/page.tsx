'use client'

import { useCallback, useEffect, useState } from 'react'
import Header from '@/components/Header'
import InteractiveBackground from '@/components/InteractiveBackground'
import AntWelcomeView from '@/components/AntWelcomeView'
import SmileRitualView from '@/components/SmileRitualView'
import MicroCommitmentView from '@/components/MicroCommitmentView'
import DeepPresenceView from '@/components/DeepPresenceView'
import AntCheckIn from '@/components/AntCheckIn'
import SessionCompletionModal from '@/components/SessionCompletionModal'
import PipWindow from '@/components/PipWindow'
import VisionMonitor from '@/components/VisionMonitor'
import { FocusSessionProvider, useFocusSession } from '@/lib/focus-session'
import { useDistractionWatch } from '@/lib/use-distraction-watch'
import { useDocumentPictureInPicture } from '@/lib/use-document-pip'
import { FloatingCompanionProvider, type FloatingCompanionApi } from '@/lib/floating-companion'
import { createCheckIn, type CheckInState } from '@/lib/check-in'
import { MascotNameProvider } from '@/lib/mascot-name'

export default function Page() {
  return (
    <MascotNameProvider>
      <FocusSessionProvider>
        <AppShell />
      </FocusSessionProvider>
    </MascotNameProvider>
  )
}

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [stagedSession, setStagedSession] = useState<{ task: string; durationMinutes: number } | null>(null)
  const [checkIn, setCheckIn] = useState<CheckInState | null>(null)
  const { session, startSession, stopSession, pauseSession, resumeSession } = useFocusSession()
  const { isSupported: pipSupported, pipDocument, openPip: openPipWindow, closePip } = useDocumentPictureInPicture()

  const handleCheckInTriggered = useCallback(
    ({ episodeId }: { episodeId: number }) => {
      setCheckIn((current) => current ?? createCheckIn(episodeId))
      pauseSession()
    },
    [pauseSession],
  )

  useDistractionWatch({
    onCheckInTriggered: handleCheckInTriggered,
    schedulingWindow: pipDocument?.defaultView ?? null,
  })

  // Sync theme with HTML root class and localStorage
  useEffect(() => {
    const saved = localStorage.getItem('virtualdouble.theme')
    const prefersDark = saved !== 'light'
    if (saved === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    const frame = requestAnimationFrame(() => setIsDarkMode(prefersDark))
    return () => cancelAnimationFrame(frame)
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
    if (typeof window !== 'undefined') {
      try {
        window.focus()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {}
    }
  }

  return (
    <FloatingCompanionProvider value={floating}>
      <div className={`relative min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark text-white' : 'text-slate-900'}`}>
        {/* Ambient Gradient Background with Peaceful Particles */}
        <InteractiveBackground isDarkMode={isDarkMode} />

        {/* Main Content Layer */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />

          <main className="flex-1">
            {/* First time / Initial landing: ANT Mascot Welcome Screen */}
            {isIdle && !hasStarted && (
              <AntWelcomeView onStart={() => setHasStarted(true)} />
            )}

            {/* Intermediate Positive Start Ritual: Smile Check-in with Mascot ANT */}
            {isIdle && hasStarted && stagedSession && (
              <SmileRitualView
                task={stagedSession.task}
                durationMinutes={stagedSession.durationMinutes}
                onComplete={(cameraOptIn) => {
                  const { task, durationMinutes } = stagedSession
                  setStagedSession(null)
                  startSession(task, Math.round(durationMinutes * 60), cameraOptIn)
                }}
                onCancel={() => setStagedSession(null)}
              />
            )}

            {/* Main micro-commitment entry (after clicking GET STARTED) */}
            {isIdle && hasStarted && !stagedSession && (
              <MicroCommitmentView
                onInitiateRitual={(task, durationMinutes) =>
                  setStagedSession({ task, durationMinutes })
                }
              />
            )}

            {/* The main view stays on screen for the whole session — the PiP
                window is an additional surface, not a replacement for it. */}
            {!isIdle && !isCompleted && <DeepPresenceView />}

            {isCompleted && (
              <SessionCompletionModal onDone={stopSession} onNextTask={stopSession} />
            )}
          </main>
        </div>

        <VisionMonitor pipDocument={pipDocument} />

        {checkIn && !pipDocument && (
          <AntCheckIn
            checkIn={checkIn}
            onAnswerChange={(answer) => setCheckIn((current) => (current ? { ...current, answer } : current))}
            onSubmit={() => setCheckIn((current) => (current ? { ...current, responseShown: true } : current))}
            onResume={() => {
              setCheckIn(null)
              resumeSession()
            }}
            onStayPaused={() => setCheckIn(null)}
          />
        )}

        {/* Document PiP surface — same provider, portal into the PiP document. */}
        {pipDocument && (
          <PipWindow
            pipDocument={pipDocument}
            onExitPip={handleExitPip}
            checkIn={checkIn}
            onCheckInAnswerChange={(answer) =>
              setCheckIn((current) => (current ? { ...current, answer } : current))
            }
            onCheckInSubmit={() =>
              setCheckIn((current) => (current ? { ...current, responseShown: true } : current))
            }
            onCheckInResume={() => {
              setCheckIn(null)
              resumeSession()
            }}
            onCheckInStayPaused={() => setCheckIn(null)}
          />
        )}
      </div>
    </FloatingCompanionProvider>
  )
}
