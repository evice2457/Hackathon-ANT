import assert from 'node:assert/strict'
import test from 'node:test'

import { recommendTaskTime, type TimeRecommendationProvider } from './provider.ts'

function providerReturning(value: unknown): TimeRecommendationProvider {
  return { recommendMinutes: async () => value }
}

test('returns a valid bounded provider recommendation', async () => {
  assert.deepEqual(await recommendTaskTime('Write a proposal', providerReturning({ minutes: 30 })), {
    minutes: 30,
    source: 'ai',
  })
})

test('falls back when the provider API fails', async () => {
  const provider: TimeRecommendationProvider = {
    recommendMinutes: async () => {
      throw new Error('provider unavailable')
    },
  }

  assert.deepEqual(await recommendTaskTime('Reply to an email', provider), {
    minutes: 15,
    source: 'fallback',
  })
})

test('falls back for malformed and out-of-bounds provider output', async () => {
  assert.deepEqual(await recommendTaskTime('Do something', providerReturning({ minutes: '20' })), {
    minutes: 20,
    source: 'fallback',
  })
  assert.deepEqual(await recommendTaskTime('Do something', providerReturning({ minutes: 121 })), {
    minutes: 20,
    source: 'fallback',
  })
})

test('uses fallback when no provider is configured (missing API key)', async () => {
  assert.deepEqual(await recommendTaskTime('Research competitors'), {
    minutes: 40,
    source: 'fallback',
  })
})
