import './LuffyCharacter.css'

function InteractionHint({ label }) {
  if (!label) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '38px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        fontFamily: '"Pirata One", cursive',
        fontSize: '15px',
        letterSpacing: '0.08em',
        color: '#f0c040',
        background: 'rgba(0,0,0,0.52)',
        border: '1px solid rgba(240,192,64,0.35)',
        borderRadius: '8px',
        padding: '8px 22px',
        pointerEvents: 'none',
        textShadow: '0 0 12px rgba(240,192,64,0.6)',
        backdropFilter: 'blur(6px)',
        animation: 'hintPulse 1.8s ease-in-out infinite',
      }}
    >
      {label}
    </div>
  )
}

function isDebugHudEnabled() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem('grand-line-debug-hud') === 'true'
  } catch {
    return false
  }
}

function SpeedIndicator({ speed, state }) {
  if (!isDebugHudEnabled()) return null

  return (
    <div className="luffy-debug-hud" aria-label="Developer movement debug">
      <div>state: <span style={{ color: '#f0c040' }}>{state}</span></div>
      <div>speed: <span style={{ color: '#44ffaa' }}>{speed.toFixed(2)}</span></div>
    </div>
  )
}

export default function LuffyUI({ hintLabel, speed, charState }) {
  const label = typeof hintLabel === 'string' ? hintLabel : hintLabel?.label ?? null

  return (
    <>
      <InteractionHint label={label} />
      <SpeedIndicator speed={speed} state={charState} />
    </>
  )
}
