import { useCallback, useEffect, useRef, useState } from 'react'

const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
}

const DIR_ORDER = [
  DIRECTIONS.NORTH,
  DIRECTIONS.EAST,
  DIRECTIONS.SOUTH,
  DIRECTIONS.WEST,
]

const ICONS = (name) => `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${name}.svg`

const SKILL_DATA = {
  [DIRECTIONS.NORTH]: {
    character: 'ZORO',
    title: 'PROGRAMMING LANGUAGES',
    subtitle: 'SKILLS · ZORO ARSENAL',
    bearing: 'NORTH BLUE',
    symbol: '三',
    characterImg: '/characters/zoro.png',
    boardRect: { left: '9.5%', top: '28%', width: '80.5%', height: '58%' },
    accentColor: '#54e58a',
    accentSoft: 'rgba(84,229,138,0.22)',
    titleColor: '#b8ffd0',
    atmosphere: 'rgba(23,92,59,0.24)',
    quote: '"I’ll become the world’s greatest swordsman."',
    effect: 'slashes',
    skills: [
      { name: 'JavaScript', iconUrl: ICONS('javascript'), color: '#F7DF1E', fallback: 'JS', level: 92, bounty: '92M', note: 'Interactive frontends, game logic, and expressive web experiences.' },
      { name: 'TypeScript', iconUrl: ICONS('typescript'), color: '#3178C6', fallback: 'TS', level: 86, bounty: '86M', note: 'Reliable application architecture with safer, scalable code.' },
      { name: 'Python', iconUrl: ICONS('python'), color: '#3776AB', fallback: 'Py', level: 90, bounty: '90M', note: 'AI systems, automation, data workflows, and rapid prototypes.' },
      { name: 'C++', iconUrl: ICONS('cplusplus'), color: '#00599C', fallback: 'C++', level: 72, bounty: '72M', note: 'Performance-minded programming and core problem solving.' },
      { name: 'Java', iconUrl: ICONS('openjdk'), color: '#ED8B00', fallback: 'J', level: 78, bounty: '78M', note: 'Object-oriented systems, APIs, and production fundamentals.' },
    ],
  },
  [DIRECTIONS.EAST]: {
    character: 'SANJI',
    title: 'FRONTEND & DESIGN',
    subtitle: 'SKILLS · SANJI CRAFT',
    bearing: 'EAST BLUE',
    symbol: '火',
    characterImg: '/characters/sanji.png',
    boardRect: { left: '10%', top: '28%', width: '80%', height: '57%' },
    accentColor: '#ffbf47',
    accentSoft: 'rgba(255,191,71,0.22)',
    titleColor: '#ffe1a2',
    atmosphere: 'rgba(141,77,18,0.22)',
    quote: '"A first-class cook never wastes the ingredients."',
    effect: 'embers',
    skills: [
      { name: 'React.js', iconUrl: ICONS('react'), color: '#61DAFB', fallback: 'R', level: 92, bounty: '92M', note: 'Component systems, stateful interfaces, and polished interactions.' },
      { name: 'Tailwind CSS', iconUrl: ICONS('tailwindcss'), color: '#38BDF8', fallback: 'TW', level: 88, bounty: '88M', note: 'Fast, consistent visual systems with responsive precision.' },
      { name: 'Streamlit', iconUrl: ICONS('streamlit'), color: '#FF4B4B', fallback: 'S', level: 82, bounty: '82M', note: 'Useful data and AI products shipped from idea to interface quickly.' },
      { name: 'Figma', iconUrl: ICONS('figma'), color: '#F24E1E', fallback: 'F', level: 78, bounty: '78M', note: 'Interface exploration, prototypes, visual hierarchy, and handoff.' },
      { name: 'Photoshop', iconUrl: ICONS('adobephotoshop'), color: '#31A8FF', fallback: 'PS', level: 70, bounty: '70M', note: 'Asset preparation, image treatment, and atmospheric compositions.' },
    ],
  },
  [DIRECTIONS.SOUTH]: {
    character: 'BOA HANCOCK',
    title: 'DEV TOOLS & APIS',
    subtitle: 'SKILLS · BOA TOOLKIT',
    bearing: 'CALM BELT',
    symbol: '心',
    characterImg: '/characters/boa.png',
    boardRect: { left: '15.5%', top: '27%', width: '74%', height: '58%' },
    accentColor: '#ef77c8',
    accentSoft: 'rgba(239,119,200,0.22)',
    titleColor: '#ffd0ef',
    atmosphere: 'rgba(118,25,91,0.20)',
    quote: '"Beauty is power, but precision makes it useful."',
    effect: 'petals',
    skills: [
      { name: 'Git', iconUrl: ICONS('git'), color: '#F05032', fallback: 'G', level: 88, bounty: '88M', note: 'Clean histories, safe collaboration, and deliberate delivery.' },
      { name: 'GitHub', iconUrl: ICONS('github'), color: '#1f2328', fallback: 'GH', level: 90, bounty: '90M', note: 'Repository workflows, reviews, automation, and project stewardship.' },
      { name: 'VS Code', iconUrl: ICONS('visualstudiocode'), color: '#007ACC', fallback: 'VS', level: 92, bounty: '92M', note: 'A tuned development cockpit for focused, efficient building.' },
      { name: 'Cursor', iconUrl: ICONS('cursor'), color: '#333333', fallback: 'C', level: 84, bounty: '84M', note: 'AI-assisted iteration while keeping engineering judgment in control.' },
      { name: 'REST API', iconUrl: ICONS('swagger'), color: '#65b93c', fallback: 'API', level: 86, bounty: '86M', note: 'Clear contracts connecting products, services, and real-world data.' },
    ],
  },
  [DIRECTIONS.WEST]: {
    character: 'SHANKS',
    title: 'AI / ML & BLOCKCHAIN',
    subtitle: 'SKILLS · SHANKS POWER',
    bearing: 'NEW WORLD',
    symbol: '覇',
    characterImg: '/characters/shanks.png',
    boardRect: { left: '16%', top: '30%', width: '74%', height: '59%' },
    accentColor: '#ef6161',
    accentSoft: 'rgba(239,97,97,0.22)',
    titleColor: '#ffc3c3',
    atmosphere: 'rgba(116,22,22,0.22)',
    quote: '"The future is worth betting an arm on."',
    effect: 'haki',
    skills: [
      { name: 'LangChain', iconUrl: ICONS('langchain'), color: '#1C7B4B', fallback: 'LC', level: 88, bounty: '88M', note: 'Composable LLM workflows, tools, memory, and grounded applications.' },
      { name: 'FAISS', iconUrl: ICONS('meta'), color: '#6655ee', fallback: 'FA', level: 82, bounty: '82M', note: 'Fast semantic retrieval over meaningful knowledge collections.' },
      { name: 'XGBoost', iconUrl: ICONS('scikitlearn'), color: '#337AB7', fallback: 'XG', level: 80, bounty: '80M', note: 'Strong tabular machine-learning baselines and practical prediction.' },
      { name: 'Groq', iconUrl: ICONS('groq'), color: '#F97316', fallback: 'G', level: 84, bounty: '84M', note: 'Low-latency inference for responsive AI product experiences.' },
      { name: 'RAG', iconUrl: ICONS('openai'), color: '#7356d8', fallback: 'RAG', level: 90, bounty: '90M', note: 'Evidence-grounded answers backed by retrieval and evaluation.' },
      { name: 'TensorFlow', iconUrl: ICONS('tensorflow'), color: '#FF6F00', fallback: 'TF', level: 76, bounty: '76M', note: 'Model experimentation and dependable deep-learning foundations.' },
      { name: 'Solidity', iconUrl: ICONS('solidity'), color: '#666666', fallback: 'S', level: 70, bounty: '70M', note: 'Smart-contract fundamentals and decentralized application logic.' },
      { name: 'Web3.py', iconUrl: ICONS('python'), color: '#F16822', fallback: 'W3', level: 74, bounty: '74M', note: 'Python integrations for chains, contracts, and transaction workflows.' },
      { name: 'Polygon', iconUrl: ICONS('polygon'), color: '#8247E5', fallback: 'POLY', level: 72, bounty: '72M', note: 'Scalable EVM application patterns and ecosystem integrations.' },
    ],
  },
}

const DIR_META = [
  { dir: DIRECTIONS.NORTH, compass: 'N', shortName: 'Languages' },
  { dir: DIRECTIONS.EAST, compass: 'E', shortName: 'Frontend' },
  { dir: DIRECTIONS.SOUTH, compass: 'S', shortName: 'Dev Tools' },
  { dir: DIRECTIONS.WEST, compass: 'W', shortName: 'AI / ML' },
]

function Atmosphere({ data, visible, turning }) {
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

function WantedCard({ skill, index, visible, accentColor, selected, onSelect }) {
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

function SkillIntel({ skill, data, onClose }) {
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

function SkillPanel({ data, visible, selectedSkill, onSelectSkill }) {
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

function CharacterStage({ data, characterVisible, boardVisible, contentVisible, turning, selectedSkill, onSelectSkill }) {
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

function BearingHeader({ data, visible }) {
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

function CompassNavigation({ current, onNavigate, data, visible }) {
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

function TurnControl({ side, label, onClick, visible, accentColor }) {
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

function SkillsCloseButton({ visible, onClose, accentColor }) {
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

function SkillsOverlay({ active, onClose, onDirectionChange }) {
  const [currentDir, setCurrentDir] = useState(DIRECTIONS.NORTH)
  const [overlayIn, setOverlayIn] = useState(false)
  const [characterIn, setCharacterIn] = useState(false)
  const [boardIn, setBoardIn] = useState(false)
  const [contentIn, setContentIn] = useState(false)
  const [controlsIn, setControlsIn] = useState(false)
  const [turning, setTurning] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const timersRef = useRef([])
  const data = SKILL_DATA[currentDir]

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const navigateTo = useCallback((targetDir) => {
    if (turning || targetDir === currentDir) return

    setTurning(true)
    setContentIn(false)
    setBoardIn(false)
    setSelectedSkill(null)

    timersRef.current.push(setTimeout(() => {
      setCurrentDir(targetDir)
      onDirectionChange?.(targetDir)
      setBoardIn(true)
      timersRef.current.push(setTimeout(() => {
        setContentIn(true)
        setTurning(false)
      }, 360))
    }, 360))
  }, [currentDir, onDirectionChange, turning])

  const rotate = useCallback((amount) => {
    const index = DIR_ORDER.indexOf(currentDir)
    navigateTo(DIR_ORDER[(index + amount + DIR_ORDER.length) % DIR_ORDER.length])
  }, [currentDir, navigateTo])

  useEffect(() => {
    clearTimers()

    if (active) {
      setSelectedSkill(null)
      setOverlayIn(false)
      setCharacterIn(false)
      setBoardIn(false)
      setContentIn(false)
      setControlsIn(false)
      onDirectionChange?.(currentDir)

      timersRef.current = [
        setTimeout(() => setOverlayIn(true), 180),
        setTimeout(() => setCharacterIn(true), 720),
        setTimeout(() => setBoardIn(true), 1180),
        setTimeout(() => setContentIn(true), 1520),
        setTimeout(() => setControlsIn(true), 1900),
      ]
    } else {
      setControlsIn(false)
      setContentIn(false)
      setBoardIn(false)
      setCharacterIn(false)
      setSelectedSkill(null)
      timersRef.current = [setTimeout(() => setOverlayIn(false), 260)]
    }

    return clearTimers
  }, [active, clearTimers, onDirectionChange])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!active) return
      if (event.key === 'Escape') {
        if (selectedSkill) setSelectedSkill(null)
        else onClose()
      }
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') rotate(-1)
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') rotate(1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, onClose, rotate, selectedSkill])

  return (
    <section
      className={`skills-overlay ${overlayIn ? 'is-visible' : ''}`}
      aria-hidden={!active}
      style={{ '--accent': data.accentColor, '--atmosphere': data.atmosphere }}
    >
      <Atmosphere data={data} visible={characterIn} turning={turning} />
      <div className="skills-overlay__horizon" />
      <div className="skills-overlay__vignette" />

      <BearingHeader data={data} visible={boardIn} />

      <CharacterStage
        data={data}
        characterVisible={characterIn}
        boardVisible={boardIn}
        contentVisible={contentIn}
        turning={turning}
        selectedSkill={selectedSkill}
        onSelectSkill={setSelectedSkill}
      />

      <TurnControl
        side="left"
        label="Previous bearing"
        onClick={() => rotate(-1)}
        visible={controlsIn}
        accentColor={data.accentColor}
      />
      <TurnControl
        side="right"
        label="Next bearing"
        onClick={() => rotate(1)}
        visible={controlsIn}
        accentColor={data.accentColor}
      />

      <CompassNavigation
        current={currentDir}
        onNavigate={navigateTo}
        data={data}
        visible={controlsIn}
      />
      <SkillsCloseButton visible={controlsIn} onClose={onClose} accentColor={data.accentColor} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=IM+Fell+English:ital@0;1&display=swap');

        .skills-overlay {
          --paper: #ead8ac;
          position: fixed;
          inset: 0;
          z-index: 220;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          color: #fff;
          transition: opacity .65s ease;
          font-family: "IM Fell English", Georgia, serif;
        }

        .skills-overlay.is-visible {
          opacity: 1;
          pointer-events: auto;
        }

        .skills-atmosphere,
        .skills-overlay__vignette,
        .skills-overlay__horizon,
        .skills-weather {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .skills-atmosphere {
          z-index: 0;
        }

        .skills-overlay__horizon {
          z-index: 1;
          top: 47%;
          bottom: auto;
          height: 28%;
          opacity: .42;
          background:
            linear-gradient(180deg, transparent, rgba(207,235,240,.14) 38%, rgba(193,225,232,.26) 55%, transparent),
            radial-gradient(ellipse at 50% 45%, var(--atmosphere), transparent 65%);
          filter: blur(12px);
        }

        .skills-overlay__vignette {
          z-index: 8;
          box-shadow: inset 0 0 130px 35px rgba(1,6,10,.62);
        }

        .skills-weather {
          z-index: 11;
          overflow: hidden;
          mix-blend-mode: screen;
          transition: opacity .8s ease;
        }

        .skills-weather::before,
        .skills-weather::after {
          position: absolute;
          inset: 0;
          content: "";
          pointer-events: none;
        }

        .skills-weather i {
          position: absolute;
          display: block;
          pointer-events: none;
        }

        .skills-weather--slashes i {
          top: calc(-18% + (var(--i) * 6.8%));
          left: calc(-24% + (var(--i) * 7.4%));
          width: clamp(210px, 22vw, 430px);
          height: 2px;
          opacity: .24;
          background: linear-gradient(90deg, transparent, rgba(191,255,213,.95), transparent);
          box-shadow: 0 0 12px rgba(84,229,138,.48);
          transform: rotate(-21deg);
          animation: wind-cut 4.8s ease-in-out infinite;
          animation-delay: calc(var(--i) * -.31s);
        }

        .skills-weather--slashes::before {
          background:
            radial-gradient(ellipse at 18% 62%, rgba(76,255,145,.22), transparent 28%),
            radial-gradient(ellipse at 82% 30%, rgba(76,255,145,.16), transparent 24%);
          animation: zoro-mist 5s ease-in-out infinite alternate;
        }

        .skills-weather--embers i {
          left: calc(-3% + (var(--i) * 5.4%));
          bottom: -28px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffe2a0;
          box-shadow: 0 0 15px 3px rgba(255,112,28,.72);
          animation: ember-rise 6.2s linear infinite;
          animation-delay: calc(var(--i) * -.43s);
        }

        .skills-weather--embers i:nth-child(3n) { width: 10px; height: 10px; }
        .skills-weather--embers i:nth-child(3n + 1) { width: 4px; height: 4px; }

        .skills-weather--embers::before {
          inset: auto 0 0;
          height: 48%;
          background: radial-gradient(ellipse at 50% 100%, rgba(255,118,28,.28), transparent 68%);
          animation: heat-pulse 2.8s ease-in-out infinite alternate;
        }

        .skills-weather--haki i {
          top: calc(3% + (var(--i) * 5.1%));
          left: calc(-8% + (var(--i) * 5.7%));
          width: clamp(140px, 16vw, 300px);
          height: 3px;
          opacity: 0;
          background: linear-gradient(90deg, transparent, #fff, #ff5e66 54%, transparent);
          box-shadow: 0 0 16px rgba(255,31,52,.88);
          clip-path: polygon(0 40%, 35% 20%, 43% 70%, 68% 36%, 100% 58%, 100% 78%, 66% 57%, 42% 92%, 33% 43%, 0 65%);
          transform: rotate(calc(-32deg + (var(--i) * 3.2deg)));
          animation: haki-flash 3.8s ease-out infinite;
          animation-delay: calc(var(--i) * -.28s);
        }

        .skills-weather--haki::before {
          background:
            radial-gradient(circle at 50% 42%, rgba(255,34,52,.34), transparent 38%),
            radial-gradient(circle at 10% 58%, rgba(255,22,44,.24), transparent 30%),
            radial-gradient(circle at 90% 34%, rgba(255,22,44,.22), transparent 30%);
          animation: haki-aura 3.8s ease-in-out infinite;
        }

        .skills-weather--haki::after {
          background:
            linear-gradient(90deg, rgba(255,18,40,.24), transparent 18%, transparent 82%, rgba(255,18,40,.24)),
            radial-gradient(ellipse at 50% 105%, rgba(143,0,15,.34), transparent 52%);
          animation: haki-breathe 2.6s ease-in-out infinite alternate;
        }

        .skills-weather--petals i {
          top: -30px;
          left: calc(-2% + (var(--i) * 5.3%));
          width: 11px;
          height: 8px;
          border-radius: 70% 20% 70% 20%;
          background: rgba(255,191,230,.86);
          box-shadow: 0 0 9px rgba(239,119,200,.54);
          animation: petal-fall 7.4s linear infinite;
          animation-delay: calc(var(--i) * -.51s);
        }

        .skills-weather--petals i:nth-child(3n) { width: 16px; height: 11px; filter: blur(.4px); }
        .skills-weather--petals i:nth-child(3n + 1) { width: 8px; height: 6px; }

        .skills-weather--petals::before {
          background:
            radial-gradient(ellipse at 20% 40%, rgba(255,105,202,.18), transparent 26%),
            radial-gradient(ellipse at 80% 58%, rgba(255,105,202,.16), transparent 28%);
          animation: boa-aura 4.5s ease-in-out infinite alternate;
        }

        .bearing-header {
          position: fixed;
          top: clamp(26px, 4vh, 48px);
          left: 50%;
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 14px;
          opacity: 0;
          transform: translate(-50%, -12px);
          transition: opacity .55s ease, transform .65s cubic-bezier(.22,1,.36,1);
          text-align: center;
          white-space: nowrap;
        }

        .bearing-header.is-visible {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        .bearing-header__line {
          width: clamp(34px, 5vw, 78px);
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent));
        }

        .bearing-header__line:last-child {
          transform: scaleX(-1);
        }

        .bearing-header small,
        .bearing-header strong {
          display: block;
        }

        .bearing-header small {
          margin-bottom: 2px;
          color: rgba(255,255,255,.46);
          font-size: 9px;
          letter-spacing: .28em;
        }

        .bearing-header strong {
          color: var(--accent);
          font: 400 clamp(15px, 1.4vw, 21px)/1 "Pirata One", cursive;
          letter-spacing: .24em;
          text-shadow: 0 0 18px var(--accent);
        }

        .character-stage {
          position: absolute;
          top: clamp(72px, 8vh, 112px);
          left: 50%;
          z-index: 12;
          width: clamp(760px, 68vw, 1220px);
          max-height: calc(100vh - 205px);
          opacity: 0;
          transform: translateX(-50%) translateY(22px) scale(.97);
          transform-origin: 50% 45%;
          transition: opacity .75s ease, transform 1s cubic-bezier(.22,1,.36,1), filter .35s ease;
          pointer-events: none;
        }

        .character-stage.is-visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .character-stage.is-turning {
          opacity: .28;
          filter: blur(5px);
          transform: translateX(-50%) translateY(4px) scale(.985);
        }

        .character-stage__art {
          position: relative;
          width: 100%;
          animation: lookout-breathe 9s ease-in-out infinite;
        }

        .character-stage__art > img {
          display: block;
          width: 100%;
          height: auto;
          opacity: .76;
          filter: saturate(.92) contrast(1.06) drop-shadow(0 20px 34px rgba(0,0,0,.36));
          mask-image: linear-gradient(180deg, #000 0%, #000 88%, rgba(0,0,0,.72) 96%, transparent 100%);
        }

        .character-stage__glass {
          position: absolute;
          box-sizing: border-box;
          opacity: 0;
          transform: perspective(900px) rotateX(5deg) scale(.94);
          transform-origin: 50% 60%;
          transition: opacity .55s ease, transform .75s cubic-bezier(.22,1,.36,1);
          pointer-events: auto;
        }

        .character-stage__glass.is-visible {
          opacity: 1;
          transform: perspective(900px) rotateX(0) scale(1);
        }

        .skill-panel {
          position: relative;
          display: flex;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(10px, 1.2vw, 18px);
        }

        .skill-panel__header {
          margin-bottom: clamp(8px, 1.2vh, 14px);
          opacity: 0;
          text-align: center;
          transform: translateY(8px);
          transition: opacity .5s ease, transform .6s ease;
        }

        .skill-panel__header.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .skill-panel__header span {
          display: block;
          margin-bottom: 5px;
          color: rgba(255, 226, 154, .82);
          font: 900 clamp(8px, .68vw, 11px)/1 Inter, system-ui, sans-serif;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .skill-panel__header h2 {
          margin: 0;
          color: #fff8e8;
          font: 900 clamp(18px, 1.65vw, 28px)/1.1 Inter, system-ui, sans-serif;
          letter-spacing: .06em;
          text-transform: uppercase;
          text-shadow: 0 0 18px color-mix(in srgb, var(--accent) 58%, transparent);
        }

        .skill-panel__rule {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 5px;
        }

        .skill-panel__rule i {
          width: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent));
          opacity: .4;
        }

        .skill-panel__rule i:last-child { transform: scaleX(-1); }
        .skill-panel__rule b { color: var(--accent); font-size: 9px; font-weight: 400; opacity: .7; }

        .skill-panel__cards {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: center;
          gap: clamp(7px, .85vw, 14px);
          width: 94%;
          transition: transform .4s ease;
        }

        .skill-panel__cards.has-selection {
          transform: translateY(-9px) scale(.88);
          transform-origin: top center;
        }

        .wanted-card {
          --card-width: clamp(62px, 5.05vw, 90px);
          position: relative;
          display: flex;
          width: var(--card-width);
          min-height: calc(var(--card-width) * 1.34);
          box-sizing: border-box;
          flex-direction: column;
          align-items: center;
          padding: 6px 5px 7px;
          overflow: hidden;
          border: 1px solid rgba(105,74,24,.76);
          border-radius: 3px 3px 7px 7px;
          opacity: 0;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(108,72,20,.035) 5px, rgba(108,72,20,.035) 6px),
            linear-gradient(155deg, #f4e4bd, #ddc589);
          box-shadow: 0 3px 10px rgba(0,0,0,.34);
          color: #211305;
          cursor: pointer;
          transform: translateY(18px) rotate(-2deg) scale(.76);
          transition:
            opacity .5s ease var(--delay),
            transform .5s cubic-bezier(.22,1,.36,1) var(--delay),
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .wanted-card:nth-child(even) { transform: translateY(18px) rotate(1.5deg) scale(.76); }

        .wanted-card--visible {
          opacity: 1;
          transform: translateY(0) rotate(0) scale(1) !important;
        }

        .wanted-card:hover,
        .wanted-card--selected {
          z-index: 3;
          border-color: var(--accent);
          box-shadow: 0 7px 18px rgba(0,0,0,.48), 0 0 13px color-mix(in srgb, var(--accent) 42%, transparent);
          transform: translateY(-7px) rotate(0) scale(1.06) !important;
        }

        .wanted-card__heading {
          width: 100%;
          margin-bottom: 4px;
          padding-bottom: 3px;
          border-bottom: 1px solid rgba(90,55,12,.24);
          font: 400 clamp(8px, .72vw, 12px)/1 "Pirata One", cursive;
          letter-spacing: .14em;
        }

        .wanted-card__portrait {
          display: flex;
          width: clamp(32px, 3.1vw, 52px);
          height: clamp(32px, 3.1vw, 52px);
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          border: 1px solid rgba(73,45,11,.18);
          border-radius: 4px;
          background: rgba(36,22,6,.06);
          font: 400 clamp(12px, 1vw, 18px)/1 "Pirata One", cursive;
        }

        .wanted-card__portrait img {
          width: 78%;
          height: 78%;
          object-fit: contain;
        }

        .wanted-card strong {
          max-width: 100%;
          font-size: clamp(8px, .72vw, 12px);
          font-weight: 600;
          line-height: 1.05;
          text-align: center;
        }

        .wanted-card small {
          margin-top: 3px;
          color: rgba(62,35,5,.58);
          font-size: clamp(5px, .46vw, 7px);
          letter-spacing: .08em;
        }

        .wanted-card__shine {
          position: absolute;
          inset: -60% auto -60% -45%;
          width: 26%;
          opacity: 0;
          background: rgba(255,255,255,.42);
          transform: rotate(18deg);
          transition: left .45s ease, opacity .2s ease;
        }

        .wanted-card:hover .wanted-card__shine {
          left: 125%;
          opacity: 1;
        }

        .skill-panel__quote {
          margin-top: clamp(6px, 1vh, 12px);
          opacity: 0;
          color: var(--accent);
          font-size: clamp(8px, .72vw, 12px);
          font-style: italic;
          letter-spacing: .03em;
          text-align: center;
          transform: translateY(7px);
          transition: opacity .5s ease .65s, transform .5s ease .65s;
        }

        .skill-panel__quote.is-visible {
          opacity: .7;
          transform: translateY(0);
        }

        .skill-intel {
          position: absolute;
          right: 7%;
          bottom: 4%;
          left: 7%;
          z-index: 8;
          box-sizing: border-box;
          padding: 10px 34px 10px 14px;
          border: 1px solid color-mix(in srgb, var(--accent) 58%, transparent);
          border-radius: 8px;
          background: linear-gradient(100deg, rgba(3,12,16,.94), rgba(8,22,25,.88));
          box-shadow: 0 10px 26px rgba(0,0,0,.42), inset 3px 0 0 var(--accent);
          animation: intel-in .4s cubic-bezier(.22,1,.36,1);
          backdrop-filter: blur(12px);
        }

        .skill-intel__close {
          position: absolute;
          top: 5px;
          right: 8px;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.55);
          cursor: pointer;
          font-size: 18px;
        }

        .skill-intel__eyebrow {
          color: var(--accent);
          font-size: 7px;
          letter-spacing: .2em;
        }

        .skill-intel__name {
          margin: 1px 0 2px;
          font: 400 clamp(12px, 1.05vw, 17px)/1 "Pirata One", cursive;
          letter-spacing: .08em;
        }

        .skill-intel p {
          margin: 0 0 6px;
          color: rgba(255,255,255,.62);
          font-size: clamp(8px, .68vw, 11px);
          line-height: 1.25;
        }

        .skill-intel__mastery {
          display: flex;
          justify-content: space-between;
          color: rgba(255,255,255,.48);
          font-size: 7px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .skill-intel__mastery strong { color: var(--accent); font-weight: 400; }
        .skill-intel__track { height: 2px; margin-top: 3px; overflow: hidden; background: rgba(255,255,255,.1); }
        .skill-intel__track span { display: block; height: 100%; background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: mastery-in .65s ease; }

        .crow-compass {
          position: fixed;
          bottom: 22px;
          left: 50%;
          z-index: 35;
          width: min(620px, 74vw);
          height: 124px;
          opacity: 0;
          transform: translate(-50%, 40px);
          transition: opacity .55s ease, transform .75s cubic-bezier(.22,1,.36,1);
          pointer-events: none;
        }

        .crow-compass.is-visible {
          opacity: 1;
          transform: translate(-50%, 0);
          pointer-events: auto;
        }

        .crow-compass__rail {
          position: absolute;
          right: 2%;
          bottom: -60px;
          left: 2%;
          height: 128px;
          border: 8px solid rgba(91,57,22,.92);
          border-bottom: 0;
          border-radius: 50% 50% 0 0;
          box-shadow: inset 0 4px 0 rgba(213,171,83,.72), 0 -5px 20px rgba(0,0,0,.32);
        }

        .crow-compass__body {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 100%;
        }

        .crow-compass__rose {
          position: absolute;
          bottom: -18px;
          left: 50%;
          width: 112px;
          height: 112px;
          margin-left: -56px;
          border: 3px solid rgba(205,161,75,.82);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(24,17,9,.94) 0 28%, rgba(73,45,19,.92) 29% 54%, rgba(18,13,8,.96) 55%);
          box-shadow: 0 0 0 5px rgba(53,31,13,.92), 0 0 26px rgba(0,0,0,.55);
          transition: transform .75s cubic-bezier(.22,1,.36,1);
        }

        .crow-compass__rose span {
          position: absolute;
          color: rgba(247,222,165,.62);
          font: 400 10px/1 "Pirata One", cursive;
        }

        .crow-compass__rose span:nth-child(1) { top: 8px; left: 50%; transform: translateX(-50%); }
        .crow-compass__rose span:nth-child(2) { top: 50%; right: 9px; transform: translateY(-50%); }
        .crow-compass__rose span:nth-child(3) { bottom: 8px; left: 50%; transform: translateX(-50%); }
        .crow-compass__rose span:nth-child(4) { top: 50%; left: 9px; transform: translateY(-50%); }

        .crow-compass__rose i {
          position: absolute;
          top: 17px;
          left: 50%;
          width: 0;
          height: 0;
          border-right: 9px solid transparent;
          border-bottom: 39px solid var(--accent);
          border-left: 9px solid transparent;
          filter: drop-shadow(0 0 6px var(--accent));
          transform: translateX(-50%);
        }

        .crow-compass__buttons {
          position: absolute;
          right: 0;
          bottom: 7px;
          left: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }

        .crow-compass__buttons button {
          display: flex;
          min-width: 86px;
          flex-direction: column;
          align-items: center;
          padding: 7px 8px 6px;
          border: 1px solid rgba(220,188,123,.3);
          border-radius: 5px;
          background: rgba(24,15,8,.74);
          color: rgba(255,244,216,.5);
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: border-color .2s ease, color .2s ease, transform .2s ease, background .2s ease;
        }

        .crow-compass__buttons button:hover,
        .crow-compass__buttons button.is-active {
          border-color: var(--accent);
          background: rgba(14,20,18,.88);
          color: var(--accent);
          transform: translateY(-3px);
        }

        .crow-compass__buttons small { font-size: 8px; letter-spacing: .16em; }
        .crow-compass__buttons span { font: 400 13px/1.2 "Pirata One", cursive; letter-spacing: .05em; }

        .turn-control {
          position: fixed;
          top: 50%;
          z-index: 36;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0;
          border: 0;
          opacity: 0;
          background: transparent;
          color: rgba(255,255,255,.48);
          cursor: pointer;
          transform: translateY(-50%);
          transition: opacity .4s ease, color .2s ease;
        }

        .turn-control.is-visible { opacity: 1; }
        .turn-control--left { left: clamp(14px, 3vw, 42px); }
        .turn-control--right { right: clamp(14px, 3vw, 42px); flex-direction: row-reverse; }

        .turn-control span {
          display: grid;
          width: clamp(42px, 4.5vw, 60px);
          height: clamp(42px, 4.5vw, 60px);
          place-items: center;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 50%;
          background: rgba(3,10,13,.46);
          font-size: 27px;
          backdrop-filter: blur(8px);
          transition: border-color .2s ease, color .2s ease, transform .2s ease;
        }

        .turn-control small {
          max-width: 50px;
          font-size: 7px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .turn-control:hover { color: var(--accent); }
        .turn-control:hover span { border-color: var(--accent); transform: scale(1.08); }

        .skills-close {
          position: fixed;
          top: clamp(16px, 2.5vh, 28px);
          right: clamp(16px, 2vw, 28px);
          z-index: 40;
          display: flex;
          width: 48px;
          height: 48px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 50%;
          opacity: 0;
          background: rgba(3,10,13,.52);
          color: rgba(255,255,255,.62);
          cursor: pointer;
          transform: scale(.7);
          backdrop-filter: blur(8px);
          transition: opacity .4s ease, transform .45s ease, border-color .2s ease, color .2s ease;
        }

        .skills-close.is-visible { opacity: 1; transform: scale(1); }
        .skills-close:hover { border-color: var(--accent); color: var(--accent); transform: scale(1.07); }
        .skills-close span { font-size: 18px; line-height: .8; }
        .skills-close small { margin-top: 4px; font-size: 6px; letter-spacing: .12em; }

        @keyframes lookout-breathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.002); }
        }

        @keyframes wind-cut {
          0%, 72%, 100% { opacity: 0; transform: translate(-80px, 40px) rotate(-21deg) scaleX(.35); }
          80% { opacity: .62; }
          93% { opacity: 0; transform: translate(280px, -55px) rotate(-21deg) scaleX(1.35); }
        }

        @keyframes ember-rise {
          from { opacity: 0; transform: translate(0, 0) scale(.6); }
          18% { opacity: .9; }
          to { opacity: 0; transform: translate(65px, -88vh) scale(1.45); }
        }

        @keyframes haki-flash {
          0%, 76%, 100% { opacity: 0; transform: scaleX(.18) rotate(-12deg); }
          81% { opacity: .92; }
          89% { opacity: .12; transform: scaleX(1.65) rotate(-12deg); }
          92% { opacity: .72; }
        }

        @keyframes petal-fall {
          from { opacity: 0; transform: translate(0, -20px) rotate(0deg); }
          10% { opacity: .9; }
          to { opacity: 0; transform: translate(130px, 105vh) rotate(620deg); }
        }

        @keyframes zoro-mist {
          from { opacity: .58; transform: translateX(-1.5%); }
          to { opacity: 1; transform: translateX(1.5%); }
        }

        @keyframes heat-pulse {
          from { opacity: .55; transform: scaleY(.92); filter: blur(5px); }
          to { opacity: 1; transform: scaleY(1.08); filter: blur(9px); }
        }

        @keyframes haki-aura {
          0%, 72%, 100% { opacity: .62; transform: scale(1); }
          82% { opacity: 1; transform: scale(1.035); }
          90% { opacity: .72; transform: scale(.995); }
        }

        @keyframes haki-breathe {
          from { opacity: .55; filter: blur(3px); }
          to { opacity: 1; filter: blur(8px); }
        }

        @keyframes boa-aura {
          from { opacity: .55; transform: scale(1); }
          to { opacity: .95; transform: scale(1.025); }
        }

        @keyframes intel-in {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes mastery-in {
          from { width: 0; }
        }

        @media (max-width: 900px) {
          .character-stage { width: max(760px, 96vw); top: 12vh; }
          .turn-control small { display: none; }
          .crow-compass { width: 78vw; }
        }

        @media (max-width: 640px) {
          .character-stage { width: 780px; left: 50%; top: 15vh; }
          .bearing-header { top: 20px; }
          .bearing-header__line { width: 22px; }
          .turn-control { top: 43%; }
          .turn-control span { width: 38px; height: 38px; }
          .crow-compass { width: 94vw; }
          .crow-compass__buttons button { min-width: 72px; padding: 6px; }
          .skills-close { width: 42px; height: 42px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .skills-overlay *,
          .skills-overlay *::before,
          .skills-overlay *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>
    </section>
  )
}

function SkillsLetterBox({ active }) {
  return (
    <>
      <div className={`skills-letterbox skills-letterbox--top ${active ? 'is-visible' : ''}`} />
      <div className={`skills-letterbox skills-letterbox--bottom ${active ? 'is-visible' : ''}`} />
      <style>{`
        .skills-letterbox {
          position: fixed;
          right: 0;
          left: 0;
          z-index: 210;
          height: clamp(22px, 3.2vh, 42px);
          background: #020708;
          pointer-events: none;
          transition: transform .7s cubic-bezier(.22,1,.36,1);
        }
        .skills-letterbox--top { top: 0; transform: translateY(-100%); }
        .skills-letterbox--bottom { bottom: 0; transform: translateY(100%); }
        .skills-letterbox.is-visible { transform: translateY(0); }
      `}</style>
    </>
  )
}

export default function SkillsSection({ active, onClose, onDirectionChange }) {
  return (
    <>
      <SkillsLetterBox active={active} />
      <SkillsOverlay
        active={active}
        onClose={onClose}
        onDirectionChange={onDirectionChange}
      />
    </>
  )
}
