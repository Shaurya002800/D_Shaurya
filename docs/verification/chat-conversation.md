# Conversational assistant

The chat opens with a neutral greeting. Server instructions welcome everyday conversation, explanations, writing help and follow-up questions. The assistant refers to Shaurya when relevant, uses the existing profile record for personal facts, and admits when a detail is missing. It follows the visitor's language without forcing pirate phrases or a portfolio pitch.

The browser sends recent conversation history without the synthetic welcome or a client-authored system prompt. Contact collection starts on an explicit message/hiring request rather than ordinary interview, email or phone-number questions. The existing review-and-confirm sending flow remains in place.

Vite development and preview now mount the existing server-owned `/api/chat` handler. Provider credentials remain on the server. An unavailable provider produces a clearly labelled limited mode; offline replies support basic greetings and saved profile facts, and do not pretend to answer arbitrary questions.

The Groq default is `openai/gpt-oss-120b`; the previous exact default is migrated automatically. The Gemini fallback default is `gemini-3.1-flash-lite`, with the same treatment for the old exact default. Other explicit model overrides remain supported. Private reasoning is not displayed, and an empty provider reply tries the next configured provider.

Provider references checked during implementation: [Groq models](https://console.groq.com/docs/models), [Groq reasoning parameters](https://console.groq.com/docs/reasoning), [Gemini deprecations](https://aistudio.google.com/docs/deprecations?hl=en), and [Gemini 3.1 Flash-Lite](https://aistudio.google.com/docs/models/gemini-3.1-flash-lite).

## Verification

- Production build and ESLint for modified application/configuration files passed.
- All 24 automated tests passed, including provider request construction, fallback behavior, context handling, deliberate handoff detection, and the local API adapter.
- Browser checks used intercepted mock responses and blocked all external requests. They verified normal conversation, follow-up history, contact questions staying in chat, explicit contact review/cancellation, and honest offline behavior. No email was sent.
- A read-only provider model listing confirmed the selected Groq model is available to the existing account. No live generation was performed: automatic approval review blocked sending portfolio context to the provider without explicit permission. Actual model tone and end-to-end live replies still require that final test.

These changes do not modify the website's colours, fonts or layout.
