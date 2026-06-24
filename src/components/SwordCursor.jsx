import { useEffect, useRef, useState } from 'react'

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'summary',
  '[role="button"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function SwordCursor() {
  const bladeRef = useRef(null)
  const auraRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const lastRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [slashing, setSlashing] = useState(false)
  const [slashes, setSlashes] = useState([])

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    const syncEnabled = () => setEnabled(query.matches)

    syncEnabled()
    query.addEventListener('change', syncEnabled)

    return () => query.removeEventListener('change', syncEnabled)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    let slashTimer
    const cleanupSlashes = new Map()

    const onPointerMove = (event) => {
      pointerRef.current.x = event.clientX
      pointerRef.current.y = event.clientY
      if (!visible) {
        currentRef.current.x = event.clientX
        currentRef.current.y = event.clientY
        lastRef.current.x = event.clientX
        lastRef.current.y = event.clientY
        setVisible(true)
      }
    }

    const onPointerLeave = () => setVisible(false)
    const onPointerEnter = (event) => {
      pointerRef.current.x = event.clientX
      pointerRef.current.y = event.clientY
      setVisible(true)
    }

    const onPointerOver = (event) => {
      setHovering(Boolean(event.target.closest?.(INTERACTIVE_SELECTOR)))
    }

    const onPointerOut = (event) => {
      if (!event.relatedTarget?.closest?.(INTERACTIVE_SELECTOR)) {
        setHovering(false)
      }
    }

    const onPointerDown = (event) => {
      const id = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
      const angle = bladeRef.current?.dataset.angle ?? '35'

      setSlashing(true)
      setSlashes((items) => [
        ...items.slice(-4),
        {
          id,
          angle,
          x: event.clientX,
          y: event.clientY,
        },
      ])

      clearTimeout(slashTimer)
      slashTimer = window.setTimeout(() => setSlashing(false), 170)

      const cleanup = window.setTimeout(() => {
        setSlashes((items) => items.filter((item) => item.id !== id))
        cleanupSlashes.delete(id)
      }, 520)
      cleanupSlashes.set(id, cleanup)
    }

    const tick = () => {
      const pointer = pointerRef.current
      const current = currentRef.current
      const last = lastRef.current
      const dx = pointer.x - current.x
      const dy = pointer.y - current.y

      current.x += dx * 0.24
      current.y += dy * 0.24

      const velocityX = current.x - last.x
      const velocityY = current.y - last.y
      const speed = Math.min(Math.hypot(velocityX, velocityY), 44)
      const travelAngle = Math.atan2(velocityY, velocityX) * 180 / Math.PI
      const restingAngle = 36
      const angle = speed > 0.35 ? travelAngle + 38 : restingAngle
      const tilt = Math.max(-12, Math.min(12, velocityY * 0.26))
      const scale = hovering ? 1.16 : 1

      if (bladeRef.current) {
        bladeRef.current.dataset.angle = String(angle)
        bladeRef.current.style.transform = [
          `translate3d(${current.x - 15}px, ${current.y - 72}px, 0)`,
          `rotate(${angle + tilt}deg)`,
          `scale(${scale})`,
        ].join(' ')
      }

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${current.x - 18}px, ${current.y - 18}px, 0) scale(${hovering ? 1.55 : 1})`
      }

      last.x = current.x
      last.y = current.y
      rafRef.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerenter', onPointerEnter, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('pointerout', onPointerOut, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerenter', onPointerEnter)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('pointerdown', onPointerDown)
      window.cancelAnimationFrame(rafRef.current)
      clearTimeout(slashTimer)
      cleanupSlashes.forEach(clearTimeout)
    }
  }, [enabled, hovering, visible])

  if (!enabled) return null

  return (
    <>
      <div
        ref={auraRef}
        className={`sword-cursor__aura${visible ? ' is-visible' : ''}${hovering ? ' is-hovering' : ''}`}
        aria-hidden="true"
      />

      <div
        ref={bladeRef}
        className={[
          'sword-cursor',
          visible ? 'is-visible' : '',
          hovering ? 'is-hovering' : '',
          slashing ? 'is-slashing' : '',
        ].join(' ')}
        aria-hidden="true"
      >
        <svg viewBox="0 0 96 96" className="sword-cursor__svg">
          <defs>
            <linearGradient id="swordBlade" x1="14" y1="5" x2="57" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.38" stopColor="#dff8ff" />
              <stop offset="0.78" stopColor="#9ab7c4" />
              <stop offset="1" stopColor="#5e7581" />
            </linearGradient>
            <linearGradient id="swordGreen" x1="54" y1="60" x2="88" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#9bff72" />
              <stop offset="0.48" stopColor="#2db84f" />
              <stop offset="1" stopColor="#102f1d" />
            </linearGradient>
            <filter id="swordGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#72ff84" floodOpacity="0.72" />
            </filter>
          </defs>

          <path
            className="sword-cursor__shadow"
            d="M12 5 18 3 64 58 58 64 13 12Z"
            fill="rgba(0,0,0,.36)"
            transform="translate(3 4)"
          />
          <path d="M12 5 18 3 64 58 58 64 13 12Z" fill="url(#swordBlade)" stroke="#111f24" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M18 3 64 58 61 61 15 8Z" fill="rgba(255,255,255,.42)" />
          <path d="M54 65 65 54 72 61 61 72Z" fill="#152418" stroke="#89ff7c" strokeWidth="2.2" filter="url(#swordGlow)" />
          <path d="M63 71 72 62 91 81c2.1 2.1 2.1 5.5 0 7.6l-.4.4c-2.1 2.1-5.5 2.1-7.6 0Z" fill="url(#swordGreen)" stroke="#0e160f" strokeWidth="2.2" />
          <path d="M72.5 70.5 78.5 64.5" stroke="#e6ffd8" strokeWidth="4" strokeLinecap="round" />
          <path d="M79.5 77.5 85.5 71.5" stroke="#e6ffd8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="72" cy="72" r="4.2" fill="#d9c56a" stroke="#171208" strokeWidth="1.8" />
        </svg>
      </div>

      {slashes.map((slash) => (
        <span
          key={slash.id}
          className="sword-cursor__slash"
          style={{
            left: slash.x,
            top: slash.y,
            transform: `translate(-50%, -50%) rotate(${Number(slash.angle) + 8}deg)`,
          }}
          aria-hidden="true"
        >
          <i />
          <b />
          <em />
        </span>
      ))}
    </>
  )
}
