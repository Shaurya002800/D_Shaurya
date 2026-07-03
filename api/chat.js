// Server-side proxy for portfolio chatbot LLM calls.
// Holds the Groq and Gemini API keys so they never ship to the browser.
// Body shape: { provider: 'groq' | 'gemini' | 'auto', messages: [{ role, content }], system?: string }

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 8000)

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

async function fetchWithTimeout(url, options = {}, timeoutMs = LLM_TIMEOUT_MS) {
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
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured')
  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: system },
        ...clampMessages(messages, 14),
      ],
      temperature: 0.82,
      top_p: 0.95,
      max_tokens: 430,
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
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')
  const contents = clampMessages(messages, 12).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
          maxOutputTokens: 360,
        },
      }),
    },
  )
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Gemini ${response.status}: ${text.slice(0, 200)}`)
  }
  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
}

export default async function handler(event) {
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

  const { provider = 'auto', system, messages } = payload
  if (!system || typeof system !== 'string') {
    return jsonResponse(400, { error: 'Missing system prompt' })
  }

  const preferred = provider === 'gemini' ? 'gemini' : 'groq'

  const providers = preferred === 'gemini'
    ? [
      ['gemini', GEMINI_API_KEY, callGemini],
      ['groq', GROQ_API_KEY, callGroq],
    ]
    : [
      ['groq', GROQ_API_KEY, callGroq],
      ['gemini', GEMINI_API_KEY, callGemini],
    ]
  const configuredProviders = providers.filter(([, apiKey]) => apiKey)

  if (configuredProviders.length === 0) {
    return jsonResponse(503, {
      error: 'No LLM provider configured on server',
      text: '',
    })
  }

  const errors = []
  for (const [name, , callProvider] of configuredProviders) {
    try {
      const text = await callProvider({ system, messages })
      return jsonResponse(200, { text, provider: name })
    } catch (err) {
      errors.push(`${name}: ${err?.message || 'provider failed'}`)
    }
  }

  return jsonResponse(502, {
    error: `LLM proxy failed: ${errors.join(' | ')}`,
    text: '',
  })
}
