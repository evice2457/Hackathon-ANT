import assert from 'node:assert/strict'
import test from 'node:test'

import { getMascotPresentation } from './mascot-presentation.ts'

test('full task completion selects the happy mascot', () => {
  assert.deepEqual(getMascotPresentation('completion', 'ANT'), {
    src: '/ant-happy-removebg.png',
    alt: 'ANT celebrating',
  })
})

test('intermediate step completion selects the happy mascot', () => {
  assert.equal(
    getMascotPresentation('step-transition', 'Buddy').src,
    '/ant-happy-removebg.png',
  )
})

test('an active check-in selects the sad mascot with neutral alt text', () => {
  assert.deepEqual(getMascotPresentation('check-in', 'Buddy'), {
    src: '/ant-sad-removebg.png',
    alt: 'Buddy checking in',
  })
})

test('normal running presentation does not select the sad mascot', () => {
  assert.equal(
    getMascotPresentation('normal', 'ANT').src,
    '/ant-mascot-removebg.png',
  )
})

test('full and PiP check-ins share the same derived presentation', () => {
  const sharedCheckInPresentation = getMascotPresentation('check-in', 'ANT')

  assert.equal(sharedCheckInPresentation.src, '/ant-sad-removebg.png')
})
