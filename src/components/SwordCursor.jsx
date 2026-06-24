import { useEffect, useRef, useState } from 'react'

const CURSOR_ASSET = '/katana-1.svg'
const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[data-cursor-hover]',
].join(',')

function watchMediaQuery(query, onChange) {
  if (query.addEventListener) {
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }

  query.addListener(onChange)
  return () => query.removeListener(onChange)
}

export default function SwordCursor() {
  const cursorRef = useRef(null)
  const slashLayerRef = useRef(null)
  const frameRef = useRef(null)
  const slashTimeoutRef = useRef(null)
  const cleanupTimersRef = useRef(new Set())
  const visibleRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncPointer = () => setEnabled(pointerQuery.matches)
    const syncReducedMotion = () => {
      reducedMotionRef.current = reducedMotionQuery.matches
    }

    syncPointer()
    syncReducedMotion()

    const cleanupPointer = watchMediaQuery(pointerQuery, syncPointer)
    const cleanupReducedMotion = watchMediaQuery(reducedMotionQuery, syncReducedMotion)

    return () => {
      cleanupPointer()
      cleanupReducedMotion()
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('sword-cursor-enabled', enabled)

    return () => {
      root.classList.remove('sword-cursor-enabled')
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined

    const cursor = cursorRef.current
    const slashLayer = slashLayerRef.current
    const cleanupTimers = cleanupTimersRef.current
    if (!cursor || !slashLayer) return undefined

    const setVisible = (nextVisible) => {
      if (visibleRef.current === nextVisible) return
      visibleRef.current = nextVisible
      cursor.classList.toggle('visible', nextVisible)
    }

    const setHovering = (target) => {
      cursor.classList.toggle('hovering', Boolean(target?.closest?.(INTERACTIVE_SELECTOR)))
    }

    const removeSlashClass = () => {
      cursor.classList.remove('slashing')
    }

    const addSlash = (event) => {
      const slash = document.createElement('span')
      const removeSlash = () => {
        slash.remove()
        window.clearTimeout(timeout)
        cleanupTimers.delete(timeout)
      }
      const timeout = window.setTimeout(removeSlash, 460)

      slash.className = 'sword-cursor__slash'
      slash.style.left = `${event.clientX}px`
      slash.style.top = `${event.clientY}px`
      slashLayer.appendChild(slash)
      slash.addEventListener('animationend', removeSlash, { once: true })
      cleanupTimers.add(timeout)
    }

    const onPointerMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return

      targetRef.current.x = event.clientX
      targetRef.current.y = event.clientY
      setHovering(event.target)

      if (!visibleRef.current) {
        currentRef.current.x = event.clientX
        currentRef.current.y = event.clientY
        setVisible(true)
      }
    }

    const onPointerDown = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      if (reducedMotionRef.current) return

      cursor.classList.remove('slashing')
      void cursor.offsetWidth
      cursor.classList.add('slashing')

      window.clearTimeout(slashTimeoutRef.current)
      slashTimeoutRef.current = window.setTimeout(removeSlashClass, 420)
      addSlash(event)
    }

    const onPointerLeave = () => {
      setVisible(false)
      setHovering(null)
    }

    const tick = () => {
      const target = targetRef.current
      const current = currentRef.current
      const ease = reducedMotionRef.current ? 0.55 : 0.22

      current.x += (target.x - current.x) * ease
      current.y += (target.y - current.y) * ease
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`

      frameRef.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('blur', onPointerLeave)
    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('blur', onPointerLeave)
      window.cancelAnimationFrame(frameRef.current)
      window.clearTimeout(slashTimeoutRef.current)
      cleanupTimers.forEach((timeout) => window.clearTimeout(timeout))
      cleanupTimers.clear()
      slashLayer.replaceChildren()
      cursor.classList.remove('visible', 'hovering', 'slashing')
      cursor.style.transform = ''
      visibleRef.current = false
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          html.sword-cursor-enabled,
          html.sword-cursor-enabled * {
            cursor: none !important;
          }
        }

        .sword-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 48px;
          height: 48px;
          z-index: 2147483647;
          pointer-events: none;
          opacity: 0;
          transform: translate3d(-100px, -100px, 0);
          transition: opacity 120ms ease;
          will-change: transform, opacity;
          contain: layout style paint;
        }

        .sword-cursor.visible {
          opacity: 1;
        }

        .sword-cursor__blade {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
          transform: translate(-25%, -20%) rotate(-25deg);
          transform-origin: 24% 22%;
          transition: transform 150ms ease;
          will-change: transform;
        }

        .sword-cursor.hovering .sword-cursor__blade {
          transform: translate(-25%, -20%) rotate(-16deg) scale(1.1);
        }

        .sword-cursor.slashing .sword-cursor__blade {
          animation: swordSlash 420ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sword-cursor__slash-layer {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          pointer-events: none;
          overflow: hidden;
        }

        .sword-cursor__slash {
          position: fixed;
          left: 0;
          top: 0;
          width: 78px;
          height: 18px;
          pointer-events: none;
          transform: translate(-36%, -58%) rotate(-24deg) scaleX(0.2);
          transform-origin: 18% 50%;
          opacity: 0;
          will-change: transform, opacity;
          animation: swordTrail 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .sword-cursor__slash::before,
        .sword-cursor__slash::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          border-radius: 999px;
        }

        .sword-cursor__slash::before {
          top: 8px;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(120, 255, 136, 0.78) 40%, rgba(245, 255, 245, 0.95) 54%, transparent 100%);
        }

        .sword-cursor__slash::after {
          top: 12px;
          height: 1px;
          width: 54px;
          background: linear-gradient(90deg, transparent 0%, rgba(108, 220, 120, 0.52) 48%, transparent 100%);
        }

        @keyframes swordSlash {
          0% {
            transform: translate(-25%, -20%) rotate(-25deg) scale(1);
          }
          34% {
            transform: translate(-15%, -28%) rotate(18deg) scale(1.13);
          }
          66% {
            transform: translate(-28%, -18%) rotate(-34deg) scale(1.04);
          }
          100% {
            transform: translate(-25%, -20%) rotate(-25deg) scale(1);
          }
        }

        @keyframes swordTrail {
          0% {
            opacity: 0;
            transform: translate(-42%, -58%) rotate(-24deg) scaleX(0.18);
          }
          24% {
            opacity: 0.88;
          }
          100% {
            opacity: 0;
            transform: translate(-10%, -68%) rotate(-24deg) scaleX(1);
          }
        }

        @media (pointer: coarse) {
          html.sword-cursor-enabled,
          html.sword-cursor-enabled * {
            cursor: auto !important;
          }

          .sword-cursor,
          .sword-cursor__slash-layer {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sword-cursor__blade {
            transition-duration: 80ms;
          }

          .sword-cursor.slashing .sword-cursor__blade,
          .sword-cursor__slash {
            animation: none;
          }

          .sword-cursor__slash {
            display: none;
          }
        }
      `}</style>

      <div ref={slashLayerRef} className="sword-cursor__slash-layer" aria-hidden="true" />
      <div ref={cursorRef} className="sword-cursor" aria-hidden="true">
        <img className="sword-cursor__blade" src={CURSOR_ASSET} alt="" draggable="false" />
      </div>
    </>
  )
}
