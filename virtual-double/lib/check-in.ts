import { createAntSupportSuggestion, parseSupportMinutes, type AntSupportSuggestion } from './ant-support.ts'

export const CHECK_IN_PROMPTS = [
  'Hey, want a quick check-in?',
  'Anything getting in the way?',
  'Want to make the next step smaller?',
] as const

export interface CheckInState {
  episodeId: number
  prompt: string
  answer: string
  responseShown: boolean
  support: AntSupportSuggestion | null
  suggestedTitle: string
  suggestedMinutesInput: string
}

export function createCheckIn(episodeId: number): CheckInState {
  return {
    episodeId,
    prompt: CHECK_IN_PROMPTS[(episodeId - 1) % CHECK_IN_PROMPTS.length],
    answer: '',
    responseShown: false,
    support: null,
    suggestedTitle: '',
    suggestedMinutesInput: '',
  }
}

export function respondToCheckIn(checkIn: CheckInState, task: string, answer = checkIn.answer): CheckInState {
  const support = createAntSupportSuggestion(task, answer)
  return {
    ...checkIn,
    answer,
    responseShown: true,
    support,
    suggestedTitle: support.nextStepTitle,
    suggestedMinutesInput: String(support.minutes),
  }
}

export function getSuggestedCheckInSession(
  checkIn: CheckInState,
): { task: string; durationSeconds: number } | null {
  const minutes = parseSupportMinutes(checkIn.suggestedMinutesInput)
  const task = checkIn.suggestedTitle.trim()
  if (!task || minutes === null) return null
  return { task, durationSeconds: minutes * 60 }
}

export type CheckInResolution =
  | { type: 'resume-current' }
  | { type: 'start-suggested'; task: string; durationSeconds: number }

export function resolveCheckInChoice(
  checkIn: CheckInState,
  choice: 'resume-current' | 'start-suggested',
): CheckInResolution | null {
  if (choice === 'resume-current') return { type: 'resume-current' }
  const session = getSuggestedCheckInSession(checkIn)
  return session ? { type: 'start-suggested', ...session } : null
}
