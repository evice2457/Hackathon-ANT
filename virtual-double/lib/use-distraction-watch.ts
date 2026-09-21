'use client'

import { useEffect, useRef, useState } from 'react'
import { DISTRACTION_THRESHOLD_MS, useFocusSession } from '@/lib/focus-session'

/**
 * Watches the shared focus state and surfaces a gentle nudge only after the
 * user has been "possibly_distracted" continuously for DISTRACTION_THRESHOLD_MS.
 *
 * Returns whether the nudge should currently be shown, plus a `dismissNudge`
 * callback to suppress it until the next distraction episode.
 *
 * The computer-vision teammate only needs to drive `setFocusState`; this hook
 * reacts automatically.
 */
export function useDistractionWatch() {
  const { session, displayMode } = useFocusSession()

  const isRunning = session.status === 'running'
  const isDistracted = session.focusState === 'possibly_distracted'
  const shouldWatch = isRunning && isDistracted

  const wasWatching = useRef(false)
  const previousTask = useRef(session.task)
  const nextEpisode = useRef(0)
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null)
  const [reachedEpisode, setReachedEpisode] = useState<number | null>(null)
  const [dismissedEpisode, setDismissedEpisode] = useState<number | null>(null)

  useEffect(() => {
    const taskChanged = previousTask.current !== session.task
    previousTask.current = session.task

    if (shouldWatch && (!wasWatching.current || taskChanged)) {
      nextEpisode.current += 1
      setActiveEpisode(nextEpisode.current)
      setReachedEpisode(null)
      setDismissedEpisode(null)
    } else if (!shouldWatch) {
      setActiveEpisode(null)
      setReachedEpisode(null)
      setDismissedEpisode(null)
    }

    wasWatching.current = shouldWatch
  }, [shouldWatch, session.task])

  useEffect(() => {
    if (activeEpisode === null || !shouldWatch) return
    const timer = setTimeout(() => {
      setReachedEpisode(activeEpisode)
    }, DISTRACTION_THRESHOLD_MS)
    return () => clearTimeout(timer)
  }, [activeEpisode, shouldWatch])

  const thresholdReached = activeEpisode !== null && reachedEpisode === activeEpisode
  const dismissedThisEpisode = activeEpisode !== null && dismissedEpisode === activeEpisode

  return {
    nudgeVisible: shouldWatch && thresholdReached && !dismissedThisEpisode && displayMode === 'full',
    dismissNudge: () => {
      if (activeEpisode !== null) setDismissedEpisode(activeEpisode)
    },
  }
}
