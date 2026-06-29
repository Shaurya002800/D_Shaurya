import { useEffect, useState } from 'react'
import { PROFILE } from '../data/profile.js'
import './PortfolioIntro.css'

const STORAGE_KEY = 'grand-line-onboarding-seen'

function hasSeenOnboarding() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
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
  onEnter,
  onViewProjects,
  onShowSkills,
  onShowExperience,
  onShowResume,
  onContact,
  onOpenMap,
}) {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!visible || hasSeenOnboarding()) return
    setShowOnboarding(true)
  }, [visible])

  const closeOnboarding = () => {
    markOnboardingSeen()
    setShowOnboarding(false)
  }

  const handleEnter = () => {
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

  const openMap = () => {
    closeOnboarding()
    onOpenMap()
  }

  if (!visible && !showOnboarding) return null

  return (
    <>
      {visible && (
        <section className="portfolio-intro" aria-labelledby="portfolio-intro-title">
          <div className="portfolio-intro__shade" aria-hidden="true" />
          <div className="portfolio-intro__content">
            <p className="portfolio-intro__eyebrow">Interactive portfolio</p>
            <h1 id="portfolio-intro-title">{PROFILE.name}</h1>
            <p className="portfolio-intro__role">Full-stack developer, AI/ML builder, frontend engineer</p>
            <p className="portfolio-intro__summary">
              Building polished products, practical AI systems, and interactive web experiences.
            </p>

            <div className="portfolio-intro__proof" aria-label="Profile highlights">
              <span>VIT CSE AI & Data Engineering</span>
              <span>9.02 CGPA</span>
              <span>Seeking software and AI internships</span>
            </div>

            <div className="portfolio-intro__actions">
              <button type="button" className="portfolio-intro__primary" onClick={handleEnter}>
                Start Voyage
              </button>
              <button type="button" className="portfolio-intro__ghost" onClick={openMap}>
                Open Map
              </button>
            </div>
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

            <button type="button" className="portfolio-onboarding__map" onClick={openMap}>
              Open Map
            </button>
            <button type="button" className="portfolio-onboarding__primary" onClick={handleEnter}>
              Start Voyage
            </button>
          </div>
        </div>
      )}
    </>
  )
}
