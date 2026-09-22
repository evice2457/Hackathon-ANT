import { fallbackMinutes } from './fallback.ts'
import { isValidRecommendedMinutes, type TimeRecommendation } from './types.ts'

export interface TimeRecommendationProvider {
  recommendMinutes(task: string, signal?: AbortSignal): Promise<unknown>
}

function extractMinutes(value: unknown): unknown {
  if (value && typeof value === 'object' && 'minutes' in value) {
    return (value as { minutes?: unknown }).minutes
  }
  return value
}

export async function recommendTaskTime(
  task: string,
  provider?: TimeRecommendationProvider,
  signal?: AbortSignal,
): Promise<TimeRecommendation> {
  if (provider) {
    try {
      const result = await provider.recommendMinutes(task, signal)
      const minutes = extractMinutes(result)
      if (isValidRecommendedMinutes(minutes)) return { minutes, source: 'ai' }
    } catch (error) {
      if (signal?.aborted) throw error
    }
  }

  return { minutes: fallbackMinutes(task), source: 'fallback' }
}
