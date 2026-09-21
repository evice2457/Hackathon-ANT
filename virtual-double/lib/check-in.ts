export const CHECK_IN_PROMPTS = [
  'Are you okay?',
  'Is something getting in the way?',
  'Want to tell me what’s making this difficult right now?',
  'Need a hand getting back into it?',
] as const

export const CHECK_IN_RESPONSE = 'Thanks for telling me. We can take it one step at a time.'

export interface CheckInState {
  episodeId: number
  prompt: string
  answer: string
  responseShown: boolean
}

export function createCheckIn(episodeId: number): CheckInState {
  return {
    episodeId,
    prompt: CHECK_IN_PROMPTS[(episodeId - 1) % CHECK_IN_PROMPTS.length],
    answer: '',
    responseShown: false,
  }
}
