import assert from 'node:assert/strict'
import test from 'node:test'
import { reconcileElapsedSeconds } from '../session-clock.ts'

test('reconciles delayed callbacks using elapsed wall time', () => {
  assert.deepEqual(reconcileElapsedSeconds(1_000, 4_450), {
    elapsedSeconds: 3,
    reconciledAt: 4_000,
  })
})

test('preserves sub-second remainder without double-counting', () => {
  const first = reconcileElapsedSeconds(1_000, 2_750)
  const second = reconcileElapsedSeconds(first.reconciledAt, 3_050)

  assert.equal(first.elapsedSeconds, 1)
  assert.equal(second.elapsedSeconds, 1)
  assert.equal(second.reconciledAt, 3_000)
})

test('does not count backwards clock movement', () => {
  assert.deepEqual(reconcileElapsedSeconds(2_000, 1_500), {
    elapsedSeconds: 0,
    reconciledAt: 2_000,
  })
})
