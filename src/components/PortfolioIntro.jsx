import { useState } from 'react'
import { PROFILE } from '../data/profile.js'
import { PROJECTS } from '../data/projects.js'
import { GRAND_LINE_MAP_ARTWORK } from '../data/mapArtwork.js'
import './PortfolioIntro.css'

const STORAGE_KEY = 'grand-line-onboarding-seen'

const ROUTE_MARKERS = [
  { label: 'Projects', meta: 'Wanted Posters', className: 'is-projects' },
  { label: 'Skills', meta: 'Sword Deck', className: 'is-skills' },
  { label: 'Resume', meta: 'Treasure Chest', className: 'is-resume' },
  { label: 'Experience', meta: 'Captain Log', className: 'is-experience' },
  { label: 'Contact', meta: 'Signal Line', className: 'is-contact' },
]

function ChartSeal() {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" stroke="currentColor" />
      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeDasharray="1 3" />
      <path d="M21 58 59 31M21 31 59 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M27 38c0-16 26-16 26 0 0 7-5 9-8 11v6H35v-6c-3-2-8-4-8-11Z" fill="#ead9ad" stroke="currentColor" strokeWidth="2" />
      <circle cx="34" cy="39" r="3" fill="currentColor" />
      <circle cx="46" cy="39" r="3" fill="currentColor" />
      <path d="m40 44-2 3h4Z" fill="currentColor" />
      <path d="M29 29c0-14 22-14 22 0" fill="#d3ad5b" stroke="currentColor" strokeWidth="2" />
      <path d="M29 27h22v5H29Z" fill="#973c2b" />
      <path d="M20 32c9-4 31-4 40 0-5 5-35 5-40 0Z" fill="#d3ad5b" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CompassRose() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth=".7" />
      <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth=".5" />
      {Array.from({ length: 8 }, (_, index) => (
        <g key={index} transform={`rotate(${index * 45} 60 60)`}>
          <path d="M60 13 67 60 60 56Z" fill={index % 2 ? '#977447' : '#763a29'} />
          <path d="M60 13 53 60 60 56Z" fill="#e7d4a3" stroke="currentColor" strokeWidth=".6" />
        </g>
      ))}
      <circle cx="60" cy="60" r="4" fill="currentColor" />
      <g fill="currentColor" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10">
        <text x="60" y="11">N</text><text x="60" y="116">S</text>
        <text x="112" y="63">E</text><text x="8" y="63">W</text>
      </g>
    </svg>
  )
}

function markOnboardingSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // Local storage can be blocked in private or hardened browser contexts.
  }
}

export default function PortfolioIntro({
  visible,
  worldReady = true,
  worldRequested = true,
  mobileProofFirst = false,
  onRequestWorld,
  worldUnavailable = false,
  onOpenMap,
  onEnter,
  onViewProjects,
  onShowSkills,
  onShowExperience,
  onShowResume,
  onContact,
}) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const worldPending = !worldUnavailable && worldRequested && !worldReady
  const worldOptional = mobileProofFirst && !worldRequested
  const voyageStatus = worldUnavailable ? 'The 3D ship is unavailable. All dossiers and the Captain Log remain accessible.' : worldOptional
    ? 'Proof route ready. 3D voyage optional.'
    : worldReady
      ? (mobileProofFirst ? 'Drag to move · Swipe to look · Tap OPEN near objects' : 'Ship deck ready.')
      : 'Preparing ship deck...'
  const voyageLabel = worldUnavailable ? 'Open Map' : worldOptional
    ? 'Load Grand Line'
    : worldReady
      ? 'Enter Grand Line'
      : 'Preparing...'

  const closeOnboarding = () => {
    markOnboardingSeen()
    setShowOnboarding(false)
  }

  const handleEnter = () => {
    if (worldUnavailable) { onOpenMap?.(); return }
    if (!worldRequested) {
      onRequestWorld?.()
      return
    }
    if (!worldReady) return
    closeOnboarding()
    onEnter()
  }

  const jumpToProjects = () => {
    closeOnboarding()
    onViewProjects()
  }

  const jumpToSkills = () => {
    closeOnboarding()
    onShowSkills()
  }

  const jumpToExperience = () => {
    closeOnboarding()
    onShowExperience()
  }

  const jumpToResume = () => {
    closeOnboarding()
    onShowResume()
  }

  const jumpToContact = () => {
    closeOnboarding()
    onContact()
  }

  const routeActions = {
    Projects: jumpToProjects,
    Skills: jumpToSkills,
    Resume: jumpToResume,
    Experience: jumpToExperience,
    Contact: jumpToContact,
  }

  if (!visible && !showOnboarding) return null

  return (
    <>
      {visible && (
        <section
          className={[
            'portfolio-intro',
            worldReady ? 'is-ready' : 'is-preparing',
            mobileProofFirst ? 'is-mobile-proof' : '',
            worldOptional ? 'is-world-optional' : '',
          ].filter(Boolean).join(' ')}
          aria-labelledby="portfolio-intro-title"
        >
          <div className="portfolio-intro__shade" aria-hidden="true" />
          <div className="portfolio-intro__layout">
            <header className="portfolio-intro__masthead">
              <div className="portfolio-intro__chart-seal"><ChartSeal /><span>A captain’s<br />personal atlas</span></div>
              <div className="portfolio-intro__chart-title"><span>A voyage through work & craft</span><p>The Grand Line</p></div>
              <div className="portfolio-intro__chart-edition"><span>Portfolio chart</span><strong>No. 001</strong><small>Explore · Discover · Connect</small></div>
            </header>
            <div className="portfolio-intro__content">
              <p className="portfolio-intro__eyebrow"><span /> Meet the captain</p>
              <h1 id="portfolio-intro-title">{PROFILE.name}</h1>
              <p className="portfolio-intro__role">{PROFILE.role}</p>
              <p className="portfolio-intro__summary">
                {PROFILE.summary}
              </p>

              <div className="portfolio-intro__proof" aria-label="Profile highlights">
                <span>{PROJECTS.length} project dossiers</span>
                <span>VIT Vellore · Class of 2028</span>
                <span>{PROFILE.academics.dsa} DSA problems · CGPA {PROFILE.academics.cgpa}</span>
              </div>

              <div className="portfolio-intro__actions">
                <button
                  type="button"
                  className="portfolio-intro__primary"
                  onClick={jumpToProjects}
                >
                  View Projects
                </button>
                <button
                  type="button"
                  className="portfolio-intro__ghost"
                  onClick={jumpToResume}
                >
                  Resume
                </button>
                <button
                  type="button"
                  className="portfolio-intro__ghost"
                  onClick={jumpToContact}
                >
                  Contact
                </button>
              </div>

              <div className="portfolio-intro__voyage">
                <p className="portfolio-intro__status">
                  {voyageStatus}
                </p>
                <button
                  type="button"
                  className="portfolio-intro__voyage-button"
                  onClick={handleEnter}
                  disabled={worldPending}
                  aria-disabled={worldPending}
                >
                  <span>{voyageLabel}</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
                {!worldUnavailable && <button type="button" className="portfolio-intro__map-shortcut" onClick={onOpenMap}>Open Map</button>}
              </div>
            </div>

            <aside className="portfolio-intro__route-map" aria-label="Grand Line portfolio route map">
              <div className="portfolio-intro__map-topline">
                <span><i /> Choose your next destination</span>
                <strong>5 ports · {PROJECTS.length} projects</strong>
              </div>

              <div className="portfolio-intro__map-field">
                <img className="portfolio-intro__chart-art" src={GRAND_LINE_MAP_ARTWORK} alt="" width="1536" height="1024" loading="eager" decoding="sync" />
                <svg className="portfolio-intro__route-line" viewBox="0 0 1000 666.67" aria-hidden="true">
                  <path
                    className="portfolio-intro__route-path"
                    d="M180 506 C230 520 240 360 380 353 S480 120 530 186 S670 550 800 486 S990 340 840 253"
                  />
                  <g className="portfolio-intro__sea-labels"><text x="220" y="190" transform="rotate(-10 220 190)">EAST BLUE</text><text x="835" y="585" transform="rotate(-8 835 585)">NEW WORLD</text></g>
                </svg>

                {ROUTE_MARKERS.map((marker, index) => (
                  <button
                    key={marker.label}
                    type="button"
                    className={`portfolio-intro__marker ${marker.className}`}
                    onClick={routeActions[marker.label]}
                  >
                    <span className="portfolio-intro__marker-number">0{index + 1}</span>
                    <span className="portfolio-intro__marker-copy"><span>{marker.meta}</span><strong>{marker.label}</strong></span>
                  </button>
                ))}

                <div className="portfolio-intro__compass" aria-hidden="true">
                  <CompassRose />
                </div>
              </div>

              <div className="portfolio-intro__map-footer">
                <span><i /> Your course</span>
                <p>Follow the red route. Every island holds a story.</p>
                <span className="portfolio-intro__chart-scale" aria-hidden="true">0 ├────┼────┤ 100 nm</span>
              </div>
            </aside>
            <footer className="portfolio-intro__chart-footer">
              <span><b>✦</b> Not all treasure is silver and gold.</span>
              <span>Select an island to explore, or board the ship.</span>
              <span>Charted by <strong>Shaurya</strong></span>
            </footer>
          </div>
        </section>
      )}

      {showOnboarding && (
        <div className="portfolio-onboarding" role="dialog" aria-modal="true" aria-labelledby="portfolio-onboarding-title">
          <div className="portfolio-onboarding__panel">
            <button
              type="button"
              className="portfolio-onboarding__close"
              onClick={closeOnboarding}
              aria-label="Close onboarding"
            >
              x
            </button>
            <p className="portfolio-onboarding__eyebrow">Before you board</p>
            <h2 id="portfolio-onboarding-title">Welcome aboard.</h2>
            <p>
              Explore the ship using WASD or touch controls. Press E near glowing
              objects to interact.
            </p>

            <div className="portfolio-onboarding__routes" aria-label="Ship object guide">
              <button type="button" onClick={jumpToResume}>
                <span>Treasure Chest</span>
                <strong>Resume</strong>
              </button>
              <button type="button" onClick={jumpToProjects}>
                <span>Wanted Posters</span>
                <strong>Projects</strong>
              </button>
              <button type="button" onClick={jumpToSkills}>
                <span>Sword Deck</span>
                <strong>Skills</strong>
              </button>
              <button type="button" onClick={jumpToExperience}>
                <span>Captain Log</span>
                <strong>Experience</strong>
              </button>
              <button type="button" onClick={jumpToContact}>
                <span>Den Den Mushi</span>
                <strong>Contact</strong>
              </button>
            </div>

            <button
              type="button"
              className="portfolio-onboarding__primary"
              onClick={handleEnter}
              disabled={!worldReady}
              aria-disabled={!worldReady}
            >
              {worldReady ? 'Start Voyage' : 'Preparing ship deck...'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
