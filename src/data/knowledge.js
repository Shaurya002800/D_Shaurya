import { PROFILE, EXPERIENCE, ACHIEVEMENTS } from './profile.js'
import { PROJECTS } from './projects.js'

export function projectSummary(project) {
  return `${project.name} — ${project.status}. ${project.problem} Implementation: ${project.decisions.join(' ')} Contribution: ${project.contribution} Scope: ${project.scope}${project.availabilityNote ? ` Availability: ${project.availabilityNote}` : ''} Technologies: ${project.stack.join(', ')}.${project.liveUrl ? ` Live demo: ${project.liveUrl}.` : ''} Source code: ${project.sourceUrl}.`
}

export function experienceSummary() {
  return EXPERIENCE.map(item => `${item.org}: ${item.title} (${item.period}; ${item.status}). ${item.details.join(' ')}${item.dateNote ? ` ${item.dateNote}` : ''}`).join('\n')
}

export function portfolioKnowledge() {
  return `You are the assistant for ${PROFILE.name}'s portfolio. Use only the factual record below. Answer the visitor's question directly and conversationally.
PROFILE
Name: ${PROFILE.name}; goes by ${PROFILE.shortName}.
Introduction, in Shaurya's own words: ${PROFILE.summary}
Role: ${PROFILE.role}
Education: ${PROFILE.education.join('; ')}
Email: ${PROFILE.email}; phone: ${PROFILE.phone}; location: ${PROFILE.location}
Portfolio: ${PROFILE.links.portfolio}; GitHub: ${PROFILE.links.github}; LinkedIn: ${PROFILE.links.linkedin}; Resume: ${PROFILE.links.resume}
EXPERIENCE
${experienceSummary()}
IEEE tenure ended on 26 October 2026. Never describe him as a current IEEE Senior Core Member.
MyPerro: part-time internship through December 2025; full-time core-member involvement began in 2026; now occasional contributions when relevant work arises. Do not infer an end date or paid status. Exact transition months are not supplied.
PROJECTS (${PROJECTS.length} dossiers)
${PROJECTS.map(projectSummary).join('\n\n')}
CREDITS
${ACHIEVEMENTS.join('\n')}
SKILLS
${Object.entries(PROFILE.skills).map(([category, skills]) => `${category}: ${skills.join(', ')}`).join('\n')}
BOUNDARIES
Distinguish deployed demos, prototypes, pilot-stage tools, synthetic simulations and research experiments. Deployment of a frontend does not certify the backend or production readiness. SpendLens calculations are deterministic; an LLM explains them with a fallback. Serenova calculations and rules are deterministic; optional LLM synthesis does not provide scientific validation. MTR-KV and TopoPatch are research experiments. AstraSafe and the linked AURA implementation use synthetic demonstrations. Do not mix AURA versions or different Vivayu repositories.
ExamChain, SentinelMesh, LoadRight and AstraSafe are team projects. Say contributed to; do not claim individual module ownership or personal impact metrics without confirmation. Do not invent users, revenue, latency, accuracy, awards, employment dates or current availability. Ask the visitor to contact Shaurya for facts not in this record. Age and date of birth are not supplied.
CONTACT
The interface may prepare a contact handoff, but it sends only after the visitor explicitly confirms. Never claim a message was sent unless the interface confirms success.`
}

export function findProject(text) {
  const query = text.toLowerCase()
  return PROJECTS.find(project => {
    const aliases = [project.id, project.name, project.id.replaceAll('-', ' ')]
    if (project.id === 'vivayu') aliases.push('agrigpt')
    if (project.id === 'peblo-notes') aliases.push('peblo')
    return aliases.some(alias => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`\\b${escaped}\\b`, 'i').test(query)
    })
  })
}
