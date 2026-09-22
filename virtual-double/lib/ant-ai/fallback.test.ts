import assert from 'node:assert/strict'
import test from 'node:test'

import { fallbackMinutes } from './fallback.ts'

test('fallback estimates small tasks deterministically', () => {
  assert.equal(fallbackMinutes('Reply to a quick email'), 15)
})

test('fallback estimates ordinary writing and coding tasks deterministically', () => {
  assert.equal(fallbackMinutes('Draft the introduction'), 25)
  assert.equal(fallbackMinutes('Implement the settings panel'), 25)
})

test('fallback estimates research and report tasks deterministically', () => {
  assert.equal(fallbackMinutes('Research and write a report'), 40)
})

test('fallback uses 20 minutes for unknown tasks and remains in bounds', () => {
  const minutes = fallbackMinutes('Organize tomorrow')
  assert.equal(minutes, 20)
  assert.ok(minutes >= 5 && minutes <= 120)
})
