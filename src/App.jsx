import { lazy, Suspense, useState, useRef, useEffect, useCallback } from 'react'
import LoadingScreen from './components/LoadingScreen'
import NavWheels from './components/NavWheels'
import GrandLineMap from './components/GrandLineMap.jsx'
import GuidedVoyageOverlay from './components/GuidedVoyageOverlay.jsx'
import MobileControls from './components/MobileControls.jsx'
import OceanMusic from './components/OceanMusic.jsx'
import PortfolioIntro from './components/PortfolioIntro.jsx'
import SwordCursor from './components/SwordCursor.jsx'
import LuffyUI from './components/LuffyUI.jsx'

const WorldScene = lazy(() => import('./scenes/WorldScene'))
const AboutSection = lazy(() => import('./components/AboutSection'))
const ArtifactDossier = lazy(() => import('./components/ArtifactDossier.jsx'))
const ControlsOverlay = lazy(() => import('./components/ControlsOverlay'))
const DevilFruitChat = lazy(() => import('./components/DevilFruitChat.jsx'))
const SkillsSection = lazy(() => import('./components/Skillssection'))
const WorkSection = lazy(() => import('./components/WorkSection'))
const WorkTransitionOverlay = lazy(() => (
  import('./components/WorkSection').then((module) => ({ default: module.WorkTransitionOverlay }))
))
const WorkSectionLabel = lazy(() => (
  import('./components/WorkSection').then((module) => ({ default: module.WorkSectionLabel }))
))

function AboutTransitionOverlay() { return null }
function SectionTransitionLabel() { return null }
function WindCompass() { return null }

function prefersMobileProofFirst() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 760px)').matches
}

function App() {
  const [loaderComplete,  setLoaderComplete]  = useState(false)
  const [worldReady,      setWorldReady]      = useState(false)
  const [mobileProofFirst, setMobileProofFirst] = useState(prefersMobileProofFirst)
  const [worldRequested,  setWorldRequested]  = useState(() => !prefersMobileProofFirst())
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
  const shouldMountWorld = !mobileProofFirst || worldRequested
  const sectionActive = aboutActive || skillsActive || skillsClimbing || workActive
  const introVisible = !sectionActive && !introDismissed && !selectedArtifact

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
  const handleLoaderComplete = useCallback(() => setLoaderComplete(true), [])
  const handleRequestWorld = useCallback(() => setWorldRequested(true), [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mobileQuery = window.matchMedia('(max-width: 760px)')
    const syncMobileMode = () => {
      const isMobile = mobileQuery.matches
      setMobileProofFirst(isMobile)
      if (!isMobile) setWorldRequested(true)
    }

    syncMobileMode()
    mobileQuery.addEventListener?.('change', syncMobileMode)
    return () => mobileQuery.removeEventListener?.('change', syncMobileMode)
  }, [])

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
    setIntroDismissed(!mobileProofFirst || worldReady)
    setActiveSection(section)
    setAboutActive(section === 'about')
    setSkillsActive(section === 'skills')
    setWorkActive(section === 'work')
    if (section !== 'work') setSelectedProject(null)
    setSelectedArtifact(null)
  }, [mobileProofFirst, worldReady])

  const handleEnterGrandLine = useCallback(() => {
    if (!worldRequested || !worldReady) {
      setWorldRequested(true)
      return
    }
    setIntroDismissed(true)
    setGuidedTourStep('resume')
    setGuidedTourActive(() => {
      if (typeof window === 'undefined') return true
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    })
  }, [worldReady, worldRequested])

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
    setIntroDismissed(!mobileProofFirst || worldReady)
    window.open('/resume.pdf', '_blank', 'noopener,noreferrer')
  }, [mobileProofFirst, worldReady])

  const handleContact = useCallback(() => {
    setMapOpen(false)
    setGuidedTourActive(false)
    setIntroDismissed(!mobileProofFirst || worldReady)
    window.location.href = 'mailto:kunwarshaurya28@gmail.com'
  }, [mobileProofFirst, worldReady])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {shouldMountWorld && (
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
      )}

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
              <Suspense fallback={null}>
                <ControlsOverlay />
              </Suspense>
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
              <Suspense fallback={null}>
                <DevilFruitChat />
              </Suspense>
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
        worldRequested={worldRequested}
        mobileProofFirst={mobileProofFirst}
        onRequestWorld={handleRequestWorld}
        onEnter={handleEnterGrandLine}
        onViewProjects={handleViewProjects}
        onShowSkills={handleShowSkills}
        onShowExperience={handleShowExperience}
        onShowResume={handleShowResume}
        onContact={handleContact}
      />

      {/* ── Section overlays ── */}
      {aboutActive && (
        <Suspense fallback={null}>
          <AboutSection active={aboutActive} onClose={handleAboutClose} />
        </Suspense>
      )}

      {skillsActive && (
        <Suspense fallback={null}>
          <SkillsSection
            active={skillsActive}
            onClose={handleSkillsClose}
            onDirectionChange={setSkillsDirection}
          />
        </Suspense>
      )}

      {workActive && (
        <Suspense fallback={null}>
          <WorkSection
            active={workActive}
            onClose={handleWorkClose}
            selectedProject={selectedProject}
            onProjectClose={handleProjectClose}
          />
          <WorkTransitionOverlay active={workActive} />
          <WorkSectionLabel active={workActive} />
        </Suspense>
      )}

      {selectedArtifact && (
        <Suspense fallback={null}>
          <ArtifactDossier
            artifact={selectedArtifact}
            onClose={() => setSelectedArtifact(null)}
          />
        </Suspense>
      )}

      <AboutTransitionOverlay active={aboutActive} />
      <SectionTransitionLabel active={aboutActive} label="ABOUT" />

      {!loaderComplete && (
        <LoadingScreen onComplete={handleLoaderComplete} />
      )}

      <SwordCursor />
    </div>
  )
}

export default App
