import { useEffect, useRef, useState } from 'react'
import { useDialog } from '../hooks/useDialog.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { BOUNTY_BOARD_TITLE, BOUNTY_ROUTES } from '../data/bountyBoard.js'
import './GrandLineMap.css'

function PosterMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="m9 5 24 3-3 29-24-3Z" stroke="currentColor" opacity=".45" />
      <path d="M10 5h23v30H10Z" fill="currentColor" fillOpacity=".08" stroke="currentColor" />
      <path d="M14 10h15M14 29h15" stroke="currentColor" />
      <path d="m15 15 3 9 3-6 3 6 3-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function Arrow({ left = false }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={left ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>
}

function BountyBoard({ onClose, onRoute }) {
  const trackRef = useRef(null)
  const progressRef = useRef(null)
  const direction = useRef(1)
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = useReducedMotion()
  const moving = playing && !hovered && !focused && !reducedMotion

  useEffect(() => {
    const track = trackRef.current
    const updateProgress = () => {
      const maximum = track.scrollWidth - track.clientWidth
      const position = maximum > 0 ? track.scrollLeft / maximum : 1
      progressRef.current?.style.setProperty('--progress', Math.max(.04, position))
    }
    const wheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return
      const maximum = track.scrollWidth - track.clientWidth
      if (maximum <= 0 || (event.deltaY < 0 && track.scrollLeft <= 0) || (event.deltaY > 0 && track.scrollLeft >= maximum - 1)) return
      event.preventDefault()
      setPlaying(false)
      track.scrollLeft += event.deltaY * (event.deltaMode === 1 ? 16 : 1)
    }
    const resize = new ResizeObserver(updateProgress)
    resize.observe(track)
    track.addEventListener('scroll', updateProgress, { passive: true })
    track.addEventListener('wheel', wheel, { passive: false })
    updateProgress()
    return () => {
      resize.disconnect()
      track.removeEventListener('scroll', updateProgress)
      track.removeEventListener('wheel', wheel)
    }
  }, [])

  useEffect(() => {
    if (!moving) return undefined
    const track = trackRef.current
    let frame
    let previous
    let position = track.scrollLeft
    const drift = (time) => {
      const maximum = track.scrollWidth - track.clientWidth
      const elapsed = previous === undefined ? 0 : Math.min(time - previous, 50)
      previous = time
      if (maximum > 0) {
        position = Math.min(maximum, Math.max(0, position + direction.current * elapsed * .028))
        track.scrollLeft = position
        if (position >= maximum) direction.current = -1
        else if (position <= 0) direction.current = 1
      }
      frame = requestAnimationFrame(drift)
    }
    frame = requestAnimationFrame(drift)
    return () => cancelAnimationFrame(frame)
  }, [moving])

  const scrollPosters = (amount) => {
    setPlaying(false)
    const track = trackRef.current
    const poster = track.querySelector('.grand-map__route')
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 28
    track.scrollBy({ left: amount * ((poster?.offsetWidth ?? 260) + gap), behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const tiltPoster = (event) => {
    if (reducedMotion || event.pointerType !== 'mouse') return
    const poster = event.currentTarget
    const bounds = poster.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    poster.style.setProperty('--lean-x', `${(x - .5) * 6}deg`)
    poster.style.setProperty('--lean-y', `${(.5 - y) * 4}deg`)
    poster.style.setProperty('--light-x', `${x * 100}%`)
    poster.style.setProperty('--light-y', `${y * 100}%`)
  }

  const settlePoster = (event) => {
    event.currentTarget.style.removeProperty('--lean-x')
    event.currentTarget.style.removeProperty('--lean-y')
    event.currentTarget.style.removeProperty('--light-x')
    event.currentTarget.style.removeProperty('--light-y')
  }

  return (
    <section className={`grand-map__panel ${playing && !reducedMotion ? 'has-atmosphere' : ''}`} aria-describedby="bounty-board-intro">
      <div className="grand-map__atmosphere" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <header className="grand-map__header">
        <div className="grand-map__seal"><PosterMark /></div>
        <div className="grand-map__heading">
          <p className="grand-map__eyebrow">Marine intelligence · restricted archive</p>
          <h2 id="grand-map-title">{BOUNTY_BOARD_TITLE}</h2>
          <p id="bounty-board-intro" className="grand-map__intro">Every legend leaves a paper trail. Choose yours.</p>
        </div>
        <button type="button" className="grand-map__close" onClick={onClose} aria-label={`Close ${BOUNTY_BOARD_TITLE}`}><span aria-hidden="true">×</span></button>
      </header>

      <div className="grand-map__toolbar">
        <span className="grand-map__dispatch"><i /> Five files. One voyage. <b>№ 001—005</b></span>
        <div className="grand-map__controls" aria-label="Poster movement">
          {!reducedMotion && <button type="button" className="grand-map__motion" aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>{playing ? <><span aria-hidden="true">Ⅱ</span> Pause</> : <><span aria-hidden="true">▷</span> Play</>}</button>}
          <button type="button" onClick={() => scrollPosters(-1)} aria-label="Scroll to previous posters"><Arrow left /></button>
          <button type="button" onClick={() => scrollPosters(1)} aria-label="Scroll to next posters"><Arrow /></button>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`grand-map__routes ${moving ? 'is-drifting' : ''}`}
        role="region"
        aria-label="Wanted poster destinations"
        tabIndex={0}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true) }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={() => setPlaying(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            scrollPosters(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}
      >
        {BOUNTY_ROUTES.map((route, index) => (
          <article className={`grand-map__route bounty-poster--${route.key}`} key={route.key} style={{ '--tilt': route.tilt, '--sway-delay': `${index * -.85}s`, '--paper-position': `${index % 2 ? '100%' : '0%'} 50%` }} onPointerMove={tiltPoster} onPointerLeave={settlePoster}>
            <div className="bounty-poster__paper">
              <div className="bounty-poster__masthead" aria-hidden="true">WANTED</div>
              <div className="bounty-poster__issue"><span>BY ORDER OF THE WORLD GOVERNMENT</span><span>00{index + 1}</span></div>
              <div className="bounty-poster__portrait"><img src={route.image} alt="" loading="eager" decoding="sync" width="576" height="768" /></div>
              <div className="bounty-poster__verdict" aria-hidden="true">DEAD OR ALIVE</div>
              <p className="bounty-poster__character">{route.character}</p>
              <p className="bounty-poster__epithet">“{route.epithet}”<span className="bounty-poster__danger" aria-hidden="true">{route.key === 'contact' ? 'CLASSIFIED' : 'AT LARGE'}</span></p>
              <div className="bounty-poster__destination">
                <span className="grand-map__object">PORTFOLIO FILE № 00{index + 1} · {route.object}</span>
                <h3 className="bounty-poster__sr-only">{route.destination}</h3>
                <button type="button" className="bounty-poster__action" onClick={() => onRoute(route.key)} aria-label={`${route.destination}: ${route.action}`} aria-describedby={`bounty-clue-${route.key}`}><span className="bounty-poster__currency" aria-hidden="true">฿</span><span>{route.destination}</span><Arrow /></button>
                <p id={`bounty-clue-${route.key}`} className="bounty-poster__clue">{route.clue}</p>
              </div>
              <div className="bounty-poster__footnote"><span>ANY INFORMATION REGARDING THIS<br />PERSON’S WHEREABOUTS IS REQUESTED.</span><span className="bounty-poster__stamp">✦<small>ISSUED</small></span><strong>MARINE</strong></div>
              <span className="bounty-poster__curl" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>

      <div ref={progressRef} className="grand-map__progress" aria-hidden="true"><span /></div>
      <footer className="grand-map__footer">
        <div className="grand-map__scroll-hint"><span aria-hidden="true">↔</span><p><strong>There’s more beyond the horizon.</strong><span className="grand-map__hint-desktop">Scroll or use the arrows. Hover to pause the posters.</span><span className="grand-map__hint-mobile">Swipe the posters to discover all five destinations.</span></p></div>
        <button type="button" className="grand-map__start" onClick={onClose}>Back to Ship<Arrow /></button>
      </footer>
    </section>
  )
}

export default function GrandLineMap({ visible, open, onOpenChange, onProjects, onResume, onSkills, onExperience, onContact }) {
  const dialogRef = useDialog(open, () => onOpenChange(false))
  if (!visible && !open) return null
  const actions = { projects: onProjects, resume: onResume, skills: onSkills, experience: onExperience, contact: onContact }
  const runRoute = (key) => {
    onOpenChange(false)
    actions[key]?.()
  }

  return (
    <>
      {visible && <button type="button" className="grand-map-trigger" onClick={() => onOpenChange(true)} aria-haspopup="dialog" aria-expanded={open}>
        <span className="grand-map-trigger__mark"><PosterMark /></span>
        <span><strong>Bounty Board</strong><small>Pick your next adventure</small></span>
      </button>}
      {open && <div ref={dialogRef} tabIndex={-1} className="grand-map" role="dialog" aria-modal="true" aria-labelledby="grand-map-title">
        <div className="grand-map__shade" onClick={() => onOpenChange(false)} aria-hidden="true" />
        <BountyBoard onClose={() => onOpenChange(false)} onRoute={runRoute} />
      </div>}
    </>
  )
}
