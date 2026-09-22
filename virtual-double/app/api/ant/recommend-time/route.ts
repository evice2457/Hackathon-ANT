import { NextResponse } from 'next/server'
import { OpenAIRecommendationProvider } from '@/lib/ant-ai/openai-provider'
import { recommendTaskTime } from '@/lib/ant-ai/provider'
import { parseRecommendationRequest, toTimeRecommendationResponse } from '@/lib/ant-ai/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = parseRecommendationRequest(body)
  if (!parsed) {
    return NextResponse.json({ error: 'Task must be between 3 and 500 characters.' }, { status: 400 })
  }

  const provider = process.env.OPENAI_API_KEY
    ? new OpenAIRecommendationProvider(process.env.OPENAI_API_KEY)
    : undefined
  const recommendation = await recommendTaskTime(parsed.task, provider, request.signal)

  return NextResponse.json(toTimeRecommendationResponse(recommendation))
}
