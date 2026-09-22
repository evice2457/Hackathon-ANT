export interface AntSupportSuggestion {
  message: string
  nextStepTitle: string
  minutes: number
  reason: 'tired' | 'stuck' | 'overwhelmed' | 'default'
}

export function createAntSupportSuggestion(task: string, answer: string): AntSupportSuggestion {
  const currentTask = task.trim() || 'your current task'

  if (/\b(tired|exhausted|sleepy|drained|fatigue|fatigued)\b/i.test(answer)) {
    return {
      message: "That's okay. Let's make this lighter.",
      nextStepTitle: `Do one small part of ${currentTask}`,
      minutes: 5,
      reason: 'tired',
    }
  }

  if (/\b(stuck|confused|unclear|lost|blocked|don't know|do not know)\b/i.test(answer)) {
    return {
      message: "Let's lower the starting barrier.",
      nextStepTitle: `Clarify the next concrete action for ${currentTask}`,
      minutes: 10,
      reason: 'stuck',
    }
  }

  if (/\b(overwhelmed|too much|too big|daunting|overload)\b/i.test(answer)) {
    return {
      message: "We don't need to solve all of it at once.",
      nextStepTitle: `Work on just the first small chunk of ${currentTask}`,
      minutes: 5,
      reason: 'overwhelmed',
    }
  }

  return {
    message: "No worries. Let's make the next step smaller.",
    nextStepTitle: `Continue with one small part of ${currentTask}`,
    minutes: 10,
    reason: 'default',
  }
}

export function parseSupportMinutes(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const minutes = Number(trimmed)
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 180 ? minutes : null
}
