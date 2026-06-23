import { useEffect, useRef, useState, useCallback } from 'react'
import { Text } from '@react-three/drei'

// ─────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────
const TRANSITION_MS  = 300   // flash overlay fade duration
const LABEL_DELAY_MS = 380   // delay before section label appears
const PANEL_DELAY_MS = 420   // delay before main panel fades in

// ─────────────────────────────────────────────────────────────────────
// WORK TRANSITION OVERLAY
// Cinematic flash on enter/exit — uses CSS transitions, no RAF timers
// ─────────────────────────────────────────────────────────────────────
export function WorkTransitionOverlay({ active }) {
  const [mounted, setMounted]   = useState(false)
  const [visible, setVisible]   = useState(false)
  const timerRef                = useRef([])

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []
  }

  useEffect(() => {
    clearTimers()
    if (active) {
      setMounted(true)
      // Next tick: fade in
      timerRef.current.push(setTimeout(() => setVisible(true),  16))
      // Hold, then fade out
      timerRef.current.push(setTimeout(() => setVisible(false), TRANSITION_MS + 80))
      // Unmount after fade out completes
      timerRef.current.push(setTimeout(() => setMounted(false), TRANSITION_MS + 600))
    } else {
      setVisible(false)
      timerRef.current.push(setTimeout(() => setMounted(false), 500))
    }
    return clearTimers
  }, [active])

  if (!mounted) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9900,
        background: '#00111f',
        opacity:    visible ? 1 : 0,
        transition: `opacity ${TRANSITION_MS}ms ease`,
        pointerEvents: 'none',
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────
// WORK SECTION LABEL
// Top badge — mounts/unmounts cleanly with no lingering state
// ─────────────────────────────────────────────────────────────────────
export function WorkSectionLabel({ active }) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const timerRef              = useRef([])

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []
  }

  useEffect(() => {
    clearTimers()
    if (active) {
      setMounted(true)
      timerRef.current.push(setTimeout(() => setVisible(true), LABEL_DELAY_MS))
    } else {
      setVisible(false)
      // Unmount only after CSS transition completes (500 ms)
      timerRef.current.push(setTimeout(() => setMounted(false), 500))
    }
    return clearTimers
  }, [active])

  if (!mounted) return null

  return (
    <div
      aria-live="polite"
      style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        display:        'flex',
        justifyContent: 'center',
        pointerEvents:  'none',
        zIndex:         8500,
        opacity:        visible ? 1 : 0,
        transform:      visible ? 'translateY(0)' : 'translateY(-14px)',
        transition:     'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      <div style={{
        marginTop:      '18px',
        padding:        '6px 28px',
        background:     'rgba(28,58,24,0.84)',
        border:         '1px solid rgba(174,231,89,0.38)',
        borderRadius:   '40px',
        /* backdrop-filter removed to disable blur for clarity */
        fontFamily:     '"Courier New", monospace',
        fontSize:       '12px',
        letterSpacing:  '4px',
        color:          'rgba(231,255,190,0.92)',
        textTransform:  'uppercase',
      }}>
        BASEMENT
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PROJECT DETAIL MODAL
// Shown when user clicks a tank card — keyboard‑trapped, scrollable
// ─────────────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }) {
  const modalRef   = useRef()
  const closeRef   = useRef()

  // Focus modal on open, restore on close
  useEffect(() => {
    const prev = document.activeElement
    closeRef.current?.focus()
    return () => prev?.focus()
  }, [])

  // Keyboard: Escape closes, Tab traps focus inside modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab') return

    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable || focusable.length === 0) { e.preventDefault(); return }

    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }, [onClose])

  // Backdrop click closes (but not clicks inside the card)
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Project: ${project.name}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9200,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '24px 16px',
        background:     'radial-gradient(ellipse at 50% 32%, rgba(18,87,98,0.28), rgba(2,10,18,0.78) 62%, rgba(0,0,0,0.86))',
        animation:      'workFadeIn 0.22s ease',
      }}
    >
      {/* ── Card ── */}
      <div
        ref={modalRef}
        style={{
          width:        'min(980px, 94vw)',
          maxHeight:    '90vh',
          display:      'flex',
          flexDirection:'column',
          borderRadius: '24px',
          border:       '3px solid rgba(76,42,18,0.95)',
          background:   'linear-gradient(135deg, rgba(255,236,176,0.98), rgba(218,176,96,0.98) 48%, rgba(140,84,39,0.98))',
          boxShadow:    `0 0 44px ${project.color}30, 0 30px 90px rgba(0,0,0,0.62), inset 0 0 0 1px rgba(255,249,214,.55)`,
          overflow:     'hidden',
          color:        '#321607',
        }}
      >
        {/* Colour accent bar */}
        <div style={{
          height:     '12px',
          flexShrink: 0,
          background: `linear-gradient(90deg, #3d1b0b, ${project.color}, #3d1b0b)`,
          boxShadow:  `0 0 18px ${project.color}`,
        }} />

        {/* Scrollable body */}
        <div style={{
          overflowY: 'auto',
          padding:   'clamp(22px, 4vw, 42px)',
          display:   'flex',
          flexDirection: 'column',
          gap:       '22px',
          background: 'radial-gradient(circle at 18% 12%, rgba(255,255,255,.38), transparent 28%), radial-gradient(circle at 82% 86%, rgba(82,35,13,.18), transparent 34%)',
        }}>

          {/* Header row */}
          <div style={{
            display:        'flex',
            alignItems:     'flex-start',
            justifyContent: 'space-between',
            gap:            '16px',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily:    '"Courier New", monospace',
                fontSize:      '12px',
                letterSpacing: '5px',
                color:         '#9f1f1f',
                marginBottom:  '10px',
                textTransform: 'uppercase',
              }}>
                GRAND LINE FILE · {project.year}
              </div>
              <h2 style={{
                margin:     0,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize:   'clamp(36px, 7vw, 76px)',
                lineHeight: 0.92,
                color:      '#2b1206',
                letterSpacing: '-0.035em',
                textShadow: '0 2px 0 rgba(255,239,181,.6)',
              }}>
                {project.name}
              </h2>
              <div style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(76,33,11,.26)',
                background: 'rgba(255,247,202,.4)',
                fontFamily: '"Courier New", monospace',
                fontSize: '12px',
                letterSpacing: '2px',
                color: '#693016',
                textTransform: 'uppercase',
              }}>
                <span style={{ color: project.color }}>●</span>
                Live Project
              </div>
            </div>

            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close project details"
              style={{
                flexShrink:     0,
                width:          '46px',
                height:         '46px',
                borderRadius:   '50%',
                border:         '2px solid rgba(76,33,11,0.55)',
                background:     'rgba(255,232,151,0.72)',
                color:          '#421806',
                cursor:         'pointer',
                fontSize:       '20px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                transition:     'background 0.18s, border-color 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background     = 'rgba(255,248,204,0.96)'
                e.currentTarget.style.borderColor    = project.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background     = 'rgba(255,232,151,0.72)'
                e.currentTarget.style.borderColor    = 'rgba(76,33,11,0.55)'
              }}
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(150px, 220px)',
            gap: 'clamp(16px, 4vw, 34px)',
            alignItems: 'stretch',
          }}>
            <p style={{
              margin:     0,
              fontSize:   'clamp(16px, 2vw, 21px)',
              lineHeight: 1.65,
              color:      '#44200d',
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}>
              {project.desc}
            </p>
            <div style={{
              borderRadius: '18px',
              border: '1px solid rgba(76,33,11,.28)',
              background: 'linear-gradient(180deg, rgba(60,24,8,.86), rgba(33,13,5,.92))',
              color: '#ffe7a2',
              padding: '18px',
              display: 'grid',
              alignContent: 'center',
              gap: '7px',
              boxShadow: 'inset 0 0 0 1px rgba(255,237,172,.08)',
            }}>
              <span style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '10px',
                letterSpacing: '3px',
                color: 'rgba(255,231,162,.62)',
                textTransform: 'uppercase',
              }}>
                Current Bounty
              </span>
              <strong style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(24px, 4vw, 34px)',
                lineHeight: 1,
                color: project.color,
                textShadow: `0 0 16px ${project.color}55`,
              }}>
                {project.bounty}
              </strong>
              <span style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '11px',
                letterSpacing: '2px',
                color: 'rgba(255,239,189,.76)',
              }}>
                BERRIES
              </span>
            </div>
          </div>

          {/* Stack pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {project.stack.map((item) => (
              <span
                key={item}
                style={{
                  padding:       '9px 15px',
                  borderRadius:  '999px',
                  border:        '1px solid rgba(76,33,11,0.26)',
                  background:    'rgba(255,248,208,0.48)',
                  color:         '#321607',
                  fontFamily:    '"Courier New", monospace',
                  fontWeight:    700,
                  fontSize:      '12px',
                  letterSpacing: '1px',
                  boxShadow:     `inset 0 -2px 0 ${project.color}44`,
                }}
              >
                {item}
              </span>
            ))}
          </div>

          {/* Footer row */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            flexWrap:       'wrap',
            gap:            '14px',
            paddingTop:     '18px',
            borderTop:      '1px solid rgba(76,33,11,0.2)',
          }}>
            <span style={{
              fontFamily:    '"Courier New", monospace',
              fontSize:      '11px',
              letterSpacing: '2px',
              color:         'rgba(60,24,8,0.58)',
            }}>
              PRESS ESC OR CLICK OUTSIDE TO RETURN
            </span>

            {project.url && project.url !== '#' && (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding:       '14px 26px',
                  borderRadius:  '999px',
                  background:    '#ff4259',
                  color:         '#1b0903',
                  border:        '2px solid rgba(76,33,11,.72)',
                  fontFamily:    '"Courier New", monospace',
                  fontWeight:    700,
                  fontSize:      '13px',
                  letterSpacing: '2px',
                  textDecoration:'none',
                  whiteSpace:    'nowrap',
                  transition:    'opacity 0.15s',
                  boxShadow:     `0 10px 28px ${project.color}33`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.82' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                ↗ OPEN LIVE
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes workFadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
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
  const timerRef              = useRef([])

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []
  }

  // Mount/unmount with clean transitions
  useEffect(() => {
    clearTimers()
    if (active) {
      setMounted(true)
      timerRef.current.push(setTimeout(() => setVisible(true), PANEL_DELAY_MS))
    } else {
      setVisible(false)
      // Wait for CSS transition before unmounting
      timerRef.current.push(setTimeout(() => setMounted(false), 550))
    }
    return clearTimers
  }, [active])

  // ESC to close — only fires if no modal is open (modal handles its own ESC)
  useEffect(() => {
    if (!active) return
    const fn = (e) => {
      if (e.key === 'Escape' && !selectedProject) onClose()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, selectedProject, onClose])

  if (!mounted) return null

  return (
    <>
      {/* ── Soft garden tint (non-blocking, behind everything) ── */}
      <div
        aria-hidden="true"
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         8800,
          background:     'radial-gradient(ellipse at 50% 30%, rgba(130,210,80,0.08), rgba(8,24,10,0.20))',
            /* backdrop-filter removed to disable blur for clarity */
          opacity:        visible ? 1 : 0,
          transition:     'opacity 0.5s ease',
          pointerEvents:  'none',
        }}
      />

      {/* ── Close button ── */}
      <button
        onClick={onClose}
        aria-label="Exit aquarium — return to ship deck"
        style={{
          position:       'fixed',
          top:            '20px',
          right:          '20px',
          zIndex:         9100,
          width:          '44px',
          height:         '44px',
          borderRadius:   '50%',
          background:     'rgba(20,45,18,0.88)',
          border:         '1px solid rgba(174,231,89,0.42)',
          color:          'rgba(231,255,190,0.94)',
          fontSize:       '17px',
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          /* backdrop-filter removed to disable blur for clarity */
          opacity:        visible ? 1 : 0,
          transform:      visible ? 'scale(1)' : 'scale(0.8)',
          transition:     'opacity 0.4s ease, transform 0.4s ease, background 0.18s, border-color 0.18s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background  = 'rgba(76,130,42,0.28)'
          e.currentTarget.style.borderColor = 'rgba(210,255,140,0.72)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background  = 'rgba(20,45,18,0.88)'
          e.currentTarget.style.borderColor = 'rgba(174,231,89,0.42)'
        }}
      >
        ✕
      </button>

      {/* ── Project detail modal ── */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={onProjectClose}
        />
      )}

      {/* Global keyframe */}
      <style>{`
        @keyframes workFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </>
  )
}
