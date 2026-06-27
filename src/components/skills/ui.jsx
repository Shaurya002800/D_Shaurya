import { useState } from 'react'
import { DIR_ORDER, DIR_META } from './data.js'

// Atmospheric tint + animated weather effect particles behind the panel.
export function Atmosphere({ data, visible, turning }) {
  return (
    <>
      <div
        className="skills-atmosphere"
        style={{
          opacity: visible ? 1 : 0,
          background: `
            radial-gradient(ellipse at 50% 35%, ${data.accentSoft} 0%, transparent 38%),
            linear-gradient(90deg, rgba(2,8,12,.72), transparent 18%, transparent 82%, rgba(2,8,12,.72)),
            linear-gradient(180deg, rgba(2,8,12,.22), transparent 50%, rgba(2,8,12,.68))
          `,
          transition: turning ? 'opacity .28s ease' : 'opacity 1.2s ease',
        }}
      />
      <div
        className={`skills-weather skills-weather--${data.effect}`}
        style={{ opacity: visible ? 1 : 0 }}
      >
        {Array.from({ length: 20 }, (_, index) => (
          <i key={index} style={{ '--i': index }} />
        ))}
      </div>
    </>
  )
}

// One skill card styled like a One Piece wanted poster.
export function WantedCard({ skill, index, visible, accentColor, selected, onSelect }) {
  const [iconError, setIconError] = useState(false)

  return (
    <button
      className={`wanted-card ${visible ? 'wanted-card--visible' : ''} ${selected ? 'wanted-card--selected' : ''}`}
      style={{ '--delay': `${index * 85}ms`, '--accent': accentColor }}
      onClick={() => onSelect(skill)}
      aria-pressed={selected}
      aria-label={`Inspect ${skill.name}`}
    >
      <span className="wanted-card__heading">WANTED</span>
      <span className="wanted-card__portrait">
        {skill.iconUrl && !iconError ? (
          <img
            src={skill.iconUrl}
            alt=""
            onError={() => setIconError(true)}
            style={{ filter: `drop-shadow(0 0 5px ${skill.color}55)` }}
          />
        ) : (
          <span style={{ color: skill.color }}>{skill.fallback}</span>
        )}
      </span>
      <strong>{skill.name}</strong>
      <small>{skill.bounty} BERRIES</small>
      <span className="wanted-card__shine" />
    </button>
  )
}

// Detail card that slides in when a wanted card is selected.
export function SkillIntel({ skill, data, onClose }) {
  if (!skill) return null

  return (
    <div className="skill-intel" style={{ '--accent': data.accentColor }}>
      <button className="skill-intel__close" onClick={onClose} aria-label="Close skill details">×</button>
      <div className="skill-intel__eyebrow">CREW NOTE · {data.bearing}</div>
      <div className="skill-intel__name">{skill.name}</div>
      <p>{skill.note}</p>
      <div className="skill-intel__mastery">
        <span>Battle readiness</span>
        <strong>{skill.level}%</strong>
      </div>
      <div className="skill-intel__track">
        <span style={{ width: `${skill.level}%` }} />
      </div>
    </div>
  )
}

// Panel container that lays out the heading + cards + quote + intel strip.
export function SkillPanel({ data, visible, selectedSkill, onSelectSkill }) {
  return (
    <div className="skill-panel">
      <header className={`skill-panel__header ${visible ? 'is-visible' : ''}`}>
        <span>{data.subtitle}</span>
        <h2>{data.title}</h2>
        <div className="skill-panel__rule"><i /><b>{data.symbol}</b><i /></div>
      </header>

      <div className={`skill-panel__cards ${selectedSkill ? 'has-selection' : ''}`}>
        {data.skills.map((skill, index) => (
          <WantedCard
            key={skill.name}
            skill={skill}
            index={index}
            visible={visible}
            accentColor={data.accentColor}
            selected={selectedSkill?.name === skill.name}
            onSelect={onSelectSkill}
          />
        ))}
      </div>

      <div className={`skill-panel__quote ${visible && !selectedSkill ? 'is-visible' : ''}`}>
        {data.quote}
      </div>

      <SkillIntel
        skill={selectedSkill}
        data={data}
        onClose={() => onSelectSkill(null)}
      />
    </div>
  )
}

// Full-bleed character art with the SkillPanel mounted on a glass rectangle.
export function CharacterStage({ data, characterVisible, boardVisible, contentVisible, turning, selectedSkill, onSelectSkill }) {
  return (
    <div
      className={`character-stage ${characterVisible ? 'is-visible' : ''} ${turning ? 'is-turning' : ''}`}
      style={{ '--glow': data.accentSoft }}
    >
      <div className="character-stage__art">
        <img src={data.characterImg} alt={data.character} />
        <div
          className={`character-stage__glass ${boardVisible ? 'is-visible' : ''}`}
          style={{
            left: data.boardRect.left,
            top: data.boardRect.top,
            width: data.boardRect.width,
            height: data.boardRect.height,
            '--accent': data.accentColor,
          }}
        >
          <SkillPanel
            data={data}
            visible={contentVisible}
            selectedSkill={selectedSkill}
            onSelectSkill={onSelectSkill}
          />
        </div>
      </div>
    </div>
  )
}

// Compass-belt header showing current bearing + character name.
export function BearingHeader({ data, visible }) {
  return (
    <div className={`bearing-header ${visible ? 'is-visible' : ''}`} style={{ '--accent': data.accentColor }}>
      <span className="bearing-header__line" />
      <div>
        <small>{data.bearing}</small>
        <strong>{data.character}</strong>
      </div>
      <span className="bearing-header__line" />
    </div>
  )
}

// Bottom-of-screen compass dial with N/E/S/W buttons.
export function CompassNavigation({ current, onNavigate, data, visible }) {
  const currentIndex = DIR_ORDER.indexOf(current)
  const rotation = currentIndex * -90

  return (
    <nav className={`crow-compass ${visible ? 'is-visible' : ''}`} aria-label="Skill categories">
      <div className="crow-compass__rail" />
      <div className="crow-compass__body">
        <div
          className="crow-compass__rose"
          style={{ transform: `rotate(${rotation}deg)`, '--accent': data.accentColor }}
        >
          <span>N</span><span>E</span><span>S</span><span>W</span>
          <i />
        </div>
        <div className="crow-compass__buttons">
          {DIR_META.map((meta) => (
            <button
              key={meta.dir}
              className={meta.dir === current ? 'is-active' : ''}
              onClick={() => onNavigate(meta.dir)}
              style={{ '--accent': data.accentColor }}
            >
              <small>{meta.compass}</small>
              <span>{meta.shortName}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

// Left/right chevron for rotating between cardinal bearings.
export function TurnControl({ side, label, onClick, visible, accentColor }) {
  return (
    <button
      className={`turn-control turn-control--${side} ${visible ? 'is-visible' : ''}`}
      style={{ '--accent': accentColor }}
      onClick={onClick}
      aria-label={label}
    >
      <span>{side === 'left' ? '‹' : '›'}</span>
      <small>{label}</small>
    </button>
  )
}

// Top-right "back to deck" pill button.
export function SkillsCloseButton({ visible, onClose, accentColor }) {
  return (
    <button
      className={`skills-close ${visible ? 'is-visible' : ''}`}
      style={{ '--accent': accentColor }}
      onClick={onClose}
      aria-label="Return to deck"
    >
      <span>×</span>
      <small>DECK</small>
    </button>
  )
}
