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
  const trailLayerRef = useRef(null)
  const frameRef = useRef(null)
  const slashTimeoutRef = useRef(null)
  const trailTimeoutsRef = useRef(new Set())
  const visibleRef = useRef(false)
  const hoveringRef = useRef(false)
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
    const trailLayer = trailLayerRef.current
    const trailTimeouts = trailTimeoutsRef.current
    if (!cursor || !trailLayer) return undefined

    const setVisible = (nextVisible) => {
      if (visibleRef.current === nextVisible) return
      visibleRef.current = nextVisible
      cursor.classList.toggle('visible', nextVisible)
    }

    const setHovering = (target) => {
      const nextHovering = Boolean(target?.closest?.(INTERACTIVE_SELECTOR))
      if (hoveringRef.current === nextHovering) return
      hoveringRef.current = nextHovering
      cursor.classList.toggle('hovering', nextHovering)
    }

    const removeSlashClass = () => {
      cursor.classList.remove('slashing')
    }

    const addSlashTrail = (event) => {
      const trail = document.createElement('span')
      const removeTrail = () => {
        trail.remove()
        window.clearTimeout(timeout)
        trailTimeouts.delete(timeout)
      }
      const timeout = window.setTimeout(removeTrail, 520)

      trail.className = 'sword-cursor__trail'
      trail.style.left = `${event.clientX}px`
      trail.style.top = `${event.clientY}px`
      trailLayer.appendChild(trail)
      trail.addEventListener('animationend', removeTrail, { once: true })
      trailTimeouts.add(timeout)
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

      if (reducedMotionRef.current) {
        removeSlashClass()
        return
      }

      cursor.classList.remove('slashing')
      void cursor.offsetWidth
      cursor.classList.add('slashing')

      window.clearTimeout(slashTimeoutRef.current)
      slashTimeoutRef.current = window.setTimeout(removeSlashClass, 430)
      addSlashTrail(event)
    }

    const onPointerLeave = () => {
      setVisible(false)
      setHovering(null)
    }

    const tick = () => {
      const target = targetRef.current
      const current = currentRef.current
      const ease = reducedMotionRef.current ? 0.55 : 0.2

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
      trailTimeouts.forEach((timeout) => window.clearTimeout(timeout))
      trailTimeouts.clear()
      cursor.classList.remove('visible', 'hovering', 'slashing')
      cursor.style.transform = ''
      visibleRef.current = false
      hoveringRef.current = false
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
          filter:
            drop-shadow(0 0 4px rgba(85, 255, 120, 0.42))
            drop-shadow(0 1px 2px rgba(0, 0, 0, 0.32));
          transition:
            filter 160ms ease,
            transform 160ms ease;
          will-change: transform, filter;
        }

        .sword-cursor.hovering .sword-cursor__blade {
          transform: translate(-25%, -20%) rotate(-16deg) scale(1.12);
          filter:
            drop-shadow(0 0 7px rgba(93, 255, 125, 0.76))
            drop-shadow(0 0 14px rgba(29, 211, 81, 0.36))
            drop-shadow(0 2px 3px rgba(0, 0, 0, 0.38));
        }

        .sword-cursor.slashing .sword-cursor__blade {
          animation: swordSlash 430ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sword-cursor__trails {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          pointer-events: none;
          overflow: hidden;
        }

        .sword-cursor__trail {
          position: fixed;
          width: 64px;
          height: 14px;
          pointer-events: none;
          transform: translate(-36%, -58%) rotate(-23deg);
          transform-origin: 20% 50%;
          border-radius: 999px;
          background:
            linear-gradient(90deg,
              rgba(151, 255, 165, 0) 0%,
              rgba(151, 255, 165, 0.78) 44%,
              rgba(234, 255, 237, 0.9) 58%,
              rgba(63, 255, 115, 0) 100%);
          box-shadow: 0 0 14px rgba(64, 255, 112, 0.42);
          opacity: 0;
          animation: swordTrail 420ms ease-out forwards;
          will-change: transform, opacity;
        }

        @keyframes swordSlash {
          0% {
            transform: translate(-25%, -20%) rotate(-25deg) scale(1);
          }
          34% {
            transform: translate(-16%, -28%) rotate(18deg) scale(1.16);
          }
          64% {
            transform: translate(-28%, -18%) rotate(-34deg) scale(1.06);
          }
          100% {
            transform: translate(-25%, -20%) rotate(-25deg) scale(1);
          }
        }

        @keyframes swordTrail {
          0% {
            opacity: 0;
            transform: translate(-42%, -58%) rotate(-23deg) scaleX(0.22);
          }
          24% {
            opacity: 0.82;
          }
          100% {
            opacity: 0;
            transform: translate(-26%, -58%) rotate(-23deg) scaleX(1);
          }
        }

        @media (pointer: coarse) {
          html.sword-cursor-enabled,
          html.sword-cursor-enabled * {
            cursor: auto !important;
          }

          .sword-cursor,
          .sword-cursor__trails {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sword-cursor {
            transition-duration: 60ms;
          }

          .sword-cursor__blade {
            transition-duration: 80ms;
          }

          .sword-cursor.slashing .sword-cursor__blade {
            animation: none;
          }

          .sword-cursor__trail {
            display: none;
            animation: none;
          }
        }
      `}</style>

      <div ref={trailLayerRef} className="sword-cursor__trails" aria-hidden="true" />
      <div ref={cursorRef} className="sword-cursor" aria-hidden="true">
        <img className="sword-cursor__blade" src={CURSOR_ASSET} alt="" draggable="false" />
      </div>
    </>
  )
}
