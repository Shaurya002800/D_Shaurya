import './NavWheels.css'

const sections = [
  {
    id: 'explore',
    label: 'Deck',
    title: 'Explore Ship Deck',
    description: 'Return to the 3D portfolio world.',
    hint: 'Free roam',
    mark: 'N',
    imgSrc: '/image 49.png',
  },
  {
    id: 'about',
    label: 'Profile',
    title: 'Captain Profile',
    description: 'About, education, and career route.',
    hint: 'Who I am',
    mark: 'E',
    imgSrc: '/image 50.png',
  },
  {
    id: 'work',
    label: 'Projects',
    title: 'Wanted Poster Archive',
    description: 'Case studies, demos, and shipped proof.',
    hint: 'What I built',
    mark: 'S',
    imgSrc: '/image 51.png',
  },
  {
    id: 'skills',
    label: 'Skills',
    title: 'Sword Arsenal',
    description: 'Languages, frontend, tools, AI/ML.',
    hint: 'What I use',
    mark: 'W',
    imgSrc: '/image 52.png',
  },
]

export default function NavWheels({
  activeSection,
  onNavigate,
  onResume,
  onContact,
}) {
  return (
    <nav
      className="nav-wheels"
      aria-label="Grand Line portfolio routes"
    >
      <div className="nav-wheels__bar">
        <div className="nav-wheels__brand" aria-hidden="true">
          <span className="nav-wheels__brand-orbit" />
          <span>
            <span>Grand</span>
            <strong>Route</strong>
          </span>
        </div>

        <div className="nav-wheels__routes">
          {sections.map(({ id, label, title, description, hint, mark, imgSrc }) => {
            const isActive = activeSection === id

            return (
              <button
                type="button"
                key={id}
                onClick={() => onNavigate(id)}
                onPointerUp={(event) => event.currentTarget.blur()}
                className={`nav-wheel${isActive ? ' nav-wheel--active' : ''}`}
                aria-label={`${label}: ${title}. ${description}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-wheel__mark">{mark}</span>
                <span className="nav-wheel__image-wrap" aria-hidden="true">
                  <img
                    src={imgSrc}
                    alt=""
                    className="nav-wheel__image"
                  />
                </span>

                <span className="nav-wheel__copy">
                  <span className="nav-wheel__eyebrow">{label}</span>
                  <span className="nav-wheel__title">{title}</span>
                  <span className="nav-wheel__description">{description}</span>
                  <span className="nav-wheel__hint">{hint}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="nav-wheels__actions" aria-label="Recruiter shortcuts">
          <button
            type="button"
            className="nav-wheels__action"
            onClick={onResume}
          >
            Resume
          </button>
          <button
            type="button"
            className="nav-wheels__action nav-wheels__action--primary"
            onClick={onContact}
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  )
}
