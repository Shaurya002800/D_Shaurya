import './GuidedVoyageOverlay.css'

const TOUR_COPY = {
  resume: {
    eyebrow: 'Proof checkpoint',
    title: 'Resume Chest',
    body: 'Download the formal resume from the deck.',
  },
  projects: {
    eyebrow: 'Work checkpoint',
    title: 'Wanted Poster Archive',
    body: 'Enter the basement to inspect project case studies.',
  },
  skills: {
    eyebrow: 'Skills checkpoint',
    title: 'Skills Deck',
    body: 'Climb to the crow\'s nest for languages, frontend, tools, and AI/ML.',
  },
  interact: {
    eyebrow: 'How to use the ship',
    title: 'Press E to interact',
    body: 'Walk near checkpoints and press E, or use the map for a direct recruiter route.',
  },
}

const STEP_ORDER = ['resume', 'projects', 'skills', 'interact']

export default function GuidedVoyageOverlay({ active, step, onSkip, onOpenMap }) {
  if (!active) return null

  const currentStep = TOUR_COPY[step] ? step : 'resume'
  const copy = TOUR_COPY[currentStep]

  return (
    <aside className="guided-voyage" aria-live="polite">
      <div className="guided-voyage__card">
        <div className="guided-voyage__compass" aria-hidden="true">
          <span />
        </div>

        <div className="guided-voyage__copy">
          <span>{copy.eyebrow}</span>
          <strong>{copy.title}</strong>
          <p>{copy.body}</p>
        </div>

        <div className="guided-voyage__actions" aria-label="Guided voyage controls">
          <button type="button" onClick={onSkip}>
            Skip
          </button>
          <button type="button" onClick={onOpenMap}>
            Open Map
          </button>
        </div>
      </div>

      <div className="guided-voyage__steps" aria-hidden="true">
        {STEP_ORDER.map((id) => (
          <i
            key={id}
            className={id === currentStep ? 'is-active' : ''}
          />
        ))}
      </div>
    </aside>
  )
}
