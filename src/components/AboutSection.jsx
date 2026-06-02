/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ABOUT SECTION — Grand Line Portfolio (3D Sail Integration)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useRef, useEffect, useState, useMemo } from 'react'
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
  photo: '/luffy-sitting.png', 
  links: [
    { label: 'GitHub',   href: 'https://github.com'   },
    { label: 'LinkedIn', href: 'https://linkedin.com'  },
    { label: 'Resume',   href: '/resume.pdf'           },
  ],
}

// Camera framing matching front-on viewport alignment
const CAM_EXPLORE = { position: new THREE.Vector3(0, 8.5, 16), target: new THREE.Vector3(0, 1.5, 0), fov: 68 }
const CAM_ABOUT   = { position: new THREE.Vector3(0, 20.2, 34.5), target: new THREE.Vector3(0, 16.7, -1.8), fov: 27 }

function lerpV3(out, a, b, t) {
  out.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t)
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
        const e = proxy.p < 0.5 ? 4 * proxy.p ** 3 : 1 - (-2 * proxy.p + 2) ** 3 / 2
        lerpV3(camera.position,  fromPos,  toPos,  e)
        lerpV3(lookRef.current,  fromLook, toLook, e)
        camera.lookAt(lookRef.current)
        camera.fov = proxy.fov
        camera.updateProjectionMatrix()
      },
    })
    return () => { if (tlRef.current) tlRef.current.kill() }
  }, [active, camera])
}

export function AboutCameraController({ active }) {
  useAboutCamera(active)
  return null
}

// Curved sail geometry generator — physical billow
function createSailGeometry(W, H, seg) {
  const geo = new THREE.PlaneGeometry(W, H, seg, seg)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const nx = x / (W / 2)  
    const ny = y / (H / 2)  
    const bulge = (1 - nx * nx) * (1 - ny * ny * 0.3) * (W * 0.16)
    pos.setZ(i, bulge)
  }
  geo.computeVertexNormals()
  return geo
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D ANIMATED SAIL COMPONENT WITH TEXTURE BAKING & VERTEX SHADER
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedSail({ position = [0, 20.5, -2.5] }) {
  const meshRef = useRef()
  const customMaterialRef = useRef(null)

  // Setup canvas pipeline context
  const [canvas, sailTex] = useMemo(() => {
    const W = 2048, H = 1400
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const tex = new THREE.CanvasTexture(canvas)
    tex.flipY = false
    tex.colorSpace = THREE.SRGBColorSpace
    return [canvas, tex]
  }, [])

  const sailGeo = useMemo(() => createSailGeometry(18, 14, 32), [])

  // Dynamic drawing layer to burn text/images into the texture canvas
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const drawTexture = (loadedImg = null) => {
      // 1. Base aged linen canvas color
      ctx.fillStyle = '#e5d4a9'
      ctx.fillRect(0, 0, W, H)

      // 2. Vertical weave/rope stitch structures
      ctx.strokeStyle = 'rgba(92, 64, 26, 0.12)'
      ctx.lineWidth = 3
      for (let x = 0; x <= W; x += W / 14) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }

      // 3. Structural canvas noise grain
      for (let i = 0; i < 22000; i++) {
        const x = Math.random() * W, y = Math.random() * H
        ctx.fillStyle = `rgba(60, 40, 15, ${Math.random() * 0.055})`
        ctx.fillRect(x, y, 1.5, 1.5)
      }

      // 4. Bulge lighting / Vignette shadows
      const edgeGrad = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.85)
      edgeGrad.addColorStop(0, 'rgba(255, 248, 220, 0.15)')
      edgeGrad.addColorStop(1, 'rgba(48, 30, 10, 0.32)')
      ctx.fillStyle = edgeGrad
      ctx.fillRect(0, 0, W, H)

      // 5. Rope Borders
      ctx.strokeStyle = 'rgba(78, 51, 19, 0.35)'
      ctx.lineWidth = 5
      ctx.strokeRect(55, 55, W - 110, H - 110)

      // 6. Corner Anchors
      const drawAnchor = (cx, cy, size) => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.strokeStyle = 'rgba(48, 30, 10, 0.45)'
        ctx.lineWidth = size * 0.08
        ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(0, -size*0.35, size*0.22, 0, Math.PI*2); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, -size*0.13); ctx.lineTo(0, size*0.52); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-size*0.28, size*0.05); ctx.lineTo(size*0.28, size*0.05); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, size*0.52); ctx.bezierCurveTo(-size*0.06, size*0.42, -size*0.3, size*0.38, -size*0.28, size*0.52); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, size*0.52); ctx.bezierCurveTo(size*0.06, size*0.42, size*0.3, size*0.38, size*0.28, size*0.52); ctx.stroke()
        ctx.restore()
      }
      drawAnchor(110, 110, 65)
      drawAnchor(W - 110, 110, 65)
      drawAnchor(110, H - 110, 65)
      drawAnchor(W - 110, H - 110, 65)

      // 7. Typography (Burned Typography Aesthetics)
      ctx.fillStyle = '#1c1004'
      ctx.font = `bold 125px "Georgia", serif`
      ctx.fillText(ABOUT.title, 130, 220)

      ctx.font = `italic 46px "Georgia", serif`
      ctx.fillStyle = 'rgba(28, 16, 4, 0.85)'
      ctx.fillText(ABOUT.tagline1, 130, 305)
      ctx.font = `italic 38px "Georgia", serif`
      ctx.fillStyle = 'rgba(28, 16, 4, 0.65)'
      ctx.fillText(ABOUT.tagline2, 130, 365)

      ctx.strokeStyle = 'rgba(78, 51, 19, 0.25)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(130, 410); ctx.lineTo(W * 0.58, 410); ctx.stroke()

      // Paragraph wrapping configurations
      ctx.font = `600 36px "Georgia", serif`
      ctx.fillStyle = 'rgba(28, 16, 4, 0.88)'
      let py = 475
      
      // Map multi-line text arrays safely onto texture layout maps
      const lines = [
        'Currently 2nd year at VIT Vellore —',
        'working full-time at a startup since day one.',
        '',
        "I'm obsessed with building things that feel alive —",
        'interfaces that respond, systems that think,',
        'and experiences that people remember.',
        'This portfolio is one of those things.',
        '',
        "When I'm not shipping code or pushing pixels,",
        "I'm going deep on AI/ML theory,",
        'blockchain fundamentals, or thinking about',
        'the next thing worth building.',
        '',
        "The ship you're exploring? That's how my brain works —",
        'everything connected, every section with a reason',
        'for being exactly where it is.',
      ]

      lines.forEach(line => {
        if (line === '') { py += 25; return }
        ctx.fillText(line, 130, py)
        py += 52
      })

      // Decorative divider ornament
      ctx.strokeStyle = 'rgba(78, 51, 19, 0.4)'
      ctx.lineWidth = 1.5
      const ox = 130, oy = H - 165, ow = 180
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + ow, oy); ctx.stroke()
      ctx.beginPath(); ctx.arc(ox + ow + 15, oy, 6, 0, Math.PI*2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ox + ow + 30, oy); ctx.lineTo(ox + ow*2 + 30, oy); ctx.stroke()

      // 8. Dynamic Photo Processing & Multiplying (Burned ink effect)
      if (loadedImg) {
        ctx.save()
        const imgW = 540
        const imgH = H - 320
        const imgX = W - imgW - 130
        const imgY = 160

        // Create canvas clipping path for vintage photography shape
        ctx.beginPath()
        ctx.rect(imgX, imgY, imgW, imgH)
        ctx.clip()

        ctx.drawImage(loadedImg, imgX, imgY, imgW, imgH)

        // Apply dark sepia tone transformation variables
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = '#9c8259'
        ctx.fillRect(imgX, imgY, imgW, imgH)

        ctx.globalCompositeOperation = 'source-over'
        // Soft vignette edge gradient blend
        const photoVignette = ctx.createRadialGradient(
          imgX + imgW/2, imgY + imgH/2, imgW * 0.3,
          imgX + imgW/2, imgY + imgH/2, imgW * 0.55
        )
        photoVignette.addColorStop(0, 'rgba(229, 212, 169, 0)')
        photoVignette.addColorStop(1, '#e5d4a9')
        ctx.fillStyle = photoVignette
        ctx.fillRect(imgX, imgY, imgW, imgH)

        ctx.restore()
      }

      sailTex.needsUpdate = true
    }

    // Initialize map texture blueprint
    drawTexture()

    // Async Asset pipeline initialization
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = ABOUT.photo
    img.onload = () => drawTexture(img)
  }, [canvas, sailTex])

  // Custom vertex compilation hook mapping physical movement values (Wind Ripples)
  useFrame((state) => {
    if (customMaterialRef.current) {
      customMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  return (
    <group position={position}>
      {/* Structural Spars */}
      <mesh position={[0, 7.2, -0.3]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 19.5, 10]} rotation={[0, 0, Math.PI/2]} />
        <meshStandardMaterial color="#211003" roughness={0.8} />
      </mesh>
      <mesh position={[0, -7.2, -0.3]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 18, 10]} rotation={[0, 0, Math.PI/2]} />
        <meshStandardMaterial color="#211003" roughness={0.8} />
      </mesh>

      {/* THE 3D BILLOWING CANVAS OBJECT */}
      <mesh ref={meshRef} geometry={sailGeo} castShadow receiveShadow>
        <meshStandardMaterial
          map={sailTex}
          roughness={0.95}
          metalness={0.0}
          side={THREE.FrontSide}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = { value: 0 }
            shader.vertexShader = `
              uniform float uTime;
            ` + shader.vertexShader
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `
                #include <begin_vertex>
                // Sine/Cosine structural wave variations mimicking standard naval animations
                float waveX = sin(position.x * 0.22 + uTime * 2.2) * cos(position.y * 0.15 + uTime * 1.2) * 0.08;
                float waveY = cos(position.y * 0.35 + uTime * 1.8) * 0.04;
                transformed.z += waveX + waveY;
                transformed.x += sin(position.y * 0.1 + uTime * 0.5) * 0.02;
              `
            )
            customMaterialRef.current = shader
          }}
        />
      </mesh>

      {/* Ring Grommets */}
      {[-8,-5.5,-3,-0.5,2,4.5,7,9].map((x, i) => (
        <mesh key={i} position={[x, 6.9, 0.1]} castShadow>
          <torusGeometry args={[0.16, 0.04, 8, 16]} />
          <meshStandardMaterial color="#4a3611" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSITIONS & ATMOSPHERIC MODULES (STAY IN HTML OVERLAY LAYER)
// ─────────────────────────────────────────────────────────────────────────────
export function AboutTransitionOverlay({ active }) {
  const [show, setShow] = useState(false)
  const [op, setOp] = useState(0)

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
  }, [active, show])

  if (!show) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 240, pointerEvents: 'none', opacity: op,
      transition: 'opacity 320ms ease',
      background: 'radial-gradient(circle at center, rgba(240,221,182,0.25), rgba(0,0,0,0.55))',
    }} />
  )
}

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
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 245, pointerEvents: 'none', opacity: phase === 'visible' ? 1 : 0,
      transition: 'opacity 360ms ease', color: 'rgba(243,227,194,0.22)',
      fontFamily: '"IM Fell English SC", Georgia, serif', fontSize: 'clamp(40px, 8vw, 88px)',
      letterSpacing: '0.24em', textTransform: 'uppercase', textShadow: '0 0 26px rgba(255,243,216,0.1)',
    }}>
      {label}
    </div>
  )
}

export function WindCompass({ visible }) {
  const needleRef = useRef()
  const angleRef  = useRef(38)
  const targetRef = useRef(38)

  useEffect(() => {
    const id = setInterval(() => {
      targetRef.current += (Math.random() - 0.5) * 12
      targetRef.current  = Math.max(-150, Math.min(150, targetRef.current))
    }, 2600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let raf
    const tick = () => {
      angleRef.current += (targetRef.current - angleRef.current) * 0.025
      if (needleRef.current) needleRef.current.style.transform = `rotate(${angleRef.current}deg)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', top: '22px', right: '22px', width: '54px', height: '54px', zIndex: 150,
      borderRadius: '50%', border: '1px solid rgba(240,218,174,0.24)', background: 'rgba(24,17,8,0.68)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(240,218,174,0.18)" strokeWidth="1"/>
        {[{l:'N',x:22,y:6},{l:'S',x:22,y:40},{l:'E',x:39,y:24},{l:'W',x:5,y:24}].map(({l,x,y})=>(
          <text key={l} x={x} y={y} textAnchor="middle" style={{ fontFamily:'Georgia,serif', fontSize:'6px', fill:'rgba(240,218,174,0.44)' }}>{l}</text>
        ))}
      </svg>
      <div ref={needleRef} style={{ position:'absolute', width:'2px', height:'30px', display:'flex', flexDirection:'column', alignItems:'center', transformOrigin:'center center' }}>
        <div style={{ width:0, height:0, borderLeft:'3px solid transparent', borderRight:'3px solid transparent', borderBottom:'11px solid #bf5c36' }}/>
        <div style={{ width:'2px', flex:1, background:'rgba(248,237,214,0.62)' }}/>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPARENT INTERACTION HOOK OVERLAY (NO VISIBLE TEXT / PANEL)
// ─────────────────────────────────────────────────────────────────────────────
function SailInteractiveOverlay({ active, onClose }) {
  const [showUI, setShowUI] = useState(false)
  const [hov, setHov]       = useState(null)

  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setShowUI(true), 1950) // Displays buttons exactly when camera locks front-on
      return () => clearTimeout(t)
    } else {
      setShowUI(false)
    }
  }, [active])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && active) onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [active, onClose])

  if (!active) return null

  return (
    <>
      {/* Click outside boundaries to close view */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 215, cursor: 'pointer' }} />

      {/* Completely transparent link wrapper positioned over the 3D canvas dimensions */}
      <div style={{
        position: 'fixed', top: '7%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 220, width: 'clamp(560px, 80vw, 1140px)', height: '65vh',
        pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        paddingLeft: 'clamp(28px, 4.2vw, 55px)', paddingBottom: 'clamp(20px, 3.2vh, 42px)'
      }}>
        
        {/* Close Button mapping */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px', pointerEvents: 'all', zIndex: 230,
            width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(48,30,10,0.3)',
            background: 'transparent', color: 'rgba(48,30,10,0.6)', fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
            opacity: showUI ? 1 : 0, transform: showUI ? 'scale(1)' : 'scale(0)'
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(48,30,10,0.1)'; e.target.style.color = '#1c1004' }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(48,30,10,0.6)' }}
        >✕</button>

        {/* Interactive Social Buttons precisely over the printed textures below */}
        <div style={{ display: 'flex', gap: 'clamp(15px, 2.8vw, 42px)', opacity: showUI ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: 'all' }}>
          {ABOUT.links.map((link, i) => (
            <a
              key={link.label} href={link.href} target="_blank" rel="noreferrer"
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(14px, 1.3vw, 19px)',
                fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: hov === i ? '#1c1004' : 'rgba(48, 30, 10, 0.45)',
                borderBottom: hov === i ? '1.5px solid #1c1004' : '1.5px solid transparent',
                transition: 'all 0.2s ease', paddingBottom: '2px',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Floating navigation utility string indicator */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 260,
        padding: '9px 20px', borderRadius: '999px', border: '1px solid rgba(232,206,158,0.2)',
        background: 'rgba(18,12,6,0.65)', color: 'rgba(244,225,187,0.85)',
        fontFamily: '"IM Fell English SC", Georgia, serif', fontSize: '11px', letterSpacing: '0.15em',
        backdropFilter: 'blur(6px)', pointerEvents: 'none', opacity: showUI ? 1 : 0, transition: 'opacity 0.4s ease'
      }}>
        CLICK ANYWHERE · PRESS ESC TO RETURN
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function AboutSection({ active, onClose }) {
  return <SailInteractiveOverlay active={active} onClose={onClose} />
}