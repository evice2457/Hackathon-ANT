'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Header, { type NavTab } from '@/components/Header'
import InteractiveBackground from '@/components/InteractiveBackground'
import AntWelcomeView from '@/components/AntWelcomeView'
import SmileRitualView from '@/components/SmileRitualView'
import MicroCommitmentView from '@/components/MicroCommitmentView'
import DeepPresenceView from '@/components/DeepPresenceView'
import DashboardView from '@/components/DashboardView'
import RecoveryView from '@/components/RecoveryView'
import ChatWithAntModal from '@/components/ChatWithAntModal'
import AntCheckIn from '@/components/AntCheckIn'
import SessionCompletionModal from '@/components/SessionCompletionModal'
import PipWindow from '@/components/PipWindow'
import VisionMonitor from '@/components/VisionMonitor'
import StepTransitionView from '@/components/StepTransitionView'
import { FocusSessionProvider, useFocusSession } from '@/lib/focus-session'
import { useDistractionWatch } from '@/lib/use-distraction-watch'
import { useDocumentPictureInPicture } from '@/lib/use-document-pip'
import { FloatingCompanionProvider, type FloatingCompanionApi } from '@/lib/floating-companion'
import {
  createCheckIn,
  resolveCheckInChoice,
  respondToCheckIn,
  type CheckInState,
} from '@/lib/check-in'
import { MascotNameProvider } from '@/lib/mascot-name'
import { startAudioKeepAlive, stopAudioKeepAlive } from '@/lib/ant-voice'
import {
  advanceTaskPlan,
  startTaskPlan,
  type TaskPlan,
  type TaskPlanProgress,
} from '@/lib/task-breakdown'

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
  const [currentTab, setCurrentTab] = useState<NavTab>('focus')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [stagedSession, setStagedSession] = useState<{
    task: string
    durationMinutes: number
    plan?: TaskPlan
  } | null>(null)
  const [activePlan, setActivePlan] = useState<TaskPlanProgress | null>(null)
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
  const planAdvance = activePlan ? advanceTaskPlan(activePlan) : null
  const isBetweenPlanSteps = isCompleted && planAdvance?.status === 'next'

  const isSessionActiveRef = useRef(isSessionActive)
  const isPipOpenRef = useRef(Boolean(pipDocument))

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive
  }, [isSessionActive])

  useEffect(() => {
    isPipOpenRef.current = Boolean(pipDocument)
  }, [pipDocument])

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
      if (isSessionActiveRef.current && pipSupported && !isPipOpenRef.current) {
        lastPipOpenTimeRef.current = Date.now()
        void openPipWindow().catch(() => {})
      }
    }

    const handleWindowFocus = () => {
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

  const handleCheckInSubmit = (answer?: string) => {
    setCheckIn((current) =>
      current ? respondToCheckIn(current, session.task, answer ?? current.answer) : current,
    )
  }

  const handleContinueWithSuggestedStep = () => {
    if (!checkIn) return
    const resolution = resolveCheckInChoice(checkIn, 'start-suggested')
    if (!resolution || resolution.type !== 'start-suggested') return
    setCheckIn(null)
    setActivePlan(null)
    setCurrentTab('focus')
    startSession(resolution.task, resolution.durationSeconds, session.visionEnabled)
  }

  const handleEndSession = () => {
    setCheckIn(null)
    setActivePlan(null)
    stopSession()
  }

  return (
    <FloatingCompanionProvider value={floating}>
      <div className={`relative min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark text-white' : 'text-slate-900'}`}>
        {/* Dynamic Fluid Wave Dither Canvas (Hover reactive as in Includio) */}
        <InteractiveBackground isDarkMode={isDarkMode} />

        {/* Main Content Layer */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onOpenChat={() => setIsChatOpen(true)}
            isChatOpen={isChatOpen}
            isSessionActive={isSessionActive}
          />

          <main className="flex-1">
            {/* View Mode 1: User Analytics Dashboard */}
            {currentTab === 'dashboard' && <DashboardView />}

            {/* View Mode 2: Recovery Session & Sound Recommendation */}
            {currentTab === 'recovery' && (
              <RecoveryView
                onStartFocusWithMusic={(genre) => {
                  setStagedSession({
                    task: `Focus Sprint (${genre})`,
                    durationMinutes: 25,
                  })
                  setHasStarted(true)
                  setCurrentTab('focus')
                }}
              />
            )}

            {/* View Mode 3: Core Focus Flow (Welcome -> MicroCommitment -> SmileRitual -> DeepPresence) */}
            {currentTab === 'focus' && (
              <>
                {/* Initial landing: Editorial Waving ANT Screen */}
                {isIdle && !hasStarted && (
                  <AntWelcomeView
                    onStart={() => setHasStarted(true)}
                    onOpenDashboard={() => setCurrentTab('dashboard')}
                    onOpenChat={() => setIsChatOpen(true)}
                  />
                )}

                {/* Positive Start Ritual: Smile Check-in */}
                {isIdle && hasStarted && stagedSession && (
                  <SmileRitualView
                    task={stagedSession.task}
                    durationMinutes={stagedSession.durationMinutes}
                    onComplete={(cameraOptIn) => {
                      const { task, durationMinutes, plan } = stagedSession
                      setStagedSession(null)
                      setActivePlan(plan ? startTaskPlan(plan) : null)
                      startSession(task, Math.round(durationMinutes * 60), cameraOptIn)
                    }}
                    onCancel={() => setStagedSession(null)}
                  />
                )}

                {/* Micro-commitment task setup */}
                {isIdle && hasStarted && !stagedSession && (
                  <MicroCommitmentView
                    onInitiateRitual={(task, durationMinutes) => {
                      setActivePlan(null)
                      setStagedSession({ task, durationMinutes })
                    }}
                    onInitiatePlan={(plan) => {
                      const firstStep = plan.steps[0]
                      if (!firstStep) return
                      setStagedSession({
                        task: firstStep.title,
                        durationMinutes: firstStep.minutes,
                        plan,
                      })
                    }}
                  />
                )}

                {/* Active Focus Session Screen */}
                {!isIdle && !isCompleted && <DeepPresenceView />}

                {isBetweenPlanSteps && !pipDocument && planAdvance?.status === 'next' && activePlan && (
                  <StepTransitionView
                    completedStepNumber={activePlan.currentStepIndex + 1}
                    totalSteps={activePlan.plan.steps.length}
                    nextStep={planAdvance.step}
                    onContinue={() => {
                      setActivePlan(planAdvance.progress)
                      startSession(
                        planAdvance.step.title,
                        planAdvance.step.minutes * 60,
                        session.visionEnabled,
                      )
                    }}
                    onEndPlan={() => {
                      setActivePlan(null)
                      stopSession()
                    }}
                  />
                )}

                {isCompleted && !isBetweenPlanSteps && (
                  <SessionCompletionModal
                    planCompleteTask={activePlan?.plan.originalTask}
                    onDone={() => {
                      setActivePlan(null)
                      stopSession()
                    }}
                    onNextTask={() => {
                      setActivePlan(null)
                      stopSession()
                    }}
                  />
                )}
              </>
            )}
          </main>
        </div>

        <VisionMonitor pipDocument={pipDocument} />

        {/* Live Sliding ANT Chat Modal */}
        <ChatWithAntModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onApplyAction={(task, duration) => {
            setStagedSession({ task, durationMinutes: duration })
            setHasStarted(true)
            setCurrentTab('focus')
          }}
        />

        {checkIn && !pipDocument && (
          <AntCheckIn
            checkIn={checkIn}
            onAnswerChange={(answer) => setCheckIn((current) => (current ? { ...current, answer } : current))}
            onSubmit={() => handleCheckInSubmit()}
            onQuickAction={handleCheckInSubmit}
            onSuggestedTitleChange={(suggestedTitle) =>
              setCheckIn((current) => (current ? { ...current, suggestedTitle } : current))
            }
            onSuggestedMinutesChange={(suggestedMinutesInput) =>
              setCheckIn((current) => (current ? { ...current, suggestedMinutesInput } : current))
            }
            onContinueWithStep={handleContinueWithSuggestedStep}
            onResume={() => {
              setCheckIn(null)
              resumeSession()
            }}
            onEndSession={handleEndSession}
          />
        )}

        {/* Document PiP surface */}
        {pipDocument && (
          <PipWindow
            pipDocument={pipDocument}
            onExitPip={handleExitPip}
            checkIn={checkIn}
            onCheckInAnswerChange={(answer) =>
              setCheckIn((current) => (current ? { ...current, answer } : current))
            }
            onCheckInSubmit={() => handleCheckInSubmit()}
            onCheckInQuickAction={handleCheckInSubmit}
            onCheckInSuggestedTitleChange={(suggestedTitle) =>
              setCheckIn((current) => (current ? { ...current, suggestedTitle } : current))
            }
            onCheckInSuggestedMinutesChange={(suggestedMinutesInput) =>
              setCheckIn((current) => (current ? { ...current, suggestedMinutesInput } : current))
            }
            onCheckInContinueWithStep={handleContinueWithSuggestedStep}
            onCheckInResume={() => {
              setCheckIn(null)
              resumeSession()
            }}
            onCheckInEndSession={handleEndSession}
            stepTransition={
              isBetweenPlanSteps && planAdvance?.status === 'next' && activePlan
                ? {
                    completedStepNumber: activePlan.currentStepIndex + 1,
                    totalSteps: activePlan.plan.steps.length,
                    nextStep: planAdvance.step,
                    onContinue: () => {
                      setActivePlan(planAdvance.progress)
                      startSession(
                        planAdvance.step.title,
                        planAdvance.step.minutes * 60,
                        session.visionEnabled,
                      )
                    },
                    onEndPlan: () => {
                      setActivePlan(null)
                      stopSession()
                    },
                  }
                : null
            }
          />
        )}
      </div>
    </FloatingCompanionProvider>
  )
}
