// This gate is evaluated only after the visitor has seen the completed handoff.
export function confirmsHandoff(stage, text) {
  return stage === 'confirm' && /^(send|confirm|yes[, ]+send|yes)$/i.test(text.trim())
}

// Start collecting details only when the visitor actually requests a handoff.
// A general question about interviews, jobs, phone numbers or email is not consent.
export function wantsContact(text) {
  const q = text.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim()
  if (/\b(?:don't|do not|not ready to|not looking to|no need to|rather not)\b/.test(q)) return false
  if (/^(?:contact|hire|recruit|collaborate|collab|get in touch)[.!]?$/i.test(q)) return true

  const recipient = '(?:shaurya|him|the (?:owner|developer)|your (?:creator|owner))'
  const request = '(?:(?:i (?:want|would like|need) to |(?:please )?(?:(?:can|could) you )?(?:help me )?))'
  if (new RegExp(`^${request}(?:contact|hire|recruit|interview|message|email|call|reach(?: out to)?|collaborate with|work with|get in touch with) ${recipient}\\b`).test(q)) return true
  if (new RegExp(`\\b(?:send|pass|forward|leave|share|tell|ask) ${recipient}\\b`).test(q) && /\b(?:message|note|details|call me|contact me|reach me|opportunity)\b/.test(q)) return true
  if (/^(?:please )?(?:send|pass|forward|leave|share)\b/.test(q) && new RegExp(`\\b(?:message|note|details)\\b.{0,40}\\b(?:to|with|for) ${recipient}\\b`).test(q)) return true
  return /\b(?:i have|i've got|we have|we've got)\b.*\b(?:internship|job|collaboration) opportunity\b/.test(q) && new RegExp(`\\bfor ${recipient}\\b`).test(q)
}
