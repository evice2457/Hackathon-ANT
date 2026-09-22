import 'server-only'

import OpenAI from 'openai'
import type { TimeRecommendationProvider } from './provider.ts'
import { MAX_RECOMMENDED_MINUTES, MIN_RECOMMENDED_MINUTES } from './types.ts'

const MODEL = 'gpt-5.6-terra'

export class OpenAIRecommendationProvider implements TimeRecommendationProvider {
  private readonly client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, maxRetries: 0, timeout: 3_000 })
  }

  async recommendMinutes(task: string, signal?: AbortSignal): Promise<unknown> {
    const response = await this.client.responses.create(
      {
        model: MODEL,
        store: false,
        reasoning: { effort: 'none' },
        max_output_tokens: 100,
        input: [
          {
            role: 'system',
            content:
              'Estimate one realistic, focused work-session duration for the task. Return only the requested structured result. Prefer a small, approachable commitment over a full-project estimate.',
          },
          { role: 'user', content: task },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'task_time_recommendation',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                minutes: {
                  type: 'integer',
                  minimum: MIN_RECOMMENDED_MINUTES,
                  maximum: MAX_RECOMMENDED_MINUTES,
                },
              },
              required: ['minutes'],
            },
          },
        },
      },
      { signal },
    )

    return JSON.parse(response.output_text) as unknown
  }
}
