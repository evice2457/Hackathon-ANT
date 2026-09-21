import type { FocusState, SessionStatus } from '@/lib/focus-session'

export const CHECK_IN_THRESHOLD_MS = 10_000

export interface CheckInEpisodeInput {
  now: number
  status: SessionStatus
  focusState: FocusState
  task: string
}

/** Deterministic continuous-non-focus episode tracker used by the React watcher. */
export class CheckInEpisodeTracker {
  private readonly thresholdMs: number
  private activeSince: number | null = null
  private triggered = false
  private task = ''

  constructor(thresholdMs = CHECK_IN_THRESHOLD_MS) {
    this.thresholdMs = thresholdMs
  }

  update(input: CheckInEpisodeInput): boolean {
    const taskChanged = this.task !== input.task
    this.task = input.task
    const isNonFocused =
      input.status === 'running' &&
      (input.focusState === 'possibly_distracted' || input.focusState === 'away')

    if (!isNonFocused || taskChanged) {
      this.activeSince = isNonFocused ? input.now : null
      this.triggered = false
      return false
    }

    this.activeSince ??= input.now
    if (this.triggered || input.now - this.activeSince < this.thresholdMs) return false

    this.triggered = true
    return true
  }
}
