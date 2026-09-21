import assert from 'node:assert/strict'
import test from 'node:test'
import type { Matrix } from '@mediapipe/tasks-vision'
import { headPoseFromMatrix } from './head-pose.ts'

const radians = (degrees: number) => (degrees * Math.PI) / 180

/** Independently constructs Rz(roll) * Ry(yaw) * Rx(pitch), then packs columns. */
function rotationMatrix(pitchDegrees: number, yawDegrees: number, rollDegrees: number): Matrix {
  const [x, y, z] = [pitchDegrees, yawDegrees, rollDegrees].map(radians)
  const [cx, sx] = [Math.cos(x), Math.sin(x)]
  const [cy, sy] = [Math.cos(y), Math.sin(y)]
  const [cz, sz] = [Math.cos(z), Math.sin(z)]

  const r00 = cz * cy
  const r01 = cz * sy * sx - sz * cx
  const r02 = cz * sy * cx + sz * sx
  const r10 = sz * cy
  const r11 = sz * sy * sx + cz * cx
  const r12 = sz * sy * cx - cz * sx
  const r20 = -sy
  const r21 = cy * sx
  const r22 = cy * cx

  return {
    rows: 4,
    columns: 4,
    data: [r00, r10, r20, 0, r01, r11, r21, 0, r02, r12, r22, 0, 0, 0, 0, 1],
  }
}

function assertPose(actual: ReturnType<typeof headPoseFromMatrix>, expected: [number, number, number]) {
  assert.ok(actual)
  assert.ok(Math.abs(actual.pitch - expected[0]) < 1e-9)
  assert.ok(Math.abs(actual.yaw - expected[1]) < 1e-9)
  assert.ok(Math.abs(actual.roll - expected[2]) < 1e-9)
}

test('extracts identity and each signed Euler axis from column-major matrices', () => {
  assertPose(headPoseFromMatrix(rotationMatrix(0, 0, 0)), [0, 0, 0])
  assertPose(headPoseFromMatrix(rotationMatrix(24, 0, 0)), [24, 0, 0])
  assertPose(headPoseFromMatrix(rotationMatrix(0, 31, 0)), [0, 31, 0])
  assertPose(headPoseFromMatrix(rotationMatrix(0, -31, 0)), [0, -31, 0])
  assertPose(headPoseFromMatrix(rotationMatrix(0, 0, 17)), [0, 0, 17])
})

test('extracts a combined rotation without transposing axes', () => {
  assertPose(headPoseFromMatrix(rotationMatrix(18, -27, 12)), [18, -27, 12])
})

test('rejects missing and malformed matrices', () => {
  assert.equal(headPoseFromMatrix(undefined), undefined)
  assert.equal(headPoseFromMatrix({ rows: 3, columns: 3, data: Array(9).fill(0) }), undefined)
})
