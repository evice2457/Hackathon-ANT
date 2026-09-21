import { DEFAULT_VISION_CONFIG, type VisionConfig } from './config.ts'

/** Ritual heuristics: brief acquisition, then an absolute smile held deliberately. */
export const SMILE_RITUAL_VISION_CONFIG: VisionConfig = {
  ...DEFAULT_VISION_CONFIG,
  calibrationDurationMs: 500,
  calibrationMinSamples: 5,
  smileScoreThreshold: 0.52,
  smileRiseThreshold: 0,
  smileHoldMs: 900,
}

export function ritualSmileProgress(smileScore: number | undefined): number {
  if (smileScore === undefined) return 0
  return Math.min(100, Math.round((smileScore / SMILE_RITUAL_VISION_CONFIG.smileScoreThreshold) * 100))
}
