import handler from '../api/chat.js'
import { Buffer } from 'node:buffer'

const MAX_BODY_BYTES = 64 * 1024

// Vite doesn't execute Vercel functions itself. Use the same server-owned
// handler locally, with credentials kept out of the browser bundle.
export function chatMiddleware() {
  return async (request, response, next) => {
    if (!['', '/'].includes((request.url || '').split('?')[0])) return next()
    try {
      if (request.method === 'POST') {
        const chunks = []
        let size = 0
        for await (const chunk of request) {
          size += Buffer.byteLength(chunk)
          if (size > MAX_BODY_BYTES) {
            response.writeHead(413, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ error: 'Message history is too large' }))
            return
          }
          chunks.push(chunk)
        }
        request.body = Buffer.concat(chunks).toString('utf8')
      }
      await handler(request, response)
    } catch {
      if (!response.writableEnded) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'The assistant is temporarily unavailable' }))
      }
    }
  }
}
