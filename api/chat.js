import { portfolioKnowledge } from '../src/data/knowledge.js'
// Server-side proxy for portfolio chatbot LLM calls.
// Holds the Groq and Gemini API keys so they never ship to the browser.
// Body shape: { provider: 'groq' | 'gemini' | 'auto', messages: [{ role, content }] }. Knowledge is server-owned.

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b'
// Older deployments may still have the retired default in their environment.
function groqModel() {
  const configured = process.env.GROQ_MODEL
  return !configured || configured === 'llama-3.3-70b-versatile' ? DEFAULT_GROQ_MODEL : configured
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function jsonResponse(status, body) {
  return {
    statusCode: status,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  }
}

function clampMessages(messages, limit) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-limit)
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 4000) }))
}

async function fetchWithTimeout(url, options = {}, timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 8000)) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Provider request timed out after ${timeoutMs}ms`, { cause: err })
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function callGroq({ system, messages }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not configured')
  const model = groqModel()
  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        ...clampMessages(messages, 14),
      ],
      temperature: 0.7,
      top_p: 0.95,
      ...(model.startsWith('openai/gpt-oss-')
        ? { max_completion_tokens: 2048, reasoning_effort: 'low', include_reasoning: false }
        : { max_tokens: 800 }),
      presence_penalty: 0.2,
      frequency_penalty: 0.15,
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Groq ${response.status}: ${text.slice(0, 200)}`)
  }
  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || ''
}

async function callGemini({ system, messages }) {
  const apiKey = process.env.GEMINI_API_KEY
  const configuredModel = process.env.GEMINI_MODEL
  const model = !configuredModel || configuredModel === 'gemini-2.0-flash' ? 'gemini-3.1-flash-lite' : configuredModel
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')
  const contents = clampMessages(messages, 12).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          temperature: 0.78,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1200,
        },
      }),
    },
  )
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Gemini ${response.status}: ${text.slice(0, 200)}`)
  }
  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('').trim() || ''
}

async function handleChatEvent(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' })
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return jsonResponse(400, { error: 'Invalid request body' })
  const { provider = 'auto' } = payload
  const messages = clampMessages(payload.messages, 14)
  if (!messages.length || messages.at(-1).role !== 'user') return jsonResponse(400, { error: 'A user message is required' })
  const system = portfolioKnowledge()
  if (!system || typeof system !== 'string') {
    return jsonResponse(400, { error: 'Missing system prompt' })
  }

  const preferred = provider === 'gemini' ? 'gemini' : 'groq'

  const providers = preferred === 'gemini'
    ? [
      ['gemini', process.env.GEMINI_API_KEY, callGemini],
      ['groq', process.env.GROQ_API_KEY, callGroq],
    ]
    : [
      ['groq', process.env.GROQ_API_KEY, callGroq],
      ['gemini', process.env.GEMINI_API_KEY, callGemini],
    ]
  const configuredProviders = providers.filter(([, apiKey]) => apiKey)

  if (configuredProviders.length === 0) {
    return jsonResponse(503, {
      error: 'No LLM provider configured on server',
      text: '',
    })
  }

  for (const [name, , callProvider] of configuredProviders) {
    try {
      const text = await callProvider({ system, messages })
      if (!text) throw new Error('Provider returned an empty reply')
      return jsonResponse(200, { text, provider: name })
    } catch {
      // Try the other configured provider before returning the limited fallback.
    }
  }

  return jsonResponse(502, {
    error: 'The assistant is temporarily unavailable. Please try again.',
    text: '',
  })
}

// Support the deployed Vercel/Node request-response contract as well as the
// existing event contract used by local tests. The factual prompt is server-owned.
export default async function handler(request, response) {
  const legacyEvent = typeof request.httpMethod === 'string'
  let event = request
  if (!legacyEvent) {
    let body = request.body
    if (typeof request.json === 'function' && request.method === 'POST') {
      try { body = await request.json() } catch { body = '{invalid-json' }
    }
    event = { httpMethod: request.method, body: typeof body === 'string' ? body : JSON.stringify(body ?? {}) }
  }
  const result = await handleChatEvent(event)
  if (response) {
    response.writeHead(result.statusCode, result.headers)
    response.end(result.body)
    return
  }
  if (!legacyEvent) return new Response(result.statusCode === 204 ? null : result.body, { status: result.statusCode, headers: result.headers })
  return result
}
