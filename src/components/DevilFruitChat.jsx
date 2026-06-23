import { useMemo, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { send } from '@emailjs/browser'
import { PROJECTS } from '../data/projects.js'

const EMAILJS = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qeqrp17',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_bu4ag6c',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'O2S5xMpkI3xI90ysE',
}

const GROQ_API_KEY =
  import.meta.env.VITE_GROQ_API_KEY ||
  import.meta.env.VITE_GROQ_KEY ||
  ''
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'
const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_GOOGLE_AI_API_KEY ||
  import.meta.env.VITE_GOOGLE_GENAI_API_KEY ||
  ''
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'

function initialAssistantStatus() {
  if (GROQ_API_KEY) return 'Groq conversation mode'
  if (GEMINI_API_KEY) return 'Gemini conversation mode'
  return 'Local context mode'
}

const PROFILE = {
  name: 'Kunwar Shaurya Pratap Singh',
  shortName: 'Shaurya',
  role: 'frontend developer, UI/UX designer, AI/ML engineer, and full-stack developer',
  summary: 'Shaurya is a second-year B.Tech CSE student at VIT Vellore specializing in AI & Data Engineering with production experience across frontend engineering, UI/UX, AI/ML, and full-stack products.',
  tagline: 'Designer by instinct. Developer by choice. AI/ML by curiosity.',
  email: 'kunwarshaurya28@gmail.com',
  phone: '+91 90580 75463',
  location: 'Meerut, Uttar Pradesh; currently Vellore, Tamil Nadu during college',
  education: [
    'VIT Vellore: B.Tech CSE, AI & Data Engineering, 2024-2028, CGPA 9.01/10',
    'White Lead Public School, Delhi: Class XII CBSE, 82%',
    "St. Mary's Convent Sr. Sec. School, Uttar Pradesh: Class X CBSE, 86%",
  ],
  focus: [
    'full-stack web development',
    'AI/ML and RAG systems',
    'frontend design and animation',
    'hackathon/event platforms',
    'blockchain-enabled systems',
  ],
  skills: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'C++', 'Java'],
    frontend: ['React.js', 'Tailwind CSS', 'Streamlit', 'Figma', 'Photoshop'],
    aiMl: ['LangChain', 'FAISS', 'XGBoost', 'Groq', 'RAG', 'TensorFlow'],
    blockchain: ['Solidity', 'Web3.py', 'Polygon'],
    tools: ['Git', 'GitHub', 'VS Code', 'Cursor', 'REST APIs'],
  },
  links: {
    resume: '/resume.pdf',
    portfolio: 'https://shauryaportfolio-sage.vercel.app',
    github: 'https://github.com/Shaurya002800',
    linkedin: 'https://www.linkedin.com/in/kunwar-shaurya-24581529b/',
    instagram: 'https://www.instagram.com/kunwar_shaurya_28/',
  },
}

const EXPERIENCE = [
  {
    org: 'MyPerro',
    title: 'Full-Time Frontend Developer & UI/UX Designer',
    period: 'August 2024 - Present',
    details: [
      'Sole frontend developer and design lead since the startup founding, owning product UI/UX, design systems, brand creatives, merchandise, packaging, and display assets.',
      'Built and shipped the product frontend using React.js, TypeScript, Tailwind CSS, and Figma.',
      'Worked directly with founders and supported brand/product assets featured on Shark Tank India Season 5 Campus Special.',
      'Grew social media presence across 3+ platforms through consistent design systems and campaigns.',
      'AI integration profile includes connecting personalization/model inference workflows to frontend clients through Python REST API style integrations.',
    ],
  },
  {
    org: 'IEEE Computer Society - VIT',
    title: 'Senior Core Member, Technical & Design',
    period: 'February 2025 - Present',
    details: [
      'Dual-domain senior core role covering technical and design responsibilities.',
      'Led frontend development and UI/UX for 3+ high-traffic chapter platforms and event websites.',
      'Shipped ieeecsvit.com and Hack Battle, serving 500+ participants with zero critical UI failures.',
      'Mentored 10+ junior developers across engineering and design domains.',
    ],
  },
]

const ACHIEVEMENTS = [
  'Shark Tank India Season 5 Campus Special: MyPerro merchandise, packaging, and brand assets featured nationally while Shaurya was a first-year student.',
  'IEEE CS-VIT Senior Core Member: selected as a dual-domain Technical & Design member.',
  "WomenTechies '26, GDG On Campus VIT: Certificate of Exemplary Performance as member of Team Togepi.",
  'Yantra 2026: Certificate of Participation, Brain to Brand Business Challenge at VIT Vellore.',
  'RIVIERA 2026: Certificate of Recognition as volunteer for the annual international sports and cultural fest.',
]

const INTERNSHIP_HUNT = [
  'Available May 9 - July 6, 2026; preferred remote, Bangalore, Hyderabad, or Delhi-NCR.',
  'Applied: Salesforce Software Engineer Intern, Oracle Intern Job ID 314122, Cisco Software Intern, Infosys InStep Tech Intern, Busibud UI/UX cum Product Designer, Assessli SDE Intern, ScientiFlow Scientific Tooling & UI/UX, Gurugram CyberPolice Cyber Security Intern.',
  'HardcoreAI AI Intern: interview scheduled.',
  'DekNek Full Stack Developer Intern: Round 2 assignment.',
  'Caterpillar Summer Internship 2028 Batch: registered.',
  'Google SWE Intern through Unstop: applying.',
]

const EXTRA_PROJECTS = [
  'Personal Portfolio Website: custom animated responsive portfolio with loader, vertical navigation, resume download, and UI/UX/front-end showcases.',
]

const QUICK_PROMPTS = [
  'Tell me about Shaurya',
  'Show strongest projects',
  'What AI/ML skills does he have?',
  'I want to contact Shaurya',
]

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function makeId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function message(sender, text, meta = {}) {
  return { id: makeId(), sender, text, ...meta }
}

function transcriptFrom(messages) {
  return messages
    .map((msg) => `${msg.sender === 'user' ? 'Visitor' : 'Portfolio Assistant'}: ${msg.text}`)
    .join('\n')
}

function portfolioKnowledge() {
  const projectLines = PROJECTS.map((project) => (
    `- ${project.name} (${project.year}): ${project.desc} Stack: ${project.stack.join(', ')}. Link: ${project.url || 'not provided'}.`
  )).join('\n')
  const experienceLines = EXPERIENCE.map((item) => (
    `- ${item.org}, ${item.title}, ${item.period}: ${item.details.join(' ')}`
  )).join('\n')

  return `
PROFILE
Name: ${PROFILE.name}
Goes by: ${PROFILE.shortName}
Role: ${PROFILE.role}
Summary: ${PROFILE.summary}
Tagline: ${PROFILE.tagline}
Email: ${PROFILE.email}
Phone: ${PROFILE.phone}
Location: ${PROFILE.location}
Focus: ${PROFILE.focus.join(', ')}
Links: Portfolio ${PROFILE.links.portfolio}; LinkedIn ${PROFILE.links.linkedin}; GitHub ${PROFILE.links.github}; Instagram ${PROFILE.links.instagram}

EDUCATION
${PROFILE.education.map((item) => `- ${item}`).join('\n')}

EXPERIENCE
${experienceLines}

SKILLS
Languages: ${PROFILE.skills.languages.join(', ')}
Frontend and design: ${PROFILE.skills.frontend.join(', ')}
AI/ML: ${PROFILE.skills.aiMl.join(', ')}
Blockchain: ${PROFILE.skills.blockchain.join(', ')}
Tools: ${PROFILE.skills.tools.join(', ')}

PROJECTS
${projectLines}
${EXTRA_PROJECTS.map((item) => `- ${item}`).join('\n')}

ACHIEVEMENTS
${ACHIEVEMENTS.map((item) => `- ${item}`).join('\n')}

INTERNSHIP HUNT SUMMER 2026
${INTERNSHIP_HUNT.map((item) => `- ${item}`).join('\n')}

CONTACT POLICY
If someone wants to contact, hire, collaborate, recruit, interview, offer an internship, or asks Shaurya to call them, collect their name, any contact method, and the message. The UI sends the full transcript to Shaurya.
UNKNOWN FACTS
This portfolio does not provide Shaurya's age or date of birth. If asked, say age is not listed. Do not infer it from school year. For the latest internship or availability updates, suggest contacting Shaurya because statuses may change.

STYLE
Be conversational and adaptive, like a smaller ChatGPT. Answer the exact question first. Use the previous chat naturally. Ask a short follow-up only when it helps. Do not sound like a static FAQ. Do not repeat the same intro.
Do not invent internships, awards, company names, education details, ages, salaries, or private facts beyond this knowledge base.
`.trim()
}

function wantsContact(text) {
  const q = normalize(text)
  const hasPhone = Boolean(extractPhone(text))
  const hasInternshipOffer = q.includes('internship') && [
    'got', 'have', 'offer', 'opportunity', 'for him', 'for shaurya',
  ].some((term) => q.includes(term))

  if (hasPhone || hasInternshipOffer) return true

  return [
    'contact', 'hire', 'recruit', 'interview', 'collaborate', 'collab',
    'message shaurya', 'reach out', 'get in touch', 'email shaurya',
    'talk to shaurya', 'work with', 'call me', 'call back', 'call on',
    'my number', 'phone number', 'whatsapp', 'opportunity for him',
    'opportunity for shaurya',
  ].some((term) => q.includes(term))
}

function isGenericContactIntent(text) {
  const q = normalize(text)
  const wordCount = q.split(' ').filter(Boolean).length
  const genericTerms = [
    'contact', 'hire', 'recruit', 'interview', 'collaborate', 'collab',
    'message shaurya', 'reach out', 'get in touch', 'email shaurya',
    'talk to shaurya',
  ]
  return genericTerms.some((term) => q === term || q === `i want to ${term}`) && wordCount <= 6
}

function isNegative(text) {
  return /^(no|nope|cancel|stop|wait|not yet|don't|do not)\b/i.test(text.trim())
}

function extractEmail(text) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || ''
}

function extractPhone(text) {
  const match = text.match(/(?:\+?\d[\d\s-]{7,}\d)/)
  if (!match) return ''
  const phone = match[0].replace(/[^\d+]/g, '')
  const digitCount = phone.replace(/\D/g, '').length
  return digitCount >= 8 && digitCount <= 15 ? phone : ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone) {
  const digitCount = phone.replace(/\D/g, '').length
  return digitCount >= 8 && digitCount <= 15
}

function extractName(text) {
  const match = text.match(/\b(?:my name is|my name|share my name|i am|i'm|this is|name is|name:)\s+([a-z][a-z\s.'-]{1,42})/i)
  if (!match) return ''
  return match[1].replace(/\b(email|message|contact|hire|for|he|she|they|knows|know)\b.*$/i, '').trim()
}

function cleanLeadMessage(text) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '')
    .replace(/(?:\+?\d[\d\s-]{7,}\d)/g, '')
    .replace(/\b(?:my name is|my name|share my name|i am|i'm|this is|name is|name:)\s+[a-z][a-z\s.'-]{1,42}/ig, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function missingLeadField(lead) {
  if (!lead.name.trim()) return 'name'
  if (!isValidEmail(lead.email) && !isValidPhone(lead.phone)) return 'contact'
  if (!lead.message.trim()) return 'message'
  return null
}

function fieldPrompt(field) {
  if (field === 'name') return 'Sure. What name should I attach to the message?'
  if (field === 'contact') return 'Got it. What phone number or email should Shaurya use to reply?'
  return 'Perfect. What should I tell Shaurya? A short message is enough.'
}

function mergeLeadFromText(lead, text, expectedField) {
  const next = { ...lead }
  const email = extractEmail(text)
  const phone = extractPhone(text)
  const name = extractName(text)
  const cleaned = cleanLeadMessage(text)

  if (email) next.email = email
  if (phone) next.phone = phone

  if (expectedField === 'name') {
    if (name) next.name = name
    else if (!email && !phone) next.name = text.trim()
  }
  else if (expectedField === 'contact') {
    if (!email && !phone) next.phone = text.trim()
  }
  else if (expectedField === 'message') next.message = text.trim()
  else {
    if (name) next.name = name
    if (cleaned && cleaned.length > 12 && !isGenericContactIntent(cleaned)) {
      next.message = cleaned
    }
  }

  return next
}

function projectMatch(text) {
  const q = normalize(text)
  return PROJECTS.find((project) => normalize(project.name).split(' ').some((part) => part && q.includes(part)))
}

function lastUserMessages(history) {
  return history
    .filter((msg) => msg.sender === 'user')
    .map((msg) => msg.text)
}

function lastMentionedProject(history) {
  const userMessages = lastUserMessages(history).reverse()
  for (const text of userMessages) {
    const matched = projectMatch(text)
    if (matched) return matched
  }
  return null
}

function lastPortfolioTopic(history) {
  const joined = lastUserMessages(history).slice(-4).join(' ')
  const q = normalize(joined)
  if (q.includes('ai') || q.includes('ml') || q.includes('rag') || q.includes('genai')) return 'ai'
  if (q.includes('project') || q.includes('work') || q.includes('portfolio')) return 'projects'
  if (q.includes('skill') || q.includes('tech') || q.includes('stack')) return 'skills'
  if (q.includes('about') || q.includes('who') || q.includes('shaurya')) return 'about'
  return null
}

function bestProjectForQuestion(text) {
  const q = normalize(text)
  if (q.includes('exam') || q.includes('credential') || q.includes('verifiable')) return PROJECTS.find((project) => project.name === 'ExamChain') || PROJECTS[0]
  if (q.includes('ai') || q.includes('ml') || q.includes('rag') || q.includes('astrology')) return PROJECTS.find((project) => project.name === 'Serenova Engine') || PROJECTS[3]
  if (q.includes('full stack') || q.includes('backend') || q.includes('marketplace')) return PROJECTS.find((project) => project.name === 'DevBoard') || PROJECTS[2]
  if (q.includes('startup') || q.includes('spend') || q.includes('saas')) return PROJECTS.find((project) => project.name === 'SpendLens') || PROJECTS[4]
  if (q.includes('notes') || q.includes('auth') || q.includes('productivity')) return PROJECTS.find((project) => project.name === 'Peblo Notes') || PROJECTS[5]
  if (q.includes('blockchain') || q.includes('iot') || q.includes('security')) return PROJECTS.find((project) => project.name === 'SentinelMesh') || PROJECTS[0]
  return PROJECTS.find((project) => project.name === 'ExamChain') || PROJECTS[0]
}

function projectSummary(project) {
  return `${project.name} (${project.year}) is ${project.desc} Stack: ${project.stack.join(', ')}.${project.url && project.url !== '#' ? ` Link: ${project.url}` : ''}`
}

function isUnknownProfileFactQuestion(text) {
  const q = normalize(text)
  return ['age', 'date of birth', 'dob', 'birthday', 'salary'].some((term) => q.includes(term))
}

function asksForOpinion(text) {
  const q = normalize(text)
  return ['should i', 'would you', 'is he good', 'fit for', 'hire him', 'recommend', 'worth'].some((term) => q.includes(term))
}

function fallbackReply(text, history = []) {
  const q = normalize(text)
  const matchedProject = projectMatch(text)
  const previousProject = lastMentionedProject(history.slice(0, -1))
  const previousTopic = lastPortfolioTopic(history.slice(0, -1))
  const asksFollowUp = [
    'tell me more', 'more about it', 'explain', 'why', 'how', 'what about',
    'details', 'which one', 'best', 'strongest', 'that project', 'it',
  ].some((term) => q.includes(term))

  if (/^(hi|hello|hey|yo|sup|gm|good morning|good evening|good afternoon)\b/.test(q)) {
    return `Hey, I'm here. Ask me anything about Shaurya's projects, skills, AI/ML work, experience, resume, or internship hunt. I can also help you send him a message.`
  }

  if (matchedProject) {
    return projectSummary(matchedProject)
  }

  if (isUnknownProfileFactQuestion(text)) {
    return `I do not have Shaurya's age or date of birth in the profile, so I should not guess. I can answer verified things like his education, MyPerro experience, IEEE CS-VIT role, projects, skills, and internship hunt status.`
  }

  if (q.includes('internship') || q.includes('intern')) {
    return `For Summer 2026, Shaurya is available from May 9 to July 6 and is targeting remote, Bangalore, Hyderabad, or Delhi-NCR roles. Current listed status: HardcoreAI AI Intern interview scheduled, DekNek Full Stack Developer Intern Round 2 assignment, several applications submitted including Salesforce, Oracle, Cisco, Infosys InStep, Busibud, Assessli, ScientiFlow, Caterpillar, Google SWE via Unstop, and Gurugram CyberPolice.`
  }

  if (q.includes('experience') || q.includes('myperro') || q.includes('job')) {
    return `Shaurya has full-time startup experience at MyPerro since August 2024 as the sole frontend developer and UI/UX design lead. He built the product frontend with React, TypeScript, Tailwind, and Figma, worked directly with founders, and created brand assets featured on Shark Tank India Season 5 Campus Special. He is also a Senior Core Member at IEEE CS-VIT in Technical & Design.`
  }

  if (q.includes('education') || q.includes('college') || q.includes('cgpa') || q.includes('gpa')) {
    return `Shaurya is pursuing B.Tech CSE with specialization in AI & Data Engineering at VIT Vellore from 2024 to 2028, with a CGPA of 9.01/10. Earlier, he scored 82% in Class XII CBSE and 86% in Class X CBSE.`
  }

  if (asksFollowUp && previousProject) {
    return `${previousProject.name} is worth expanding on because it shows both execution and product thinking. ${previousProject.desc} The stack is ${previousProject.stack.join(', ')}, so visitors can see the technical choices instead of just a polished UI.${previousProject.url && previousProject.url !== '#' ? ` You can open it here: ${previousProject.url}` : ''}`
  }

  if (asksForOpinion(text)) {
    return `Based on this portfolio, Shaurya looks strongest for roles or collaborations that need product engineering plus AI/security thinking. I would judge him by ExamChain for ambitious system design, DevBoard for full-stack execution, Serenova Engine for deterministic AI-assisted domain logic, and SentinelMesh for hardware/security ambition.`
  }

  if ((q.includes('best') || q.includes('strongest') || q.includes('which one')) && (previousTopic === 'projects' || q.includes('project'))) {
    const best = bestProjectForQuestion(text)
    return `For a first impression, I would lead with ${best.name}. ${best.desc} It gives Shaurya a strong story because it connects real problem-solving with a clear technical stack: ${best.stack.join(', ')}.`
  }

  if (q.includes('project') || q.includes('work') || q.includes('portfolio')) {
    const topProjects = PROJECTS.slice(0, 4)
      .map((project) => `${project.name}: ${project.desc}`)
      .join('\n\n')
    return `Here are strong portfolio highlights:\n\n${topProjects}\n\nAsk about any project name and I can break down stack, purpose, and impact.`
  }

  if (asksFollowUp && previousTopic === 'skills') {
    return `The strongest combination is frontend polish plus AI/ML systems. Shaurya can design the interface, build it in React/Tailwind, and connect AI pieces like LangChain, FAISS, Groq, XGBoost, or TensorFlow when the product needs intelligence.`
  }

  if (asksFollowUp && previousTopic === 'ai') {
    return `The AI/ML side is strongest around practical applied systems: Serenova Engine for deterministic chart computation plus guarded LLM interpretation, Vivayu for RAG and crop guidance, SpendLens for AI-assisted business recommendations, and SentinelMesh for edge inference with TensorFlow Lite Micro.`
  }

  if (q.includes('skill') || q.includes('tech') || q.includes('stack')) {
    return `Shaurya's core stack is React, Tailwind, JavaScript/TypeScript, Python, LangChain, FAISS, XGBoost, Groq, TensorFlow, Solidity, Web3.py, Git, and REST APIs. His strongest mix is frontend polish plus AI/ML product thinking.`
  }

  if (q.includes('ai') || q.includes('ml') || q.includes('rag') || q.includes('genai')) {
    return `On AI/ML, Shaurya has worked with LangChain, FAISS, RAG, Groq, XGBoost, TensorFlow, and TFLite. Vivayu shows RAG and crop-disease intelligence; SentinelMesh shows on-device AI inference and autonomous threat intelligence.`
  }

  if (q.includes('about') || q.includes('who') || q.includes('shaurya')) {
    return `${PROFILE.name} is a ${PROFILE.role}. ${PROFILE.tagline} He focuses on polished web interfaces, AI/ML systems, and creative interactive experiences like this Grand Line portfolio.`
  }

  if (q.includes('resume')) {
    return `You can open Shaurya's resume from the portfolio at ${PROFILE.links.resume}. I can also summarize his projects or skills here.`
  }

  if (q.includes('thanks') || q.includes('thank you')) {
    return `Anytime. I can keep going on projects, skills, resume fit, or help you send Shaurya a message.`
  }

  return `I can help with Shaurya's projects, skills, AI/ML work, frontend/design experience, resume, or contact handoff. Try asking about DevBoard, Vivayu, SentinelMesh, or how to reach Shaurya.`
}

function buildSystemInstruction() {
  return `
You are Shaurya's live portfolio assistant.
Act like a smaller, focused ChatGPT: conversational, spontaneous, context-aware, and natural, not a menu bot.
Answer the user's exact question first, then add useful detail from the portfolio.
Use the recent chat to understand pronouns and follow-ups like "what about it", "tell me more", "which is best", and "why".
For greetings, reply warmly and briefly instead of dumping the whole profile.
If the portfolio does not verify something, say that clearly. Never invent internships, education, company history, phone number, email, awards, or private facts.
Tone: warm, confident, clear, lightly adventurous only when it fits. Do not force pirate language.
Length: usually 2-5 sentences. Longer only when the user asks for deep detail.

PORTFOLIO KNOWLEDGE:
${portfolioKnowledge()}
`.trim()
}

function messagesForGroq(history) {
  return history
    .filter((msg) => msg.text && msg.sender !== 'system')
    .slice(-14)
    .map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))
}

async function generateGroqReply(userText, history) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: buildSystemInstruction() },
        ...messagesForGroq(history),
      ],
      temperature: 0.82,
      top_p: 0.95,
      max_tokens: 430,
      presence_penalty: 0.2,
      frequency_penalty: 0.15,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Groq request failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || fallbackReply(userText, history)
}

async function generateGeminiReply(userText, history) {
  const systemInstruction = buildSystemInstruction()

  const contents = history
    .filter((msg) => msg.text && msg.sender !== 'system')
    .slice(-12)
    .map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }))

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
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
    const errorText = await response.text().catch(() => '')
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallbackReply(userText, history)
}

async function generateReply(userText, history) {
  if (GROQ_API_KEY) {
    try {
      return {
        text: await generateGroqReply(userText, history),
        provider: 'Groq conversation mode',
      }
    } catch (err) {
      console.error(err)
      if (!GEMINI_API_KEY) {
        return {
          text: fallbackReply(userText, history),
          provider: 'Local fallback - check Groq API',
        }
      }
    }
  }

  if (GEMINI_API_KEY) {
    try {
      return {
        text: await generateGeminiReply(userText, history),
        provider: 'Gemini conversation mode',
      }
    } catch (err) {
      console.error(err)
      return {
        text: fallbackReply(userText, history),
        provider: 'Local fallback - check Gemini API',
      }
    }
  }

  return {
    text: fallbackReply(userText, history),
    provider: 'Local context mode',
  }
}

async function sendContactLead({ lead, chat }) {
  const contact = [
    lead.email && `Email: ${lead.email}`,
    lead.phone && `Phone: ${lead.phone}`,
  ].filter(Boolean).join('\n') || 'Contact method not provided'
  const replyTo = isValidEmail(lead.email) ? lead.email : PROFILE.email

  const body = [
    '--- NEW PORTFOLIO CONTACT HANDOFF ---',
    '',
    `Name: ${lead.name}`,
    contact,
    `Message: ${lead.message}`,
    '',
    '--- CHAT TRANSCRIPT ---',
    transcriptFrom(chat),
  ].join('\n')

  return send(
    EMAILJS.serviceId,
    EMAILJS.templateId,
    {
      message: body,
      from_name: lead.name || 'Portfolio visitor',
      reply_to: replyTo,
      visitor_email: lead.email || '',
      visitor_phone: lead.phone || '',
      visitor_contact: [lead.email, lead.phone].filter(Boolean).join(' / '),
      visitor_message: lead.message,
    },
    { publicKey: EMAILJS.publicKey },
  )
}

export default function OnePieceChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    message(
      'crew',
      "Ahoy. I'm Shaurya's portfolio assistant. Ask me about his projects, skills, AI/ML work, or I can help you send him a message.",
    ),
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [assistantStatus, setAssistantStatus] = useState(initialAssistantStatus)
  const [contactFlow, setContactFlow] = useState({
    active: false,
    expectedField: null,
    lead: { name: '', email: '', phone: '', message: '' },
  })
  const chatEndRef = useRef(null)

  const inputPlaceholder = useMemo(() => {
    if (!contactFlow.active) return 'Ask about Shaurya...'
    return contactFlow.expectedField === 'contact'
      ? 'Phone number or email'
      : contactFlow.expectedField === 'name'
        ? 'Your name'
        : 'Your message for Shaurya'
  }, [contactFlow])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    window.__PORTFOLIO_CHAT_ACTIVE__ = isOpen
    window.dispatchEvent(new Event('portfolio-chat-state-change'))
    return () => {
      window.__PORTFOLIO_CHAT_ACTIVE__ = false
      window.dispatchEvent(new Event('portfolio-chat-state-change'))
    }
  }, [isOpen])

  const appendBot = (text, meta) => {
    setMessages((prev) => [...prev, message('crew', text, meta)])
  }

  const resetContactFlow = () => {
    setContactFlow({
      active: false,
      expectedField: null,
      lead: { name: '', email: '', phone: '', message: '' },
    })
  }

  const sendLeadNow = async (lead, chat) => {
    try {
      await sendContactLead({ lead, chat })
      appendBot("Done. I sent Shaurya the full chat history with your contact details, so he can follow up directly.")
    } catch (err) {
      console.error(err)
      appendBot("I could not send the handoff right now. Please try again in a moment, or use the portfolio links while I steady the connection.")
    } finally {
      resetContactFlow()
    }
  }

  const beginContactFlow = async (userText, chat) => {
    const lead = mergeLeadFromText(
      { name: '', email: '', phone: '', message: '' },
      userText,
      null,
    )
    const missing = missingLeadField(lead)

    if (missing) {
      setContactFlow({
        active: true,
        expectedField: missing,
        lead,
      })
      appendBot(fieldPrompt(missing))
      return
    }

    await sendLeadNow(lead, chat)
  }

  const handleContactStep = async (userText, chat) => {
    if (isNegative(userText)) {
      resetContactFlow()
      appendBot('No problem. I cancelled the handoff. You can still ask me anything about Shaurya.')
      return
    }

    const lead = mergeLeadFromText(contactFlow.lead, userText, contactFlow.expectedField)
    const missing = missingLeadField(lead)

    if (missing) {
      setContactFlow({
        active: true,
        expectedField: missing,
        lead,
      })
      appendBot(fieldPrompt(missing))
      return
    }

    await sendLeadNow(lead, chat)
  }

  const submitText = async (rawText) => {
    const userText = rawText.trim()
    if (!userText || isTyping) return

    const userEntry = message('user', userText)
    const chat = [...messages, userEntry]

    setMessages(chat)
    setInput('')
    setIsTyping(true)

    try {
      if (contactFlow.active) {
        await handleContactStep(userText, chat)
      } else if (wantsContact(userText)) {
        await beginContactFlow(userText, chat)
      } else {
        const reply = await generateReply(userText, chat)
        setAssistantStatus(reply.provider)
        appendBot(reply.text)
      }
    } catch (err) {
      console.error(err)
      setAssistantStatus(GROQ_API_KEY || GEMINI_API_KEY ? 'Local fallback - check API' : 'Local context mode')
      appendBot(fallbackReply(userText, chat))
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = (event) => {
    event.preventDefault()
    submitText(input)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitText(input)
    }
  }

  return (
    <div
      data-chatbot-root="true"
      onKeyDownCapture={(event) => event.stopPropagation()}
      onKeyUpCapture={(event) => event.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 999999,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            style={{
              width: 'min(390px, calc(100vw - 28px))',
              height: 'min(610px, calc(100vh - 110px))',
              position: 'absolute',
              bottom: 0,
              right: 0,
              overflow: 'hidden',
              borderRadius: '22px',
              background: 'linear-gradient(180deg, #fbf5e5 0%, #f0dfb8 100%)',
              border: '2px solid #5c3519',
              boxShadow: '0 22px 56px rgba(44, 27, 14, 0.24), 0 6px 18px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(rgba(92,58,31,0.035) 1.5px, transparent 1.5px)',
                backgroundSize: '9px 9px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <div
              style={{
                padding: '18px 20px',
                background: 'rgba(255, 255, 255, 0.36)',
                borderBottom: '1px solid rgba(92,58,31,0.13)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="/image.png"
                  alt="Assistant avatar"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '1.5px solid #5c3519',
                    background: '#fff',
                  }}
                />
                <div>
                  <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '1.04rem', color: '#321806', fontWeight: 800 }}>
                    Shaurya Assistant
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#765640', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#32a852', display: 'inline-block' }} />
                    {assistantStatus}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(92,53,25,0.08)',
                  border: '1px solid rgba(92,53,25,0.12)',
                  color: '#4a260f',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
                aria-label="Close chat"
              >
                x
              </button>
            </div>

            <div
              className="scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                zIndex: 2,
              }}
            >
              {messages.map((msg) => {
                const isUser = msg.sender === 'user'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}
                  >
                    <div
                      style={{
                        maxWidth: '84%',
                        whiteSpace: 'pre-wrap',
                        padding: '11px 14px',
                        borderRadius: isUser ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
                        background: isUser ? '#4a2b18' : 'rgba(255, 255, 255, 0.72)',
                        color: isUser ? '#fff4dd' : '#281305',
                        border: isUser ? 'none' : '1px solid rgba(92,58,31,0.08)',
                        lineHeight: 1.48,
                        fontSize: '0.9rem',
                        boxShadow: isUser ? '0 5px 14px rgba(74,43,24,0.18)' : '0 5px 14px rgba(0,0,0,0.035)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                )
              })}

              {isTyping && (
                <div style={{ display: 'flex', gap: '5px', marginLeft: '4px', padding: '4px 0' }}>
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: dot * 0.15, ease: 'easeInOut' }}
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7d6049' }}
                    />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {!contactFlow.active && (
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '0 20px 12px',
                zIndex: 2,
              }}>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => submitText(prompt)}
                    disabled={isTyping}
                    style={{
                      flex: '0 0 auto',
                      border: '1px solid rgba(92,53,25,0.2)',
                      background: 'rgba(255,255,255,0.42)',
                      color: '#4a260f',
                      borderRadius: '999px',
                      padding: '7px 10px',
                      fontSize: '0.74rem',
                      cursor: isTyping ? 'default' : 'pointer',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSend}
              style={{
                padding: '16px 20px 18px',
                background: 'rgba(255, 255, 255, 0.22)',
                borderTop: '1px solid rgba(92,58,31,0.08)',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  background: '#fff',
                  border: contactFlow.active ? '1.5px solid #2f7b3f' : '1.5px solid rgba(92,58,31,0.16)',
                  borderRadius: '15px',
                  padding: '5px 6px 5px 14px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
                }}
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputPlaceholder}
                  disabled={isTyping}
                  rows={1}
                  style={{
                    flex: 1,
                    minHeight: '34px',
                    maxHeight: '86px',
                    resize: 'none',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    color: '#281305',
                    fontSize: '0.9rem',
                    lineHeight: '1.35',
                    padding: '8px 8px 7px 0',
                    fontFamily: 'inherit',
                  }}
                />

                <button
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '11px',
                    border: 'none',
                    background: input.trim() && !isTyping ? '#4a2b18' : '#d5c8b5',
                    color: '#fff',
                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                    fontSize: '0.9rem',
                  }}
                  aria-label="Send message"
                >
                  {'>'}
                </button>
              </div>
              <div style={{
                marginTop: '8px',
                fontSize: '0.68rem',
                color: '#7c6049',
                lineHeight: 1.35,
              }}>
                Contact handoffs are sent to Shaurya only after you confirm.
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: '70px',
              height: '70px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              padding: 0,
              zIndex: 3,
            }}
            aria-label="Open portfolio assistant"
          >
            <img
              src="/image 53.png"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <style>
        {`
          .scrollbar::-webkit-scrollbar { width: 5px; }
          .scrollbar::-webkit-scrollbar-thumb {
            background: rgba(92, 58, 31, 0.16);
            border-radius: 10px;
          }
          .scrollbar::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>
    </div>
  )
}
