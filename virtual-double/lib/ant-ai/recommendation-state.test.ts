import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyRecommendation,
  hasInvalidCustomDuration,
  selectCustomDuration,
  selectPresetDuration,
  shouldBeginRecommendation,
  type DurationSelection,
} from './recommendation-state.ts'

const initial: DurationSelection = { minutes: 15, source: 'default', customMinutes: null }

test('applies the latest recommendation and preserves its origin', () => {
  assert.deepEqual(applyRecommendation(initial, { minutes: 25, generation: 2, source: 'ai' }, 2, [25]), {
    minutes: 25,
    source: 'suggested',
    customMinutes: null,
    recommendationOrigin: 'ai',
  })
})

test('ignores a stale response', () => {
  assert.equal(
    applyRecommendation(initial, { minutes: 40, generation: 1, source: 'fallback' }, 2),
    initial,
  )
})

test('does not overwrite a manual duration', () => {
  const manual: DurationSelection = { minutes: 10, source: 'manual', customMinutes: null }
  assert.equal(
    applyRecommendation(manual, { minutes: 40, generation: 2, source: 'fallback' }, 2),
    manual,
  )
})

test('manual selection during a pending debounce prevents recommendation work', () => {
  assert.equal(shouldBeginRecommendation(1, 2, 'manual'), false)
})

test('a stale generation does not initiate recommendation work', () => {
  assert.equal(shouldBeginRecommendation(1, 2, 'default'), false)
})

test('the current non-manual generation may initiate recommendation work', () => {
  assert.equal(shouldBeginRecommendation(2, 2, 'default'), true)
})

test('rejects invalid custom durations without replacing the typed text', () => {
  for (const value of ['0', '-1', '181', '']) {
    const selection = selectCustomDuration(value)
    assert.equal(selection.minutes, null)
    assert.equal(selection.customMinutes, value)
    assert.equal(hasInvalidCustomDuration(selection), true)
  }
})

test('accepts custom duration boundaries', () => {
  assert.deepEqual(selectCustomDuration('1'), {
    minutes: 1,
    source: 'manual',
    customMinutes: '1',
  })
  assert.deepEqual(selectCustomDuration('180'), {
    minutes: 180,
    source: 'manual',
    customMinutes: '180',
  })
})

test('preset selection clears invalid custom input', () => {
  const invalid = selectCustomDuration('0')
  assert.equal(hasInvalidCustomDuration(invalid), true)

  const preset = selectPresetDuration(40)
  assert.deepEqual(preset, { minutes: 40, source: 'manual', customMinutes: null })
  assert.equal(hasInvalidCustomDuration(preset), false)
})
