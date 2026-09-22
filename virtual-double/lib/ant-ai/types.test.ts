import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isValidRecommendedMinutes,
  parseRecommendationRequest,
  toTimeRecommendationResponse,
} from './types.ts'

test('validates and trims recommendation requests', () => {
  assert.deepEqual(parseRecommendationRequest({ task: '  Draft an email  ' }), {
    task: 'Draft an email',
  })
})

test('rejects invalid request input', () => {
  assert.equal(parseRecommendationRequest(null), null)
  assert.equal(parseRecommendationRequest({}), null)
  assert.equal(parseRecommendationRequest({ task: 42 }), null)
  assert.equal(parseRecommendationRequest({ task: '  ' }), null)
  assert.equal(parseRecommendationRequest({ task: 'x'.repeat(501) }), null)
})

test('accepts only integer recommendations from 5 through 120', () => {
  assert.equal(isValidRecommendedMinutes(5), true)
  assert.equal(isValidRecommendedMinutes(120), true)
  assert.equal(isValidRecommendedMinutes(4), false)
  assert.equal(isValidRecommendedMinutes(121), false)
  assert.equal(isValidRecommendedMinutes(20.5), false)
})

test('API response facade preserves AI and fallback origins', () => {
  assert.deepEqual(toTimeRecommendationResponse({ minutes: 25, source: 'ai' }), {
    minutes: 25,
    source: 'ai',
  })
  assert.deepEqual(toTimeRecommendationResponse({ minutes: 20, source: 'fallback' }), {
    minutes: 20,
    source: 'fallback',
  })
})
