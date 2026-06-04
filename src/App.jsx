import { useState, useRef, useEffect, useCallback } from 'react'
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
import WorkSection, {
  WorkTransitionOverlay,
  WorkSectionLabel,
} from './components/WorkSection'

function App() {
  const [loaded,        setLoaded]        = useState(false)
  const [activeSection, setActiveSection] = useState('explore')
  const [aboutActive,   setAboutActive]   = useState(false)
  const [skillsActive,  setSkillsActive]  = useState(false)
  const [workActive, setWorkActive] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [hintLabel,     setHintLabel]     = useState(null)
  const [charState,     setCharState]     = useState('idle')
  const [speed,         setSpeed]         = useState(0)
  const debugRef = useRef(null)
  const sectionActive = aboutActive || skillsActive || workActive

  const handleAboutClose = useCallback(() => {
    setAboutActive(false)
    setActiveSection('explore')
  }, [])

  const handleSkillsClose = useCallback(() => {
    setSkillsActive(false)
    setActiveSection('explore')
  }, [])

  const handleWorkClose = useCallback(() => {
    setWorkActive(false)
    setSelectedProject(null)
    setActiveSection('explore')
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      if (debugRef.current) setSpeed(debugRef.current.speed ?? 0)
    }, 100)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && aboutActive) handleAboutClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [aboutActive, handleAboutClose])

  const handleNavigate = (section) => {
    setActiveSection(section)
    setAboutActive(section === 'about')
    setSkillsActive(section === 'skills')
    setWorkActive(section === 'work')
    if (section !== 'work') setSelectedProject(null)
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <WorldScene
        debugRef={debugRef}
        onZoneChange={setHintLabel}
        onStateChange={setCharState}
        onNavigate={handleNavigate}
        aboutActive={aboutActive}
        skillsActive={skillsActive}
        workActive={workActive}
        onProjectSelect={setSelectedProject}
      />

      {loaded && (
        <>
          {!sectionActive && (
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
              <WindCompass visible />
            </>
          )}
          
          {!sectionActive && (
            <div style={{ 
              position: 'fixed', 
              bottom: '30px', 
              right: '30px', 
              zIndex: 9999,
              pointerEvents: 'auto'
            }}>
              <DevilFruitChat /> 
            </div>
          )}
        </>
      )}

      <AboutSection active={aboutActive} onClose={handleAboutClose} />
      
      <SkillsSection 
        active={skillsActive} 
        onClose={handleSkillsClose} 
      />
      <WorkSection
        active={workActive}
        onClose={handleWorkClose}
        selectedProject={selectedProject}
        onProjectClose={() => setSelectedProject(null)}
      />
      <WorkTransitionOverlay active={workActive} />
      <WorkSectionLabel active={workActive} />
      
      <AboutTransitionOverlay active={aboutActive} />
      <SectionTransitionLabel active={aboutActive} label="ABOUT" />

      {!loaded && (
        <LoadingScreen onComplete={() => setLoaded(true)} />
      )}
    </div>
  )
}

export default App
