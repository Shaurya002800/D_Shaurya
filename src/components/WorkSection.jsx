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
        background:     'rgba(0,20,44,0.85)',
        border:         '1px solid rgba(0,160,255,0.3)',
        borderRadius:   '40px',
        /* backdrop-filter removed to disable blur for clarity */
        fontFamily:     '"Courier New", monospace',
        fontSize:       '12px',
        letterSpacing:  '4px',
        color:          'rgba(100,210,255,0.9)',
        textTransform:  'uppercase',
      }}>
        ⚓ AQUARIUM · WORK
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
  background:     'radial-gradient(ellipse at 50% 35%, rgba(0,60,100,0.22), rgba(0,8,20,0.72))',
  /* backdrop-filter removed to disable blur for clarity */
        animation:      'workFadeIn 0.22s ease',
      }}
    >
      {/* ── Card ── */}
      <div
        ref={modalRef}
        style={{
          width:        'min(700px, 94vw)',
          maxHeight:    '90vh',
          display:      'flex',
          flexDirection:'column',
          borderRadius: '16px',
          border:       `1px solid ${project.color}66`,
          background:   'linear-gradient(160deg, rgba(2,18,36,0.97), rgba(0,8,20,0.99))',
          boxShadow:    `0 0 40px ${project.color}30, 0 24px 72px rgba(0,0,0,0.55)`,
          overflow:     'hidden',
        }}
      >
        {/* Colour accent bar */}
        <div style={{
          height:     '4px',
          flexShrink: 0,
          background: project.color,
          boxShadow:  `0 0 16px ${project.color}`,
        }} />

        {/* Scrollable body */}
        <div style={{
          overflowY: 'auto',
          padding:   'clamp(20px, 4vw, 32px)',
          display:   'flex',
          flexDirection: 'column',
          gap:       '20px',
        }}>

          {/* Header row */}
          <div style={{
            display:        'flex',
            alignItems:     'flex-start',
            justifyContent: 'space-between',
            gap:            '16px',
          }}>
            <div>
              <div style={{
                fontFamily:    '"Courier New", monospace',
                fontSize:      '11px',
                letterSpacing: '3px',
                color:         project.color,
                marginBottom:  '8px',
                textTransform: 'uppercase',
              }}>
                {project.year} · LIVE PROJECT
              </div>
              <h2 style={{
                margin:     0,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize:   'clamp(28px, 6vw, 52px)',
                lineHeight: 1.05,
                color:      '#ffffff',
                textShadow: `0 0 20px ${project.color}55`,
              }}>
                {project.name}
              </h2>
            </div>

            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close project details"
              style={{
                flexShrink:     0,
                width:          '38px',
                height:         '38px',
                borderRadius:   '50%',
                border:         '1px solid rgba(100,210,255,0.3)',
                background:     'rgba(2,24,48,0.9)',
                color:          'rgba(160,220,255,0.9)',
                cursor:         'pointer',
                fontSize:       '16px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                transition:     'background 0.18s, border-color 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background     = 'rgba(0,150,255,0.18)'
                e.currentTarget.style.borderColor    = 'rgba(100,210,255,0.7)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background     = 'rgba(2,24,48,0.9)'
                e.currentTarget.style.borderColor    = 'rgba(100,210,255,0.3)'
              }}
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <p style={{
            margin:     0,
            fontSize:   'clamp(14px, 2vw, 16px)',
            lineHeight: 1.75,
            color:      'rgba(210,238,255,0.88)',
          }}>
            {project.desc}
          </p>

          {/* Stack pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {project.stack.map((item) => (
              <span
                key={item}
                style={{
                  padding:       '7px 14px',
                  borderRadius:  '999px',
                  border:        `1px solid ${project.color}44`,
                  background:    `${project.color}14`,
                  color:         '#ddf4ff',
                  fontFamily:    '"Courier New", monospace',
                  fontSize:      '11px',
                  letterSpacing: '1px',
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
            paddingTop:     '4px',
            borderTop:      '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{
              fontFamily:    '"Courier New", monospace',
              fontSize:      '11px',
              letterSpacing: '2px',
              color:         'rgba(160,220,255,0.55)',
            }}>
              PRESS ESC OR CLICK OUTSIDE TO RETURN
            </span>

            {project.url && project.url !== '#' && (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding:       '11px 22px',
                  borderRadius:  '999px',
                  background:    project.color,
                  color:         '#00111f',
                  fontFamily:    '"Courier New", monospace',
                  fontWeight:    700,
                  fontSize:      '12px',
                  letterSpacing: '1px',
                  textDecoration:'none',
                  whiteSpace:    'nowrap',
                  transition:    'opacity 0.15s',
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
      {/* ── Ambient underwater tint (non-blocking, behind everything) ── */}
      <div
        aria-hidden="true"
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         8800,
          background:     'radial-gradient(ellipse at 50% 30%, rgba(0,60,100,0.14), rgba(0,6,16,0.46))',
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
          background:     'rgba(0,16,36,0.88)',
          border:         '1px solid rgba(0,160,255,0.38)',
          color:          'rgba(120,210,255,0.9)',
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
          e.currentTarget.style.background  = 'rgba(0,100,200,0.25)'
          e.currentTarget.style.borderColor = 'rgba(0,200,255,0.7)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background  = 'rgba(0,16,36,0.88)'
          e.currentTarget.style.borderColor = 'rgba(0,160,255,0.38)'
        }}
      >
        ✕
      </button>

      {/* ── Bottom hint bar ── */}
      <div
        aria-hidden="true"
        style={{
          position:       'fixed',
          bottom:         '32px',
          width:          '100%',
          display:        'flex',
          justifyContent: 'center',
          pointerEvents:  'none',
          zIndex:         9100,
          opacity:        visible ? 1 : 0,
          transform:      visible ? 'translateY(0)' : 'translateY(10px)',
          transition:     'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div style={{
          padding:        '10px 26px',
          background:     'rgba(0,14,30,0.9)',
          border:         '1px solid rgba(0,150,255,0.25)',
          borderRadius:   '40px',
          /* backdrop-filter removed to disable blur for clarity */
          fontFamily:     '"Courier New", monospace',
          fontSize:       '11px',
          letterSpacing:  '2.5px',
          color:          'rgba(100,200,255,0.78)',
          textTransform:  'uppercase',
          display:        'flex',
          alignItems:     'center',
          gap:            '12px',
        }}>
          <span style={{ color: 'rgba(100,200,255,0.45)' }}>🖱</span>
          Drag to look around
          <span style={{ color: 'rgba(100,200,255,0.25)' }}>·</span>
          Click a tank to inspect
          <span style={{ color: 'rgba(100,200,255,0.25)' }}>·</span>
          <kbd style={{
            padding:       '2px 7px',
            border:        '1px solid rgba(100,200,255,0.3)',
            borderRadius:  '4px',
            fontSize:      '10px',
            background:    'rgba(0,40,80,0.5)',
            fontFamily:    '"Courier New", monospace',
          }}>ESC</kbd>
          to surface
        </div>
      </div>

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