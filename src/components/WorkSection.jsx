import { useEffect, useRef, useState, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────
// TIMING CONSTANTS
// ─────────────────────────────────────────────────────────────────────
const TRANSITION_MS = 300
const LABEL_DELAY_MS = 380
const PANEL_DELAY_MS = 420

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

// ─────────────────────────────────────────────────────────────────────
// HYPE COUNTER — animated reader-rating readout for the cover panel
// ─────────────────────────────────────────────────────────────────────
function HypeCounter({ value }) {
  const [display, setDisplay] = useState('0')
  const rafRef = useRef()

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    const numStr = String(value || '').replace(/[^0-9]/g, '')
    const target = parseInt(numStr, 10) || 0
    if (!target) { setDisplay(value || '—'); return }

    const dur = 1600
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - t, 4)
      const current = Math.round(eased * target)
      setDisplay(current.toLocaleString('en-US'))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 900, color: '#c1272d' }}>★</span>
      <span style={{
        fontFamily: '"Anton", Georgia, sans-serif',
        fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
        color: '#15120f',
        letterSpacing: '0.01em',
      }}>
        {display}
      </span>
      <span style={{
        fontFamily: '"Courier New", monospace', fontSize: '9px',
        color: '#6b6354', letterSpacing: '1.5px', textTransform: 'uppercase',
        alignSelf: 'flex-end', marginBottom: '5px',
      }}>
        reader hype
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PROJECT DETAIL MODAL — MANGA PAGE DOSSIER
// ─────────────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }) {
  const modalRef = useRef()
  const closeRef = useRef()
  const [coverHover, setCoverHover] = useState(false)

  useEffect(() => {
    const prev = document.activeElement
    closeRef.current?.focus()
    return () => { prev?.focus() }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab') return
    const focusable = modalRef.current?.querySelectorAll(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )
    if (!focusable?.length) { e.preventDefault(); return }
    const first = focusable[0], last = focusable[focusable.length - 1]
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus() } }
  }, [onClose])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  // ── Ink palette ──────────────────────────────────────────────────
  const ink = '#15120f'
  const paper = '#f3eee2'
  const hanko = '#c1272d'
  const inkSoft = '#3c352a'
  const tone = '#b9b19c'

  const year = project.year || new Date().getFullYear()
  const isLive = project.url && project.url !== '#'

  const fileId = String(
    Math.abs((project.name || '').split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 17) % 99999)
  ).padStart(5, '0')
  const seed = parseInt(fileId, 10)
  const chapterNo = String((seed % 180) + 1).padStart(3, '0')
  const pageNo = String((seed % 80) + 10).padStart(3, '0')

  const halftone = {
    backgroundImage: `radial-gradient(${tone} 1px, transparent 1.6px)`,
    backgroundSize: '8px 8px',
  }
  const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Project: ${project.name}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 9200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 40px)',
        background: '#0b0907',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1.6px)',
        backgroundSize: '7px 7px',
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.3s ease both',
      }}
    >
      {/* Hidden SVG filter used to rough up the hanko stamp edge */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="inkRough">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.09" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
        </filter>
      </svg>

      <div
        ref={modalRef}
        className="manga-page"
        style={{
          width: 'min(1080px, 100%)',
          maxHeight: 'min(92vh, 820px)',
          display: 'flex', flexDirection: 'column',
          background: paper,
          border: `5px solid ${ink}`,
          borderRadius: '2px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.4)',
          animation: 'pageSlam 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Paper grain, across the whole page */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none', zIndex: 0 }} />

        {/* Close — inked corner stamp */}
        <button
          ref={closeRef} onClick={onClose} aria-label="Close manga page"
          style={{
            position: 'absolute', top: '14px', right: '14px', zIndex: 20,
            width: '34px', height: '34px',
            background: paper, border: `2.5px solid ${ink}`,
            color: ink, fontSize: '15px', fontWeight: 900, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            transform: 'rotate(-6deg)',
            transition: 'all 0.2s',
            boxShadow: `2px 2px 0 ${ink}`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = ink
            e.currentTarget.style.color = paper
            e.currentTarget.style.transform = 'rotate(0deg) scale(1.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = paper
            e.currentTarget.style.color = ink
            e.currentTarget.style.transform = 'rotate(-6deg) scale(1)'
          }}
        >
          ✕
        </button>

        {/* ═══════════════════════════════════════════════════════
            THE PAGE — panels separated by black-gutter grid
        ═══════════════════════════════════════════════════════ */}
        <div
          className="manga-grid"
          style={{
            flex: 1,
            position: 'relative', zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '320px minmax(0, 1fr)',
            gridTemplateRows: '78px auto auto 70px',
            gap: '6px',
            padding: '6px',
            background: ink,
            overflowY: 'auto',
          }}
        >
          {/* ── PANEL: COVER ────────────────────────────────────── */}
          <div
            className="panel-cover"
            onMouseEnter={() => setCoverHover(true)}
            onMouseLeave={() => setCoverHover(false)}
            style={{
              gridColumn: 1, gridRow: '1 / span 4',
              background: paper, ...halftone,
              padding: '26px 20px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: 'relative',
              transform: coverHover ? 'scale(1.01)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              animation: 'panelIn 0.4s ease 0.05s both',
            }}
          >
            <div style={{
              fontFamily: '"Courier New", monospace', fontSize: '10px',
              fontWeight: 700, letterSpacing: '0.25em', color: inkSoft,
              textTransform: 'uppercase', marginBottom: '14px',
            }}>
              ※ Featured Series
            </div>

            {/* Cover art placeholder, crosshatched like unfinished inking */}
            <div style={{
              width: '100%', height: '188px',
              background: `repeating-linear-gradient(45deg, ${ink} 0px, ${ink} 1.5px, transparent 1.5px, transparent 7px)`,
              backgroundColor: '#e7e0cd',
              border: `3px solid ${ink}`,
              marginBottom: '18px',
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <span style={{
                fontFamily: '"Courier New", monospace', color: paper, background: ink,
                fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '4px 10px', border: `1px solid ${paper}`,
              }}>
                panel still inking
              </span>
            </div>

            <div style={{
              fontFamily: '"Anton", Georgia, sans-serif',
              fontSize: 'clamp(1.6rem, 3.4vw, 2.5rem)',
              color: ink, textAlign: 'center', lineHeight: 1.04,
              textTransform: 'uppercase', marginBottom: '10px',
            }}>
              {project.name}
            </div>

            <div style={{ width: '46px', height: '4px', background: hanko, marginBottom: '18px' }} />

            <HypeCounter value={project.bounty} />

            {/* Hanko approval stamp */}
            <div style={{
              position: 'absolute', bottom: '18px', right: '14px',
              width: '88px', height: '88px', borderRadius: '50%',
              border: `4px solid ${hanko}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: hanko, fontWeight: 900, transform: 'rotate(-12deg)',
              animation: 'stampDown 0.5s cubic-bezier(0.2, 2, 0.3, 1) 0.7s both',
              filter: 'url(#inkRough)', opacity: 0.9, pointerEvents: 'none',
            }}>
              <div style={{ position: 'absolute', inset: '4px', border: `1px solid rgba(193,39,45,0.5)`, borderRadius: '50%' }} />
              <span style={{ fontFamily: '"Anton", Georgia, sans-serif', fontSize: '13px', letterSpacing: '1px' }}>EDITOR'S</span>
              <span style={{ fontFamily: '"Anton", Georgia, sans-serif', fontSize: '13px', letterSpacing: '1px' }}>PICK</span>
            </div>
          </div>

          {/* ── PANEL: TITLE / CHAPTER STRIP (inverted, diagonal cut) ── */}
          <div
            className="panel-title"
            style={{
              gridColumn: 2, gridRow: 1,
              background: ink,
              backgroundImage: 'repeating-conic-gradient(from 0deg at 0% 0%, rgba(255,255,255,0.07) 0deg 1.6deg, transparent 1.6deg 6deg)',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 86%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 22px', position: 'relative', overflow: 'hidden',
              animation: 'panelIn 0.4s ease 0.1s both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontFamily: '"Anton", Georgia, sans-serif', fontSize: '1.8rem', color: paper, letterSpacing: '0.02em' }}>
                CH. {chapterNo}
              </span>
              <span style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: 'rgba(243,238,226,0.55)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                vol. {year}
              </span>
            </div>

            {/* Comic burst badge */}
            <div style={{
              position: 'relative',
              fontFamily: '"Bangers", "Anton", cursive', fontSize: '11px',
              color: ink, background: hanko,
              padding: '6px 14px', transform: 'rotate(6deg)',
              clipPath: 'polygon(8% 0%, 92% 5%, 100% 50%, 94% 100%, 6% 95%, 0% 50%)',
              letterSpacing: '0.5px', textTransform: 'uppercase',
              animation: 'burstPop 0.45s cubic-bezier(0.2, 2, 0.3, 1) 0.35s both',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
            }}>
              {isLive ? 'on sale now' : 'work in progress'}
            </div>
          </div>

          {/* ── PANEL: SYNOPSIS (speech bubble) ─────────────────── */}
          <div
            className="panel-synopsis"
            style={{
              gridColumn: 2, gridRow: 2,
              background: paper, position: 'relative',
              padding: '24px 28px',
              animation: 'panelIn 0.4s ease 0.18s both',
            }}
          >
            <div className="bubble-tail" aria-hidden="true" style={{ position: 'absolute', left: '-16px', top: '26px', width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderRight: `16px solid ${ink}` }} />
            <div className="bubble-tail" aria-hidden="true" style={{ position: 'absolute', left: '-12px', top: '29px', width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: `12px solid ${paper}` }} />

            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: hanko, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700 }}>
              [ Synopsis ]
            </div>
            <p style={{
              color: inkSoft, fontSize: '1.02rem', lineHeight: 1.75,
              margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 400,
            }}>
              {project.desc}
            </p>
          </div>

          {/* ── PANEL: TECHNIQUES (tech stack as move-list tags) ── */}
          <div
            className="panel-techniques"
            style={{
              gridColumn: 2, gridRow: 3,
              background: paper, padding: '22px 28px',
              animation: 'panelIn 0.4s ease 0.26s both',
            }}
          >
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: hanko, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>
              [ Techniques Unlocked ]
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {project.stack?.map((item, i) => (
                <span
                  key={item}
                  style={{
                    '--chip-rot': `${i % 2 === 0 ? -2.5 : 2.5}deg`,
                    padding: '7px 14px',
                    background: paper,
                    border: `2.5px solid ${ink}`,
                    color: ink,
                    fontFamily: '"Anton", Georgia, sans-serif',
                    fontSize: '11.5px', letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0% 100%)',
                    animation: `chipFade 0.4s ease ${0.4 + i * 0.07}s both`,
                    cursor: 'default',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = ink
                    e.currentTarget.style.color = paper
                    e.currentTarget.style.transform = 'rotate(0deg) scale(1.07)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = paper
                    e.currentTarget.style.color = ink
                    e.currentTarget.style.transform = 'rotate(var(--chip-rot)) scale(1)'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ── PANEL: NEXT-PAGE CAPTION / CTA ──────────────────── */}
          <div
            className="panel-cta"
            style={{
              gridColumn: 2, gridRow: 4,
              background: paper,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px',
              animation: 'panelIn 0.4s ease 0.34s both',
            }}
          >
            <span style={{
              fontFamily: '"Courier New", monospace', fontSize: '10px',
              color: inkSoft, letterSpacing: '1.5px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isLive ? hanko : '#999', display: 'inline-block' }} />
              {isLive ? 'serialization · ongoing' : 'unscanned · draft only'}
            </span>

            {isLive ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: ink, color: paper,
                  padding: '9px 18px',
                  border: `2px solid ${ink}`,
                  fontFamily: '"Anton", Georgia, sans-serif',
                  fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = hanko; e.currentTarget.style.borderColor = hanko }}
                onMouseLeave={e => { e.currentTarget.style.background = ink; e.currentTarget.style.borderColor = ink }}
              >
                turn the page ▶
              </a>
            ) : (
              <span style={{
                fontFamily: '"Anton", Georgia, sans-serif', fontSize: '11px', letterSpacing: '1px',
                color: '#9a9282', padding: '9px 16px',
                border: `2px dashed ${tone}`, textTransform: 'uppercase',
              }}>
                pages not yet scanned
              </span>
            )}
          </div>
        </div>

        {/* ── Printed-page footer strip ──────────────────────────── */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 16px',
          borderTop: `2px solid ${ink}`,
          background: paper,
          fontFamily: '"Courier New", monospace', fontSize: '10px',
          color: inkSoft, letterSpacing: '1px',
        }}>
          <span>FILE №{fileId}</span>
          <span>— {pageNo} —</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bangers&display=swap');

        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pageSlam {
          0% { opacity: 0; transform: scale(0.86) rotate(-2deg); }
          60% { opacity: 1; transform: scale(1.015) rotate(0.4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes panelIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes burstPop {
          0% { opacity: 0; transform: rotate(-25deg) scale(0); }
          60% { opacity: 1; transform: rotate(10deg) scale(1.15); }
          100% { opacity: 1; transform: rotate(6deg) scale(1); }
        }
        @keyframes stampDown {
          0% { opacity: 0; transform: rotate(-30deg) scale(2.4); }
          55% { opacity: 1; transform: rotate(-6deg) scale(0.92); }
          100% { opacity: 0.9; transform: rotate(-12deg) scale(1); }
        }
        @keyframes chipFade {
          from { opacity: 0; transform: translateY(8px) rotate(0deg); }
          to { opacity: 1; transform: translateY(0) rotate(var(--chip-rot, 0deg)); }
        }

        /* Responsive: stack the page into a single reading column */
        @media (max-width: 900px) {
          .manga-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 240px auto auto auto auto !important;
          }
          .panel-cover { grid-column: 1 !important; grid-row: 1 !important; }
          .panel-title { grid-column: 1 !important; grid-row: 2 !important; clip-path: none !important; }
          .panel-synopsis { grid-column: 1 !important; grid-row: 3 !important; padding: 22px !important; }
          .panel-techniques { grid-column: 1 !important; grid-row: 4 !important; }
          .panel-cta { grid-column: 1 !important; grid-row: 5 !important; flex-wrap: wrap; gap: 12px; padding: 14px 18px !important; }
          .bubble-tail { display: none !important; }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// MAIN WORK SECTION
// ─────────────────────────────────────────────────────────────────────
export default function WorkSection({
  active,
  onClose,
  selectedProject,
  onProjectClose,
}) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef([])

  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = [] }

  useEffect(() => {
    clearTimers()
    if (active) {
      timerRef.current.push(setTimeout(() => setMounted(true), 0))
      timerRef.current.push(setTimeout(() => setVisible(true), PANEL_DELAY_MS))
    } else {
      timerRef.current.push(setTimeout(() => setVisible(false), 0))
      timerRef.current.push(setTimeout(() => setMounted(false), 550))
    }
    return clearTimers
  }, [active])

  useEffect(() => {
    if (!active) return
    const fn = (e) => { if (e.key === 'Escape' && !selectedProject) onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, selectedProject, onClose])

  if (!mounted) return null

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 8800,
          background: `
            radial-gradient(circle at 15% 50%, rgba(64, 169, 255, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 85% 30%, rgba(255, 77, 79, 0.03) 0%, transparent 40%)
          `,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }}
      />

      {!selectedProject && (
        <button
          onClick={onClose}
          aria-label="Exit Terminal"
          style={{
            position: 'fixed', top: '24px', right: '24px',
            zIndex: 9100, width: '44px', height: '44px',
            borderRadius: '50%', background: 'rgba(10, 15, 24, 0.8)',
            border: '1px solid rgba(64, 169, 255, 0.3)',
            color: '#8be9fd', fontSize: '16px', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 0 15px rgba(64, 169, 255, 0.1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(64, 169, 255, 0.15)'
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(10, 15, 24, 0.8)'
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
          }}
        >
          ✕
        </button>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={onProjectClose}
        />
      )}
    </>
  )
}
