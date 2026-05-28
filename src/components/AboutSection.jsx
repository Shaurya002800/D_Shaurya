/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ABOUT SECTION — Grand Line Portfolio
 * Fixed & Complete — matches exact Figma frame 18 design
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * What this does:
 *   1. Camera GSAP sweeps to face the sail front-on
 *   2. The sail cloth is rendered in Three.js with animated wind shader
 *   3. Content overlays on top in HTML — "I'M SHAURYA.", bio, sepia photo
 *   4. Anchor corners, ornament divider, social links — exactly like Figma
 *   5. Escape or click outside to return to explore
 *
 * No external texture files required — sail cloth is procedural
 */

import {
  useRef,
  useEffect,
  useState,
  useMemo,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT DATA
// ─────────────────────────────────────────────────────────────────────────────

const ABOUT = {
  title:    "I'M SHAURYA.",
  tagline1: 'I build things that look good and work well.',
  tagline2: 'Designer by instinct. Developer by choice. AI/ML by curiosity.',
  paras: [
    'Currently 2nd year at VIT Vellore — working full-time at a startup since day one.',
    "I'm obsessed with building things that feel alive — interfaces that respond, systems that think, and experiences that people remember. This portfolio is one of those things.",
    "When I'm not shipping code or pushing pixels, I'm going deep on AI/ML theory, blockchain fundamentals, or thinking about the next thing worth building.",
    "The ship you're exploring? That's how my brain works — everything connected, every section with a reason for being exactly where it is.",
  ],
  photo: '/luffy-sitting.png', // replace with your actual photo
  links: [
    { label: 'GitHub',   href: 'https://github.com'   },
    { label: 'LinkedIn', href: 'https://linkedin.com'  },
    { label: 'Resume',   href: '/resume.pdf'           },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA POSITIONS
// ─────────────────────────────────────────────────────────────────────────────

const CAM_EXPLORE = {
  position: new THREE.Vector3(0, 8.5, 16),
  target:   new THREE.Vector3(0, 1.5, 0),
  fov:      68,
}

// Tuned to show the sail front-on exactly like Figma frame 18
const CAM_ABOUT = {
  position: new THREE.Vector3(0, 20.2, 34.5),
  target:   new THREE.Vector3(0, 16.7, -1.8),
  fov:      27,
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA HOOK — GSAP transition, runs inside Canvas
// ─────────────────────────────────────────────────────────────────────────────

function lerpV3(out, a, b, t) {
  out.set(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t,
  )
}

export function useAboutCamera(active) {
  const { camera } = useThree()
  const lookRef    = useRef(CAM_EXPLORE.target.clone())
  const tlRef      = useRef(null)

  useEffect(() => {
    if (tlRef.current) tlRef.current.kill()

    const fromPos  = camera.position.clone()
    const fromLook = lookRef.current.clone()
    const toPos    = active ? CAM_ABOUT.position : CAM_EXPLORE.position
    const toLook   = active ? CAM_ABOUT.target   : CAM_EXPLORE.target
    const proxy    = { p: 0, fov: camera.fov }

    tlRef.current = gsap.to(proxy, {
      p:        1,
      fov:      active ? CAM_ABOUT.fov : CAM_EXPLORE.fov,
      duration: active ? 2.15 : 1.65,
      ease:     active ? 'power3.inOut' : 'power2.inOut',
      onUpdate: () => {
        // cubic-in-out easing on top of gsap for extra smoothness
        const e = proxy.p < 0.5
          ? 4 * proxy.p ** 3
          : 1 - (-2 * proxy.p + 2) ** 3 / 2
        lerpV3(camera.position,  fromPos,  toPos,  e)
        lerpV3(lookRef.current,  fromLook, toLook, e)
        camera.lookAt(lookRef.current)
        camera.fov = proxy.fov
        camera.updateProjectionMatrix()
      },
    })

    return () => { if (tlRef.current) tlRef.current.kill() }
  }, [active])
}

export function AboutCameraController({ active }) {
  useAboutCamera(active)
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED SAIL — Three.js mesh with wind vertex shader, no external textures
// Drop this into Ship.jsx to replace the static sail plane
// ─────────────────────────────────────────────────────────────────────────────

export function AnimatedSail({ position = [0, 21, -2.8], size = [22, 17] }) {
  const meshRef = useRef()

  const shader = useMemo(() => ({
    uniforms: {
      uTime:       { value: 0 },
      uClothColor: { value: new THREE.Color('#f2e6d2') },
      uShadowColor:{ value: new THREE.Color('#c4a97a') },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2  vUv;
      varying float vWave;
      varying vec3  vNormal;

      void main() {
        vUv = uv;

        vec3 pos = position;

        // Horizontal sail billow — more pronounced in center/top
        float band     = sin(uv.y * 3.14159);
        float crest    = sin(uv.x * 4.5  + uTime * 1.15) * 0.18;
        float ripple   = cos(uv.y * 5.4  + uTime * 0.90) * 0.06;
        float sidePull = sin(uv.y * 2.1  + uTime * 0.72) * 0.13 * band;
        float wave     = (crest + ripple) * (0.28 + uv.y * 0.92);

        pos.z += wave;
        pos.x += sidePull * (0.15 + uv.y * 0.4);
        pos.y += sin(uv.x * 3.4 + uTime * 0.55) * 0.05 * uv.y;

        vWave  = wave;
        vNormal = normalMatrix * normal;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3  uClothColor;
      uniform vec3  uShadowColor;
      uniform float uTime;
      varying vec2  vUv;
      varying float vWave;
      varying vec3  vNormal;

      void main() {
        // Base cloth weave
        float warpX  = sin(vUv.x * 120.0) * 0.5 + 0.5;
        float warpY  = sin(vUv.y * 120.0) * 0.5 + 0.5;
        float weave  = mix(0.94, 1.0, warpX * warpY);

        // Light direction (sun from right-upper)
        vec3  L     = normalize(vec3(0.6, 0.8, 0.5));
        float diff  = max(dot(normalize(vNormal), L), 0.0);
        float light = 0.55 + diff * 0.45;

        // Wave-based shading — pockets are darker
        float wShade = 1.0 - abs(vWave) * 0.18;

        // Seam lines — faint horizontal rope marks
        float seam   = smoothstep(0.48, 0.50, abs(fract(vUv.y * 5.0) - 0.5));
        float seamDk = 1.0 - seam * 0.07;

        // Edge vignette — edges of sail darker from being in shadow
        float edgeX = 1.0 - smoothstep(0.35, 0.5, abs(vUv.x - 0.5) * 2.0) * 0.18;
        float edgeY = 1.0 - smoothstep(0.6, 1.0, vUv.y) * 0.10;

        vec3 color = mix(uClothColor, uShadowColor, 0.12);
        color *= weave * light * wShade * seamDk * edgeX * edgeY;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }), [])

  useFrame(({ clock }) => {
    if (meshRef.current?.material?.uniforms) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <planeGeometry args={[...size, 54, 42]} />
      <shaderMaterial args={[shader]} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT TRANSITION OVERLAY — flash on transition
// ─────────────────────────────────────────────────────────────────────────────

export function AboutTransitionOverlay({ active }) {
  const [show, setShow]   = useState(false)
  const [op,   setOp]     = useState(0)

  useEffect(() => {
    if (active) {
      setShow(true)
      requestAnimationFrame(() => {
        setOp(0.9)
        setTimeout(() => setOp(0), 360)
      })
    } else if (show) {
      setOp(0.24)
      const t = setTimeout(() => {
        setOp(0)
        setTimeout(() => setShow(false), 280)
      }, 80)
      return () => clearTimeout(t)
    }
  }, [active])

  if (!show) return null

  return (
    <div style={{
      position:      'fixed',
      inset:         0,
      zIndex:        240,
      pointerEvents: 'none',
      opacity:       op,
      transition:    'opacity 320ms ease',
      background:    'radial-gradient(circle at center, rgba(240,221,182,0.32), rgba(26,16,6,0.06) 42%, rgba(0,0,0,0.45) 100%)',
    }} />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION TRANSITION LABEL
// ─────────────────────────────────────────────────────────────────────────────

export function SectionTransitionLabel({ active, label = 'ABOUT' }) {
  const [phase, setPhase] = useState('hidden')

  useEffect(() => {
    if (!active) return
    setPhase('showing')
    const t1 = setTimeout(() => setPhase('visible'), 80)
    const t2 = setTimeout(() => setPhase('hiding'),  980)
    const t3 = setTimeout(() => setPhase('hidden'),  1420)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [active])

  if (phase === 'hidden') return null

  return (
    <div style={{
      position:      'fixed',
      top:           '50%',
      left:          '50%',
      transform:     'translate(-50%, -50%)',
      zIndex:        245,
      pointerEvents: 'none',
      opacity:       phase === 'visible' ? 1 : 0,
      transition:    'opacity 360ms ease',
      color:         'rgba(243,227,194,0.22)',
      fontFamily:    '"IM Fell English SC", Georgia, serif',
      fontSize:      'clamp(40px, 8vw, 88px)',
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      textShadow:    '0 0 26px rgba(255,243,216,0.1)',
      whiteSpace:    'nowrap',
    }}>
      {label}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WIND COMPASS
// ─────────────────────────────────────────────────────────────────────────────

export function WindCompass({ visible }) {
  const needleRef = useRef()
  const angleRef  = useRef(38)
  const targetRef = useRef(38)

  useEffect(() => {
    const id = setInterval(() => {
      targetRef.current += (Math.random() - 0.5) * 10
      targetRef.current  = Math.max(-150, Math.min(150, targetRef.current))
    }, 2600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let raf
    const tick = () => {
      angleRef.current += (targetRef.current - angleRef.current) * 0.025
      if (needleRef.current)
        needleRef.current.style.transform = `rotate(${angleRef.current}deg)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position:       'fixed',
      top:            '22px',
      right:          '22px',
      width:          '54px',
      height:         '54px',
      zIndex:         150,
      borderRadius:   '50%',
      border:         '1px solid rgba(240,218,174,0.24)',
      background:     'rgba(24,17,8,0.68)',
      backdropFilter: 'blur(8px)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
    }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(240,218,174,0.18)" strokeWidth="1"/>
        {[{l:'N',x:22,y:6},{l:'S',x:22,y:40},{l:'E',x:39,y:24},{l:'W',x:5,y:24}].map(({l,x,y})=>(
          <text key={l} x={x} y={y} textAnchor="middle"
            style={{ fontFamily:'Georgia,serif', fontSize:'6px', fill:'rgba(240,218,174,0.44)' }}>
            {l}
          </text>
        ))}
      </svg>
      <div ref={needleRef} style={{
        position:'absolute', width:'2px', height:'30px',
        display:'flex', flexDirection:'column', alignItems:'center',
        transformOrigin:'center center',
      }}>
        <div style={{ width:0, height:0, borderLeft:'3px solid transparent', borderRight:'3px solid transparent', borderBottom:'11px solid #bf5c36' }}/>
        <div style={{ width:'2px', flex:1, background:'rgba(248,237,214,0.62)' }}/>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SAIL PARAGRAPH — animated text reveal
// ─────────────────────────────────────────────────────────────────────────────

function SailPara({ text, index, active, style = {} }) {
  const [vis, setVis] = useState(false)

  useEffect(() => {
    if (!active) { setVis(false); return }
    const t = setTimeout(() => setVis(true), 280 + index * 130)
    return () => clearTimeout(t)
  }, [active, index])

  return (
    <p style={{
      margin:      0,
      fontFamily:  '"Cormorant Garamond", "Times New Roman", serif',
      lineHeight:  1.72,
      color:       'rgba(26,14,4,0.90)',
      transform:   vis ? 'translateX(0)' : 'translateX(-16px)',
      opacity:     vis ? 1 : 0,
      transition:  `transform 620ms cubic-bezier(0.22,1,0.36,1) ${index * 35}ms,
                    opacity 620ms ease ${index * 35}ms`,
      ...style,
    }}>
      {text}
    </p>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ANCHOR CORNER
// ─────────────────────────────────────────────────────────────────────────────

function Anchor({ pos, delay, vis }) {
  return (
    <div style={{
      position:    'absolute',
      ...pos,
      fontSize:    'clamp(18px, 2vw, 26px)',
      color:       'rgba(90,60,20,0.38)',
      opacity:     vis ? 1 : 0,
      transform:   vis ? 'scale(1)' : 'scale(0.4)',
      transition:  `all 0.5s ease ${delay}ms`,
      userSelect:  'none',
      pointerEvents:'none',
      lineHeight:  1,
    }}>⚓</div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORNAMENT DIVIDER — swirl from Figma
// ─────────────────────────────────────────────────────────────────────────────

function OrnamentDivider({ vis }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '10px',
      margin:         'clamp(8px, 1.2vh, 14px) 0',
      opacity:        vis ? 0.55 : 0,
      transition:     'opacity 0.6s ease 0.75s',
    }}>
      <div style={{ height:'1px', width:'50px', background:'linear-gradient(to right, transparent, rgba(80,50,15,0.55))' }}/>
      <svg width="48" height="18" viewBox="0 0 48 18" fill="none">
        <path d="M24 9C20 4,12 2,8 6C4 10,6 16,12 15C18 14,22 8,24 9C26 10,30 16,36 15C42 14,44 8,40 6C36 2,28 4,24 9Z"
          fill="none" stroke="rgba(80,50,15,0.58)" strokeWidth="1.2"/>
        <circle cx="24" cy="9" r="1.6" fill="rgba(80,50,15,0.58)"/>
      </svg>
      <div style={{ height:'1px', width:'50px', background:'linear-gradient(to left, transparent, rgba(80,50,15,0.55))' }}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SEPIA PHOTO — right side of sail, blends into cloth exactly like Figma
// ─────────────────────────────────────────────────────────────────────────────

function SepiaPhoto({ src, vis }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{
      position:   'absolute',
      top:        'clamp(30px, 3.5vh, 55px)',
      right:      'clamp(28px, 3.5vw, 52px)',
      bottom:     'clamp(30px, 3.5vh, 55px)',
      width:      'clamp(165px, 28%, 310px)',
      opacity:    vis && loaded ? 1 : 0,
      transform:  vis ? 'scale(1)' : 'scale(0.92)',
      transition: 'all 0.75s ease 0.35s',
      zIndex:     1,
    }}>
      <img
        src={src}
        alt="Shaurya"
        onLoad={() => setLoaded(true)}
        style={{
          display:        'block',
          width:          '100%',
          height:         '100%',
          objectFit:      'cover',
          objectPosition: 'top center',
          // The key: sepia + multiply blends photo INTO the cloth
          filter:  'sepia(100%) contrast(1.12) brightness(0.70) saturate(0.45)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Blend edges into sail cloth */}
      <div style={{
        position:      'absolute',
        inset:         0,
        background:    `
          radial-gradient(ellipse 100% 100% at 50% 50%,
            transparent 45%,
            rgba(200,170,110,0.55) 78%,
            rgba(190,155,90,0.90) 100%
          ),
          linear-gradient(to right,
            rgba(225,200,155,0.92) 0%,
            transparent 28%
          ),
          linear-gradient(to bottom,
            rgba(225,200,155,0.75) 0%,
            transparent 18%
          ),
          linear-gradient(to top,
            rgba(225,200,155,0.75) 0%,
            transparent 15%
          )
        `,
        pointerEvents: 'none',
      }}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SAIL CLOTH CSS BACKGROUND — matches the procedural Three.js sail shader
// ─────────────────────────────────────────────────────────────────────────────

function SailClothBg() {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:0, overflow:'hidden' }}>
      {/* Parchment base — aged linen color */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'linear-gradient(155deg, #ede2c6 0%, #d9c99a 28%, #cbb978 55%, #d4c08c 78%, #ddd0a0 100%)',
      }}/>
      {/* Curvature: center lighter, edges darker — simulates sail billow */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: `
          radial-gradient(ellipse 72% 62% at 44% 40%, rgba(255,255,255,0.20) 0%, transparent 55%),
          radial-gradient(ellipse 100% 100% at 0% 50%,   rgba(90,65,25,0.16) 0%, transparent 42%),
          radial-gradient(ellipse 100% 100% at 100% 50%, rgba(90,65,25,0.13) 0%, transparent 42%),
          radial-gradient(ellipse 100% 55%  at 50% 100%, rgba(70,50,20,0.12) 0%, transparent 48%)
        `,
      }}/>
      {/* Horizontal weave threads */}
      <div style={{
        position:   'absolute',
        inset:      0,
        backgroundImage: `
          repeating-linear-gradient(0deg,
            transparent, transparent 3px,
            rgba(130,100,45,0.07) 3px, rgba(130,100,45,0.07) 4px
          ),
          repeating-linear-gradient(90deg,
            transparent, transparent 9px,
            rgba(130,100,45,0.04) 9px, rgba(130,100,45,0.04) 10px
          )
        `,
      }}/>
      {/* Subtle grain */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.055, mixBlendMode:'multiply' }} preserveAspectRatio="xMidYMid slice">
        <filter id="cloth-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#cloth-noise)"/>
      </svg>
      {/* Inner rope border */}
      <div style={{
        position:     'absolute',
        top:'18px', left:'18px', right:'18px', bottom:'18px',
        border:       '1.5px solid rgba(110,80,30,0.22)',
        borderRadius: '3px',
        pointerEvents:'none',
      }}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function CloseBtn({ onClose, vis }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClose}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:       'absolute',
        top:            'clamp(10px, 1.5vw, 18px)',
        right:          'clamp(10px, 1.5vw, 18px)',
        zIndex:         10,
        width:          'clamp(28px, 2.8vw, 38px)',
        height:         'clamp(28px, 2.8vw, 38px)',
        borderRadius:   '50%',
        border:         `1.5px solid rgba(80,55,18,${hov ? 0.55 : 0.28})`,
        background:     hov ? 'rgba(80,55,18,0.10)' : 'transparent',
        color:          `rgba(26,14,4,${hov ? 0.82 : 0.42})`,
        fontSize:       'clamp(11px, 1.3vw, 15px)',
        cursor:         'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        transition:     'all 0.2s ease',
        opacity:        vis ? 1 : 0,
        transform:      vis ? 'scale(1)' : 'scale(0)',
        transitionDelay:vis ? '0.55s' : '0s',
      }}
      aria-label="Close about"
    >✕</button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HINT BAR — "click anywhere or press Esc to return"
// ─────────────────────────────────────────────────────────────────────────────

function HintBar({ vis }) {
  return (
    <div style={{
      position:      'fixed',
      top:           'clamp(14px, 2vh, 24px)',
      right:         vis ? 'clamp(14px, 2vw, 24px)' : '-300px',
      zIndex:        260,
      padding:       '9px 16px',
      borderRadius:  '999px',
      border:        '1px solid rgba(232,206,158,0.28)',
      background:    'rgba(23,16,8,0.42)',
      color:         'rgba(244,225,187,0.82)',
      fontFamily:    '"IM Fell English SC", Georgia, serif',
      fontSize:      'clamp(10px, 1.1vw, 12px)',
      letterSpacing: '0.12em',
      backdropFilter:'blur(8px)',
      pointerEvents: 'none',
      transition:    'right 0.5s ease 0.6s',
      whiteSpace:    'nowrap',
    }}>
      Click anywhere · Esc to return
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SAIL PANEL — the content overlay
// ─────────────────────────────────────────────────────────────────────────────

function SailPanel({ active, onClose }) {
  const [panelIn,  setPanelIn]  = useState(false)
  const [contentIn,setContentIn]= useState(false)
  const [hov,      setHov]      = useState(null)

  useEffect(() => {
    if (active) {
      // Camera takes ~2.15s — show panel after it lands
      const t1 = setTimeout(() => setPanelIn(true),   1850)
      const t2 = setTimeout(() => setContentIn(true), 2200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else {
      setContentIn(false)
      const t = setTimeout(() => setPanelIn(false), 300)
      return () => clearTimeout(t)
    }
  }, [active])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && active) onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, onClose])

  const FONT = '"Cormorant Garamond", "Palatino Linotype", Georgia, serif'
  const TITLE_FONT = '"IM Fell English SC", "Palatino Linotype", Georgia, serif'

  return (
    <>
      {/* Full-screen close zone — clicking outside panel closes it */}
      {panelIn && (
        <div
          onClick={onClose}
          style={{
            position:   'fixed',
            inset:      0,
            zIndex:     215,
            cursor:     'pointer',
          }}
        />
      )}

      {/* THE SAIL PANEL */}
      <div style={{
        position:       'fixed',
        // Positioned to match where sail appears in viewport when camera faces it
        top:            '5%',
        left:           '50%',
        transform:      `translateX(-50%) ${panelIn ? 'scale(1)' : 'scale(0.93)'}`,
        zIndex:         220,
        width:          'clamp(560px, 80vw, 1140px)',
        height:         '65vh',
        borderRadius:   '5px 5px 0 0',
        overflow:       'hidden',
        opacity:        panelIn ? 1 : 0,
        transition:     'all 0.65s cubic-bezier(0.22,1,0.36,1)',
        boxShadow:      panelIn
          ? '0 12px 80px rgba(0,0,0,0.28), 0 2px 12px rgba(0,0,0,0.18)'
          : 'none',
        pointerEvents:  panelIn ? 'all' : 'none',
      }}>
        {/* Sail cloth background */}
        <SailClothBg />

        {/* Close button */}
        <CloseBtn onClose={onClose} vis={contentIn} />

        {/* Anchor corner decorations — exactly like Figma */}
        <Anchor pos={{ top:'20px',  left:'24px'   }} delay={0}   vis={contentIn} />
        <Anchor pos={{ top:'20px',  right:'clamp(52px,7%,88px)' }} delay={80}  vis={contentIn} />
        <Anchor pos={{ bottom:'20px', left:'24px' }} delay={120} vis={contentIn} />
        <Anchor pos={{ bottom:'20px', right:'clamp(52px,7%,88px)' }} delay={160} vis={contentIn} />

        {/* SEPIA PHOTO — right side, blends into cloth */}
        <SepiaPhoto src={ABOUT.photo} vis={contentIn} />

        {/* ── LEFT TEXT CONTENT ── */}
        <div style={{
          position:      'absolute',
          top:           'clamp(28px, 3.8vh, 50px)',
          left:          'clamp(28px, 3.8vw, 52px)',
          right:         'clamp(190px, 34%, 360px)',
          bottom:        'clamp(22px, 3vh, 40px)',
          zIndex:        2,
          display:       'flex',
          flexDirection: 'column',
          overflow:      'hidden',
        }}>

          {/* TITLE */}
          <h1 style={{
            fontFamily:    TITLE_FONT,
            fontSize:      'clamp(28px, 4.8vw, 65px)',
            fontWeight:    400,
            color:         '#160c02',
            margin:        '0 0 clamp(5px, 0.9vh, 10px) 0',
            lineHeight:    1.05,
            letterSpacing: '0.02em',
            textShadow:    '1px 2px 3px rgba(80,50,15,0.15)',
            opacity:       contentIn ? 1 : 0,
            transform:     contentIn ? 'translateY(0)' : 'translateY(-14px)',
            transition:    'all 0.55s ease 0.08s',
          }}>
            {ABOUT.title}
          </h1>

          {/* TAGLINES — italic */}
          <div style={{
            marginBottom: 'clamp(10px, 1.6vh, 18px)',
            opacity:      contentIn ? 1 : 0,
            transform:    contentIn ? 'translateY(0)' : 'translateY(8px)',
            transition:   'all 0.5s ease 0.2s',
          }}>
            <p style={{
              margin:      0,
              fontFamily:  FONT,
              fontSize:    'clamp(12px, 1.5vw, 17px)',
              fontStyle:   'italic',
              fontWeight:  500,
              color:       'rgba(26,14,4,0.85)',
              lineHeight:  1.45,
            }}>
              {ABOUT.tagline1}
            </p>
            <p style={{
              margin:      '2px 0 0 0',
              fontFamily:  FONT,
              fontSize:    'clamp(11px, 1.35vw, 15px)',
              fontStyle:   'italic',
              color:       'rgba(26,14,4,0.75)',
              lineHeight:  1.45,
            }}>
              {ABOUT.tagline2}
            </p>
          </div>

          {/* BIO PARAGRAPHS */}
          <div style={{
            flex:           1,
            overflow:       'hidden',
            display:        'flex',
            flexDirection:  'column',
            gap:            'clamp(7px, 1.1vh, 14px)',
          }}>
            {ABOUT.paras.map((text, i) => (
              <SailPara
                key={i}
                text={text}
                index={i}
                active={contentIn}
                style={{
                  fontFamily:  FONT,
                  fontSize:    'clamp(10.5px, 1.25vw, 15px)',
                  fontWeight:  600,
                  letterSpacing:'0.005em',
                }}
              />
            ))}
          </div>

          {/* ORNAMENT DIVIDER */}
          <OrnamentDivider vis={contentIn} />

          {/* SOCIAL LINKS */}
          <div style={{
            display:    'flex',
            gap:        'clamp(10px, 1.6vw, 22px)',
            opacity:    contentIn ? 1 : 0,
            transform:  contentIn ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.5s ease 1.0s',
          }}>
            {ABOUT.links.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  fontFamily:    FONT,
                  fontSize:      'clamp(10px, 1.1vw, 13px)',
                  fontWeight:    600,
                  color:         hov === i ? '#160c02' : 'rgba(26,14,4,0.58)',
                  textDecoration:'none',
                  letterSpacing: '0.07em',
                  borderBottom:  hov === i
                    ? '1px solid rgba(26,14,4,0.45)'
                    : '1px solid transparent',
                  transition:    'all 0.18s ease',
                  paddingBottom: '2px',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

        </div>
      </div>

      <HintBar vis={panelIn} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — render in App.jsx outside Canvas
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutSection({ active, onClose }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IM+Fell+English+SC&display=swap');
      `}</style>
      <SailPanel active={active} onClose={onClose} />
    </>
  )
}