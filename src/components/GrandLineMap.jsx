import './GrandLineMap.css'

const ROUTES = [
  {
    object: 'Wanted Posters',
    destination: 'Projects',
    clue: 'Open the bounty files behind the strongest builds.',
    action: 'Open Posters',
    key: 'projects',
  },
  {
    object: 'Treasure Chest',
    destination: 'Resume',
    clue: 'Download the formal proof in one clean PDF.',
    action: 'Unlock Chest',
    key: 'resume',
  },
  {
    object: 'Sword Deck',
    destination: 'Skills',
    clue: 'See the weapons: languages, frontend, tools, and AI/ML.',
    action: 'Visit Deck',
    key: 'skills',
  },
  {
    object: 'Captain Log',
    destination: 'Experience',
    clue: 'Read the profile, education, and recruiter-facing story.',
    action: 'Read Log',
    key: 'experience',
  },
  {
    object: 'Den Den Mushi',
    destination: 'Contact',
    clue: 'Send a direct signal for internships, work, or collaboration.',
    action: 'Call Now',
    key: 'contact',
  },
]

export default function GrandLineMap({
  visible,
  open,
  onOpenChange,
  onProjects,
  onResume,
  onSkills,
  onExperience,
  onContact,
}) {
  if (!visible && !open) return null

  const actions = {
    projects: onProjects,
    resume: onResume,
    skills: onSkills,
    experience: onExperience,
    contact: onContact,
  }

  const runRoute = (key) => {
    onOpenChange(false)
    actions[key]?.()
  }

  return (
    <>
      {visible && (
        <button
          type="button"
          className="grand-map-trigger"
          onClick={() => onOpenChange(true)}
          aria-haspopup="dialog"
          aria-expanded={open ? 'true' : 'false'}
        >
          <span className="grand-map-trigger__mark" aria-hidden="true" />
          <span>
            <strong>Open Map</strong>
            <small>Ship route guide</small>
          </span>
        </button>
      )}

      {open && (
        <div
          className="grand-map"
          role="dialog"
          aria-modal="true"
          aria-labelledby="grand-map-title"
        >
          <div className="grand-map__shade" onClick={() => onOpenChange(false)} aria-hidden="true" />
          <section className="grand-map__panel">
            <button
              type="button"
              className="grand-map__close"
              onClick={() => onOpenChange(false)}
              aria-label="Close Grand Line Map"
            >
              x
            </button>

            <header className="grand-map__header">
              <div className="grand-map__seal" aria-hidden="true" />
              <div>
                <p className="grand-map__eyebrow">Route guide</p>
                <h2 id="grand-map-title">Grand Line Map</h2>
                <p className="grand-map__intro">
                  Every ship object leads to a real checkpoint. Walk there and press E,
                  or jump directly from this map.
                </p>
              </div>
            </header>

            <div className="grand-map__routes" aria-label="Grand Line portfolio routes">
              {ROUTES.map((route) => (
                <article className="grand-map__route" key={route.key}>
                  <div>
                    <span className="grand-map__object">{route.object}</span>
                    <strong>{route.destination}</strong>
                    <p>{route.clue}</p>
                  </div>
                  <button type="button" onClick={() => runRoute(route.key)}>
                    {route.action}
                  </button>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="grand-map__start"
              onClick={() => onOpenChange(false)}
            >
              Back to Ship
            </button>
          </section>
        </div>
      )}
    </>
  )
}
