import { MAX_RECOMMENDED_MINUTES, MIN_RECOMMENDED_MINUTES } from './types.ts'

const RESEARCH_TASK = /\b(research|report|assignment|analysis|analyse|analyze|investigate|study)\b/i
const ORDINARY_TASK = /\b(write|writing|code|coding|outline|draft|implement|build|fix|develop)\b/i
const SMALL_TASK = /\b(email|reply|respond|quick|brief|small|check|review)\b/i

export function fallbackMinutes(task: string): number {
  let minutes = 20

  if (RESEARCH_TASK.test(task)) minutes = 40
  else if (ORDINARY_TASK.test(task)) minutes = 25
  else if (SMALL_TASK.test(task)) minutes = 15

  return Math.min(MAX_RECOMMENDED_MINUTES, Math.max(MIN_RECOMMENDED_MINUTES, minutes))
}
