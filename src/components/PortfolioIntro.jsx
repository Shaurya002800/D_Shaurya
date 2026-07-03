import { useEffect, useState } from 'react'
import { PROFILE } from '../data/profile.js'
import { PROJECTS } from '../data/projects.js'
import './PortfolioIntro.css'

const STORAGE_KEY = 'grand-line-onboarding-seen'

const ROUTE_MARKERS = [
  { label: 'Projects', meta: 'Wanted Posters', className: 'is-projects' },
  { label: 'Skills', meta: 'Sword Deck', className: 'is-skills' },
  { label: 'Resume', meta: 'Treasure Chest', className: 'is-resume' },
  { label: 'Experience', meta: 'Captain Log', className: 'is-experience' },
  { label: 'Contact', meta: 'Signal Line', className: 'is-contact' },
]

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
  onEnter,
  onViewProjects,
  onShowSkills,
  onShowExperience,
  onShowResume,
  onContact,
}) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const worldPending = worldRequested && !worldReady
  const worldOptional = mobileProofFirst && !worldRequested
  const voyageStatus = worldOptional
    ? 'Proof route ready. 3D voyage optional.'
    : worldReady
      ? 'Ship deck ready.'
      : 'Preparing ship deck...'
  const voyageLabel = worldOptional
    ? 'Load Grand Line'
    : worldReady
      ? 'Enter Grand Line'
      : 'Preparing...'

  useEffect(() => {
    if (!visible) setShowOnboarding(false)
  }, [visible])

  const closeOnboarding = () => {
    markOnboardingSeen()
    setShowOnboarding(false)
  }

  const handleEnter = () => {
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
            <div className="portfolio-intro__map-canvas" aria-hidden="true">
              <svg viewBox="0 0 1440 820" preserveAspectRatio="none">
                <path
                  className="portfolio-intro__paper-fold is-fold-a"
                  d="M0 158 C232 120 367 184 545 142 C741 96 897 137 1082 102 C1238 72 1342 93 1440 64"
                />
                <path
                  className="portfolio-intro__paper-fold is-fold-b"
                  d="M-20 676 C178 628 357 694 524 648 C742 588 929 628 1127 586 C1253 559 1354 575 1460 536"
                />
                <path
                  className="portfolio-intro__coast is-main"
                  d="M536 164 C602 88 729 110 781 173 C830 232 918 213 985 266 C1052 319 1048 416 997 462 C948 506 978 596 905 638 C832 681 745 626 691 663 C628 706 522 670 505 589 C490 517 399 504 386 425 C374 347 481 320 477 251 C474 214 502 195 536 164 Z"
                />
                <path
                  className="portfolio-intro__coast is-west"
                  d="M104 230 C180 166 288 184 322 254 C356 326 295 391 214 389 C132 387 58 312 104 230 Z"
                />
                <path
                  className="portfolio-intro__coast is-south"
                  d="M884 622 C934 579 1018 588 1053 648 C1088 708 1031 759 962 744 C904 731 846 684 884 622 Z"
                />
                <path
                  className="portfolio-intro__global-route-shadow"
                  d="M112 674 C242 596 371 646 486 548 S658 410 811 360 S983 570 1138 258 C1179 176 1261 164 1323 216"
                />
                <path
                  className="portfolio-intro__global-route"
                  d="M112 674 C242 596 371 646 486 548 S658 410 811 360 S983 570 1138 258 C1179 176 1261 164 1323 216"
                />
                <g className="portfolio-intro__map-ornaments">
                  <circle cx="116" cy="674" r="8" />
                  <circle cx="486" cy="548" r="8" />
                  <circle cx="811" cy="360" r="8" />
                  <circle cx="1138" cy="258" r="8" />
                  <path d="M1196 632 h92 m-46 -46 v92" />
                  <path d="M1242 554 l12 78 -12 78 -12 -78 Z" />
                </g>
              </svg>
            </div>
            <div className="portfolio-intro__content">
              <p className="portfolio-intro__eyebrow">Interactive portfolio</p>
              <h1 id="portfolio-intro-title">{PROFILE.name}</h1>
              <p className="portfolio-intro__role">Full-stack developer, AI/ML builder, frontend engineer</p>
              <p className="portfolio-intro__summary">
                Building polished products, practical AI systems, and interactive web experiences.
              </p>

              <div className="portfolio-intro__proof" aria-label="Profile highlights">
                <span>{PROJECTS.length} shipped project dossiers</span>
                <span>AI/ML + full-stack + Web3 systems</span>
                <span>Live demos, GitHub proof, resume-ready details</span>
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
                  {voyageLabel}
                </button>
              </div>
            </div>

            <aside className="portfolio-intro__route-map" aria-label="Grand Line portfolio route map">
              <div className="portfolio-intro__map-topline">
                <span>Grand Line Route</span>
                <strong>{PROJECTS.length} dossiers logged</strong>
              </div>

              <div className="portfolio-intro__map-field">
                <svg className="portfolio-intro__route-line" viewBox="0 0 520 360" aria-hidden="true">
                  <path
                    className="portfolio-intro__route-shadow"
                    d="M58 282 C114 202 176 252 216 180 S330 92 386 136 S428 246 472 90"
                  />
                  <path
                    className="portfolio-intro__route-path"
                    d="M58 282 C114 202 176 252 216 180 S330 92 386 136 S428 246 472 90"
                  />
                </svg>

                {ROUTE_MARKERS.map((marker) => (
                  <button
                    key={marker.label}
                    type="button"
                    className={`portfolio-intro__marker ${marker.className}`}
                    onClick={routeActions[marker.label]}
                  >
                    <span>{marker.meta}</span>
                    <strong>{marker.label}</strong>
                  </button>
                ))}

                <div className="portfolio-intro__compass" aria-hidden="true">
                  <span>N</span>
                  <i />
                  <small>S</small>
                </div>
              </div>

              <div className="portfolio-intro__map-footer">
                <span>Fast proof route</span>
                <strong>Projects {'->'} Resume {'->'} Contact</strong>
              </div>
            </aside>
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
