import { useState, useRef, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import WorldScene from './scenes/WorldScene'
import ControlsOverlay from './components/ControlsOverlay'
import NavWheels from './components/NavWheels'
import DevilFruitChat from './components/DevilFruitChat.jsx'
import AboutSection, {
  AboutTransitionOverlay,
  SectionTransitionLabel,
  WindCompass,
} from './components/AboutSection'
import { LuffyUI } from './components/LuffyCharacter'
import SkillsSection from './components/Skillssection'

function App() {
  const [loaded,        setLoaded]        = useState(false)
  const [activeSection, setActiveSection] = useState('explore')
  const [aboutActive,   setAboutActive]   = useState(false)
  const [skillsActive,  setSkillsActive]  = useState(false) // ✨ FIXED: Added missing state
  const [hintLabel,     setHintLabel]     = useState(null)
  const [charState,     setCharState]     = useState('idle')
  const [speed,         setSpeed]         = useState(0)
  const debugRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => {
      if (debugRef.current) setSpeed(debugRef.current.speed ?? 0)
    }, 100)
    return () => clearInterval(id)
  }, [])
  // ADD this useEffect at the top of App() function, after your existing useEffects:
useEffect(() => {
  const fn = (e) => { if (e.key === 'Escape' && aboutActive) handleAboutClose() }
  window.addEventListener('keydown', fn)
  return () => window.removeEventListener('keydown', fn)
}, [aboutActive])

  const handleNavigate = (section) => {
    setActiveSection(section)
    setAboutActive(section === 'about')
    setSkillsActive(section === 'skills') // ✨ FIXED: Set active state for skills
  }

  const handleAboutClose = () => {
    setAboutActive(false)
    setActiveSection('explore')
  }

  const handleSkillsClose = () => {
    setSkillsActive(false)
    setActiveSection('explore') // ✨ FIXED: Added missing close handler
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <WorldScene
        debugRef={debugRef}
        onZoneChange={setHintLabel}
        onStateChange={setCharState}
        onNavigate={handleNavigate}
        aboutActive={aboutActive}
        skillsActive={skillsActive} // ✨ FIXED: Passed down to canvas
      />

      {loaded && (
        <>
          <NavWheels
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />
          <ControlsOverlay />
          <LuffyUI
            hintLabel={hintLabel}
            speed={speed}
            charState={charState}
          />
          <WindCompass visible={!aboutActive} />
          
          <div style={{ 
            position: 'fixed', 
            bottom: '30px', 
            right: '30px', 
            zIndex: 9999,
            pointerEvents: 'auto'
          }}>
            <DevilFruitChat /> 
          </div>
        </>
      )}

      <AboutSection active={aboutActive} onClose={handleAboutClose} />
      
      <SkillsSection 
        active={skillsActive} 
        onClose={handleSkillsClose} 
      />
      
      <AboutTransitionOverlay active={aboutActive} />
      <SectionTransitionLabel active={aboutActive} label="ABOUT" />

      {!loaded && (
        <LoadingScreen onComplete={() => setLoaded(true)} />
      )}
    </div>
  )
}

export default App