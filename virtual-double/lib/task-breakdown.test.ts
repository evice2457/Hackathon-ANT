import assert from 'node:assert/strict'
import test from 'node:test'

import {
  advanceTaskPlan,
  createTaskPlan,
  currentTaskStep,
  startTaskPlan,
} from './task-breakdown.ts'

test('creates writing, coding, research, and generic plans', () => {
  assert.match(createTaskPlan('Write the report', 20).steps[0].title, /Outline/)
  assert.match(createTaskPlan('Implement the frontend', 20).steps[1].title, /Implement/)
  assert.match(createTaskPlan('Research the topic', 20).steps[0].title, /Define/)
  assert.match(createTaskPlan('Organize my desk', 20).steps[0].title, /Clarify/)
})

test('plan creation is deterministic with valid durations totaling the original duration', () => {
  const first = createTaskPlan('Study chapter four', 17)
  const second = createTaskPlan('Study chapter four', 17)
  assert.deepEqual(first, second)
  assert.equal(first.steps.reduce((total, step) => total + step.minutes, 0), 17)
  assert.ok(first.steps.every((step) => step.minutes >= 1 && step.minutes <= 180))
})

test('plan progression starts first, advances, and completes after the final step', () => {
  const plan = createTaskPlan('Write a report', 20)
  let progress = startTaskPlan(plan)
  assert.equal(currentTaskStep(progress), plan.steps[0])

  for (let index = 1; index < plan.steps.length; index += 1) {
    const result = advanceTaskPlan(progress)
    assert.equal(result.status, 'next')
    if (result.status === 'next') {
      progress = result.progress
      assert.equal(result.step, plan.steps[index])
    }
  }

  assert.equal(advanceTaskPlan(progress).status, 'complete')
})

test('edited step duration is retained by plan progression', () => {
  const plan = createTaskPlan('Implement the form', 20)
  plan.steps[0] = { ...plan.steps[0], minutes: 9 }
  assert.equal(currentTaskStep(startTaskPlan(plan)).minutes, 9)
})
