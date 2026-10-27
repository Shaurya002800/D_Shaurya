import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { PROFILE, EXPERIENCE } from '../src/data/profile.js'
import { PROJECTS, FEATURED_PROJECTS, PROJECT_GALLERY_SPOTS } from '../src/data/projects.js'
import { portfolioKnowledge, projectSummary } from '../src/data/knowledge.js'
import { portfolioStructuredData } from '../src/data/metadata.js'

test('profile chronology is shared and completed IEEE tenure is explicit', () => {
  const ieee = EXPERIENCE.find(role => role.org.startsWith('IEEE'))
  assert.equal(ieee.endedOn, '2026-10-26')
  assert.equal(ieee.period, 'February 2025–October 2026')
  assert.equal(ieee.status, 'Completed tenure')
  assert.equal(PROFILE.academics.dsa, '300+')
  assert.equal(PROFILE.academics.years, '2024–2028')
  assert(!PROFILE.role.includes('UI/UX'))
  const knowledge = portfolioKnowledge()
  assert(knowledge.includes('part-time internship through December 2025'))
  assert(knowledge.includes('now occasional contributions'))
  assert(knowledge.includes(ieee.period))
  assert(!knowledge.includes('February 2025 - Present'))
})

test('archive contracts retain eight physical posters while all dossiers carry evidence', () => {
  assert(FEATURED_PROJECTS.length >= 6 && FEATURED_PROJECTS.length <= 8)
  assert.equal(PROJECT_GALLERY_SPOTS.length, FEATURED_PROJECTS.length)
  assert.equal(new Set(PROJECTS.map(p => p.id)).size, PROJECTS.length)
  for (const spot of PROJECT_GALLERY_SPOTS) assert(PROJECTS[spot.projectIndex].featured)
  for (const project of PROJECTS) {
    assert(project.problem && project.contribution && project.status && project.scope)
    assert(project.decisions.length >= 2 && project.decisions.length <= 3)
    assert(project.sourceUrl.startsWith('https://github.com/Shaurya002800/'))
    assert(project.stack.length && project.evidence.length)
    assert(existsSync(new URL('../public' + project.image, import.meta.url)), project.name + ' screenshot missing')
    assert(!('bounty' in project))
    assert(!projectSummary(project).includes('serialization'))
  }
  const peblo = PROJECTS.find(p => p.id === 'peblo-notes')
  assert.equal(peblo.liveUrl, 'https://ai-powered-learning-universe.vercel.app/')
  assert(peblo.sourceUrl.endsWith('/AI-powered-learning-universe'))
  for (const id of ['examchain', 'sentinelmesh', 'loadright', 'astrasafe']) {
    const project = PROJECTS.find(p => p.id === id)
    assert(project.contribution.startsWith('Contributed to this team project'))
    assert(project.scope.toLowerCase().includes('prototype') || project.scope.toLowerCase().includes('simulation'))
  }
  for (const id of ['mtr-kv', 'topopatch']) assert.equal(PROJECTS.find(p => p.id === id).status, 'Research experiment')
})

test('metadata and assistant use the archive count and factual scopes', () => {
  const schema = portfolioStructuredData()
  assert.equal(schema['@graph'][1].mainEntity.numberOfItems, PROJECTS.length)
  const knowledge = portfolioKnowledge()
  for (const project of PROJECTS) {
    assert(knowledge.includes(project.status))
    assert(knowledge.includes(project.sourceUrl))
    assert(knowledge.includes(project.scope))
  }
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert(html.includes('https://d-shaurya.vercel.app/'))
  assert(!html.includes('shipped full-stack'))
})

test('assistant project lookup does not mistake role words or a slash for a project', async () => {
  const { findProject } = await import('../src/data/knowledge.js')
  assert.equal(findProject('What engineering experience does he have at MyPerro?'), undefined)
  assert.equal(findProject('What are his AI/ML skills?'), undefined)
  assert.equal(findProject('Tell me about the Vivayu prototype').id, 'vivayu')
  assert.equal(findProject('What is TopoPatch?').id, 'topopatch')
  assert.equal(findProject('Show MTR-KV').id, 'mtr-kv')
})
