'use client'

import { useEffect, useRef, useState } from 'react'
import { useFocusSession } from '@/lib/focus-session'
import { CHECK_IN_THRESHOLD_MS, CheckInEpisodeTracker } from '@/lib/check-in-episode'

interface CheckInTrigger {
  episodeId: number
}

interface UseDistractionWatchOptions {
  onCheckInTriggered: (trigger: CheckInTrigger) => void
  schedulingWindow?: Window | null
}

/** Watches continuous `possibly_distracted` or `away` time and emits once per episode. */
export function useDistractionWatch({
  onCheckInTriggered,
  schedulingWindow,
}: UseDistractionWatchOptions) {
  const { session } = useFocusSession()
  const [tracker] = useState(() => new CheckInEpisodeTracker(CHECK_IN_THRESHOLD_MS))
  const onTriggeredRef = useRef(onCheckInTriggered)
  const episodeIdRef = useRef(0)
  const shouldWatch =
    session.status === 'running' &&
    (session.focusState === 'possibly_distracted' || session.focusState === 'away')

  useEffect(() => {
    onTriggeredRef.current = onCheckInTriggered
  }, [onCheckInTriggered])

  useEffect(() => {
    const evaluate = () => {
      const triggered = tracker.update({
        now: performance.now(),
        status: session.status,
        focusState: session.focusState,
        task: session.task,
      })
      if (!triggered) return
      episodeIdRef.current += 1
      onTriggeredRef.current({ episodeId: episodeIdRef.current })
    }

    evaluate()
    if (!shouldWatch) return

    const timerWindow = schedulingWindow ?? window
    const interval = timerWindow.setInterval(evaluate, 250)
    return () => timerWindow.clearInterval(interval)
  }, [session.status, session.focusState, session.task, shouldWatch, schedulingWindow, tracker])
}
