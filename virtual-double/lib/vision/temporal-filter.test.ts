import assert from 'node:assert/strict'
import test from 'node:test'
import { VisionBehaviorClassifier } from './temporal-filter.ts'
import type { VisionObservation } from './types.ts'

const config = { awayDwellMs: 3_000, distractedDwellMs: 2_000, recoveryDwellMs: 1_500 }

function observation(
  timestamp: number,
  overrides: Partial<VisionObservation> = {},
): VisionObservation {
  return {
    facePresent: true,
    faceCount: 1,
    poseCalibration: { status: 'ready', sampleCount: 10 },
    headDown: false,
    lookingAway: false,
    smileGesture: false,
    timestamp,
    ...overrides,
  }
}

test('ignores a brief face detector miss', () => {
  const classifier = new VisionBehaviorClassifier(config)
  assert.equal(classifier.update(observation(0, { facePresent: false, faceCount: 0 })), 'focused')
  assert.equal(classifier.update(observation(2_900, { facePresent: false, faceCount: 0 })), 'focused')
  assert.equal(classifier.update(observation(3_000)), 'focused')
})

test('moves to away only after continuous absence and recovers with hysteresis', () => {
  const classifier = new VisionBehaviorClassifier(config)
  classifier.update(observation(100, { facePresent: false, faceCount: 0 }))
  assert.equal(classifier.update(observation(3_100, { facePresent: false, faceCount: 0 })), 'away')
  assert.equal(classifier.update(observation(3_200)), 'away')
  assert.equal(classifier.update(observation(4_699)), 'away')
  assert.equal(classifier.update(observation(4_700)), 'focused')
})

test('requires a sustained posture signal and cancels a broken episode', () => {
  const classifier = new VisionBehaviorClassifier(config)
  classifier.update(observation(0, { headDown: true }))
  assert.equal(classifier.update(observation(1_999, { headDown: true })), 'focused')
  assert.equal(classifier.update(observation(2_000)), 'focused')

  classifier.update(observation(3_000, { lookingAway: true }))
  assert.equal(classifier.update(observation(5_000, { lookingAway: true })), 'possibly_distracted')
  assert.equal(classifier.update(observation(6_000)), 'possibly_distracted')
  assert.equal(classifier.update(observation(7_500)), 'focused')
})

test('requires uninterrupted recovery from away', () => {
  const classifier = new VisionBehaviorClassifier(config)
  classifier.update(observation(0, { facePresent: false, faceCount: 0 }))
  classifier.update(observation(3_000, { facePresent: false, faceCount: 0 }))

  assert.equal(classifier.update(observation(3_100)), 'away')
  assert.equal(classifier.update(observation(4_500)), 'away')
  assert.equal(classifier.update(observation(4_600, { facePresent: false, faceCount: 0 })), 'away')
  assert.equal(classifier.update(observation(4_700)), 'away')
  assert.equal(classifier.update(observation(6_200)), 'focused')
})

test('applies the same dwell rule to head-down and turned-head signals', () => {
  const classifier = new VisionBehaviorClassifier(config)
  classifier.update(observation(0, { headDown: true }))
  assert.equal(classifier.update(observation(2_000, { headDown: true })), 'possibly_distracted')
  classifier.reset()
  classifier.update(observation(3_000, { lookingAway: true }))
  assert.equal(classifier.update(observation(5_000, { lookingAway: true })), 'possibly_distracted')
})

test('does not recover from away while the returned face has bad posture', () => {
  const classifier = new VisionBehaviorClassifier(config)
  classifier.update(observation(0, { facePresent: false, faceCount: 0 }))
  classifier.update(observation(3_000, { facePresent: false, faceCount: 0 }))

  assert.equal(classifier.update(observation(3_100, { headDown: true })), 'away')
  assert.equal(classifier.update(observation(5_100, { headDown: true })), 'possibly_distracted')
  assert.equal(classifier.update(observation(5_200)), 'possibly_distracted')
  assert.equal(classifier.update(observation(6_700)), 'focused')
})
