'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
import { startAudioKeepAlive, stopAudioKeepAlive } from '@/lib/ant-voice'

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
  const isSessionActive = session.status === 'running' || session.status === 'paused'

  const isSessionActiveRef = useRef(isSessionActive)
  isSessionActiveRef.current = isSessionActive

  const isPipOpenRef = useRef(Boolean(pipDocument))
  isPipOpenRef.current = Boolean(pipDocument)

  const wasAwayRef = useRef(false)
  const lastPipOpenTimeRef = useRef(0)

  const handleOpenPip = useCallback(() => {
    lastPipOpenTimeRef.current = Date.now()
    void openPipWindow()
  }, [openPipWindow])

  // Automatic PiP pop-out on minimize/blur and auto-close when returning to the countdown web screen
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasAwayRef.current = true
        if (isSessionActiveRef.current && pipSupported && !isPipOpenRef.current) {
          lastPipOpenTimeRef.current = Date.now()
          void openPipWindow().catch(() => {})
        }
      } else if (document.visibilityState === 'visible') {
        if (wasAwayRef.current) {
          wasAwayRef.current = false
          if (isPipOpenRef.current && Date.now() - lastPipOpenTimeRef.current > 1200) {
            closePip()
          }
        }
      }
    }

    const handleWindowBlur = () => {
      wasAwayRef.current = true
      // On Windows, clicking the minimize button fires blur immediately during the title bar mouse click.
      // Calling openPipWindow here preserves the transient user gesture from the minimize click!
      if (isSessionActiveRef.current && pipSupported && !isPipOpenRef.current) {
        lastPipOpenTimeRef.current = Date.now()
        void openPipWindow().catch(() => {})
      }
    }

    const handleWindowFocus = () => {
      // ONLY close the PiP window if the main web document is currently VISIBLE
      // This prevents the OS minimize focus flutter from killing the newly opened PiP window
      if (document.visibilityState !== 'visible') return

      if (wasAwayRef.current) {
        wasAwayRef.current = false
        if (isPipOpenRef.current && Date.now() - lastPipOpenTimeRef.current > 1200) {
          closePip()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [pipSupported, openPipWindow, closePip])

  // Manage inaudible audio keep-alive for Chrome Auto-PiP qualification
  useEffect(() => {
    if (isSessionActive) {
      startAudioKeepAlive()
    } else {
      stopAudioKeepAlive()
    }
    return () => {
      stopAudioKeepAlive()
    }
  }, [isSessionActive])

  // Register Chrome native Automatic Picture-in-Picture via Media Session API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    if (!pipSupported) return

    if (isSessionActive) {
      try {
        navigator.mediaSession.playbackState = 'playing'
        navigator.mediaSession.metadata = new MediaMetadata({
          title: session.task || 'Focus Session',
          artist: 'VirtualDouble — ANT Companion',
          artwork: [{ src: '/ant-mascot.png', sizes: '512x512', type: 'image/png' }],
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('enterpictureinpicture', () => {
          if (!isPipOpenRef.current) {
            lastPipOpenTimeRef.current = Date.now()
            void openPipWindow().catch(() => {})
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('play', () => {
          resumeSession()
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('pause', () => {
          pauseSession()
        })
      } catch {}
    } else {
      try {
        navigator.mediaSession.playbackState = 'none'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('enterpictureinpicture', null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('play', null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('pause', null)
      } catch {}
    }

    return () => {
      try {
        navigator.mediaSession.playbackState = 'none'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('enterpictureinpicture', null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('play', null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(navigator.mediaSession.setActionHandler as any)('pause', null)
      } catch {}
    }
  }, [isSessionActive, pipSupported, session.task, openPipWindow, pauseSession, resumeSession])

  // The floating companion is opened from the session view button's NATIVE
  // click handler (see DeepPresenceView) so requestWindow() runs inside the
  // real user gesture. This API is exposed via context for that purpose.
  const floating: FloatingCompanionApi = {
    isSupported: pipSupported,
    isOpen: Boolean(pipDocument),
    open: handleOpenPip,
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
