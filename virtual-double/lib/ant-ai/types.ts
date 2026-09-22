export const MIN_RECOMMENDED_MINUTES = 5
export const MAX_RECOMMENDED_MINUTES = 120
export const MIN_TASK_LENGTH = 3
export const MAX_TASK_LENGTH = 500

export type RecommendationSource = 'ai' | 'fallback'
export type DurationSource = 'default' | 'suggested' | 'manual'

export interface TimeRecommendation {
  minutes: number
  source: RecommendationSource
}

export interface TimeRecommendationResponse {
  minutes: number
  source: RecommendationSource
}

export function toTimeRecommendationResponse(
  recommendation: TimeRecommendation,
): TimeRecommendationResponse {
  return {
    minutes: recommendation.minutes,
    source: recommendation.source,
  }
}

export function parseRecommendationRequest(value: unknown): { task: string } | null {
  if (!value || typeof value !== 'object' || !('task' in value)) return null

  const task = (value as { task?: unknown }).task
  if (typeof task !== 'string') return null

  const trimmed = task.trim()
  if (trimmed.length < MIN_TASK_LENGTH || trimmed.length > MAX_TASK_LENGTH) return null

  return { task: trimmed }
}

export function isValidRecommendedMinutes(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_RECOMMENDED_MINUTES &&
    value <= MAX_RECOMMENDED_MINUTES
  )
}

export function isRecommendationSource(value: unknown): value is RecommendationSource {
  return value === 'ai' || value === 'fallback'
}
