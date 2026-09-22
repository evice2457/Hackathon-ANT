# ANT task-time recommendation

The recommendation provider and `POST /api/ant/recommend-time` remain available as dormant groundwork for future work. The current demo task-entry screen does not call this route, does not automatically change duration, and requires no OpenAI/network response. Users choose a preset or validated custom duration directly.

The server uses the official OpenAI JavaScript SDK and the Responses API with model `gpt-5.6-terra`. It requests a strict JSON Schema result, disables response storage, and does not enable tools or web search. The API key is read only from the server-side `OPENAI_API_KEY` environment variable and must never use a `NEXT_PUBLIC_` prefix.

If the key is absent, the provider fails, exceeds its 3-second timeout, or its output is malformed or outside 5–120 minutes, the server returns a deterministic local estimate. Email and other small tasks receive 15 minutes, ordinary writing/coding tasks 25 minutes, research/report work 40 minutes, and unknown tasks 20 minutes. The response preserves whether the recommendation originated from AI or the fallback for internal state and diagnostics, while both remain a simple ANT suggestion in the ordinary UI.

The visible demo uses deterministic local task breakdown and support rules. The OpenAI groundwork remains isolated from that flow and does not alter the focus-session or CV architecture.

## Local setup

`OPENAI_API_KEY` is optional and unused by the visible demo. It may be set in `virtual-double/.env.local` only when directly exercising the dormant recommendation route. The repository ignores `.env*`; do not commit that file or expose the key in client code.

Run `npm run test:ant-ai` for the recommendation unit tests.
