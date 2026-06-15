/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILLS SECTION — Grand Line Portfolio (Crow's Nest Ocean View)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * FLOW:
 *   1. User clicks "Skills" nav wheel OR Luffy climbs the ladder (E key)
 *   2. Camera GSAP transitions from deck → crow's nest, looking OUT at the ocean
 *   3. Full-screen ocean/sky overlay appears, vibe-tinted per direction
 *   4. A One Piece character appears floating in the sky, holding a
 *      transparent glass board (the PNG already contains the board)
 *   5. Skill "WANTED" cards render INSIDE the transparent rectangle of the
 *      board art, positioned via per-direction boardRect coordinates
 *   6. Arrow buttons / bottom compass rotate between N / E / S / W
 *
 * 4 DIRECTIONS:
 *   NORTH — Zoro    — Programming Languages — dark green storm sky
 *   EAST  — Sanji   — Frontend & Design      — golden sunset sky
 *   WEST  — Shanks  — AI / ML & Blockchain   — blood red sky
 *   SOUTH — Boa     — Dev Tools & Integration— pink / magenta sky
 *
 * IMAGES EXPECTED IN /public/characters/:
 *   zoro.png, sanji.png, shanks.png, boa.png
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTIONS
// ─────────────────────────────────────────────────────────────────────────────

const DIRECTIONS = {
  NORTH: 'north',
  EAST:  'east',
  WEST:  'west',
  SOUTH: 'south',
}

const DIR_ORDER = [
  DIRECTIONS.NORTH,
  DIRECTIONS.EAST,
  DIRECTIONS.SOUTH,
  DIRECTIONS.WEST,
]

// ─────────────────────────────────────────────────────────────────────────────
// SKILL DATA
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = (name) => `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${name}.svg`

const SKILL_DATA = {
  [DIRECTIONS.NORTH]: {
    character: 'ZORO',
    title:     'PROGRAMMING LANGUAGES',
    subtitle:  "The Swordsman's Arsenal",
    characterImg: '/characters/zoro.png',

    // % position of the transparent board area WITHIN the character image
    boardRect: { left: '9.5%', top: '28%', width: '80.5%', height: '58%' },

    skyGradient: 'linear-gradient(180deg, #050f0a 0%, #0e2718 22%, #163d26 45%, #1f5536 68%, #0d2418 100%)',
    glowColor:   'rgba(34,180,80,0.28)',
    titleColor:  '#9dffc4',
    accentColor: '#3ddc84',
    seaColor:    '#0f5d4c',
    foamColor:   '#bff6d2',

    skills: [
      { name: 'JavaScript', iconUrl: ICONS('javascript'), color: '#F7DF1E' },
      { name: 'TypeScript', iconUrl: ICONS('typescript'), color: '#3178C6' },
      { name: 'Python',     iconUrl: ICONS('python'),     color: '#3776AB' },
      { name: 'C++',        iconUrl: ICONS('cplusplus'),  color: '#00599C' },
      { name: 'Java',       iconUrl: ICONS('openjdk'),    color: '#ED8B00' },
    ],
    quote: '"I\'ll become the world\'s greatest swordsman!"',
  },

  [DIRECTIONS.EAST]: {
    character: 'SANJI',
    title:     'FRONTEND & DESIGN',
    subtitle:  "The Chef's Craft",
    characterImg: '/characters/sanji.png',

    boardRect: { left: '10%', top: '28%', width: '80%', height: '57%' },

    skyGradient: 'linear-gradient(180deg, #1a0f00 0%, #4a2800 22%, #9a5400 45%, #d98e1a 68%, #f6d27a 100%)',
    glowColor:   'rgba(255,180,30,0.32)',
    titleColor:  '#ffd97a',
    accentColor: '#f0b830',
    seaColor:    '#7f5c1a',
    foamColor:   '#ffe7a3',

    skills: [
      { name: 'React.js',     iconUrl: ICONS('react'),       color: '#61DAFB' },
      { name: 'Tailwind CSS', iconUrl: ICONS('tailwindcss'), color: '#38BDF8' },
      { name: 'Streamlit',    iconUrl: ICONS('streamlit'),   color: '#FF4B4B' },
      { name: 'Figma',        iconUrl: ICONS('figma'),       color: '#F24E1E' },
      { name: 'Photoshop',    iconUrl: ICONS('adobephotoshop'), color: '#31A8FF' },
    ],
    quote: '"Anything worth doing is worth doing well."',
  },

  [DIRECTIONS.WEST]: {
    character: 'SHANKS',
    title:     'AI / ML & BLOCKCHAIN',
    subtitle:  "The Emperor's Power",
    characterImg: '/characters/shanks.png',

    boardRect: { left: '16%', top: '30%', width: '74%', height: '59%' },

    skyGradient: 'linear-gradient(180deg, #100000 0%, #3d0a0a 22%, #7d1414 45%, #c52424 68%, #ef5050 100%)',
    glowColor:   'rgba(255,50,50,0.28)',
    titleColor:  '#ffb0b0',
    accentColor: '#e05050',
    seaColor:    '#661414',
    foamColor:   '#ffb08f',

    skills: [
      { name: 'LangChain',  iconUrl: ICONS('langchain'),   color: '#1C7B4B' },
      { name: 'FAISS',      iconUrl: ICONS('meta'),        color: '#7B68EE' },
      { name: 'XGBoost',    iconUrl: ICONS('scikitlearn'), color: '#337AB7' },
      { name: 'Groq',       iconUrl: ICONS('groq'),        color: '#F97316' },
      { name: 'RAG',        iconUrl: ICONS('openai'),      color: '#8B5CF6' },
      { name: 'TensorFlow', iconUrl: ICONS('tensorflow'),  color: '#FF6F00' },
      { name: 'Solidity',   iconUrl: ICONS('solidity'),    color: '#9b9b9b' },
      { name: 'Web3.py',    iconUrl: ICONS('python'),      color: '#F16822' },
      { name: 'Polygon',    iconUrl: ICONS('polygon'),     color: '#8247E5' },
    ],
    quote: '"A true pirate doesn\'t fear the unknown."',
  },

  [DIRECTIONS.SOUTH]: {
    character: 'BOA HANCOCK',
    title:     'DEVELOPER TOOLS & INTEGRATION',
    subtitle:  "The Empress's Domain",
    characterImg: '/characters/boa.png',

    boardRect: { left: '15.5%', top: '27%', width: '74%', height: '58%' },

    skyGradient: 'linear-gradient(180deg, #110014 0%, #3d0a32 22%, #8a1268 45%, #d12aa8 68%, #ff8fe0 100%)',
    glowColor:   'rgba(255,100,220,0.28)',
    titleColor:  '#ffc2ee',
    accentColor: '#e050c0',
    seaColor:    '#8b1b72',
    foamColor:   '#ffd1f2',

    skills: [
      { name: 'Git',      iconUrl: ICONS('git'),               color: '#F05032' },
      { name: 'GitHub',   iconUrl: ICONS('github'),            color: '#ffffff' },
      { name: 'VS Code',  iconUrl: ICONS('visualstudiocode'),  color: '#007ACC' },
      { name: 'Cursor',   iconUrl: ICONS('cursor'),            color: '#cccccc' },
      { name: 'REST API', iconUrl: ICONS('swagger'),           color: '#85EA2D' },
    ],
    quote: '"Those who stand at the top determine what\'s wrong and right."',
  },
}

const DIR_META = [
  { dir: DIRECTIONS.NORTH, compass: '↑', shortName: 'Languages' },
  { dir: DIRECTIONS.EAST,  compass: '→', shortName: 'Frontend'  },
  { dir: DIRECTIONS.SOUTH, compass: '↓', shortName: 'Dev Tools' },
  { dir: DIRECTIONS.WEST,  compass: '←', shortName: 'AI / ML'   },
]

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER — floating in the sky, holding the transparent skill board
// ─────────────────────────────────────────────────────────────────────────────

function RealWorldTint({ data, visible, transitioning }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      opacity: visible ? 0.86 : 0,
      transition: transitioning ? 'opacity 0.6s ease' : 'none',
      pointerEvents: 'none',
      background: `
        radial-gradient(circle at 50% 35%, ${data.accentColor}55 0%, transparent 30%),
        linear-gradient(180deg, ${data.seaColor}82 0%, ${data.accentColor}44 48%, ${data.seaColor}88 100%),
        linear-gradient(90deg, rgba(0,0,0,0.30), transparent 28%, transparent 72%, rgba(0,0,0,0.30))
      `,
      mixBlendMode: 'color',
    }} />
  )
}

function HorizonDepthHaze({ data, visible, transitioning }) {
  return (
    <div style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: '46%',
      height: '28%',
      zIndex: 2,
      opacity: visible ? 0.28 : 0,
      transition: transitioning ? 'opacity 0.6s ease' : 'none',
      pointerEvents: 'none',
      background: `
        linear-gradient(180deg, transparent 0%, rgba(220,238,244,0.22) 35%, rgba(185,220,226,0.42) 62%, transparent 100%),
        radial-gradient(ellipse at 50% 48%, ${data.accentColor}20 0%, transparent 58%)
      `,
      filter: 'blur(10px)',
      mixBlendMode: 'screen',
    }} />
  )
}

function FloatingCharacter({ data, visible, transitioning, children }) {
  return (
    <div style={{
      position:   'absolute',
      top:        'clamp(70px, 8vh, 118px)',
      left:       '50%',
      transform:  `translateX(-50%) perspective(1200px) rotateX(1.5deg) scale(${visible ? 1 : 0.96})`,
      transformOrigin: '50% 45%',
      width:      'clamp(720px, 62vw, 1180px)',
      maxHeight:  'calc(100vh - 210px)',
      opacity:    visible ? 1 : 0,
      transition: transitioning ? 'opacity 0.5s ease, transform 0.55s ease' : 'none',
      zIndex:     3,
      animation:  visible ? 'oceanMirage 8s ease-in-out infinite' : 'none',
      pointerEvents: 'none',
      WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 76%, rgba(0,0,0,0.82) 89%, transparent 100%)',
      maskImage:       'linear-gradient(180deg, #000 0%, #000 76%, rgba(0,0,0,0.82) 89%, transparent 100%)',
    }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <img
          src={data.characterImg}
          alt={data.character}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            opacity: 0.54,
            filter: `saturate(1.18) contrast(1.04) drop-shadow(0 0 30px ${data.glowColor})`,
          }}
        />
        <div style={{
          position: 'absolute',
          left: data.boardRect.left,
          top: data.boardRect.top,
          width: data.boardRect.width,
          height: data.boardRect.height,
          borderRadius: '14px',
          background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06), transparent 64%), linear-gradient(135deg, ${data.accentColor}0a, rgba(255,255,255,0.018))`,
          boxShadow: `inset 0 0 18px rgba(255,255,255,0.07), 0 0 28px ${data.glowColor}`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          left:   data.boardRect.left,
          top:    data.boardRect.top,
          width:  data.boardRect.width,
          height: data.boardRect.height,
          pointerEvents: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WANTED CARD — individual skill card with real brand logo
// ─────────────────────────────────────────────────────────────────────────────

function WantedCard({ skill, index, visible, accentColor, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setEntered(false), 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setEntered(true), delay + index * 70)
    return () => clearTimeout(t)
  }, [visible, delay, index])

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        width: 'clamp(62px, 5.2vw, 92px)',
        background:     hovered
          ? 'linear-gradient(160deg, #f5e6cc 0%, #e8d4aa 100%)'
          : 'linear-gradient(160deg, #f0ddb8 0%, #e0c890 100%)',
        border:         `1.5px solid ${hovered ? '#8B6914' : 'rgba(139,105,20,0.6)'}`,
        borderRadius:   '3px 3px 5px 5px',
        padding:        'clamp(6px, 0.75vw, 10px) clamp(4px, 0.55vw, 7px)',
        cursor:         'pointer',
        transform:      entered
          ? hovered ? 'scale(1.08) translateY(-3px)' : 'scale(1) translateY(0)'
          : 'scale(0.7) translateY(16px)',
        opacity:        entered ? 1 : 0,
        transition:     'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow:      hovered
          ? `0 4px 12px rgba(0,0,0,0.45), 0 0 8px ${accentColor}44`
          : '0 2px 7px rgba(0,0,0,0.35)',
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      {/* Aged paper texture */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: `
          repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(150,110,40,0.04) 4px, rgba(150,110,40,0.04) 5px),
          repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(150,110,40,0.02) 10px, rgba(150,110,40,0.02) 11px)
        `,
        pointerEvents: 'none',
      }} />

      {/* WANTED text */}
      <div style={{
        fontFamily:    '"Pirata One", cursive',
        fontSize:      'clamp(8px, 0.78vw, 12px)',
        fontWeight:    700,
        color:         '#1a0d00',
        letterSpacing: '0.1em',
        marginBottom:  'clamp(2px, 0.4vh, 6px)',
        textAlign:     'center',
        lineHeight:    1,
        borderBottom:  '1px solid rgba(80,50,10,0.25)',
        paddingBottom: 'clamp(2px, 0.3vh, 4px)',
        width:         '100%',
      }}>
        WANTED
      </div>

      {/* Logo */}
      <div style={{
        width:          'clamp(34px, 3.4vw, 58px)',
        height:         'clamp(34px, 3.4vw, 58px)',
        borderRadius:   '4px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        marginBottom:   'clamp(3px, 0.4vh, 6px)',
        border:         '1px solid rgba(80,50,10,0.18)',
        background:     'rgba(20,15,5,0.06)',
        boxShadow:      'inset 0 1px 3px rgba(0,0,0,0.15)',
        transition:     'transform 0.2s ease',
        transform:      hovered ? 'scale(1.1)' : 'scale(1)',
        padding:        '4px',
      }}>
        <div style={{
          width:  '100%',
          height: '100%',
          backgroundColor: skill.color,
          WebkitMaskImage: `url(${skill.iconUrl})`,
          maskImage:       `url(${skill.iconUrl})`,
          WebkitMaskSize:  'contain',
          maskSize:        'contain',
          WebkitMaskRepeat:'no-repeat',
          maskRepeat:      'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition:       'center',
        }} />
      </div>

      {/* Skill name */}
      <div style={{
        fontFamily:    '"IM Fell English", Georgia, serif',
        fontSize:      'clamp(8px, 0.78vw, 12px)',
        color:         '#1a0d00',
        textAlign:     'center',
        lineHeight:    1.2,
        letterSpacing: '0.02em',
        opacity:       0.88,
      }}>
        {skill.name}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL PANEL — title + card grid + quote, rendered inside the board rect
// ─────────────────────────────────────────────────────────────────────────────

function SkillPanel({ data, visible }) {
  const [cardsIn, setCardsIn] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setCardsIn(true), 250)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCardsIn(false), 0)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <div style={{
      width:          '100%',
      height:         '100%',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        'clamp(8px, 1.2vw, 18px)',
      boxSizing:      'border-box',
      transform:      visible ? 'scale(1)' : 'scale(0.96)',
      opacity:        visible ? 1 : 0,
      transition:     'opacity 0.35s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)',
    }}>
      {/* Title */}
      <div style={{
        textAlign:     'center',
        marginBottom:  'clamp(8px, 1.4vh, 16px)',
      }}>
        <div style={{
          fontFamily:    '"Pirata One", cursive',
          fontSize: 'clamp(16px, 1.65vw, 28px)',
          color:         data.titleColor,
          letterSpacing: '0.16em',
          textShadow:    `0 0 16px ${data.accentColor}88`,
          marginBottom:  '3px',
        }}>
          {data.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <div style={{ height:'1px', width:'28px', background:`linear-gradient(to right, transparent, ${data.accentColor}55)` }}/>
          <span style={{ color: `${data.accentColor}66`, fontSize:'9px' }}>✦</span>
          <div style={{ height:'1px', width:'28px', background:`linear-gradient(to left, transparent, ${data.accentColor}55)` }}/>
        </div>
      </div>

      {/* Skill cards */}
      <div style={{
        display:        'flex',
        flexWrap:       'wrap',
        gap:            'clamp(10px, 1vw, 18px)',
        justifyContent: 'center',
        alignItems:     'flex-start',
        maxWidth:       '92%',
      }}>
        {data.skills.map((skill, i) => (
          <WantedCard
            key={skill.name}
            skill={skill}
            index={i}
            visible={cardsIn}
            accentColor={data.accentColor}
          />
        ))}
      </div>

      {/* Quote */}
      <div style={{
        marginTop:    'clamp(8px, 1.5vh, 18px)',
        textAlign:    'center',
        fontFamily:   '"IM Fell English", Georgia, serif',
        fontSize:     'clamp(9px, 0.82vw, 13px)',
        fontStyle:    'italic',
        color:        `${data.accentColor}aa`,
        letterSpacing:'0.03em',
        lineHeight:   1.4,
        opacity:      cardsIn ? 1 : 0,
        transition:   'opacity 0.5s ease 0.5s',
        maxWidth:     '90%',
      }}>
        {data.quote}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER NAME BADGE
// ─────────────────────────────────────────────────────────────────────────────

function CharacterBadge({ data, visible }) {
  return (
    <div style={{
      position:   'fixed',
      top:        'clamp(22px, 3.5vh, 42px)',
      left:       '50%',
      transform:  `translateX(-50%) ${visible ? 'translateY(0)' : 'translateY(-20px)'}`,
      zIndex:     248,
      display:    'flex',
      alignItems: 'center',
      gap:        '10px',
      opacity:    visible ? 1 : 0,
      transition: 'all 0.45s ease',
      whiteSpace: 'nowrap',
    }}>
      <div style={{ height:'1px', width:'30px', background:`linear-gradient(to right, transparent, ${data.accentColor}66)` }}/>
      <span style={{
        fontFamily:    '"Pirata One", cursive',
        fontSize:      'clamp(11px, 1.3vw, 16px)',
        color:         data.titleColor,
        letterSpacing: '0.2em',
        textShadow:    `0 0 16px ${data.accentColor}88`,
      }}>
        {data.character}
      </span>
      <div style={{ height:'1px', width:'30px', background:`linear-gradient(to left, transparent, ${data.accentColor}66)` }}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTION NAVIGATOR
// ─────────────────────────────────────────────────────────────────────────────

function DirectionNavigator({ current, onRotate, data, visible }) {
  const [hovLeft,  setHovLeft]  = useState(false)
  const [hovRight, setHovRight] = useState(false)

  const currentIndex = DIR_ORDER.indexOf(current)
  const prevIndex    = (currentIndex - 1 + DIR_ORDER.length) % DIR_ORDER.length
  const nextIndex    = (currentIndex + 1) % DIR_ORDER.length

  const prevDir = DIR_META.find(d => d.dir === DIR_ORDER[prevIndex])
  const nextDir = DIR_META.find(d => d.dir === DIR_ORDER[nextIndex])

  const btnStyle = (hovered) => ({
    width:          'clamp(44px, 5vw, 62px)',
    height:         'clamp(44px, 5vw, 62px)',
    borderRadius:   '50%',
    background:     hovered ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.35)',
    border:         `1.5px solid ${hovered ? data.accentColor : 'rgba(255,255,255,0.2)'}`,
    color:          hovered ? data.accentColor : 'rgba(255,255,255,0.7)',
    fontSize:       'clamp(18px, 2.2vw, 28px)',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    transition:     'all 0.22s ease',
    transform:      hovered ? 'scale(1.1)' : 'scale(1)',
    boxShadow:      hovered ? `0 0 20px ${data.glowColor}, 0 4px 14px rgba(0,0,0,0.4)` : '0 4px 12px rgba(0,0,0,0.4)',
    opacity:        visible ? 1 : 0,
  })

  return (
    <>
      <div style={{
        position: 'fixed', left: 'clamp(16px, 3vw, 40px)', top: '50%',
        transform: 'translateY(-50%)', zIndex: 250,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        <button
          onClick={() => onRotate('prev')}
          onMouseEnter={() => setHovLeft(true)}
          onMouseLeave={() => setHovLeft(false)}
          style={btnStyle(hovLeft)}
          aria-label="Previous direction"
        >‹</button>
        <span style={{
          fontFamily: '"IM Fell English", serif', fontSize: 'clamp(8px, 0.9vw, 11px)',
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', whiteSpace: 'nowrap',
          opacity: visible ? 1 : 0,
        }}>{prevDir?.shortName}</span>
      </div>

      <div style={{
        position: 'fixed', right: 'clamp(16px, 3vw, 40px)', top: '50%',
        transform: 'translateY(-50%)', zIndex: 250,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        <button
          onClick={() => onRotate('next')}
          onMouseEnter={() => setHovRight(true)}
          onMouseLeave={() => setHovRight(false)}
          style={btnStyle(hovRight)}
          aria-label="Next direction"
        >›</button>
        <span style={{
          fontFamily: '"IM Fell English", serif', fontSize: 'clamp(8px, 0.9vw, 11px)',
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', whiteSpace: 'nowrap',
          opacity: visible ? 1 : 0,
        }}>{nextDir?.shortName}</span>
      </div>

      {/* Bottom compass indicator */}
      <div style={{
        position: 'fixed', bottom: 'clamp(20px, 4vh, 40px)', left: '50%',
        transform: 'translateX(-50%)', zIndex: 250,
        display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 14px)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease',
      }}>
        {DIR_META.map((meta) => (
          <button
            key={meta.dir}
            onClick={() => {
              const targetIdx = DIR_ORDER.indexOf(meta.dir)
              const currIdx   = DIR_ORDER.indexOf(current)
              if (targetIdx !== currIdx)
                onRotate(targetIdx > currIdx ? 'next' : 'prev', meta.dir)
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              background: meta.dir === current ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: `1px solid ${meta.dir === current ? data.accentColor : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
              transition: 'all 0.2s ease', backdropFilter: 'blur(6px)',
            }}
          >
            <span style={{
              fontFamily: '"Pirata One", cursive', fontSize: 'clamp(10px, 1.1vw, 14px)',
              color: meta.dir === current ? data.accentColor : 'rgba(255,255,255,0.55)',
              letterSpacing: '0.08em',
            }}>{meta.shortName}</span>
            <span style={{
              fontSize: '8px',
              color: meta.dir === current ? data.accentColor : 'rgba(255,255,255,0.3)',
            }}>{meta.compass}</span>
          </button>
        ))}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function SkillsCloseBtn({ onClose, visible, accentColor }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClose}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'fixed', top: 'clamp(14px, 2vh, 24px)', right: 'clamp(14px, 2vw, 24px)',
        zIndex: 260, width: 'clamp(34px, 3.5vw, 46px)', height: 'clamp(34px, 3.5vw, 46px)',
        borderRadius: '50%',
        background: hov ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.4)',
        border: `1.5px solid ${hov ? accentColor : 'rgba(255,255,255,0.18)'}`,
        color: hov ? accentColor : 'rgba(255,255,255,0.65)',
        fontSize: 'clamp(13px, 1.5vw, 18px)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', transition: 'all 0.22s ease',
        transform: visible ? (hov ? 'scale(1.1)' : 'scale(1)') : 'scale(0)',
        opacity: visible ? 1 : 0,
        transitionDelay: visible ? '0.5s' : '0s',
        boxShadow: hov ? `0 0 18px ${accentColor}55` : 'none',
      }}
      aria-label="Close skills"
    >✕</button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GHOST LABEL — "SKILLS" watermark during entry
// ─────────────────────────────────────────────────────────────────────────────

function SkillsGhostLabel({ active }) {
  const [op, setOp] = useState(0)
  useEffect(() => {
    if (!active) {
      const t = setTimeout(() => setOp(0), 0)
      return () => clearTimeout(t)
    }
    const t1 = setTimeout(() => setOp(1),   50)
    const t2 = setTimeout(() => setOp(0), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [active])

  if (op === 0) return null
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 195, pointerEvents: 'none', fontFamily: '"Pirata One", cursive',
      fontSize: 'clamp(50px, 10vw, 110px)', letterSpacing: '0.22em',
      color: `rgba(255,255,255,${op * 0.07})`, transition: 'color 0.5s ease',
      userSelect: 'none', whiteSpace: 'nowrap',
    }}>SKILLS</div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LETTERBOX BARS
// ─────────────────────────────────────────────────────────────────────────────

function SkillsLetterBox({ active }) {
  const [mounted, setMounted] = useState(false)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const timers = []
    if (active) {
      timers.push(setTimeout(() => {
        setMounted(true)
        setLeaving(false)
      }, 0))
    } else if (mounted) {
      timers.push(setTimeout(() => setLeaving(true), 0))
      timers.push(setTimeout(() => setMounted(false), 700))
    }
    return () => timers.forEach(clearTimeout)
  }, [active, mounted])
  if (!mounted) return null
  const showing = active && !leaving
  return (
    <>
      <div style={{
        position:'fixed', top:0, left:0, right:0, height:'clamp(26px, 4vh, 50px)',
        background:'#000', zIndex:190, pointerEvents:'none',
        transition:'transform 0.65s cubic-bezier(0.22,1,0.36,1)',
        transform: showing ? 'translateY(0)' : 'translateY(-100%)',
      }}/>
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, height:'clamp(26px, 4vh, 50px)',
        background:'#000', zIndex:190, pointerEvents:'none',
        transition:'transform 0.65s cubic-bezier(0.22,1,0.36,1)',
        transform: showing ? 'translateY(0)' : 'translateY(100%)',
      }}/>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

function SkillsOverlay({ active, onClose, onDirectionChange }) {
  const [currentDir,    setCurrentDir]    = useState(DIRECTIONS.NORTH)
  const [transitioning, setTransitioning] = useState(false)
  const [overlayIn,     setOverlayIn]     = useState(false)
  const [contentIn,     setContentIn]     = useState(false)
  const transitionTimer = useRef(null)

  const data = SKILL_DATA[currentDir]

  useEffect(() => {
    if (active) onDirectionChange?.(currentDir)
  }, [active, currentDir, onDirectionChange])

  const handleRotate = useCallback((direction, targetDir = null) => {
    if (transitioning) return

    setTransitioning(true)
    setContentIn(false)

    const currIdx = DIR_ORDER.indexOf(currentDir)
    let nextDir

    if (targetDir) {
      nextDir = targetDir
    } else {
      const nextIdx = direction === 'next'
        ? (currIdx + 1) % DIR_ORDER.length
        : (currIdx - 1 + DIR_ORDER.length) % DIR_ORDER.length
      nextDir = DIR_ORDER[nextIdx]
    }

    if (transitionTimer.current) clearTimeout(transitionTimer.current)

    transitionTimer.current = setTimeout(() => {
      setCurrentDir(nextDir)
      setTimeout(() => {
        setContentIn(true)
        setTransitioning(false)
      }, 120)
    }, 300)
  }, [currentDir, transitioning])

  useEffect(() => {
    if (active) {
      const t1 = setTimeout(() => setOverlayIn(true), 400)
      const t2 = setTimeout(() => setContentIn(true), 900)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else {
      const t1 = setTimeout(() => setContentIn(false), 0)
      const t2 = setTimeout(() => setOverlayIn(false), 400)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [active])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && active) onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, onClose])

  useEffect(() => {
    const fn = (e) => {
      if (!active) return
      if (e.key === 'ArrowLeft')  handleRotate('prev')
      if (e.key === 'ArrowRight') handleRotate('next')
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, handleRotate])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 220,
      pointerEvents: overlayIn ? 'all' : 'none',
      overflow: 'hidden',
      background: 'transparent',
    }}>
      <RealWorldTint data={data} visible={overlayIn} transitioning={transitioning} />

      <FloatingCharacter data={data} visible={contentIn} transitioning={transitioning}>
        <SkillPanel data={data} visible={contentIn} />
      </FloatingCharacter>
      <HorizonDepthHaze data={data} visible={contentIn} transitioning={transitioning} />

      <CharacterBadge data={data} visible={contentIn} />

      <DirectionNavigator current={currentDir} onRotate={handleRotate} data={data} visible={contentIn} />
      <SkillsCloseBtn onClose={onClose} visible={contentIn} accentColor={data.accentColor} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=IM+Fell+English:ital@0;1&display=swap');

        @keyframes oceanMirage {
          0%,100% { transform: translateX(-50%) perspective(1200px) rotateX(1.5deg) translateY(0px) scale(1); filter: saturate(1); }
          50%      { transform: translateX(-50%) perspective(1200px) rotateX(1.5deg) translateY(-4px) scale(1.004); filter: saturate(1.035); }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default function SkillsSection({ active, onClose, onDirectionChange }) {
  return (
    <>
      <SkillsLetterBox active={active} />
      <SkillsGhostLabel active={active} />
      <SkillsOverlay
        active={active}
        onClose={onClose}
        onDirectionChange={onDirectionChange}
      />
    </>
  )
}
