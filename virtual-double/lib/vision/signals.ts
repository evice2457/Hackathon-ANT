import type { Category, FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import type { VisionConfig } from './config.ts'
import { headPoseFromMatrix } from './head-pose.ts'
import type { HeadPose, PoseCalibration, VisionObservation } from './types.ts'

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function scoreMap(categories: Category[] | undefined): Map<string, number> {
  return new Map(categories?.map((category) => [category.categoryName, category.score]) ?? [])
}

function average(left: number, right: number): number {
  return (left + right) / 2
}

function smooth(previous: number, current: number, alpha: number): number {
  return previous + alpha * (current - previous)
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

/** Stateful frame-to-frame geometry smoothing and per-monitor calibration. */
export class VisionSignalExtractor {
  private readonly config: VisionConfig
  private smoothedPose: HeadPose | undefined
  private smoothedSmile: number | undefined
  private smoothedLeftOpen: number | undefined
  private smoothedRightOpen: number | undefined
  private absenceStartedAt: number | undefined
  private smoothingResetForAbsence = false

  private calibrationStartedAt: number | undefined
  private calibrationPoses: HeadPose[] = []
  private calibrationSmiles: number[] = []
  private neutralPose: HeadPose | undefined
  private neutralSmile: number | undefined

  private headDownActive = false
  private lookingAwayActive = false
  private smileArmed = true
  private smileCandidateSince: number | undefined

  constructor(config: VisionConfig) {
    this.config = config
  }

  /** Starts a new monitoring run, including a fresh neutral-pose calibration. */
  reset(): void {
    this.resetInstantaneousSignals()
    this.absenceStartedAt = undefined
    this.smoothingResetForAbsence = false
    this.calibrationStartedAt = undefined
    this.calibrationPoses = []
    this.calibrationSmiles = []
    this.neutralPose = undefined
    this.neutralSmile = undefined
  }

  private resetInstantaneousSignals(): void {
    this.smoothedPose = undefined
    this.smoothedSmile = undefined
    this.smoothedLeftOpen = undefined
    this.smoothedRightOpen = undefined
    this.headDownActive = false
    this.lookingAwayActive = false
    this.smileArmed = true
    this.smileCandidateSince = undefined
  }

  private resetAfterMeaningfulAbsence(): void {
    this.resetInstantaneousSignals()
    // Preserve a completed per-session neutral baseline. If calibration was
    // interrupted, restart rather than accepting a sparse sample set.
    if (!this.neutralPose) {
      this.calibrationStartedAt = undefined
      this.calibrationPoses = []
      this.calibrationSmiles = []
    }
  }

  private calibration(relativePose?: HeadPose): PoseCalibration {
    return {
      status: this.neutralPose ? 'ready' : 'calibrating',
      sampleCount: this.calibrationPoses.length,
      neutralPitch: this.neutralPose?.pitch,
      neutralYaw: this.neutralPose?.yaw,
      pitchDelta: relativePose?.pitch,
      yawDelta: relativePose?.yaw,
    }
  }

  extract(result: FaceLandmarkerResult, timestamp: number): VisionObservation {
    const faceCount = result.faceLandmarks.length
    if (faceCount === 0) {
      this.absenceStartedAt ??= timestamp
      if (
        !this.smoothingResetForAbsence &&
        timestamp - this.absenceStartedAt >= this.config.smoothingResetAfterAbsenceMs
      ) {
        this.resetAfterMeaningfulAbsence()
        this.smoothingResetForAbsence = true
      }

      return {
        facePresent: false,
        faceCount: 0,
        poseCalibration: this.calibration(),
        headDown: false,
        lookingAway: false,
        smileGesture: false,
        timestamp,
      }
    }

    if (
      this.absenceStartedAt !== undefined &&
      timestamp - this.absenceStartedAt >= this.config.smoothingResetAfterAbsenceMs &&
      !this.smoothingResetForAbsence
    ) {
      this.resetAfterMeaningfulAbsence()
    }
    this.absenceStartedAt = undefined
    this.smoothingResetForAbsence = false

    const alpha = this.config.poseSmoothingAlpha
    const rawPose = headPoseFromMatrix(result.facialTransformationMatrixes[0])
    if (rawPose) {
      this.smoothedPose = this.smoothedPose
        ? {
            pitch: smooth(this.smoothedPose.pitch, rawPose.pitch, alpha),
            yaw: smooth(this.smoothedPose.yaw, rawPose.yaw, alpha),
            roll: smooth(this.smoothedPose.roll, rawPose.roll, alpha),
          }
        : rawPose
    }

    const scores = scoreMap(result.faceBlendshapes[0]?.categories)
    const rawSmile = average(scores.get('mouthSmileLeft') ?? 0, scores.get('mouthSmileRight') ?? 0)
    const rawLeftOpen = 1 - (scores.get('eyeBlinkLeft') ?? 0)
    const rawRightOpen = 1 - (scores.get('eyeBlinkRight') ?? 0)

    this.smoothedSmile = this.smoothedSmile === undefined ? rawSmile : smooth(this.smoothedSmile, rawSmile, alpha)
    this.smoothedLeftOpen =
      this.smoothedLeftOpen === undefined ? rawLeftOpen : smooth(this.smoothedLeftOpen, rawLeftOpen, alpha)
    this.smoothedRightOpen =
      this.smoothedRightOpen === undefined ? rawRightOpen : smooth(this.smoothedRightOpen, rawRightOpen, alpha)

    if (!this.neutralPose && rawPose) {
      this.calibrationStartedAt ??= timestamp
      this.calibrationPoses.push(rawPose)
      this.calibrationSmiles.push(rawSmile)

      const durationReached = timestamp - this.calibrationStartedAt >= this.config.calibrationDurationMs
      const samplesReached = this.calibrationPoses.length >= this.config.calibrationMinSamples
      if (durationReached && samplesReached) {
        this.neutralPose = {
          pitch: median(this.calibrationPoses.map((pose) => pose.pitch)),
          yaw: median(this.calibrationPoses.map((pose) => pose.yaw)),
          roll: median(this.calibrationPoses.map((pose) => pose.roll)),
        }
        this.neutralSmile = median(this.calibrationSmiles)
      }
    }

    const pose = this.smoothedPose
    const relativePose =
      pose && this.neutralPose
        ? {
            pitch: pose.pitch - this.neutralPose.pitch,
            yaw: pose.yaw - this.neutralPose.yaw,
            roll: pose.roll - this.neutralPose.roll,
          }
        : undefined

    if (relativePose) {
      if (this.headDownActive) {
        if (relativePose.pitch <= this.config.headDownExitDegrees) this.headDownActive = false
      } else if (relativePose.pitch >= this.config.headDownEnterDegrees) {
        this.headDownActive = true
      }

      const yawMagnitude = Math.abs(relativePose.yaw)
      if (this.lookingAwayActive) {
        if (yawMagnitude <= this.config.lookingAwayExitDegrees) this.lookingAwayActive = false
      } else if (yawMagnitude >= this.config.lookingAwayEnterDegrees) {
        this.lookingAwayActive = true
      }
    } else {
      // Calibration frames still drive presence/absence but never posture.
      this.headDownActive = false
      this.lookingAwayActive = false
    }

    const smileScore = clamp01(this.smoothedSmile)
    let smileGesture = false
    if (this.neutralSmile !== undefined) {
      if (!this.smileArmed) {
        if (smileScore <= this.neutralSmile + this.config.smileRearmDelta) this.smileArmed = true
      } else {
        const deliberateRise =
          smileScore >= this.config.smileScoreThreshold &&
          smileScore - this.neutralSmile >= this.config.smileRiseThreshold
        if (deliberateRise) {
          this.smileCandidateSince ??= timestamp
          if (timestamp - this.smileCandidateSince >= this.config.smileHoldMs) {
            smileGesture = true
            this.smileArmed = false
            this.smileCandidateSince = undefined
          }
        } else {
          this.smileCandidateSince = undefined
        }
      }
    }

    return {
      facePresent: true,
      faceCount,
      headPose: pose,
      relativeHeadPose: relativePose,
      poseCalibration: this.calibration(relativePose),
      headDown: this.headDownActive,
      lookingAway: this.lookingAwayActive,
      eyes: {
        leftOpen: clamp01(this.smoothedLeftOpen),
        rightOpen: clamp01(this.smoothedRightOpen),
      },
      smileScore,
      smileGesture,
      timestamp,
    }
  }
}
