import assert from 'node:assert/strict'
import test from 'node:test'
import type { FaceLandmarkerResult, Matrix } from '@mediapipe/tasks-vision'
import { DEFAULT_VISION_CONFIG, type VisionConfig } from './config.ts'
import { VisionSignalExtractor } from './signals.ts'

const radians = (degrees: number) => (degrees * Math.PI) / 180

function poseMatrix(pitchDegrees: number, yawDegrees = 0, rollDegrees = 0): Matrix {
  const [x, y, z] = [pitchDegrees, yawDegrees, rollDegrees].map(radians)
  const [cx, sx] = [Math.cos(x), Math.sin(x)]
  const [cy, sy] = [Math.cos(y), Math.sin(y)]
  const [cz, sz] = [Math.cos(z), Math.sin(z)]
  const rows = [
    [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
    [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
    [-sy, cy * sx, cy * cx],
  ]
  return {
    rows: 4,
    columns: 4,
    data: [rows[0][0], rows[1][0], rows[2][0], 0, rows[0][1], rows[1][1], rows[2][1], 0, rows[0][2], rows[1][2], rows[2][2], 0, 0, 0, 0, 1],
  }
}

function face(pitch = 0, yaw = 0, smile = 0.1): FaceLandmarkerResult {
  return {
    faceLandmarks: [[]],
    facialTransformationMatrixes: [poseMatrix(pitch, yaw)],
    faceBlendshapes: [
      {
        headIndex: 0,
        headName: '',
        categories: [
          { index: 0, categoryName: 'mouthSmileLeft', displayName: '', score: smile },
          { index: 1, categoryName: 'mouthSmileRight', displayName: '', score: smile },
          { index: 2, categoryName: 'eyeBlinkLeft', displayName: '', score: 0 },
          { index: 3, categoryName: 'eyeBlinkRight', displayName: '', score: 0 },
        ],
      },
    ],
  }
}

const absent: FaceLandmarkerResult = {
  faceLandmarks: [],
  facialTransformationMatrixes: [],
  faceBlendshapes: [],
}

function testConfig(overrides: Partial<VisionConfig> = {}): VisionConfig {
  return {
    ...DEFAULT_VISION_CONFIG,
    calibrationDurationMs: 100,
    calibrationMinSamples: 3,
    poseSmoothingAlpha: 1,
    ...overrides,
  }
}

function calibrate(extractor: VisionSignalExtractor, pitch = 0, yaw = 0): void {
  extractor.extract(face(pitch, yaw), 0)
  extractor.extract(face(pitch, yaw), 50)
  extractor.extract(face(pitch, yaw), 100)
}

test('calibrates a median neutral pose and reports relative deltas', () => {
  const extractor = new VisionSignalExtractor(testConfig())
  extractor.extract(face(9, -6), 0)
  extractor.extract(absent, 50)
  extractor.extract(face(11, -4), 60)
  const calibrated = extractor.extract(face(10, -5), 100)

  assert.equal(calibrated.poseCalibration.status, 'ready')
  assert.equal(calibrated.poseCalibration.sampleCount, 3)
  assert.ok(Math.abs(calibrated.poseCalibration.neutralPitch! - 10) < 1e-9)
  assert.ok(Math.abs(calibrated.poseCalibration.neutralYaw! + 5) < 1e-9)

  const moved = extractor.extract(face(34, 30), 150)
  assert.ok(Math.abs(moved.relativeHeadPose!.pitch - 24) < 1e-9)
  assert.ok(Math.abs(moved.relativeHeadPose!.yaw - 35) < 1e-9)
})

test('uses separate enter and exit angles to prevent posture chatter', () => {
  const extractor = new VisionSignalExtractor(testConfig())
  calibrate(extractor)

  assert.equal(extractor.extract(face(21, 31), 150).headDown, false)
  const entered = extractor.extract(face(23, 33), 200)
  assert.equal(entered.headDown, true)
  assert.equal(entered.lookingAway, true)

  const held = extractor.extract(face(18, 27), 250)
  assert.equal(held.headDown, true)
  assert.equal(held.lookingAway, true)

  const exited = extractor.extract(face(13, 21), 300)
  assert.equal(exited.headDown, false)
  assert.equal(exited.lookingAway, false)
})

test('classifies head-down from the calibrated delta rather than absolute pose', () => {
  const extractor = new VisionSignalExtractor(testConfig())
  calibrate(extractor, 20)

  assert.equal(extractor.extract(face(39), 150).headDown, false)
  assert.equal(extractor.extract(face(43), 200).headDown, true)
})

test('preserves smoothing over a brief miss but resets it after meaningful absence', () => {
  const extractor = new VisionSignalExtractor(testConfig({ poseSmoothingAlpha: 0.5 }))
  calibrate(extractor)
  extractor.extract(face(40), 150)

  extractor.extract(absent, 200)
  const afterBriefMiss = extractor.extract(face(0), 300)
  assert.ok(afterBriefMiss.headPose!.pitch > 9)

  extractor.extract(absent, 400)
  extractor.extract(absent, 1_200)
  const afterLongAbsence = extractor.extract(face(0), 1_250)
  assert.ok(Math.abs(afterLongAbsence.headPose!.pitch) < 1e-9)
  assert.equal(afterLongAbsence.poseCalibration.status, 'ready')
})

test('emits one held smile gesture and rearms only after relaxation', () => {
  const extractor = new VisionSignalExtractor(
    testConfig({ smileHoldMs: 100, smileScoreThreshold: 0.5, smileRiseThreshold: 0.2 }),
  )
  calibrate(extractor)

  assert.equal(extractor.extract(face(0, 0, 0.7), 150).smileGesture, false)
  assert.equal(extractor.extract(face(0, 0, 0.7), 250).smileGesture, true)
  assert.equal(extractor.extract(face(0, 0, 0.7), 400).smileGesture, false)
  extractor.extract(face(0, 0, 0.1), 450)
  extractor.extract(face(0, 0, 0.7), 500)
  assert.equal(extractor.extract(face(0, 0, 0.7), 600).smileGesture, true)
})
