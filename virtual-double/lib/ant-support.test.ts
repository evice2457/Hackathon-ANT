import assert from 'node:assert/strict'
import test from 'node:test'

import { createAntSupportSuggestion } from './ant-support.ts'

test('creates tired, stuck, overwhelmed, and default support suggestions', () => {
  assert.equal(createAntSupportSuggestion('the report', "I'm exhausted").reason, 'tired')
  assert.equal(createAntSupportSuggestion('the report', "I'm stuck").reason, 'stuck')
  assert.equal(createAntSupportSuggestion('the report', 'This is too much').reason, 'overwhelmed')
  assert.equal(createAntSupportSuggestion('the report', 'Just thinking').reason, 'default')
})

test('all deterministic support durations are valid', () => {
  for (const answer of ['tired', 'confused', 'overwhelmed', 'something else']) {
    const suggestion = createAntSupportSuggestion('Finish the demo', answer)
    assert.ok(suggestion.minutes >= 1 && suggestion.minutes <= 180)
  }
})
