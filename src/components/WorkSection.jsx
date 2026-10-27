import MobileControls from './MobileControls.jsx'
import { useEffect, useRef, useState } from 'react'
import { PROJECTS, FEATURED_PROJECTS } from '../data/projects.js'
import './WorkSection.css'
import './ProjectArchive.css'
import MangaProjectPage from './MangaProjectPage.jsx'
import './MangaArchive.css'
import { useDialog } from '../hooks/useDialog.js'

// ─────────────────────────────────────────────────────────────────────
// TIMING CONSTANTS
// ─────────────────────────────────────────────────────────────────────
const TRANSITION_MS = 300
const LABEL_DELAY_MS = 380

// ─────────────────────────────────────────────────────────────────────
// WORK TRANSITION OVERLAY
// ─────────────────────────────────────────────────────────────────────
export function WorkTransitionOverlay({ active }) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef([])

  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = [] }

  useEffect(() => {
    clearTimers()
    if (active) {
      timerRef.current.push(setTimeout(() => setMounted(true), 0))
      timerRef.current.push(setTimeout(() => setVisible(true), 16))
      timerRef.current.push(setTimeout(() => setVisible(false), TRANSITION_MS + 80))
      timerRef.current.push(setTimeout(() => setMounted(false), TRANSITION_MS + 600))
    } else {
      timerRef.current.push(setTimeout(() => setVisible(false), 0))
      timerRef.current.push(setTimeout(() => setMounted(false), 500))
    }
    return clearTimers
  }, [active])

  if (!mounted) return null
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9900,
        background: '#0a0d14',
        opacity: visible ? 1 : 0,
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: 'none',
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────
// WORK SECTION LABEL
// ─────────────────────────────────────────────────────────────────────
export function WorkSectionLabel({ active }) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef([])

  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = [] }

  useEffect(() => {
    clearTimers()
    if (active) {
      timerRef.current.push(setTimeout(() => setMounted(true), 0))
      timerRef.current.push(setTimeout(() => setVisible(true), LABEL_DELAY_MS))
    } else {
      timerRef.current.push(setTimeout(() => setVisible(false), 0))
      timerRef.current.push(setTimeout(() => setMounted(false), 500))
    }
    return clearTimers
  }, [active])

  if (!mounted) return null
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 8500,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{
        marginTop: '24px',
        display: 'grid',
        gap: '3px',
        justifyItems: 'center',
        padding: '8px 28px 10px',
        background: 'rgba(10, 15, 24, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(242, 200, 97, 0.28)',
        borderRadius: '8px',
        fontFamily: '"Courier New", Courier, monospace',
        textTransform: 'uppercase',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(242, 200, 97, 0.08)',
      }}>
        <span style={{
          color: 'rgba(255, 248, 226, 0.72)',
          fontSize: '8px',
          fontWeight: 800,
          letterSpacing: '3px',
        }}>
          Projects
        </span>
        <strong style={{
          color: '#f2c861',
          fontSize: '12px',
          letterSpacing: '4px',
        }}>
          Wanted Poster Archive
        </strong>
      </div>
    </div>
  )
}

const FILTERS = ['Featured', 'All Projects', 'Web Products', 'Applied AI', 'Systems', 'Research']

function projectsForFilter(filter) {
  return filter === 'Featured' ? FEATURED_PROJECTS : filter === 'All Projects' ? PROJECTS : PROJECTS.filter(project => project.category === filter)
}

function ArchiveBrowser({ onClose, onExplore, worldAvailable }) {
  const [filter, setFilter] = useState('Featured')
  const [activeId, setActiveId] = useState(PROJECTS[0].id)
  const ref = useDialog(true, onClose)
  const filtered = projectsForFilter(filter)
  const activeIndex = Math.max(0, filtered.findIndex(project => project.id === activeId))
  const project = filtered[activeIndex]
  const changeProject = direction => setActiveId(filtered[(activeIndex + direction + filtered.length) % filtered.length].id)
  return (
    <section ref={ref} className="project-carousel" role="dialog" aria-modal="true" aria-label="Wanted Poster Archive" tabIndex={-1}
      onKeyDown={event => {
        if (event.target.closest('select, input, textarea, summary')) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          changeProject(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }}>
      <h1 className="project-carousel__sr-title">Project Manga Pages</h1>
      <header className="project-carousel__command-bar">
        <div className="manga-archive-heading"><span>Wanted Poster Archive</span><strong aria-live="polite">{project.name}</strong>
          <label className="manga-filter">Browse <select aria-label="Project filter" value={filter} onChange={event => { const next = event.target.value; setFilter(next); setActiveId(projectsForFilter(next)[0].id) }}>{FILTERS.map(item => <option key={item} value={item}>{item} · {projectsForFilter(item).length}</option>)}</select></label>
        </div>
        {worldAvailable && <button type="button" className="project-carousel__explore" onClick={onExplore}><span>Free Roam</span><strong>Explore Posters</strong></button>}
      </header>
      <div className="project-carousel__stage">
        <button type="button" className="project-carousel__arrow" onClick={() => changeProject(-1)} aria-label="Previous project">&lt;</button>
        <MangaProjectPage key={project.id} project={project} onClose={onClose} />
        <button type="button" className="project-carousel__arrow" onClick={() => changeProject(1)} aria-label="Next project">&gt;</button>
      </div>
      <footer className="project-carousel__rail" aria-label="Project pages">{filtered.map((item, index) => <button type="button" key={item.id} className={project.id === item.id ? 'is-active' : ''} aria-current={project.id === item.id ? 'true' : undefined} style={{ '--accent': item.color }} onClick={() => setActiveId(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong></button>)}</footer>
    </section>
  )
}

function PhysicalDossier({ project, onClose }) {
  const ref = useDialog(true, onClose)
  return <section ref={ref} className="manga-physical-view" role="dialog" aria-modal="true" aria-label={`${project.name} dossier`} tabIndex={-1}><MangaProjectPage project={project} onClose={onClose} /></section>
}

export default function WorkSection({ active, onClose, selectedProject, onProjectClose, worldAvailable = true }) {
  const [exploring, setExploring] = useState(false)
  if (!active) return null
  if (selectedProject) return <PhysicalDossier project={selectedProject} onClose={onProjectClose} />
  if (!exploring || !worldAvailable) return <ArchiveBrowser onClose={onClose} onExplore={() => setExploring(true)} worldAvailable={worldAvailable} />
  return <><button className="archive-return" type="button" onClick={() => setExploring(false)}>Wanted Posters · Browse Projects</button><button className="archive-exit" type="button" onClick={onClose} aria-label="Exit project basement">× Deck</button><MobileControls /></>
}
