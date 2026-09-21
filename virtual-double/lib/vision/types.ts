import type { FocusState } from '@/lib/focus-session'

export interface HeadPose {
  /** Approximate degrees. Positive pitch means the face is angled down. */
  pitch: number
  /** Approximate degrees. Sign indicates left/right; consumers should use magnitude. */
  yaw: number
  /** Approximate in-plane tilt in degrees. */
  roll: number
}

export interface EyeOpenness {
  /** 0 = closed-like geometry, 1 = open-like geometry. */
  leftOpen: number
  rightOpen: number
}

export interface PoseCalibration {
  status: 'calibrating' | 'ready'
  sampleCount: number
  neutralPitch?: number
  neutralYaw?: number
  pitchDelta?: number
  yawDelta?: number
}

/** Observable geometry only. This deliberately contains no emotion or diagnosis labels. */
export interface VisionObservation {
  facePresent: boolean
  faceConfidence?: number
  faceCount: number
  /** Smoothed absolute pose reported by the MediaPipe canonical-face transform. */
  headPose?: HeadPose
  /** Pose relative to the per-monitor neutral baseline. */
  relativeHeadPose?: HeadPose
  poseCalibration: PoseCalibration
  headDown: boolean
  lookingAway: boolean
  eyes?: EyeOpenness
  /** Strength of the model's mouth-smile geometry coefficients, from 0 to 1. */
  smileScore?: number
  smileGesture: boolean
  timestamp: number
}

export type VisionStatus =
  | 'disabled'
  | 'loading_model'
  | 'requesting_camera'
  | 'running'
  | 'camera_denied'
  | 'camera_unavailable'
  | 'unsupported'
  | 'error'

export interface VisionDiagnostics {
  status: VisionStatus
  observation: VisionObservation | null
  derivedState: FocusState
  fps: number
  inferenceMs: number
  error?: string
}
