import type { FocusState } from '@/lib/focus-session'
import type { VisionConfig } from '@/lib/vision/config'
import type { VisionObservation } from '@/lib/vision/types'

/**
 * Converts frame-level observable signals into stable application state.
 * No single frame can change state: every transition has a dwell period.
 */
export class VisionBehaviorClassifier {
  private state: FocusState = 'focused'
  private candidate: FocusState | null = null
  private candidateSince = 0
  private readonly config: Pick<VisionConfig, 'awayDwellMs' | 'distractedDwellMs' | 'recoveryDwellMs'>

  constructor(config: Pick<VisionConfig, 'awayDwellMs' | 'distractedDwellMs' | 'recoveryDwellMs'>) {
    this.config = config
  }

  get currentState(): FocusState {
    return this.state
  }

  reset(state: FocusState = 'focused'): void {
    this.state = state
    this.candidate = null
    this.candidateSince = 0
  }

  update(observation: VisionObservation): FocusState {
    const rawState: FocusState = !observation.facePresent
      ? 'away'
      : observation.headDown || observation.lookingAway
        ? 'possibly_distracted'
        : 'focused'

    if (rawState === this.state) {
      this.candidate = null
      return this.state
    }

    if (rawState !== this.candidate) {
      this.candidate = rawState
      this.candidateSince = observation.timestamp
      return this.state
    }

    const dwellMs =
      rawState === 'away'
        ? this.config.awayDwellMs
        : rawState === 'possibly_distracted'
          ? this.config.distractedDwellMs
          : this.config.recoveryDwellMs

    if (observation.timestamp - this.candidateSince >= dwellMs) {
      this.state = rawState
      this.candidate = null
    }

    return this.state
  }
}
