import { useEffect, useRef } from 'react'

export function useKeyboard() {
  const keys = useRef({
  w: false, a: false, s: false, d: false,
  e: false,
  ArrowUp: false, ArrowDown: false,
  ArrowLeft: false, ArrowRight: false,
})

  useEffect(() => {
    const down = (e) => {
      if (keys.current.hasOwnProperty(e.key)) {
        e.preventDefault()
        keys.current[e.key] = true
      }
    }
    const up = (e) => {
      if (keys.current.hasOwnProperty(e.key)) {
        keys.current[e.key] = false
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}