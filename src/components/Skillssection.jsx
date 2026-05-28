/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILLS SECTION — Grand Line Portfolio
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * EXACT FIGMA FLOW:
 *   1. User clicks "Skills" nav wheel OR Luffy reaches the ladder
 *   2. Camera GSAP transitions from deck → crow's nest level (looking outward)
 *   3. Full-screen overlay appears with the character backdrop
 *   4. Glass board floats in front with WANTED poster skill cards
 *   5. Arrow buttons rotate between 4 directions (N/E/S/W)
 *   6. Each direction: different One Piece character + sky color + skill set
 *
 * 4 DIRECTIONS:
 *   NORTH (default) — Zoro    — Programming Languages — dark green storm sky
 *   EAST            — Sanji   — Frontend & Design     — golden sunset sky
 *   WEST            — Shanks  — AI/ML & Blockchain    — blood red sky
 *   SOUTH           — Boa     — Dev Tools             — pink/magenta sky
 *
 * CAMERA:
 *   Explore: [0, 8.5, 16]  lookAt [0, 1.5, 0]
 *   Skills:  [0, 34, 10]   lookAt [0, 31, -10]  (crow's nest level)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useFrame } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// ─────────────────────────────────────────────────────────────────────────────
// SKILL DATA — exactly from your Figma frames
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

const SKILL_DATA = {
  [DIRECTIONS.NORTH]: {
    character:   'ZORO',
    title:       'PROGRAMMING LANGUAGES',
    subtitle:    'The Swordsman\'s Arsenal',
    // Background image from your Figma — Zoro dark green stormy sky
    bgImage:     null, // user will add: '/skills/zoro-bg.jpg'
    bgColor:     '#0d2418',
    skyGradient: 'linear-gradient(180deg, #0a1a0e 0%, #143322 25%, #1a4a2e 50%, #0d2418 100%)',
    atmosphereColor: 'rgba(20,60,35,0.85)',
    glowColor:   'rgba(34,180,80,0.25)',
    boardColor:  'rgba(15,35,20,0.65)',
    titleColor:  '#7dffb0',
    accentColor: '#3ddc84',
    // Character silhouette tint
    characterTint: 'rgba(30,80,45,0.3)',
    skills: [
      { name: 'JavaScript', icon: 'JS',  color: '#F7DF1E', bg: '#3d3000', logo: null },
      { name: 'TypeScript', icon: 'TS',  color: '#3178C6', bg: '#0a1a30', logo: null },
      { name: 'Python',     icon: 'Py',  color: '#3776AB', bg: '#0a1520', logo: null },
      { name: 'C++',        icon: 'C++', color: '#00599C', bg: '#001020', logo: null },
      { name: 'Java',       icon: '☕',  color: '#ED8B00', bg: '#301800', logo: null },
    ],
    quote: '"I\'ll become the world\'s greatest swordsman!"',
  },

  [DIRECTIONS.EAST]: {
    character:   'SANJI',
    title:       'FRONTEND & DESIGN',
    subtitle:    'The Chef\'s Craft',
    bgImage:     null, // user will add: '/skills/sanji-bg.jpg'
    bgColor:     '#1a1000',
    skyGradient: 'linear-gradient(180deg, #0a0800 0%, #3a2200 20%, #8a4800 45%, #d4820a 65%, #f0b830 80%, #e8d050 100%)',
    atmosphereColor: 'rgba(180,100,10,0.8)',
    glowColor:   'rgba(255,180,30,0.3)',
    boardColor:  'rgba(40,25,5,0.65)',
    titleColor:  '#ffd060',
    accentColor: '#f0b830',
    characterTint: 'rgba(180,120,0,0.25)',
    skills: [
      { name: 'React.js',        icon: '⚛',  color: '#61DAFB', bg: '#001a20', logo: null },
      { name: 'Tailwind CSS',    icon: '💨', color: '#38BDF8', bg: '#001520', logo: null },
      { name: 'Streamlit',       icon: '▶',  color: '#FF4B4B', bg: '#200808', logo: null },
      { name: 'Figma',           icon: '◈',  color: '#F24E1E', bg: '#200a00', logo: null },
      { name: 'Adobe Photoshop', icon: '◻',  color: '#31A8FF', bg: '#001020', logo: null },
    ],
    quote: '"Anything worth doing is worth doing well."',
  },

  [DIRECTIONS.WEST]: {
    character:   'SHANKS',
    title:       'AI / ML & BLOCKCHAIN',
    subtitle:    'The Emperor\'s Power',
    bgImage:     null, // user will add: '/skills/shanks-bg.jpg'
    bgColor:     '#1a0505',
    skyGradient: 'linear-gradient(180deg, #0d0000 0%, #3a0808 20%, #8a0f0f 45%, #c01515 65%, #e02020 80%, #b01010 100%)',
    atmosphereColor: 'rgba(160,20,20,0.85)',
    glowColor:   'rgba(255,50,50,0.25)',
    boardColor:  'rgba(35,8,8,0.68)',
    titleColor:  '#ff9090',
    accentColor: '#e05050',
    characterTint: 'rgba(160,30,30,0.3)',
    skills: [
      { name: 'LangChain',       icon: '🔗', color: '#1C7B4B', bg: '#001a0a', logo: null },
      { name: 'FAISS',           icon: '◈',  color: '#7B68EE', bg: '#100a20', logo: null },
      { name: 'XGBoost',         icon: '✕',  color: '#337AB7', bg: '#001020', logo: null },
      { name: 'Groq (LLMs)',     icon: '9',  color: '#F97316', bg: '#200800', logo: null },
      { name: 'RAG',             icon: '🧠', color: '#8B5CF6', bg: '#100520', logo: null },
      { name: 'TensorFlow Lite', icon: '▲',  color: '#FF6F00', bg: '#1a0800', logo: null },
      { name: 'Solidity',        icon: '◆',  color: '#363636', bg: '#0a0a0a', logo: null },
      { name: 'Web3.py',         icon: '🐍', color: '#F16822', bg: '#200800', logo: null },
      { name: 'Polygon',         icon: '⬡',  color: '#8247E5', bg: '#100520', logo: null },
    ],
    quote: '"A true pirate doesn\'t fear the unknown."',
    // Shanks has one arm — reflected in layout asymmetry
    oneArmed: true,
  },

  [DIRECTIONS.SOUTH]: {
    character:   'BOA HANCOCK',
    title:       'DEVELOPER TOOLS & INTEGRATION',
    subtitle:    'The Empress\'s Domain',
    bgImage:     null, // user will add: '/skills/boa-bg.jpg'
    bgColor:     '#1a0515',
    skyGradient: 'linear-gradient(180deg, #0d0010 0%, #3a0830 20%, #8a0a60 45%, #c01890 65%, #e030b0 80%, #ff60d0 100%)',
    atmosphereColor: 'rgba(180,30,140,0.8)',
    glowColor:   'rgba(255,100,220,0.25)',
    boardColor:  'rgba(35,5,25,0.68)',
    titleColor:  '#ff90e0',
    accentColor: '#e050c0',
    characterTint: 'rgba(200,50,160,0.25)',
    skills: [
      { name: 'Git',               icon: '⎇',  color: '#F05032', bg: '#200500', logo: null },
      { name: 'GitHub',            icon: '◈',  color: '#ffffff', bg: '#0a0a0a', logo: null },
      { name: 'VS Code',           icon: '▷',  color: '#007ACC', bg: '#000d18', logo: null },
      { name: 'Cursor',            icon: '⌃',  color: '#888888', bg: '#0a0a0a', logo: null },
      { name: 'REST API',          icon: '⇄',  color: '#00D084', bg: '#001a0a', logo: null },
    ],
    quote: '"Those who stand at the top determine what\'s wrong and right."',
  },
}

// Direction navigation order and labels
const DIR_META = [
  { dir: DIRECTIONS.NORTH, label: 'N', compass: '↑', shortName: 'Languages' },
  { dir: DIRECTIONS.EAST,  label: 'E', compass: '→', shortName: 'Frontend'  },
  { dir: DIRECTIONS.SOUTH, label: 'S', compass: '↓', shortName: 'Dev Tools' },
  { dir: DIRECTIONS.WEST,  label: 'W', compass: '←', shortName: 'AI / ML'   },
]

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const CAM_EXPLORE = {
  position: new THREE.Vector3(0, 8.5, 16),
  target:   new THREE.Vector3(0, 1.5, 0),
  fov:      68,
}

// Crow's nest — looking out at the horizon, matching Figma angle
const CAM_SKILLS = {
  position: new THREE.Vector3(0, 34, 12),
  target:   new THREE.Vector3(0, 31, -15),
  fov:      58,
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useSkillsCamera(active) {
  const { camera } = useThree()
  const tl       = useRef(null)
  const inSkills = useRef(false)
  const lookVec  = useRef(new THREE.Vector3())

  useEffect(() => {
    if (tl.current) tl.current.kill()

    if (active && !inSkills.current) {
      inSkills.current = true
      const fromPos  = camera.position.clone()
      const fromLook = new THREE.Vector3(0, 1.5, 0)
      const toPos    = CAM_SKILLS.position
      const toLook   = CAM_SKILLS.target
      lookVec.current.copy(fromLook)
      const proxy = {
        px: fromPos.x,  py: fromPos.y,  pz: fromPos.z,
        lx: fromLook.x, ly: fromLook.y, lz: fromLook.z,
        fov: camera.fov,
      }
      tl.current = gsap.to(proxy, {
        px: toPos.x,   py: toPos.y,   pz: toPos.z,
        lx: toLook.x,  ly: toLook.y,  lz: toLook.z,
        fov: CAM_SKILLS.fov,
        duration: 2.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.position.set(proxy.px, proxy.py, proxy.pz)
          lookVec.current.set(proxy.lx, proxy.ly, proxy.lz)
          camera.lookAt(lookVec.current)
          camera.fov = proxy.fov
          camera.updateProjectionMatrix()
        },
      })
    } else if (!active && inSkills.current) {
      inSkills.current = false
      const fromPos  = camera.position.clone()
      const fromLook = CAM_SKILLS.target.clone()
      const toPos    = CAM_EXPLORE.position
      const toLook   = CAM_EXPLORE.target
      lookVec.current.copy(fromLook)
      const proxy = {
        px: fromPos.x,  py: fromPos.y,  pz: fromPos.z,
        lx: fromLook.x, ly: fromLook.y, lz: fromLook.z,
        fov: camera.fov,
      }
      tl.current = gsap.to(proxy, {
        px: toPos.x,  py: toPos.y,  pz: toPos.z,
        lx: toLook.x, ly: toLook.y, lz: toLook.z,
        fov: CAM_EXPLORE.fov,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.position.set(proxy.px, proxy.py, proxy.pz)
          lookVec.current.set(proxy.lx, proxy.ly, proxy.lz)
          camera.lookAt(lookVec.current)
          camera.fov = proxy.fov
          camera.updateProjectionMatrix()
        },
      })
    }
    return () => { if (tl.current) tl.current.kill() }
  }, [active])
}

export function SkillsCameraController({ active }) {
  useSkillsCamera(active)
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// SKY BACKGROUND — full screen atmospheric sky per direction
// ─────────────────────────────────────────────────────────────────────────────

function DirectionalSky({ data, visible, transitioning }) {
  return (
    <div style={{
      position:   'absolute',
      inset:      0,
      zIndex:     0,
      background: data.skyGradient,
      opacity:    visible ? 1 : 0,
      transition: transitioning
        ? 'opacity 0.55s cubic-bezier(0.4,0,0.2,1)'
        : 'none',
    }}>
      {/* Atmospheric glow */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: `radial-gradient(ellipse 120% 80% at 50% 120%, ${data.glowColor} 0%, transparent 60%)`,
      }} />
      {/* Horizon line glow */}
      <div style={{
        position:   'absolute',
        bottom:     '35%',
        left:       0,
        right:      0,
        height:     '3px',
        background: `linear-gradient(to right, transparent 0%, ${data.accentColor}55 30%, ${data.accentColor}88 50%, ${data.accentColor}55 70%, transparent 100%)`,
        filter:     'blur(2px)',
      }} />
      {/* Stars / atmosphere dots */}
      {Array.from({ length: 25 }, (_, i) => (
        <div
          key={i}
          style={{
            position:     'absolute',
            top:          `${Math.random() * 60}%`,
            left:         `${Math.random() * 100}%`,
            width:        `${1 + Math.random() * 2}px`,
            height:       `${1 + Math.random() * 2}px`,
            borderRadius: '50%',
            background:   data.accentColor,
            opacity:      0.1 + Math.random() * 0.25,
            animation:    `starTwinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER SILHOUETTE — the One Piece character backdrop
// ─────────────────────────────────────────────────────────────────────────────

function CharacterBackdrop({ data, direction, visible, transitioning }) {
  // Character SVG silhouettes matching Figma — each direction different
  const getCharacterSVG = () => {
    switch (direction) {
      case DIRECTIONS.NORTH:
        // Zoro — three swords, muscular, brooding stance
        return (
          <svg viewBox="0 0 400 600" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="zoro-glow">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Body */}
            <ellipse cx="200" cy="280" rx="85" ry="160" fill="rgba(20,60,30,0.7)" filter="url(#zoro-glow)"/>
            {/* Head */}
            <ellipse cx="200" cy="100" rx="55" ry="65" fill="rgba(25,70,35,0.75)"/>
            {/* Hair */}
            <ellipse cx="200" cy="75" rx="52" ry="30" fill="rgba(30,80,40,0.8)"/>
            {/* Shoulders wide */}
            <ellipse cx="200" cy="210" rx="100" ry="35" fill="rgba(18,55,28,0.7)"/>
            {/* Three swords — left side */}
            <rect x="80" y="120" width="8" height="250" rx="4" fill="rgba(180,200,180,0.5)" transform="rotate(-15 100 200)"/>
            <rect x="100" y="100" width="8" height="260" rx="4" fill="rgba(180,200,180,0.55)" transform="rotate(-8 110 200)"/>
            <rect x="120" y="130" width="6" height="240" rx="3" fill="rgba(160,180,160,0.45)" transform="rotate(-20 110 200)"/>
            {/* Bandana */}
            <rect x="155" y="95" width="90" height="15" rx="7" fill="rgba(0,150,80,0.6)"/>
            {/* Eye scar */}
            <line x1="180" y1="100" x2="192" y2="125" stroke="rgba(200,80,80,0.5)" strokeWidth="2.5"/>
          </svg>
        )

      case DIRECTIONS.EAST:
        // Sanji — suit, cigarette, graceful pose
        return (
          <svg viewBox="0 0 400 600" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="sanji-glow">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Suit body */}
            <ellipse cx="200" cy="290" rx="75" ry="155" fill="rgba(40,30,10,0.75)" filter="url(#sanji-glow)"/>
            {/* Head */}
            <ellipse cx="210" cy="100" rx="50" ry="58" fill="rgba(45,35,12,0.8)"/>
            {/* Swept hair */}
            <path d="M175 80 Q210 50 250 75 Q235 65 215 70 Q200 55 180 72Z" fill="rgba(50,40,15,0.85)"/>
            {/* Suit lapels */}
            <path d="M170 200 L200 240 L230 200 L215 195 L200 220 L185 195Z" fill="rgba(60,50,20,0.7)"/>
            {/* Cigarette */}
            <rect x="225" y="108" width="30" height="5" rx="2.5" fill="rgba(230,200,150,0.6)"/>
            {/* Smoke wisps */}
            <path d="M250 105 Q260 95 255 80 Q265 70 260 55" fill="none" stroke="rgba(220,180,100,0.3)" strokeWidth="2"/>
            {/* Elegant leg pose */}
            <ellipse cx="185" cy="450" rx="25" ry="80" fill="rgba(38,28,8,0.7)" transform="rotate(8 185 450)"/>
            <ellipse cx="215" cy="440" rx="25" ry="85" fill="rgba(38,28,8,0.72)" transform="rotate(-5 215 440)"/>
          </svg>
        )

      case DIRECTIONS.WEST:
        // Shanks — ONE ARM, cape, commanding stance
        return (
          <svg viewBox="0 0 400 600" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="shanks-glow">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="shanks-body">
                <stop offset="0%" stopColor="rgba(100,20,20,0.8)"/>
                <stop offset="100%" stopColor="rgba(60,10,10,0.6)"/>
              </radialGradient>
            </defs>
            {/* Cape — sweeping */}
            <path d="M80 200 Q20 320 40 500 Q200 550 360 500 Q380 320 320 200 L200 180Z"
              fill="rgba(80,15,15,0.65)" filter="url(#shanks-glow)"/>
            {/* Body */}
            <ellipse cx="200" cy="280" rx="80" ry="150" fill="url(#shanks-body)"/>
            {/* Head */}
            <ellipse cx="195" cy="95" rx="58" ry="65" fill="rgba(90,18,18,0.8)"/>
            {/* Red hair */}
            <path d="M145 70 Q195 30 250 60 Q235 45 200 50 Q170 40 150 62Z" fill="rgba(180,30,30,0.9)"/>
            <path d="M240 55 Q270 80 260 110" fill="none" stroke="rgba(160,25,25,0.7)" strokeWidth="12" strokeLinecap="round"/>
            {/* Scar over eye */}
            <line x1="170" y1="80" x2="195" y2="115" stroke="rgba(220,100,100,0.55)" strokeWidth="3"/>
            {/* ONE ARM — only right arm exists */}
            <ellipse cx="290" cy="230" rx="22" ry="75" fill="rgba(85,16,16,0.75)" transform="rotate(15 290 230)"/>
            {/* Empty left shoulder — cloth hanging */}
            <path d="M105 200 Q85 250 90 300" fill="none" stroke="rgba(70,12,12,0.6)" strokeWidth="18" strokeLinecap="round"/>
            {/* Sword on back */}
            <rect x="155" y="80" width="7" height="220" rx="3.5" fill="rgba(180,140,80,0.45)" transform="rotate(10 155 200)"/>
          </svg>
        )

      case DIRECTIONS.SOUTH:
        // Boa Hancock — elegant, tall, snake
        return (
          <svg viewBox="0 0 400 600" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="boa-glow">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="boa-body">
                <stop offset="0%" stopColor="rgba(150,30,120,0.75)"/>
                <stop offset="100%" stopColor="rgba(100,15,80,0.6)"/>
              </radialGradient>
            </defs>
            {/* Flowing robe */}
            <path d="M130 220 Q80 380 100 560 Q200 590 300 560 Q320 380 270 220Z"
              fill="rgba(120,20,100,0.65)" filter="url(#boa-glow)"/>
            {/* Body */}
            <ellipse cx="200" cy="270" rx="60" ry="170" fill="url(#boa-body)"/>
            {/* Head — elegant oval */}
            <ellipse cx="200" cy="88" rx="45" ry="58" fill="rgba(140,25,110,0.82)"/>
            {/* Long dark hair */}
            <path d="M160 60 Q200 25 245 55 L250 300 Q200 320 150 300Z" fill="rgba(20,5,18,0.85)"/>
            {/* Snake — Salome */}
            <path d="M280 180 Q340 150 360 200 Q380 250 340 280 Q300 310 320 360"
              fill="none" stroke="rgba(160,40,130,0.6)" strokeWidth="16" strokeLinecap="round"/>
            {/* Snake head */}
            <ellipse cx="325" cy="368" rx="14" ry="10" fill="rgba(140,35,110,0.7)" transform="rotate(30 325 368)"/>
            {/* Crown earrings */}
            <circle cx="158" cy="100" r="6" fill="rgba(220,180,80,0.7)"/>
            <circle cx="242" cy="100" r="6" fill="rgba(220,180,80,0.7)"/>
            {/* Confident arms */}
            <ellipse cx="145" cy="240" rx="18" ry="60" fill="rgba(135,22,105,0.7)" transform="rotate(-20 145 240)"/>
            <ellipse cx="258" cy="235" rx="18" ry="60" fill="rgba(135,22,105,0.7)" transform="rotate(20 258 235)"/>
          </svg>
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      position:   'absolute',
      bottom:     '28%',
      left:       '50%',
      transform:  'translateX(-50%)',
      width:      'clamp(280px, 38vw, 520px)',
      height:     'clamp(380px, 52vh, 680px)',
      opacity:    visible ? 1 : 0,
      transition: transitioning ? 'opacity 0.45s ease' : 'none',
      zIndex:     1,
      filter:     `drop-shadow(0 0 40px ${data.glowColor})`,
    }}>
      {getCharacterSVG()}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WANTED POSTER CARD — individual skill card exactly like Figma
// ─────────────────────────────────────────────────────────────────────────────

function WantedCard({ skill, index, visible, accentColor, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!visible) { setEntered(false); return }
    const t = setTimeout(() => setEntered(true), delay + index * 80)
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
        width:          'clamp(72px, 8.5vw, 115px)',
        background:     hovered
          ? 'linear-gradient(160deg, #f5e6cc 0%, #e8d4aa 100%)'
          : 'linear-gradient(160deg, #f0ddb8 0%, #e0c890 100%)',
        border:         `1.5px solid ${hovered ? '#8B6914' : 'rgba(139,105,20,0.6)'}`,
        borderRadius:   '4px 4px 6px 6px',
        padding:        'clamp(6px, 1vw, 12px) clamp(4px, 0.7vw, 8px)',
        cursor:         'pointer',
        transform:      entered
          ? hovered ? 'scale(1.08) translateY(-4px)' : 'scale(1) translateY(0)'
          : 'scale(0.7) translateY(20px)',
        opacity:        entered ? 1 : 0,
        transition:     'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow:      hovered
          ? `0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${accentColor}44`
          : '0 4px 14px rgba(0,0,0,0.4)',
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
        fontSize:      'clamp(9px, 1vw, 13px)',
        fontWeight:    700,
        color:         '#1a0d00',
        letterSpacing: '0.12em',
        marginBottom:  'clamp(4px, 0.6vh, 8px)',
        textShadow:    '0 1px 2px rgba(0,0,0,0.2)',
        textAlign:     'center',
        lineHeight:    1,
        borderBottom:  '1px solid rgba(80,50,10,0.25)',
        paddingBottom: 'clamp(3px, 0.4vh, 5px)',
        width:         '100%',
      }}>
        WANTED
      </div>

      {/* Skill icon */}
      <div style={{
        width:          'clamp(38px, 4.5vw, 62px)',
        height:         'clamp(38px, 4.5vw, 62px)',
        borderRadius:   '4px',
        background:     skill.bg || 'rgba(20,15,5,0.08)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       'clamp(18px, 2.2vw, 30px)',
        marginBottom:   'clamp(4px, 0.6vh, 8px)',
        border:         `1px solid rgba(80,50,10,0.18)`,
        color:          skill.color,
        fontWeight:     700,
        fontFamily:     'monospace, sans-serif',
        boxShadow:      'inset 0 1px 3px rgba(0,0,0,0.15)',
        transition:     'transform 0.2s ease',
        transform:      hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {skill.icon}
      </div>

      {/* Skill name */}
      <div style={{
        fontFamily:    '"IM Fell English", Georgia, serif',
        fontSize:      'clamp(7.5px, 0.85vw, 11px)',
        color:         '#1a0d00',
        textAlign:     'center',
        lineHeight:    1.25,
        letterSpacing: '0.02em',
        opacity:       0.88,
      }}>
        {skill.name}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GLASS BOARD — the floating transparent panel with skills
// ─────────────────────────────────────────────────────────────────────────────

function GlassBoard({ data, direction, visible, transitioning }) {
  const [boardIn,  setBoardIn]  = useState(false)
  const [cardsIn,  setCardsIn]  = useState(false)

  useEffect(() => {
    if (visible) {
      const t1 = setTimeout(() => setBoardIn(true), 100)
      const t2 = setTimeout(() => setCardsIn(true), 350)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else {
      setCardsIn(false)
      const t = setTimeout(() => setBoardIn(false), 200)
      return () => clearTimeout(t)
    }
  }, [visible])

  const isLarge = data.skills.length > 5

  return (
    <div style={{
      position:      'absolute',
      top:           '50%',
      left:          '50%',
      transform:     `translate(-50%, -50%) ${boardIn ? 'scale(1)' : 'scale(0.88)'}`,
      zIndex:        3,
      width:         isLarge
        ? 'clamp(600px, 75vw, 920px)'
        : 'clamp(480px, 62vw, 780px)',
      opacity:       boardIn ? 1 : 0,
      transition:    transitioning
        ? 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)'
        : 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Glass panel */}
      <div style={{
        background:     `
          linear-gradient(
            135deg,
            rgba(255,255,255,0.06) 0%,
            ${data.boardColor} 40%,
            rgba(0,0,0,0.3) 100%
          )
        `,
        border:         `1.5px solid rgba(255,255,255,0.15)`,
        borderRadius:   '10px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding:        'clamp(16px, 2.5vw, 30px)',
        boxShadow:      `
          0 8px 40px rgba(0,0,0,0.5),
          0 0 0 1px rgba(255,255,255,0.06),
          inset 0 1px 0 rgba(255,255,255,0.12),
          0 0 60px ${data.glowColor}
        `,
        position:       'relative',
        overflow:       'hidden',
      }}>
        {/* Glass shimmer */}
        <div style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     '1px',
          background: `linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)`,
        }} />

        {/* Board corner anchors */}
        {[
          { top: '10px', left: '14px' },
          { top: '10px', right: '14px' },
        ].map((pos, i) => (
          <div key={i} style={{
            position:   'absolute',
            ...pos,
            fontSize:   'clamp(14px, 1.6vw, 20px)',
            color:      `${data.accentColor}66`,
            lineHeight: 1,
            userSelect: 'none',
          }}>⚓</div>
        ))}

        {/* Compass rose center top */}
        <div style={{
          position:       'absolute',
          top:            '10px',
          left:           '50%',
          transform:      'translateX(-50%)',
          width:          '16px',
          height:         '16px',
          opacity:        0.35,
        }}>
          <svg viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke={data.accentColor} strokeWidth="0.8"/>
            <line x1="8" y1="1" x2="8" y2="15" stroke={data.accentColor} strokeWidth="0.8"/>
            <line x1="1" y1="8" x2="15" y2="8" stroke={data.accentColor} strokeWidth="0.8"/>
          </svg>
        </div>

        {/* Title */}
        <div style={{
          textAlign:     'center',
          marginBottom:  'clamp(14px, 2vh, 24px)',
          paddingTop:    'clamp(4px, 0.6vh, 8px)',
        }}>
          <div style={{
            fontFamily:    '"Pirata One", cursive',
            fontSize:      'clamp(14px, 1.8vw, 22px)',
            color:         data.titleColor,
            letterSpacing: '0.18em',
            textShadow:    `0 0 20px ${data.accentColor}88`,
            marginBottom:  '4px',
          }}>
            {data.title}
          </div>
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '10px',
          }}>
            <div style={{ height:'1px', width:'40px', background:`linear-gradient(to right, transparent, ${data.accentColor}55)` }}/>
            <span style={{ color: `${data.accentColor}66`, fontSize:'10px' }}>✦</span>
            <div style={{ height:'1px', width:'40px', background:`linear-gradient(to left, transparent, ${data.accentColor}55)` }}/>
          </div>
        </div>

        {/* Skill cards grid */}
        <div style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:            'clamp(8px, 1.2vw, 16px)',
          justifyContent: 'center',
          alignItems:     'flex-start',
        }}>
          {data.skills.map((skill, i) => (
            <WantedCard
              key={skill.name}
              skill={skill}
              index={i}
              visible={cardsIn}
              accentColor={data.accentColor}
              delay={0}
            />
          ))}
        </div>

        {/* Character quote at bottom */}
        <div style={{
          marginTop:   'clamp(12px, 1.8vh, 20px)',
          textAlign:   'center',
          fontFamily:  '"IM Fell English", Georgia, serif',
          fontSize:    'clamp(9px, 1vw, 12px)',
          fontStyle:   'italic',
          color:       `${data.accentColor}88`,
          letterSpacing:'0.04em',
          lineHeight:  1.5,
          opacity:     cardsIn ? 1 : 0,
          transition:  'opacity 0.5s ease 0.6s',
        }}>
          {data.quote}
        </div>

        {/* Glass bottom shimmer */}
        <div style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          right:      0,
          height:     '1px',
          background: `linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)`,
        }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTION NAVIGATOR — compass-style rotation buttons
// ─────────────────────────────────────────────────────────────────────────────

function DirectionNavigator({ current, onRotate, data, visible }) {
  const [hovLeft,  setHovLeft]  = useState(false)
  const [hovRight, setHovRight] = useState(false)

  const currentIndex = DIR_ORDER.indexOf(current)
  const prevIndex    = (currentIndex - 1 + DIR_ORDER.length) % DIR_ORDER.length
  const nextIndex    = (currentIndex + 1) % DIR_ORDER.length

  const prevDir = DIR_META.find(d => d.dir === DIR_ORDER[prevIndex])
  const nextDir = DIR_META.find(d => d.dir === DIR_ORDER[nextIndex])
  const currMeta = DIR_META.find(d => d.dir === current)

  const btnStyle = (hovered) => ({
    width:          'clamp(44px, 5vw, 62px)',
    height:         'clamp(44px, 5vw, 62px)',
    borderRadius:   '50%',
    background:     hovered
      ? `rgba(255,255,255,0.12)`
      : 'rgba(0,0,0,0.35)',
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
    boxShadow:      hovered
      ? `0 0 20px ${data.glowColor}, 0 4px 14px rgba(0,0,0,0.4)`
      : '0 4px 12px rgba(0,0,0,0.4)',
    opacity:        visible ? 1 : 0,
  })

  return (
    <>
      {/* Left arrow — prev direction */}
      <div style={{
        position:  'fixed',
        left:      'clamp(16px, 3vw, 40px)',
        top:       '50%',
        transform: 'translateY(-50%)',
        zIndex:    250,
        display:   'flex',
        flexDirection:'column',
        alignItems:'center',
        gap:       '8px',
      }}>
        <button
          onClick={() => onRotate('prev')}
          onMouseEnter={() => setHovLeft(true)}
          onMouseLeave={() => setHovLeft(false)}
          style={btnStyle(hovLeft)}
          aria-label="Previous direction"
        >
          ‹
        </button>
        <span style={{
          fontFamily:    '"IM Fell English", serif',
          fontSize:      'clamp(8px, 0.9vw, 11px)',
          color:         'rgba(255,255,255,0.4)',
          letterSpacing: '0.08em',
          whiteSpace:    'nowrap',
          opacity:       visible ? 1 : 0,
        }}>
          {prevDir?.shortName}
        </span>
      </div>

      {/* Right arrow — next direction */}
      <div style={{
        position:  'fixed',
        right:     'clamp(16px, 3vw, 40px)',
        top:       '50%',
        transform: 'translateY(-50%)',
        zIndex:    250,
        display:   'flex',
        flexDirection:'column',
        alignItems:'center',
        gap:       '8px',
      }}>
        <button
          onClick={() => onRotate('next')}
          onMouseEnter={() => setHovRight(true)}
          onMouseLeave={() => setHovRight(false)}
          style={btnStyle(hovRight)}
          aria-label="Next direction"
        >
          ›
        </button>
        <span style={{
          fontFamily:    '"IM Fell English", serif',
          fontSize:      'clamp(8px, 0.9vw, 11px)',
          color:         'rgba(255,255,255,0.4)',
          letterSpacing: '0.08em',
          whiteSpace:    'nowrap',
          opacity:       visible ? 1 : 0,
        }}>
          {nextDir?.shortName}
        </span>
      </div>

      {/* Bottom direction indicator */}
      <div style={{
        position:       'fixed',
        bottom:         'clamp(20px, 4vh, 40px)',
        left:           '50%',
        transform:      'translateX(-50%)',
        zIndex:         250,
        display:        'flex',
        alignItems:     'center',
        gap:            'clamp(6px, 1vw, 14px)',
        opacity:        visible ? 1 : 0,
        transition:     'opacity 0.4s ease',
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
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            '3px',
              background:     meta.dir === current
                ? `rgba(255,255,255,0.1)`
                : 'transparent',
              border:         `1px solid ${meta.dir === current ? data.accentColor : 'rgba(255,255,255,0.2)'}`,
              borderRadius:   '6px',
              padding:        '6px 12px',
              cursor:         'pointer',
              transition:     'all 0.2s ease',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span style={{
              fontFamily:    '"Pirata One", cursive',
              fontSize:      'clamp(10px, 1.1vw, 14px)',
              color:         meta.dir === current ? data.accentColor : 'rgba(255,255,255,0.55)',
              letterSpacing: '0.08em',
            }}>
              {meta.shortName}
            </span>
            <span style={{
              fontSize:  '8px',
              color:     meta.dir === current ? data.accentColor : 'rgba(255,255,255,0.3)',
            }}>
              {meta.compass}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CROW'S NEST RAILING — bottom decorative element
// ─────────────────────────────────────────────────────────────────────────────

function CrowsNestRailing({ visible }) {
  return (
    <div style={{
      position:      'fixed',
      bottom:        0,
      left:          '50%',
      transform:     `translateX(-50%) ${visible ? 'translateY(0)' : 'translateY(100%)'}`,
      zIndex:        245,
      width:         'clamp(280px, 45vw, 620px)',
      transition:    'all 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s',
      opacity:       visible ? 1 : 0,
    }}>
      <svg
        viewBox="0 0 620 120"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Main railing circle arc */}
        <path
          d="M10 80 Q310 20 610 80"
          fill="none"
          stroke="#5C3A21"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Top rail */}
        <path
          d="M10 65 Q310 5 610 65"
          fill="none"
          stroke="#7a5230"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Vertical posts */}
        {Array.from({ length: 13 }, (_, i) => {
          const t   = i / 12
          const x   = 10 + t * 600
          const yTop = 65 - Math.sin(Math.PI * t) * 60 + 5
          return (
            <line key={i}
              x1={x} y1={yTop}
              x2={x} y2={120}
              stroke="#4a3018"
              strokeWidth={i === 0 || i === 12 ? 5 : 3}
            />
          )
        })}
        {/* Wood texture lines on top rail */}
        {Array.from({ length: 6 }, (_, i) => {
          const t = 0.15 + (i / 5) * 0.7
          const x = 10 + t * 600
          const y = 62 - Math.sin(Math.PI * t) * 60
          return (
            <line key={i}
              x1={x - 4} y1={y - 1}
              x2={x + 4} y2={y + 1}
              stroke="#8B6914"
              strokeWidth="1.5"
              opacity="0.5"
            />
          )
        })}
      </svg>
    </div>
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
        position:       'fixed',
        top:            'clamp(14px, 2vh, 24px)',
        right:          'clamp(14px, 2vw, 24px)',
        zIndex:         260,
        width:          'clamp(34px, 3.5vw, 46px)',
        height:         'clamp(34px, 3.5vw, 46px)',
        borderRadius:   '50%',
        background:     hov ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.4)',
        border:         `1.5px solid ${hov ? accentColor : 'rgba(255,255,255,0.18)'}`,
        color:          hov ? accentColor : 'rgba(255,255,255,0.65)',
        fontSize:       'clamp(13px, 1.5vw, 18px)',
        cursor:         'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition:     'all 0.22s ease',
        transform:      visible
          ? hov ? 'scale(1.1)' : 'scale(1)'
          : 'scale(0)',
        opacity:        visible ? 1 : 0,
        transitionDelay:visible ? '0.5s' : '0s',
        boxShadow:      hov ? `0 0 18px ${accentColor}55` : 'none',
      }}
      aria-label="Close skills"
    >✕</button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION GHOST LABEL — "SKILLS" ghost text during transition
// ─────────────────────────────────────────────────────────────────────────────

function SkillsGhostLabel({ active }) {
  const [op, setOp] = useState(0)
  useEffect(() => {
    if (!active) { setOp(0); return }
    const t1 = setTimeout(() => setOp(1),   50)
    const t2 = setTimeout(() => setOp(0), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [active])

  if (op === 0) return null
  return (
    <div style={{
      position:      'fixed',
      top:           '50%',
      left:          '50%',
      transform:     'translate(-50%, -50%)',
      zIndex:        195,
      pointerEvents: 'none',
      fontFamily:    '"Pirata One", cursive',
      fontSize:      'clamp(50px, 10vw, 110px)',
      letterSpacing: '0.22em',
      color:         `rgba(255,255,255,${op * 0.07})`,
      transition:    'color 0.5s ease',
      userSelect:    'none',
      whiteSpace:    'nowrap',
    }}>
      SKILLS
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LETTER BOX BARS
// ─────────────────────────────────────────────────────────────────────────────

function SkillsLetterBox({ active }) {
  const [mounted, setMounted] = useState(false)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (active) { setMounted(true); setLeaving(false) }
    else if (mounted) {
      setLeaving(true)
      const t = setTimeout(() => setMounted(false), 700)
      return () => clearTimeout(t)
    }
  }, [active])
  if (!mounted) return null
  const showing = active && !leaving
  return (
    <>
      <div style={{
        position:'fixed', top:0, left:0, right:0,
        height:'clamp(26px, 4vh, 50px)',
        background:'#000', zIndex:190, pointerEvents:'none',
        transition:'transform 0.65s cubic-bezier(0.22,1,0.36,1)',
        transform: showing ? 'translateY(0)' : 'translateY(-100%)',
      }}/>
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        height:'clamp(26px, 4vh, 50px)',
        background:'#000', zIndex:190, pointerEvents:'none',
        transition:'transform 0.65s cubic-bezier(0.22,1,0.36,1)',
        transform: showing ? 'translateY(0)' : 'translateY(100%)',
      }}/>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER NAME BADGE — shows character name top-center
// ─────────────────────────────────────────────────────────────────────────────

function CharacterBadge({ data, visible, transitioning }) {
  return (
    <div style={{
      position:       'fixed',
      top:            'clamp(22px, 3.5vh, 42px)',
      left:           '50%',
      transform:      `translateX(-50%) ${visible ? 'translateY(0)' : 'translateY(-20px)'}`,
      zIndex:         248,
      display:        'flex',
      alignItems:     'center',
      gap:            '10px',
      opacity:        visible ? 1 : 0,
      transition:     transitioning
        ? 'all 0.45s ease'
        : 'all 0.45s ease',
      whiteSpace:     'nowrap',
    }}>
      <div style={{
        height: '1px',
        width:  '30px',
        background: `linear-gradient(to right, transparent, ${data.accentColor}66)`,
      }}/>
      <span style={{
        fontFamily:    '"Pirata One", cursive',
        fontSize:      'clamp(11px, 1.3vw, 16px)',
        color:         data.titleColor,
        letterSpacing: '0.2em',
        textShadow:    `0 0 16px ${data.accentColor}88`,
      }}>
        {data.character}
      </span>
      <div style={{
        height: '1px',
        width:  '30px',
        background: `linear-gradient(to left, transparent, ${data.accentColor}66)`,
      }}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OCEAN HORIZON — bottom strip showing ocean from crow's nest
// ─────────────────────────────────────────────────────────────────────────────

function OceanHorizon({ data, visible }) {
  return (
    <div style={{
      position:   'fixed',
      bottom:     0,
      left:       0,
      right:      0,
      height:     '32%',
      zIndex:     1,
      background: `
        linear-gradient(
          to top,
          rgba(0,40,70,0.9) 0%,
          rgba(0,50,80,0.7) 30%,
          transparent 100%
        )
      `,
      pointerEvents: 'none',
      opacity:    visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Animated wave lines on horizon */}
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{
          position:   'absolute',
          top:        `${15 + i * 15}%`,
          left:       0,
          right:      0,
          height:     '1px',
          background: `linear-gradient(to right, transparent 5%, rgba(100,180,220,${0.06 + i * 0.03}) 20%, rgba(100,180,220,${0.1 + i * 0.04}) 50%, rgba(100,180,220,${0.06 + i * 0.03}) 80%, transparent 95%)`,
          animation:  `waveShift ${4 + i * 0.8}s ease-in-out infinite ${i * 0.3}s`,
        }}/>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SKILLS SECTION — the full overlay
// ─────────────────────────────────────────────────────────────────────────────

function SkillsOverlay({ active, onClose }) {
  const [currentDir,    setCurrentDir]    = useState(DIRECTIONS.NORTH)
  const [prevDir,       setPrevDir]       = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [overlayIn,     setOverlayIn]     = useState(false)
  const [contentIn,     setContentIn]     = useState(false)
  const transitionTimer = useRef(null)

  const data    = SKILL_DATA[currentDir]
  const prevData = prevDir ? SKILL_DATA[prevDir] : null

  useEffect(() => {
    if (active) {
      const t1 = setTimeout(() => setOverlayIn(true),  400)
      const t2 = setTimeout(() => setContentIn(true),  900)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else {
      setContentIn(false)
      const t = setTimeout(() => setOverlayIn(false), 400)
      return () => clearTimeout(t)
    }
  }, [active])

  // Escape key
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && active) onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, onClose])

  // Arrow keys for direction
  useEffect(() => {
    const fn = (e) => {
      if (!active) return
      if (e.key === 'ArrowLeft')  handleRotate('prev')
      if (e.key === 'ArrowRight') handleRotate('next')
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, currentDir, transitioning])

  const handleRotate = useCallback((direction, targetDir = null) => {
    if (transitioning) return

    setTransitioning(true)
    setContentIn(false)
    setPrevDir(currentDir)

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
        setPrevDir(null)
      }, 120)
    }, 300)
  }, [currentDir, transitioning])

  return (
    <div style={{
      position:      'fixed',
      inset:         0,
      zIndex:        220,
      pointerEvents: overlayIn ? 'all' : 'none',
      overflow:      'hidden',
    }}>
      {/* Sky background layers — cross-fade between directions */}
      <div style={{ position:'absolute', inset:0, zIndex:0 }}>
        <DirectionalSky
          data={data}
          visible={overlayIn}
          transitioning={transitioning}
        />
      </div>

      {/* Ocean horizon at bottom */}
      <OceanHorizon data={data} visible={overlayIn} />

      {/* Character silhouette */}
      <CharacterBackdrop
        data={data}
        direction={currentDir}
        visible={contentIn}
        transitioning={transitioning}
      />

      {/* Glass board with skills */}
      <GlassBoard
        data={data}
        direction={currentDir}
        visible={contentIn}
        transitioning={transitioning}
      />

      {/* Character name badge */}
      <CharacterBadge
        data={data}
        visible={contentIn}
        transitioning={transitioning}
      />

      {/* Crow's nest railing at bottom */}
      <CrowsNestRailing visible={overlayIn} />

      {/* Navigation arrows */}
      <DirectionNavigator
        current={currentDir}
        onRotate={handleRotate}
        data={data}
        visible={contentIn}
      />

      {/* Close button */}
      <SkillsCloseBtn
        onClose={onClose}
        visible={contentIn}
        accentColor={data.accentColor}
      />

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=IM+Fell+English:ital@0;1&display=swap');

        @keyframes starTwinkle {
          0%,100% { opacity: 0.12; transform: scale(1); }
          50%      { opacity: 0.5;  transform: scale(1.3); }
        }
        @keyframes waveShift {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(12px); }
        }
        @keyframes boardFloat {
          0%,100% { transform: translate(-50%,-50%) translateY(0px); }
          50%      { transform: translate(-50%,-50%) translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS CAMERA CONTROLLER — Flies up to the Crow's Nest
// ─────────────────────────────────────────────────────────────────────────────



const currentTarget = new THREE.Vector3(0, 1.5, 0)


// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — render in App.jsx outside Canvas
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — render in App.jsx outside Canvas
// ─────────────────────────────────────────────────────────────────────────────

export default function SkillsSection({ active, onClose }) {
  return (
    <>
      <SkillsLetterBox active={active} />
      <SkillsGhostLabel active={active} />
      <SkillsOverlay active={active} onClose={onClose} />
    </>
  )
}
