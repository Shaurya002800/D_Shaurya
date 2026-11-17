import { PROFILE } from './profile.js'
import { PROJECTS } from './projects.js'
import { experienceSummary, findProject, projectSummary } from './knowledge.js'

export const CHAT_WELCOME = 'Hey! What would you like to chat about?'
export const CHAT_PLACEHOLDER = 'Ask anything…'

export function messagesForApi(history) {
  return history
    .filter(msg => msg.text && msg.sender !== 'system' && !msg.intro)
    .slice(-14)
    .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
}

const normalise = text => text.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim()
const followUp = q => /^(?:tell me more|more details|what about (?:it|that|this|his|its)|how does (?:it|that|this) work|(?:why|how|what) (?:did|does|is|was) (?:he|it|that|this)|which (?:one|project)|(?:and )?(?:its|his)\b)/.test(q)

function profileQuestion(q) {
  return /\b(?:shaurya|kunwar|he|his|him|myperro|ieee|cgpa)\b/.test(q)
    || /\b(?:your|the owner's|the developer's) (?:projects?|skills?|experience|education|resume|background|work)\b/.test(q)
    || /^(?:(?:show|list|tell me about|what are|what is|view|open) (?:me )?(?:the )?)?(?:projects?|portfolio|resume|skills|education|experience|contact)(?:[?!.]|$)/.test(q)
}

function previousContext(history) {
  for (const msg of [...history].reverse()) {
    if (msg.sender !== 'user') continue
    const project = findProject(msg.text)
    if (project) return { project, profile: true }
    const q = normalise(msg.text)
    if (profileQuestion(q)) return { profile: true, question: q }
    if (!followUp(q)) break
  }
  return {}
}

// This is a limited offline response, not a substitute for the live model.
export function fallbackReply(text, history = []) {
  const q = normalise(text)
  if (/^(?:hi|hello|hey|yo|sup|gm|good morning|good afternoon|good evening)[\s!.?]*$/.test(q)) return "Hey! How's it going?"
  if (/^(?:how are you|how's it going|how are you doing|what's up)[\s!.?]*$/.test(q)) return "I'm here and ready to help. How's your day going?"
  if (/^(?:thanks|thank you|thank you so much|thanks a lot|cheers)[\s!.?]*$/.test(q)) return "You're welcome!"
  if (/^(?:bye|goodbye|see you|good night)[\s!.?]*$/.test(q)) return 'Take care!'
  if (/\b(?:who are you|what can you do)\b/.test(q)) return "I'm the assistant on Shaurya's website. We can chat, work through a question, or explore his work when you'd like."

  const earlier = history.at(-1)?.sender === 'user' && history.at(-1).text === text ? history.slice(0, -1) : history
  const context = previousContext(earlier)
  const namedProject = findProject(text)
  const project = namedProject || (followUp(q) ? context.project : null)
  if (project) {
    if (/\b(?:stack|technologies|tools|built with)\b/.test(q)) return `${project.name} uses ${project.stack.join(', ')}.`
    if (/\b(?:github|source|repository|repo)\b/.test(q)) return `Here's the source for ${project.name}: ${project.sourceUrl}`
    if (/\b(?:demo|live|try it)\b/.test(q)) return project.liveUrl ? `You can view ${project.name} here: ${project.liveUrl}. ${project.scope}` : `${project.name} is a ${project.status.toLowerCase()}. ${project.availabilityNote || 'I do not have a public live demo in the saved record.'}`
    if (/\b(?:more|details|implementation|architecture)\b/.test(q)) return projectSummary(project)
    return `${project.name} — ${project.status}. ${project.problem}\n\n${project.decisions[0]} ${project.contribution}`
  }

  if (profileQuestion(q) || (followUp(q) && context.profile)) {
    const topic = profileQuestion(q) ? q : `${context.question || ''} ${q}`
    if (/\b(?:age|date of birth|dob|birthday|salary|availability|available)\b/.test(topic)) return "I don't have that confirmed detail about Shaurya, so I shouldn't guess. He can confirm it directly."
    if (/\b(?:experience|myperro|ieee|internship|job|career)\b/.test(topic)) return experienceSummary()
    if (/\b(?:education|college|university|cgpa|gpa|study|studying)\b/.test(topic)) return `${PROFILE.role}. ${PROFILE.education.join(' ')}.`
    if (/\bresume\b/.test(topic)) return `Here's Shaurya's resume: ${PROFILE.links.resume}`
    if (/\b(?:contact|email|phone|reach|number)\b/.test(topic)) return `You can reach Shaurya at ${PROFILE.email} or ${PROFILE.phone}. If you'd like me to prepare a message for him, just ask.`
    if (/\b(?:skills?|technologies|tech|stack|python|react)\b/.test(topic)) return Object.entries(PROFILE.skills).map(([category, skills]) => `${category}: ${skills.join(', ')}`).join('\n')
    if (/\b(?:ai|ml|rag|genai)\b/.test(topic)) return `His listed AI/ML tools include ${PROFILE.skills.aiMl.join(', ')}. Applied AI projects include ${PROJECTS.filter(p => p.category === 'Applied AI').map(p => p.name).join(', ')}.`
    if (/\b(?:projects?|work|portfolio|built)\b/.test(topic)) return PROJECTS.filter(p => p.featured).slice(0, 3).map(p => `${p.name} — ${p.status}. ${p.problem}`).join('\n\n')
    return PROFILE.summary.replace(/^I[’']m /, "Shaurya is ").replace(/\bI build\b/, 'He builds')
  }

  return "My live connection is unavailable right now, so I can't give that question a proper answer. Please try again in a moment."
}
