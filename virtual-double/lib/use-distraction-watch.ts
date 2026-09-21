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

  // A stable id for "this particular distraction episode". Changing the focus
  // state, or pausing/resuming, starts a new episode.
  const episode = `${session.focusState}:${session.status}:${session.task}`

  // Which episode the threshold has elapsed for (null = none pending).
  const [reachedEpisode, setReachedEpisode] = useState<string | null>(null)
  // Which episode the user dismissed the nudge for.
  const [dismissedEpisode, setDismissedEpisode] = useState<string | null>(null)

  // Guard so the timer never re-arms for an episode already handled.
  const handled = useRef<string | null>(null)

  useEffect(() => {
    if (!shouldWatch || handled.current === episode) return
    const timer = setTimeout(() => {
      handled.current = episode
      setReachedEpisode(episode)
    }, DISTRACTION_THRESHOLD_MS)
    return () => clearTimeout(timer)
  }, [shouldWatch, episode])

  const thresholdReached = reachedEpisode === episode
  const dismissedThisEpisode = dismissedEpisode === episode

  return {
    nudgeVisible: shouldWatch && thresholdReached && !dismissedThisEpisode && displayMode === 'full',
    dismissNudge: () => setDismissedEpisode(episode),
  }
}
