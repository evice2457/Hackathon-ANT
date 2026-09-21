import assert from 'node:assert/strict'
import test from 'node:test'
import { CheckInEpisodeTracker } from '../check-in-episode.ts'

const running = (now: number, focusState: 'focused' | 'possibly_distracted' | 'away') => ({
  now,
  status: 'running' as const,
  focusState,
  task: 'Finish the demo',
})

test('does not trigger for a short non-focused interval', () => {
  const tracker = new CheckInEpisodeTracker(30_000)
  assert.equal(tracker.update(running(0, 'possibly_distracted')), false)
  assert.equal(tracker.update(running(29_999, 'possibly_distracted')), false)
})

test('recovery before the threshold cancels the pending episode', () => {
  const tracker = new CheckInEpisodeTracker(30_000)
  tracker.update(running(0, 'possibly_distracted'))
  tracker.update(running(20_000, 'focused'))
  assert.equal(tracker.update(running(40_000, 'possibly_distracted')), false)
  assert.equal(tracker.update(running(69_999, 'possibly_distracted')), false)
  assert.equal(tracker.update(running(70_000, 'possibly_distracted')), true)
})

test('sustained distracted and away episodes each trigger exactly once', () => {
  for (const focusState of ['possibly_distracted', 'away'] as const) {
    const tracker = new CheckInEpisodeTracker(30_000)
    tracker.update(running(0, focusState))
    assert.equal(tracker.update(running(30_000, focusState)), true)
    assert.equal(tracker.update(running(90_000, focusState)), false)
  }
})

test('switching between non-focused states does not reset continuous time', () => {
  const tracker = new CheckInEpisodeTracker(30_000)
  tracker.update(running(0, 'possibly_distracted'))
  assert.equal(tracker.update(running(15_000, 'away')), false)
  assert.equal(tracker.update(running(30_000, 'away')), true)
})

test('pause ends the episode and resume permits a later fresh trigger', () => {
  const tracker = new CheckInEpisodeTracker(30_000)
  tracker.update(running(0, 'away'))
  assert.equal(tracker.update(running(30_000, 'away')), true)
  assert.equal(
    tracker.update({ now: 30_001, status: 'paused', focusState: 'focused', task: 'Finish the demo' }),
    false,
  )
  tracker.update(running(40_000, 'focused'))
  tracker.update(running(50_000, 'possibly_distracted'))
  assert.equal(tracker.update(running(80_000, 'possibly_distracted')), true)
})
