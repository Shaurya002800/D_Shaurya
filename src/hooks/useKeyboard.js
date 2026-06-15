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

      if (keys.current.hasOwnProperty(e.key)) {
        e.preventDefault()
        keys.current[e.key] = true
      }
    }
    const up = (e) => {
      if (window.__PORTFOLIO_CHAT_ACTIVE__) {
        releaseKeys()
        return
      }

      if (keys.current.hasOwnProperty(e.key)) {
        keys.current[e.key] = false
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('portfolio-chat-state-change', releaseKeys)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('portfolio-chat-state-change', releaseKeys)
    }
  }, [])

  return keys
}
