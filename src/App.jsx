import { useState, useRef, useEffect, useCallback } from 'react'
import LoadingScreen from './components/LoadingScreen'
import WorldScene from './scenes/WorldScene'
import ControlsOverlay from './components/ControlsOverlay'
import NavWheels from './components/NavWheels'
import DevilFruitChat from './components/DevilFruitChat.jsx'
import ArtifactDossier from './components/ArtifactDossier.jsx'
import MobileControls from './components/MobileControls.jsx'
import OceanMusic from './components/OceanMusic.jsx'
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
  const [loaded,          setLoaded]          = useState(false)
  const [activeSection,   setActiveSection]   = useState('explore')
  const [aboutActive,     setAboutActive]     = useState(false)
  const [skillsActive,    setSkillsActive]    = useState(false)
  const [skillsClimbing,  setSkillsClimbing]  = useState(false)
  const [workActive,      setWorkActive]      = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedArtifact, setSelectedArtifact] = useState(null)
  const [skillsDirection, setSkillsDirection] = useState('north')
  const [hintLabel,       setHintLabel]       = useState(null)
  const [charState,       setCharState]       = useState('idle')
  const [speed,           setSpeed]           = useState(0)
  const debugRef   = useRef(null)
  const sectionActive = aboutActive || skillsActive || skillsClimbing || workActive

  // ── Close handlers ────────────────────────────────────────────────
  const handleAboutClose = useCallback(() => {
    setAboutActive(false)
    setActiveSection('explore')
  }, [])

  const handleSkillsClose = useCallback(() => {
    setSkillsActive(false)
    setActiveSection('explore')
  }, [])

  // If a project modal is open, close it first (lets it animate out),
  // then close the full work section 240 ms later.
  const handleWorkClose = useCallback(() => {
    if (selectedProject) {
      setSelectedProject(null)
      setTimeout(() => {
        setWorkActive(false)
        setActiveSection('explore')
      }, 240)
    } else {
      setWorkActive(false)
      setActiveSection('explore')
    }
  }, [selectedProject])

  // Stable callback so WorkSection doesn't re-render on every project change
  const handleProjectClose = useCallback(() => setSelectedProject(null), [])

  // ── Speed polling for Luffy UI ────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (debugRef.current) setSpeed(debugRef.current.speed ?? 0)
    }, 100)
    return () => clearInterval(id)
  }, [])

  // ── Global ESC for About section ──────────────────────────────────
  // (Work section manages its own ESC internally)
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && aboutActive) handleAboutClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [aboutActive, handleAboutClose])

  // ── Section navigation ────────────────────────────────────────────
  const handleNavigate = useCallback((section) => {
    setActiveSection(section)
    setAboutActive(section === 'about')
    setSkillsActive(section === 'skills')
    setWorkActive(section === 'work')
    if (section !== 'work') setSelectedProject(null)
    setSelectedArtifact(null)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <WorldScene
        debugRef={debugRef}
        onZoneChange={setHintLabel}
        onStateChange={setCharState}
        onNavigate={handleNavigate}
        aboutActive={aboutActive}
        skillsActive={skillsActive}
        onSkillsClimbingChange={setSkillsClimbing}
        skillsDirection={skillsDirection}
        workActive={workActive}
        onProjectSelect={setSelectedProject}
        onArtifactOpen={setSelectedArtifact}
      />

      {loaded && (
        <>
          <OceanMusic visible={loaded} />

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
              <MobileControls visible={!selectedArtifact} />
            </>
          )}

          {!sectionActive && (
            <div className="chat-dock" style={{
              position:      'fixed',
              bottom:        '30px',
              right:         '30px',
              zIndex:        9999,
              pointerEvents: 'auto',
            }}>
              <DevilFruitChat />
            </div>
          )}
        </>
      )}

      {/* ── Section overlays ── */}
      <AboutSection active={aboutActive} onClose={handleAboutClose} />

      <SkillsSection
        active={skillsActive}
        onClose={handleSkillsClose}
        onDirectionChange={setSkillsDirection}
      />

      <WorkSection
        active={workActive}
        onClose={handleWorkClose}
        selectedProject={selectedProject}
        onProjectClose={handleProjectClose}
      />
      <WorkTransitionOverlay active={workActive} />
      <WorkSectionLabel      active={workActive} />

      <ArtifactDossier
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
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
