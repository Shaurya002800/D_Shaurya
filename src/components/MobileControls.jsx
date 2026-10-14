import { useEffect, useRef, useState } from 'react'
import './MobileControls.css'

const MOVEMENT_KEYS = ['w', 'a', 's', 'd']

function setVirtualKey(key, pressed) {
  window.dispatchEvent(new CustomEvent('portfolio-virtual-key', { detail: { key, pressed } }))
}

export default function MobileControls({ visible = true, hintLabel = null }) {
  const pointerRef = useRef(null)
  const padRef = useRef(null)
  const pressedRef = useRef(new Set())
  const [thumb, setThumb] = useState({ x: 0, y: 0 })
  const label = typeof hintLabel === 'string' ? hintLabel : hintLabel?.label
  const actionLabel = label?.replace(/^press e\s*[-–—:]?\s*/i, '') || 'Move near an object to interact'

  const updateKeys = (nextKeys) => {
    const next = new Set(nextKeys)
    MOVEMENT_KEYS.forEach(key => {
      if (pressedRef.current.has(key) !== next.has(key)) setVirtualKey(key, next.has(key))
    })
    pressedRef.current = next
  }

  useEffect(() => {
    const release = () => {
      pressedRef.current.forEach(key => setVirtualKey(key, false))
      pressedRef.current.clear()
      pointerRef.current = null
      setThumb({ x: 0, y: 0 })
    }
    const onVisibility = () => { if (document.hidden) release() }
    window.addEventListener('blur', release)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      pressedRef.current.forEach(key => setVirtualKey(key, false))
      pressedRef.current.clear()
      pointerRef.current = null
      setThumb({ x: 0, y: 0 })
      window.removeEventListener('blur', release)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [visible])

  if (!visible) return null

  const move = (event) => {
    if (pointerRef.current !== event.pointerId) return
    const bounds = padRef.current.getBoundingClientRect()
    const dx = event.clientX - bounds.left - bounds.width / 2
    const dy = event.clientY - bounds.top - bounds.height / 2
    const distance = Math.hypot(dx, dy)
    const radius = bounds.width * .3
    const scale = distance > radius ? radius / distance : 1
    setThumb({ x: dx * scale, y: dy * scale })
    // A dead zone prevents accidental movement; the angle allows diagonals.
    const next = []
    if (distance > 10) {
      if (dy / distance < -.38) next.push('w')
      if (dy / distance > .38) next.push('s')
      if (dx / distance < -.38) next.push('a')
      if (dx / distance > .38) next.push('d')
    }
    updateKeys(next)
    event.preventDefault()
  }

  const release = (event) => {
    if (pointerRef.current !== event.pointerId) return
    pointerRef.current = null
    updateKeys([])
    setThumb({ x: 0, y: 0 })
  }

  return (
    <div className="mobile-helm" aria-label="Mobile ship controls">
      <div className="mobile-helm__movement">
        <button
          ref={padRef}
          className="mobile-helm__joystick"
          type="button"
          aria-label="Move character: drag the joystick in any direction"
          onPointerDown={event => {
            if (pointerRef.current !== null) return
            pointerRef.current = event.pointerId
            event.currentTarget.setPointerCapture(event.pointerId)
            move(event)
          }}
          onPointerMove={move}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onContextMenu={event => event.preventDefault()}
          onKeyDown={event => {
            const key = { ArrowUp: 'w', ArrowDown: 's', ArrowLeft: 'a', ArrowRight: 'd' }[event.key]
            if (key) { event.preventDefault(); updateKeys([...pressedRef.current, key]) }
          }}
          onKeyUp={event => {
            const key = { ArrowUp: 'w', ArrowDown: 's', ArrowLeft: 'a', ArrowRight: 'd' }[event.key]
            if (key) { event.preventDefault(); updateKeys([...pressedRef.current].filter(item => item !== key)) }
          }}
          onBlur={() => {
            if (pointerRef.current === null) { updateKeys([]); setThumb({ x: 0, y: 0 }) }
          }}
        >
          <span className="mobile-helm__directions" aria-hidden="true">✥</span>
          <span className="mobile-helm__thumb" style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }} />
        </button>
        <small>MOVE</small>
      </div>
      <p className="mobile-helm__look">Swipe the ship<br />to look around</p>
      <div className="mobile-helm__action">
        <button
          className={`mobile-helm__interact${label ? ' is-ready' : ''}`}
          type="button"
          aria-label={actionLabel}
          disabled={!label}
          onClick={() => window.dispatchEvent(new Event('portfolio-interact'))}
        ><span aria-hidden="true">✦</span><small>{label ? 'OPEN' : 'INTERACT'}</small></button>
      </div>
    </div>
  )
}
