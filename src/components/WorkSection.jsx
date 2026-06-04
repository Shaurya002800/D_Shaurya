import { useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────
// WORK SECTION — Aquarium Basement overlay
// Controls camera transition + UI when workActive === true
// The actual 3D aquarium is always rendered in Ship.jsx (AquariumBasement)
// This file handles: cinematic fade, section label, ESC hint
// ─────────────────────────────────────────────────────────────────────

// Transition flash overlay (same pattern as AboutTransitionOverlay)
export function WorkTransitionOverlay({ active }) {
  const [show, setShow] = useState(false)
  const [op,   setOp]   = useState(0)

  useEffect(() => {
    if (active) {
      setShow(true)
      requestAnimationFrame(() => {
        setOp(1)
        setTimeout(() => setOp(0), 320)
        setTimeout(() => setShow(false), 900)
      })
    }
  }, [active])

  if (!show) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: '#001830',
      opacity: op,
      transition: 'opacity 0.32s ease',
      pointerEvents: 'none',
    }} />
  )
}

// Section label (same pattern as SectionTransitionLabel)
export function WorkSectionLabel({ active }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (active) {
      setTimeout(() => setVisible(true), 350)
    } else {
      setVisible(false)
    }
  }, [active])

  if (!active && !visible) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 8500,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-20px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div style={{
        marginTop: '18px',
        padding: '6px 28px',
        background: 'rgba(0,24,48,0.82)',
        border: '1px solid rgba(0,150,255,0.35)',
        borderRadius: '40px',
        backdropFilter: 'blur(8px)',
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
          letterSpacing: '4px',
          color: 'rgba(100,200,255,0.9)',
          textTransform: 'uppercase',
        }}>
        AQUARIUM · WORK
      </div>
    </div>
  )
}

// Main WorkSection component
export default function WorkSection({
  active,
  onClose,
  selectedProject,
  onProjectClose,
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setTimeout(() => setVisible(true), 400)
    } else {
      setVisible(false)
    }
  }, [active])

  // ESC key to close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && active) onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, onClose])

  if (!active && !visible) return null

  return (
    <>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9100,
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'rgba(0,20,40,0.85)',
          border: '1px solid rgba(0,150,255,0.4)',
          color: 'rgba(100,200,255,0.9)',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        ✕
      </button>

      {/* Bottom hint bar */}
      <div style={{
        position: 'fixed',
        bottom: '36px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 9100,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}>
        <div style={{
          padding: '10px 28px',
          background: 'rgba(0,18,36,0.88)',
          border: '1px solid rgba(0,150,255,0.3)',
          borderRadius: '40px',
          backdropFilter: 'blur(10px)',
          fontFamily: '"Courier New", monospace',
          fontSize: '13px',
          letterSpacing: '2px',
          color: 'rgba(100,200,255,0.85)',
        }}>
          DRAG TO EXPLORE · CLICK CARDS · ESC TO SURFACE
        </div>
      </div>

      {selectedProject && (
        <div
          onClick={onProjectClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px',
            background: 'radial-gradient(circle at 50% 40%, rgba(8,64,96,0.18), rgba(0,8,18,0.68))',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(720px, 92vw)',
              border: `1px solid ${selectedProject.color}88`,
              borderRadius: '18px',
              background: 'linear-gradient(180deg, rgba(3,25,48,0.96), rgba(0,10,24,0.98))',
              boxShadow: `0 0 34px ${selectedProject.color}40, 0 28px 80px rgba(0,0,0,0.45)`,
              color: '#e8f7ff',
              overflow: 'hidden',
            }}
          >
            <div style={{
              height: '5px',
              background: selectedProject.color,
              boxShadow: `0 0 18px ${selectedProject.color}`,
            }} />

            <div style={{
              padding: '30px',
              display: 'grid',
              gap: '22px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '18px',
              }}>
                <div>
                  <div style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '12px',
                    letterSpacing: '3px',
                    color: selectedProject.color,
                    marginBottom: '8px',
                  }}>
                    {selectedProject.year} · LIVE PROJECT
                  </div>
                  <h2 style={{
                    margin: 0,
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(34px, 6vw, 58px)',
                    lineHeight: 1,
                    letterSpacing: 0,
                    color: '#ffffff',
                    textShadow: `0 0 18px ${selectedProject.color}66`,
                  }}>
                    {selectedProject.name}
                  </h2>
                </div>

                <button
                  onClick={onProjectClose}
                  aria-label="Close project details"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid rgba(120,210,255,0.35)',
                    background: 'rgba(3,30,56,0.86)',
                    color: '#aee8ff',
                    cursor: 'pointer',
                    fontSize: '18px',
                    flex: '0 0 auto',
                  }}
                >
                  x
                </button>
              </div>

              <p style={{
                margin: 0,
                maxWidth: '62ch',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'rgba(220,242,255,0.86)',
              }}>
                {selectedProject.desc}
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                {selectedProject.stack.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      border: `1px solid ${selectedProject.color}55`,
                      background: `${selectedProject.color}18`,
                      color: '#ecfbff',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '12px',
                      letterSpacing: '1px',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                paddingTop: '4px',
              }}>
                <span style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  color: 'rgba(174,232,255,0.72)',
                }}>
                  CLICK OUTSIDE TO RETURN TO THE TANK
                </span>

                {selectedProject.url && selectedProject.url !== '#' && (
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '12px 18px',
                      borderRadius: '999px',
                      background: selectedProject.color,
                      color: '#00101c',
                      fontFamily: '"Courier New", monospace',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '1px',
                      textDecoration: 'none',
                    }}
                  >
                    OPEN LIVE
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
