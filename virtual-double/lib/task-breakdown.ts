/**
 * Integration point for the backend / AI teammate.
 *
 * Replace the body with a real API call (e.g. POST /api/breakdown) and keep the
 * same signature so no UI code needs to change:
 *
 *   async function requestTaskBreakdown(task: string): Promise<string[]>
 *
 * It must resolve to a list of smaller sub-steps for the given task.
 *
 * TODO(backend/AI): connect the real endpoint. Do not assume any model is
 * running locally — nothing here actually calls an AI today.
 */
export async function requestTaskBreakdown(task: string): Promise<string[]> {
  console.info('[VirtualDouble] requestTaskBreakdown (placeholder) called with:', task)

  // Simulated latency so the UI's loading state is exercised during the demo.
  await new Promise((resolve) => setTimeout(resolve, 600))

  return [
    `Open what you need to start "${task}"`,
    'Write just the first sentence or bullet',
    'Keep going for a few minutes',
  ]
}
