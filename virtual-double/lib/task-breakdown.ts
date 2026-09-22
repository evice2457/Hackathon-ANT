export interface TaskStep {
  id: string
  title: string
  minutes: number
}

export interface TaskPlan {
  originalTask: string
  originalMinutes: number
  steps: TaskStep[]
}

export interface TaskPlanProgress {
  plan: TaskPlan
  currentStepIndex: number
}

export type TaskPlanAdvance =
  | { status: 'next'; progress: TaskPlanProgress; step: TaskStep }
  | { status: 'complete'; progress: TaskPlanProgress }

type BreakdownCategory = 'writing' | 'coding' | 'research' | 'email' | 'generic'

const CATEGORY_STEPS: Record<BreakdownCategory, readonly string[]> = {
  writing: [
    'Outline what needs to be covered',
    'Draft the main content',
    'Review and refine',
    'Do a final check',
  ],
  coding: [
    'Review the requirements',
    'Implement the core part',
    'Test and fix issues',
    'Polish and verify',
  ],
  research: [
    'Define the focus',
    'Work through the main material',
    'Write short notes or a summary',
    'Review what was learned',
  ],
  email: ['Review and prioritize', 'Handle the important items', 'Do a quick final review'],
  generic: [
    'Clarify the outcome',
    'Work on the first chunk',
    'Finish the core task',
    'Review and wrap up',
  ],
}

function classifyTask(task: string): BreakdownCategory {
  if (/\b(code|coding|frontend|implement|implementation|component|bug|debug|develop|build)\b/i.test(task)) {
    return 'coding'
  }
  if (/\b(study|research|learn|reading|investigate|material|notes)\b/i.test(task)) return 'research'
  if (/\b(email|inbox|admin|reply|respond|schedule|paperwork)\b/i.test(task)) return 'email'
  if (/\b(write|writing|report|essay|draft|article|proposal|document)\b/i.test(task)) return 'writing'
  return 'generic'
}

function distributeMinutes(totalMinutes: number, stepCount: number): number[] {
  const base = Math.floor(totalMinutes / stepCount)
  const remainder = totalMinutes % stepCount
  return Array.from({ length: stepCount }, (_, index) => base + (index < remainder ? 1 : 0))
}

export function createTaskPlan(task: string, totalMinutes: number): TaskPlan {
  const originalTask = task.trim()
  const originalMinutes = Math.max(1, Math.round(totalMinutes))
  const category = classifyTask(originalTask)
  const labels = CATEGORY_STEPS[category]
  const stepCount = Math.min(labels.length, originalMinutes)
  const minutes = distributeMinutes(originalMinutes, stepCount)

  return {
    originalTask,
    originalMinutes,
    steps: labels.slice(0, stepCount).map((title, index) => ({
      id: `${category}-${index + 1}`,
      title,
      minutes: minutes[index],
    })),
  }
}

export function startTaskPlan(plan: TaskPlan): TaskPlanProgress {
  return { plan, currentStepIndex: 0 }
}

export function currentTaskStep(progress: TaskPlanProgress): TaskStep {
  return progress.plan.steps[progress.currentStepIndex]
}

export function advanceTaskPlan(progress: TaskPlanProgress): TaskPlanAdvance {
  const nextIndex = progress.currentStepIndex + 1
  if (nextIndex >= progress.plan.steps.length) return { status: 'complete', progress }

  const nextProgress = { ...progress, currentStepIndex: nextIndex }
  return { status: 'next', progress: nextProgress, step: currentTaskStep(nextProgress) }
}
