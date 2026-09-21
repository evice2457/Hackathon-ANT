import type { Matrix } from '@mediapipe/tasks-vision'
import type { HeadPose } from './types.ts'

const RADIANS_TO_DEGREES = 180 / Math.PI

/**
 * Extracts intrinsic XYZ Euler angles from MediaPipe's column-major
 * canonical-face transform. MatrixData's protobuf defaults to column-major,
 * and the Web API copies packed_data without transposing it.
 *
 * The rotation convention is R = Rz(roll) * Ry(yaw) * Rx(pitch). For the
 * canonical camera coordinate system, positive pitch angles the face down.
 * Values are approximate and intended for coarse posture thresholds, not gaze.
 */
export function headPoseFromMatrix(matrix: Matrix | undefined): HeadPose | undefined {
  if (!matrix || matrix.rows !== 4 || matrix.columns !== 4 || matrix.data.length < 16) return undefined

  const m = matrix.data
  // Column-major indices: m[row + column * 4].
  const r00 = m[0]
  const r10 = m[1]
  const r20 = m[2]
  const r21 = m[6]
  const r22 = m[10]
  const horizontalScale = Math.hypot(r00, r10)

  let rotationX: number
  let rotationY: number
  let rotationZ: number

  if (horizontalScale > 1e-6) {
    rotationX = Math.atan2(r21, r22)
    rotationY = Math.atan2(-r20, horizontalScale)
    rotationZ = Math.atan2(r10, r00)
  } else {
    // Gimbal-lock fallback. Roll is not independently recoverable here.
    rotationX = Math.atan2(-m[9], m[5])
    rotationY = Math.atan2(-r20, horizontalScale)
    rotationZ = 0
  }

  return {
    pitch: rotationX * RADIANS_TO_DEGREES,
    yaw: rotationY * RADIANS_TO_DEGREES,
    roll: rotationZ * RADIANS_TO_DEGREES,
  }
}
