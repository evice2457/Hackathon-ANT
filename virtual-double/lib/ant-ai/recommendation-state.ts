import type { DurationSource, RecommendationSource } from './types.ts'

export interface DurationSelection {
  minutes: number | null
  source: DurationSource
  customMinutes: string | null
  recommendationOrigin?: RecommendationSource
}

export interface RecommendationResult {
  minutes: number
  generation: number
  source: RecommendationSource
}

export function shouldBeginRecommendation(
  scheduledGeneration: number,
  currentGeneration: number,
  durationSource: DurationSource,
): boolean {
  return scheduledGeneration === currentGeneration && durationSource !== 'manual'
}

export function parseCustomDuration(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null

  const minutes = Number(trimmed)
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 180 ? minutes : null
}

export function selectCustomDuration(value: string): DurationSelection {
  return {
    minutes: parseCustomDuration(value),
    source: 'manual',
    customMinutes: value,
  }
}

export function selectPresetDuration(minutes: number): DurationSelection {
  return {
    minutes,
    source: 'manual',
    customMinutes: null,
  }
}

export function hasInvalidCustomDuration(selection: DurationSelection): boolean {
  return selection.source === 'manual' && selection.customMinutes !== null && selection.minutes === null
}

export function applyRecommendation(
  selection: DurationSelection,
  result: RecommendationResult,
  currentGeneration: number,
  presetMinutes: readonly number[] = [],
): DurationSelection {
  if (selection.source === 'manual' || result.generation !== currentGeneration) return selection

  return {
    minutes: result.minutes,
    source: 'suggested',
    customMinutes: presetMinutes.includes(result.minutes) ? null : String(result.minutes),
    recommendationOrigin: result.source,
  }
}
