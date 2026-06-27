import { useCallback, useEffect, useRef, useState } from 'react'
import { DIRECTIONS, DIR_ORDER, SKILL_DATA } from './data.js'
import {
  Atmosphere, BearingHeader, CharacterStage, CompassNavigation,
  TurnControl, SkillsCloseButton,
} from './ui.jsx'

// Orchestrates the entrance / exit / rotation animations across all of the
// skills-overlay subcomponents.
function SkillsOverlay({ active, onClose, onDirectionChange }) {
  const [currentDir, setCurrentDir] = useState(DIRECTIONS.NORTH)
  const [overlayIn, setOverlayIn] = useState(false)
  const [characterIn, setCharacterIn] = useState(false)
  const [boardIn, setBoardIn] = useState(false)
  const [contentIn, setContentIn] = useState(false)
  const [controlsIn, setControlsIn] = useState(false)
  const [turning, setTurning] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const timersRef = useRef([])
  const data = SKILL_DATA[currentDir]

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const navigateTo = useCallback((targetDir) => {
    if (turning || targetDir === currentDir) return

    setTurning(true)
    setContentIn(false)
    setBoardIn(false)
    setSelectedSkill(null)

    timersRef.current.push(setTimeout(() => {
      setCurrentDir(targetDir)
      onDirectionChange?.(targetDir)
      setBoardIn(true)
      timersRef.current.push(setTimeout(() => {
        setContentIn(true)
        setTurning(false)
      }, 360))
    }, 360))
  }, [currentDir, onDirectionChange, turning])

  const rotate = useCallback((amount) => {
    const index = DIR_ORDER.indexOf(currentDir)
    navigateTo(DIR_ORDER[(index + amount + DIR_ORDER.length) % DIR_ORDER.length])
  }, [currentDir, navigateTo])

  // Enter / exit sequence — staggered fade-ins feel intentional.
  useEffect(() => {
    clearTimers()

    if (active) {
      setSelectedSkill(null)
      setOverlayIn(false)
      setCharacterIn(false)
      setBoardIn(false)
      setContentIn(false)
      setControlsIn(false)
      onDirectionChange?.(currentDir)

      timersRef.current = [
        setTimeout(() => setOverlayIn(true), 180),
        setTimeout(() => setCharacterIn(true), 720),
        setTimeout(() => setBoardIn(true), 1180),
        setTimeout(() => setContentIn(true), 1520),
        setTimeout(() => setControlsIn(true), 1900),
      ]
    } else {
      setControlsIn(false)
      setContentIn(false)
      setBoardIn(false)
      setCharacterIn(false)
      setSelectedSkill(null)
      timersRef.current = [setTimeout(() => setOverlayIn(false), 260)]
    }

    return clearTimers
  }, [active, clearTimers, onDirectionChange])

  // Keyboard navigation — Esc closes, arrows rotate the dial.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!active) return
      if (event.key === 'Escape') {
        if (selectedSkill) setSelectedSkill(null)
        else onClose()
      }
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') rotate(-1)
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') rotate(1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, onClose, rotate, selectedSkill])

  return (
    <section
      className={`skills-overlay ${overlayIn ? 'is-visible' : ''}`}
      aria-hidden={!active}
      style={{ '--accent': data.accentColor, '--atmosphere': data.atmosphere }}
    >
      <Atmosphere data={data} visible={characterIn} turning={turning} />
      <div className="skills-overlay__horizon" />
      <div className="skills-overlay__vignette" />

      <BearingHeader data={data} visible={boardIn} />

      <CharacterStage
        data={data}
        characterVisible={characterIn}
        boardVisible={boardIn}
        contentVisible={contentIn}
        turning={turning}
        selectedSkill={selectedSkill}
        onSelectSkill={setSelectedSkill}
      />

      <TurnControl
        side="left"
        label="Previous bearing"
        onClick={() => rotate(-1)}
        visible={controlsIn}
        accentColor={data.accentColor}
      />
      <TurnControl
        side="right"
        label="Next bearing"
        onClick={() => rotate(1)}
        visible={controlsIn}
        accentColor={data.accentColor}
      />

      <CompassNavigation
        current={currentDir}
        onNavigate={navigateTo}
        data={data}
        visible={controlsIn}
      />
      <SkillsCloseButton visible={controlsIn} onClose={onClose} accentColor={data.accentColor} />
    </section>
  )
}

// Cinematic letterbox bars that slide in when the section opens.
function SkillsLetterBox({ active }) {
  return (
    <>
      <div className={`skills-letterbox skills-letterbox--top ${active ? 'is-visible' : ''}`} />
      <div className={`skills-letterbox skills-letterbox--bottom ${active ? 'is-visible' : ''}`} />
    </>
  )
}

export default function SkillsSection({ active, onClose, onDirectionChange }) {
  return (
    <>
      <SkillsLetterBox active={active} />
      <SkillsOverlay
        active={active}
        onClose={onClose}
        onDirectionChange={onDirectionChange}
      />
    </>
  )
}
