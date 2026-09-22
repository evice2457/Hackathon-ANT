import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createCheckIn,
  getSuggestedCheckInSession,
  resolveCheckInChoice,
  respondToCheckIn,
} from './check-in.ts'

test('check-in response creates an editable deterministic suggestion', () => {
  const response = respondToCheckIn(createCheckIn(1), 'Finish the report', 'I am stuck')
  assert.equal(response.responseShown, true)
  assert.equal(response.support?.reason, 'stuck')
  assert.match(response.suggestedTitle, /Finish the report/)
  assert.equal(response.suggestedMinutesInput, '10')
})

test('continue with smaller step respects edited title and duration', () => {
  const response = {
    ...respondToCheckIn(createCheckIn(1), 'Finish the report', 'too much'),
    suggestedTitle: 'Write one paragraph',
    suggestedMinutesInput: '7',
  }
  assert.deepEqual(getSuggestedCheckInSession(response), {
    task: 'Write one paragraph',
    durationSeconds: 420,
  })
})

test('invalid suggested duration cannot start a smaller step', () => {
  const response = {
    ...respondToCheckIn(createCheckIn(1), 'Finish the report', 'tired'),
    suggestedMinutesInput: '0',
  }
  assert.equal(getSuggestedCheckInSession(response), null)
})

test('resume current task and continue-smaller-step choices resolve distinctly', () => {
  const response = respondToCheckIn(createCheckIn(1), 'Finish the report', 'tired')
  assert.deepEqual(resolveCheckInChoice(response, 'resume-current'), { type: 'resume-current' })
  assert.deepEqual(resolveCheckInChoice(response, 'start-suggested'), {
    type: 'start-suggested',
    task: 'Do one small part of Finish the report',
    durationSeconds: 300,
  })
})
