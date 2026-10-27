import { useEffect, useRef } from 'react'

// One focus trap for the map, Captain Log and archive; works without WebGL.
export function useDialog(open, onClose) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    if (!open || !ref.current) return undefined
    const previous = document.activeElement
    const panel = ref.current
    window.dispatchEvent(new Event('portfolio-dialog-state-change'))
    const focusable = () => [...panel.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')].filter(el => el.getClientRects().length)
    ;(focusable()[0] || panel).focus()
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeRef.current?.(); return }
      if (event.key !== 'Tab') return
      const elements = focusable(), first = elements[0], last = elements.at(-1)
      if (!first) { event.preventDefault(); panel.focus(); return }
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    panel.addEventListener('keydown', onKey)
    return () => {
      panel.removeEventListener('keydown', onKey)
      window.dispatchEvent(new Event('portfolio-dialog-state-change'))
      requestAnimationFrame(() => {
        const nextDialog = document.querySelector('[role="dialog"][aria-modal="true"]')
        if (nextDialog && nextDialog !== panel && !nextDialog.contains(previous)) return
        const target = previous?.isConnected ? previous : document.querySelector('.grand-map-trigger, .portfolio-intro__primary')
        target?.focus()
      })
    }
  }, [open])
  return ref
}
