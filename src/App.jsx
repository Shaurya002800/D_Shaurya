import { lazy, Suspense, useState, useRef, useEffect, useCallback } from 'react'
import LoadingScreen from './components/LoadingScreen'
import ControlsOverlay from './components/ControlsOverlay'
import NavWheels from './components/NavWheels'
import DevilFruitChat from './components/DevilFruitChat.jsx'
import ArtifactDossier from './components/ArtifactDossier.jsx'
import GrandLineMap from './components/GrandLineMap.jsx'
import GuidedVoyageOverlay from './components/GuidedVoyageOverlay.jsx'
import MobileControls from './components/MobileControls.jsx'
import OceanMusic from './components/OceanMusic.jsx'
import PortfolioIntro from './components/PortfolioIntro.jsx'
import SwordCursor from './components/SwordCursor.jsx'
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

const WorldScene = lazy(() => import('./scenes/WorldScene'))

function App() {
  const [loaderComplete,  setLoaderComplete]  = useState(false)
  const [worldReady,      setWorldReady]      = useState(false)
  const [activeSection,   setActiveSection]   = useState('explore')
  const [aboutActive,     setAboutActive]     = useState(false)
  const [skillsActive,    setSkillsActive]    = useState(false)
  const [skillsClimbing,  setSkillsClimbing]  = useState(false)
  const [workActive,      setWorkActive]      = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedArtifact, setSelectedArtifact] = useState(null)
  const [mapOpen,         setMapOpen]         = useState(false)
  const [introDismissed,  setIntroDismissed]  = useState(false)
  const [guidedTourActive, setGuidedTourActive] = useState(false)
  const [guidedTourStep,  setGuidedTourStep]  = useState(null)
  const [skillsDirection, setSkillsDirection] = useState('north')
  const [hintLabel,       setHintLabel]       = useState(null)
  const [charState,       setCharState]       = useState('idle')
  const [speed,           setSpeed]           = useState(0)
  const debugRef   = useRef(null)
  const loaded = loaderComplete && worldReady
  const sectionActive = aboutActive || skillsActive || skillsClimbing || workActive
  const introVisible = loaderComplete && !sectionActive && !introDismissed && !selectedArtifact

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
  const handleWorldReady = useCallback(() => setWorldReady(true), [])

  // ── Speed polling for Luffy UI ────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!debugRef.current) return
      const nextSpeed = debugRef.current.speed ?? 0
      setSpeed((currentSpeed) => (
        Math.abs(currentSpeed - nextSpeed) > 0.01 ? nextSpeed : currentSpeed
      ))
    }, 160)
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
    setMapOpen(false)
    setGuidedTourActive(false)
    setIntroDismissed(true)
    setActiveSection(section)
    setAboutActive(section === 'about')
    setSkillsActive(section === 'skills')
    setWorkActive(section === 'work')
    if (section !== 'work') setSelectedProject(null)
    setSelectedArtifact(null)
  }, [])

  const handleEnterGrandLine = useCallback(() => {
    setIntroDismissed(true)
    setGuidedTourStep('resume')
    setGuidedTourActive(() => {
      if (typeof window === 'undefined') return true
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    })
  }, [])

  const handleSkipGuidedTour = useCallback(() => {
    setGuidedTourActive(false)
  }, [])

  const handleGuidedOpenMap = useCallback(() => {
    setGuidedTourActive(false)
    setMapOpen(true)
  }, [])

  const handleViewProjects = useCallback(() => {
    handleNavigate('work')
  }, [handleNavigate])

  const handleShowSkills = useCallback(() => {
    handleNavigate('skills')
  }, [handleNavigate])

  const handleShowExperience = useCallback(() => {
    handleNavigate('about')
  }, [handleNavigate])

  const handleShowResume = useCallback(() => {
    setMapOpen(false)
    setGuidedTourActive(false)
    setIntroDismissed(true)
    window.open('/resume.pdf', '_blank', 'noopener,noreferrer')
  }, [])

  const handleContact = useCallback(() => {
    setMapOpen(false)
    setGuidedTourActive(false)
    setIntroDismissed(true)
    window.location.href = 'mailto:kunwarshaurya28@gmail.com'
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={null}>
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
          guidedTourActive={guidedTourActive}
          onGuidedTourStepChange={setGuidedTourStep}
          onGuidedTourComplete={() => setGuidedTourActive(false)}
          onProjectSelect={setSelectedProject}
          onArtifactOpen={setSelectedArtifact}
          onReady={handleWorldReady}
        />
      </Suspense>

      {loaded && (
        <>
          <OceanMusic visible={loaded && !introVisible && !guidedTourActive && !sectionActive && !selectedArtifact && !mapOpen} />

          <GrandLineMap
            visible={loaded && !introVisible && !guidedTourActive && !sectionActive && !selectedArtifact}
            open={mapOpen}
            onOpenChange={setMapOpen}
            onProjects={handleViewProjects}
            onResume={handleShowResume}
            onSkills={handleShowSkills}
            onExperience={handleShowExperience}
            onContact={handleContact}
          />

          {!sectionActive && !introVisible && !guidedTourActive && (
            <>
              <NavWheels
                activeSection={activeSection}
                onNavigate={handleNavigate}
                onResume={handleShowResume}
                onContact={handleContact}
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

          {!sectionActive && !introVisible && !guidedTourActive && (
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

      <GuidedVoyageOverlay
        active={loaded && guidedTourActive && !introVisible && !sectionActive && !selectedArtifact}
        step={guidedTourStep}
        onSkip={handleSkipGuidedTour}
        onOpenMap={handleGuidedOpenMap}
      />

      <PortfolioIntro
        visible={introVisible}
        worldReady={worldReady}
        onEnter={handleEnterGrandLine}
        onViewProjects={handleViewProjects}
        onShowSkills={handleShowSkills}
        onShowExperience={handleShowExperience}
        onShowResume={handleShowResume}
        onContact={handleContact}
        onOpenMap={() => setMapOpen(true)}
      />

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

      {!loaderComplete && (
        <LoadingScreen onComplete={() => setLoaderComplete(true)} />
      )}

      <SwordCursor />
    </div>
  )
}

export default App
