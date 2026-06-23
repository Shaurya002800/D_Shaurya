import { useEffect, useRef } from 'react'

export function useKeyboard() {
  const keys = useRef({
  w: false, a: false, s: false, d: false,
  e: false,
  ArrowUp: false, ArrowDown: false,
  ArrowLeft: false, ArrowRight: false,
})

  useEffect(() => {
    const releaseKeys = () => {
      Object.keys(keys.current).forEach((key) => {
        keys.current[key] = false
      })
    }

    const down = (e) => {
      if (window.__PORTFOLIO_CHAT_ACTIVE__) {
        releaseKeys()
        return
      }

      if (Object.prototype.hasOwnProperty.call(keys.current, e.key)) {
        e.preventDefault()
        keys.current[e.key] = true
      }
    }
    const up = (e) => {
      if (window.__PORTFOLIO_CHAT_ACTIVE__) {
        releaseKeys()
        return
      }

      if (Object.prototype.hasOwnProperty.call(keys.current, e.key)) {
        keys.current[e.key] = false
      }
    }
    const virtualKey = (e) => {
      const { key, pressed } = e.detail ?? {}
      if (!Object.prototype.hasOwnProperty.call(keys.current, key)) return
      keys.current[key] = Boolean(pressed)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('portfolio-virtual-key', virtualKey)
    window.addEventListener('portfolio-chat-state-change', releaseKeys)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('portfolio-virtual-key', virtualKey)
      window.removeEventListener('portfolio-chat-state-change', releaseKeys)
    }
  }, [])

  return keys
}
