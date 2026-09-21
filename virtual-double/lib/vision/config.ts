export interface VisionConfig {
  inferenceFps: number
  minFaceDetectionConfidence: number
  minFacePresenceConfidence: number
  minTrackingConfidence: number
  poseSmoothingAlpha: number
  calibrationDurationMs: number
  calibrationMinSamples: number
  smoothingResetAfterAbsenceMs: number
  headDownEnterDegrees: number
  headDownExitDegrees: number
  lookingAwayEnterDegrees: number
  lookingAwayExitDegrees: number
  smileScoreThreshold: number
  smileRiseThreshold: number
  smileHoldMs: number
  smileRearmDelta: number
  awayDwellMs: number
  distractedDwellMs: number
  recoveryDwellMs: number
}

/**
 * Hackathon defaults, not universal truths. Tune with the development panel on
 * the actual demo laptop, camera height, lighting, and expected seating pose.
 */
export const DEFAULT_VISION_CONFIG: Readonly<VisionConfig> = {
  inferenceFps: 10,
  minFaceDetectionConfidence: 0.55,
  minFacePresenceConfidence: 0.55,
  minTrackingConfidence: 0.55,
  poseSmoothingAlpha: 0.35,
  calibrationDurationMs: 1_800,
  calibrationMinSamples: 10,
  smoothingResetAfterAbsenceMs: 750,
  headDownEnterDegrees: 22,
  headDownExitDegrees: 14,
  lookingAwayEnterDegrees: 32,
  lookingAwayExitDegrees: 22,
  smileScoreThreshold: 0.55,
  smileRiseThreshold: 0.2,
  smileHoldMs: 300,
  smileRearmDelta: 0.08,
  awayDwellMs: 3_000,
  distractedDwellMs: 2_000,
  recoveryDwellMs: 1_500,
}

export const MEDIAPIPE_WASM_PATH = '/mediapipe/wasm'
export const FACE_LANDMARKER_MODEL_PATH = '/mediapipe/models/face_landmarker.task'
