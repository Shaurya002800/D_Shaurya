import { useEffect, useRef, useState, useCallback } from 'react'

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
      timerRef.current.push(setTimeout(() => setMounted(true), 0))
      // Next tick: fade in
      timerRef.current.push(setTimeout(() => setVisible(true),  16))
      // Hold, then fade out
      timerRef.current.push(setTimeout(() => setVisible(false), TRANSITION_MS + 80))
      // Unmount after fade out completes
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
      timerRef.current.push(setTimeout(() => setMounted(true), 0))
      timerRef.current.push(setTimeout(() => setVisible(true), LABEL_DELAY_MS))
    } else {
      timerRef.current.push(setTimeout(() => setVisible(false), 0))
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
      className="project-briefing"
      role="dialog"
      aria-modal="true"
      aria-label={`Project: ${project.name}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      style={{ '--project-color': project.color }}
    >
      <div ref={modalRef} className="project-briefing__board">
        <button
          ref={closeRef}
          className="project-briefing__close"
          onClick={onClose}
          aria-label="Close project details"
        >
          <span aria-hidden="true">×</span>
          <small>Deck</small>
        </button>

        <div className="project-briefing__rail" aria-hidden="true" />
        <div className="project-briefing__scan" aria-hidden="true" />

        <section className="project-briefing__wanted" aria-labelledby="project-briefing-title">
          <div className="project-briefing__file">
            <span>Grand Line File</span>
            <i />
            <span>{project.year}</span>
          </div>

          <strong className="project-briefing__wanted-label">Wanted</strong>
          <h2 id="project-briefing-title">{project.name}</h2>

          <div className="project-briefing__live">
            <span />
            Live Project
          </div>

          <div className="project-briefing__stamp">Verified Build</div>
        </section>

        <section className="project-briefing__brief">
          <div className="project-briefing__section-label">Mission Brief</div>
          <p>{project.desc}</p>
        </section>

        <aside className="project-briefing__intel" aria-label="Project intelligence">
          <div className="project-briefing__bounty">
            <span>Current Bounty</span>
            <strong>{project.bounty}</strong>
            <em>Berries</em>
          </div>

          <div className="project-briefing__stack" aria-label="Technology stack">
            {project.stack.map((item, index) => (
              <b key={item} style={{ '--tag-delay': `${240 + index * 70}ms` }}>
                {item}
              </b>
            ))}
          </div>
        </aside>

        <footer className="project-briefing__footer">
          <span>Esc or outside click returns to gallery</span>

          {project.url && project.url !== '#' && (
            <a href={project.url} target="_blank" rel="noreferrer">
              Open Live
            </a>
          )}
        </footer>
      </div>

      <style>{`
        .project-briefing {
          position: fixed;
          inset: 0;
          z-index: 9200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(14px, 3vw, 28px);
          background:
            radial-gradient(circle at 50% 46%, color-mix(in srgb, var(--project-color) 18%, transparent), transparent 34%),
            radial-gradient(circle at 50% 10%, rgba(45, 91, 105, .22), transparent 38%),
            linear-gradient(180deg, rgba(2, 8, 13, .68), rgba(0, 0, 0, .92));
          animation: project-briefing-fade .2s ease both;
        }

        .project-briefing__board {
          position: relative;
          width: min(1080px, 94vw);
          max-height: min(84vh, 760px);
          display: grid;
          grid-template-columns: minmax(260px, .82fr) minmax(0, 1.18fr);
          grid-template-areas:
            "wanted brief"
            "wanted intel"
            "footer footer";
          gap: 14px;
          overflow: hidden auto;
          padding: clamp(18px, 3vw, 34px);
          border: 1px solid rgba(246, 212, 137, .34);
          border-radius: 14px;
          color: #221108;
          background:
            linear-gradient(90deg, rgba(255,255,255,.08), transparent 16%, transparent 84%, rgba(255,255,255,.07)),
            repeating-linear-gradient(90deg, rgba(77, 41, 17, .18) 0 2px, transparent 2px 96px),
            linear-gradient(135deg, #26140c 0%, #4c2b16 42%, #1a1010 100%);
          box-shadow:
            0 36px 90px rgba(0,0,0,.72),
            0 0 46px color-mix(in srgb, var(--project-color) 24%, transparent),
            inset 0 0 0 1px rgba(255,255,255,.07);
          transform-origin: 50% 0;
          animation: project-briefing-board-in .46s cubic-bezier(.18,.88,.2,1.1) both;
        }

        .project-briefing__board::before {
          content: "";
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(255, 230, 168, .17);
          border-radius: 10px;
          pointer-events: none;
        }

        .project-briefing__board::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 14% 16%, rgba(255, 230, 158, .12), transparent 16%),
            radial-gradient(circle at 88% 82%, color-mix(in srgb, var(--project-color) 18%, transparent), transparent 24%);
          mix-blend-mode: screen;
        }

        .project-briefing__rail {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 8px;
          background:
            linear-gradient(90deg, transparent, color-mix(in srgb, var(--project-color) 70%, #ffe3a5), transparent),
            linear-gradient(#100706, #100706);
          box-shadow: 0 0 22px color-mix(in srgb, var(--project-color) 40%, transparent);
          opacity: .82;
        }

        .project-briefing__scan {
          position: absolute;
          left: -30%;
          top: -40%;
          width: 42%;
          height: 180%;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255, 246, 197, .18), transparent);
          transform: rotate(16deg);
          animation: project-briefing-scan 2.6s .3s ease-out both;
        }

        .project-briefing__close {
          position: absolute;
          top: 22px;
          right: 22px;
          z-index: 4;
          display: grid;
          width: 54px;
          height: 54px;
          place-items: center;
          border: 1px solid rgba(255, 231, 172, .38);
          border-radius: 50%;
          background: rgba(10, 24, 26, .78);
          color: #fff3bf;
          cursor: pointer;
          box-shadow: 0 12px 26px rgba(0,0,0,.34), inset 0 0 0 1px rgba(255,255,255,.08);
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
        }

        .project-briefing__close:hover {
          border-color: var(--project-color);
          background: rgba(22, 38, 36, .94);
          transform: translateY(-1px) scale(1.04);
        }

        .project-briefing__close span {
          font-size: 26px;
          line-height: .72;
        }

        .project-briefing__close small {
          margin-top: -8px;
          color: rgba(255, 243, 191, .68);
          font: 800 8px/1 "Courier New", monospace;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .project-briefing__wanted,
        .project-briefing__brief,
        .project-briefing__intel,
        .project-briefing__footer {
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: project-briefing-panel-in .42s ease both;
        }

        .project-briefing__wanted {
          grid-area: wanted;
          min-height: 452px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 24px;
          border: 1px solid rgba(77, 25, 12, .24);
          border-radius: 8px;
          background:
            radial-gradient(circle at 18% 14%, rgba(255, 255, 230, .7), transparent 22%),
            repeating-linear-gradient(0deg, rgba(86, 46, 22, .045) 0 1px, transparent 1px 10px),
            linear-gradient(160deg, #f7e5ad 0%, #d8b36b 54%, #98724a 100%);
          box-shadow:
            0 18px 28px rgba(0,0,0,.18),
            inset 0 0 0 1px rgba(255,255,255,.2);
          transform: rotate(-1.5deg);
          animation-delay: .08s;
        }

        .project-briefing__wanted::before,
        .project-briefing__wanted::after {
          content: "";
          position: absolute;
          top: 16px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--project-color);
          box-shadow: inset 0 0 0 3px rgba(34, 10, 6, .24), 0 0 18px color-mix(in srgb, var(--project-color) 65%, transparent);
        }

        .project-briefing__wanted::before { left: 16px; }
        .project-briefing__wanted::after { right: 16px; }

        .project-briefing__file {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-left: 20px;
          color: rgba(97, 38, 24, .68);
          font: 900 .7rem/1 "Courier New", monospace;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .project-briefing__file i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(97, 38, 24, .48);
        }

        .project-briefing__wanted-label {
          margin-top: 34px;
          color: rgba(68, 19, 12, .78);
          font: 900 1.45rem/1 Georgia, "Times New Roman", serif;
          letter-spacing: .28em;
          text-align: center;
          text-transform: uppercase;
        }

        .project-briefing__wanted h2 {
          margin: 18px 0 0;
          color: #2a0f07;
          font: 900 4.35rem/.86 Georgia, "Times New Roman", serif;
          letter-spacing: 0;
          overflow-wrap: anywhere;
          text-align: center;
          text-shadow: 0 2px 0 rgba(255, 244, 197, .56);
        }

        .project-briefing__live {
          align-self: center;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 24px;
          padding: 9px 14px;
          border: 1px solid rgba(68,31,12,.2);
          border-radius: 999px;
          background: rgba(255,249,218,.48);
          color: rgba(47, 20, 9, .74);
          font: 900 .7rem/1 "Courier New", monospace;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .project-briefing__live span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--project-color);
          box-shadow: 0 0 14px var(--project-color);
        }

        .project-briefing__stamp {
          align-self: flex-end;
          margin-top: auto;
          color: color-mix(in srgb, var(--project-color) 68%, #5d1611);
          border: 3px solid currentColor;
          border-radius: 7px;
          padding: 8px 12px;
          font: 900 .78rem/1 "Courier New", monospace;
          letter-spacing: .16em;
          text-transform: uppercase;
          transform: rotate(-11deg) scale(.88);
          opacity: 0;
          animation: project-briefing-stamp .42s .46s cubic-bezier(.18,.9,.22,1.18) both;
        }

        .project-briefing__brief {
          grid-area: brief;
          min-height: 236px;
          display: grid;
          align-content: center;
          padding: 36px clamp(28px, 4vw, 48px);
          border: 1px solid rgba(255, 233, 184, .22);
          border-radius: 8px;
          background:
            linear-gradient(90deg, rgba(255, 238, 177, .08), transparent 18%),
            linear-gradient(135deg, rgba(11, 33, 39, .94), rgba(17, 20, 21, .98));
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.05);
          animation-delay: .16s;
        }

        .project-briefing__section-label {
          margin-bottom: 18px;
          color: color-mix(in srgb, var(--project-color) 70%, #fff2b5);
          font: 900 .72rem/1 "Courier New", monospace;
          letter-spacing: .26em;
          text-transform: uppercase;
        }

        .project-briefing__brief p {
          margin: 0;
          color: rgba(255, 242, 204, .92);
          font: 700 1.55rem/1.45 Georgia, "Times New Roman", serif;
        }

        .project-briefing__intel {
          grid-area: intel;
          display: grid;
          grid-template-columns: minmax(210px, .78fr) minmax(0, 1fr);
          gap: 14px;
          animation-delay: .24s;
        }

        .project-briefing__bounty {
          display: grid;
          align-content: center;
          gap: 8px;
          min-height: 156px;
          padding: 22px;
          border: 1px solid rgba(255, 233, 184, .18);
          border-radius: 8px;
          background:
            radial-gradient(circle at 84% 18%, color-mix(in srgb, var(--project-color) 28%, transparent), transparent 32%),
            linear-gradient(180deg, rgba(64, 20, 11, .96), rgba(22, 9, 7, .98));
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.04);
        }

        .project-briefing__bounty span,
        .project-briefing__bounty em {
          color: rgba(255,235,181,.66);
          font: 900 .65rem/1 "Courier New", monospace;
          letter-spacing: .22em;
          text-transform: uppercase;
          font-style: normal;
        }

        .project-briefing__bounty strong {
          color: var(--project-color);
          font: 900 2.7rem/.9 Georgia, "Times New Roman", serif;
          letter-spacing: .03em;
          text-shadow: 0 0 18px color-mix(in srgb, var(--project-color) 55%, transparent);
          overflow-wrap: anywhere;
        }

        .project-briefing__stack {
          display: flex;
          flex-wrap: wrap;
          align-content: center;
          gap: 10px;
          min-height: 156px;
          padding: 22px;
          border: 1px dashed rgba(255, 233, 184, .23);
          border-radius: 8px;
          background:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px),
            rgba(6, 18, 22, .76);
          background-size: 22px 22px;
        }

        .project-briefing__stack b {
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          padding: 0 14px;
          border: 1px solid color-mix(in srgb, var(--project-color) 52%, rgba(255,255,255,.22));
          border-radius: 999px;
          background: rgba(255, 244, 202, .08);
          color: rgba(255, 245, 215, .9);
          font: 900 .75rem/1 "Courier New", monospace;
          letter-spacing: .08em;
          box-shadow: 0 0 16px color-mix(in srgb, var(--project-color) 16%, transparent);
          opacity: 0;
          transform: translateY(8px);
          animation: project-briefing-tag-in .26s ease both;
          animation-delay: var(--tag-delay);
        }

        .project-briefing__footer {
          grid-area: footer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 18px 0;
          color: rgba(255, 235, 181, .55);
          font: 900 .68rem/1.4 "Courier New", monospace;
          letter-spacing: .2em;
          text-transform: uppercase;
          animation-delay: .31s;
        }

        .project-briefing__footer a {
          display: inline-flex;
          min-height: 48px;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
          border: 1px solid rgba(255,255,255,.24);
          border-radius: 999px;
          background: var(--project-color);
          color: #160806;
          font: 900 .76rem/1 "Courier New", monospace;
          letter-spacing: .14em;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 14px 28px color-mix(in srgb, var(--project-color) 28%, transparent);
          transition: transform .16s ease, filter .16s ease;
        }

        .project-briefing__footer a:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        @keyframes project-briefing-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes project-briefing-board-in {
          from { opacity: 0; transform: translateY(26px) rotateX(10deg) scale(.98); }
          to { opacity: 1; transform: translateY(0) rotateX(0) scale(1); }
        }

        @keyframes project-briefing-panel-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes project-briefing-stamp {
          0% { opacity: 0; transform: rotate(-24deg) scale(1.26); }
          100% { opacity: .92; transform: rotate(-11deg) scale(1); }
        }

        @keyframes project-briefing-tag-in {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes project-briefing-scan {
          0% { opacity: 0; transform: translateX(0) rotate(16deg); }
          12% { opacity: 1; }
          100% { opacity: 0; transform: translateX(330%) rotate(16deg); }
        }

        @media (max-width: 880px) {
          .project-briefing {
            align-items: flex-end;
            padding: 10px;
          }

          .project-briefing__board {
            width: 100%;
            max-height: 82vh;
            grid-template-columns: 1fr;
            grid-template-areas:
              "wanted"
              "brief"
              "intel"
              "footer";
            padding: 14px;
            border-radius: 12px 12px 0 0;
          }

          .project-briefing__close {
            top: 18px;
            right: 18px;
            width: 48px;
            height: 48px;
          }

          .project-briefing__wanted {
            min-height: 320px;
            transform: rotate(0);
            padding: 24px 18px;
          }

          .project-briefing__wanted-label {
            margin-top: 24px;
            font-size: 1.1rem;
          }

          .project-briefing__wanted h2 {
            font-size: 3rem;
          }

          .project-briefing__brief {
            min-height: auto;
            padding: 26px 20px;
          }

          .project-briefing__brief p {
            font-size: 1.22rem;
          }

          .project-briefing__intel {
            grid-template-columns: 1fr;
          }

          .project-briefing__bounty,
          .project-briefing__stack {
            min-height: auto;
          }

          .project-briefing__bounty strong {
            font-size: 2.18rem;
          }

          .project-briefing__footer {
            align-items: stretch;
            flex-direction: column;
            padding: 12px 4px 0;
          }
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
  const timerRef              = useRef([])

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []
  }

  // Mount/unmount with clean transitions
  useEffect(() => {
    clearTimers()
    if (active) {
      timerRef.current.push(setTimeout(() => setMounted(true), 0))
      timerRef.current.push(setTimeout(() => setVisible(true), PANEL_DELAY_MS))
    } else {
      timerRef.current.push(setTimeout(() => setVisible(false), 0))
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
      {!selectedProject && (
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
      )}

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
