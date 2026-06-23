/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ABOUT SECTION — Grand Line Portfolio (High-Res 3D Crisp Sail)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { PROFILE } from '../data/profile.js'
let _sailTexCache = null
let _blankTexCache = null

const ABOUT = {
  title:    "I'M SHAURYA.",
  tagline1: 'I build things that look good and work well.',
  tagline2: 'Designer by instinct. Developer by choice. AI/ML by curiosity.',
  photo: '/shaurya.png', 
  links: [
    { label: 'GitHub',   href: PROFILE.links.github   },
    { label: 'LinkedIn', href: PROFILE.links.linkedin  },
    { label: 'Resume',   href: PROFILE.links.resume    },
  ],
}

// Precise camera angles for the 4:3 aspect sail layout
const CAM_EXPLORE = { position: new THREE.Vector3(0, 8.5, 16), target: new THREE.Vector3(0, 1.5, 0), fov: 68 }
const CAM_ABOUT   = { position: new THREE.Vector3(0, 20.2, 33.5), target: new THREE.Vector3(0, 16.5, -1.8), fov: 26 }

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
      duration: active ? 2.0 : 1.5,
      ease:     'power3.inOut',
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

// Generates sail geometry with clean 3D curvature billow
function createSailGeometry(W, H, seg) {
  const geo = new THREE.PlaneGeometry(W, H, seg, seg)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const nx = x / (W / 2)  
    const ny = y / (H / 2)  
    const bulge = (1 - nx * nx) * (1 - ny * ny * 0.25) * (W * 0.12)
    pos.setZ(i, bulge)
  }
  geo.computeVertexNormals()
  return geo
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D SAIL COMPONENT WITH CRISP ANTI-ALIASED TEXTURE PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedSail({ position = [0, 20.5, -2.5] }) {
  const meshRef = useRef()

  const sailGeo = useMemo(() => {
    const W = 18, H = 14, seg = 32
    const geo = new THREE.PlaneGeometry(W, H, seg, seg)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const nx = x / (W / 2)
      const ny = y / (H / 2)
      const bulge = (1 - nx * nx) * (1 - ny * ny * 0.18) * (W * 0.28)
      pos.setZ(i, bulge)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  const [aboutTex, setAboutTex] = useState(null)

  useEffect(() => {
    const W = 2048, H = 1400
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    const drawAll = (photoImg) => {
    // Base linen
    const baseGrad = ctx.createLinearGradient(0, 0, W, H)
    baseGrad.addColorStop(0,   '#ece0bc')
    baseGrad.addColorStop(0.35,'#ece0bc')
    baseGrad.addColorStop(0.65,'#ece0bc')
    baseGrad.addColorStop(1,   '#ece0bc')
    ctx.fillStyle = baseGrad
    ctx.fillRect(0, 0, W, H)

    // Vertical rope stitch lines
    ctx.strokeStyle = 'rgba(90,60,22,0.13)'
    ctx.lineWidth = 2
    for (let x = 0; x <= W; x += W / 13) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }

    // Grain noise
    for (let i = 0; i < 22000; i++) {
      const x = Math.random() * W, y = Math.random() * H
      ctx.fillStyle = `rgba(70,48,18,${Math.random() * 0.04})`
      ctx.fillRect(x, y, 1.5, 1.5)
    }

    // Edge vignette (removed for even color)
    // const vg = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.85)
    // vg.addColorStop(0, 'rgba(255,245,220,0.10)')
    // vg.addColorStop(1, 'rgba(50,30,8,0.28)')
    // ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H)

    // Border rope line
    ctx.strokeStyle = 'rgba(80,55,18,0.30)'; ctx.lineWidth = 5
    ctx.strokeRect(55, 55, W - 110, H - 110)

    // Anchor corners
    const drawAnchor = (cx, cy, size) => {
      ctx.save(); ctx.translate(cx, cy)
      ctx.strokeStyle = 'rgba(55,35,10,0.40)'
      ctx.lineWidth = size * 0.09; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.arc(0, -size*0.35, size*0.22, 0, Math.PI*2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, -size*0.13); ctx.lineTo(0, size*0.52); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(-size*0.28, size*0.05); ctx.lineTo(size*0.28, size*0.05); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, size*0.52)
        ctx.bezierCurveTo(-size*0.06, size*0.42, -size*0.30, size*0.38, -size*0.28, size*0.52); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, size*0.52)
        ctx.bezierCurveTo(size*0.06, size*0.42, size*0.30, size*0.38, size*0.28, size*0.52); ctx.stroke()
      ctx.restore()
    }
    drawAnchor(105, 100, 68); drawAnchor(W-105, 100, 68)
    drawAnchor(105, H-100, 68); drawAnchor(W-105, H-100, 68)

    // ── PHOTO — right half, sepia blended ──
    if (photoImg) {
      const px = W * 0.54, py = 80
      const pw = W * 0.42, ph = H - 160
      // Save and clip to right zone
      ctx.save()
      ctx.globalAlpha = 0.78
      ctx.filter = 'sepia(85%) contrast(1.05) brightness(0.88) saturate(0.6)'
      // Draw photo filling right side
      const imgAspect = photoImg.naturalWidth / photoImg.naturalHeight
      const drawH = ph
      const drawW = drawH * imgAspect
      const drawX = px + (pw - drawW) / 2
      ctx.drawImage(photoImg, drawX, py, drawW, drawH)
      ctx.filter = 'none'
      ctx.globalAlpha = 1

      // Blend gradients removed for even color
      // const fadeGrad = ctx.createLinearGradient(px, 0, px + pw * 0.45, 0)
      // fadeGrad.addColorStop(0, 'rgba(232,217,176,1)')
      // fadeGrad.addColorStop(0.6,'rgba(232,217,176,0.4)')
      // fadeGrad.addColorStop(1,  'rgba(232,217,176,0)')
      // ctx.fillStyle = fadeGrad
      // ctx.fillRect(px, py, pw * 0.45, ph)

      // const fadeBot = ctx.createLinearGradient(0, py + ph - ph*0.22, 0, py + ph)
      // fadeBot.addColorStop(0, 'rgba(232,217,176,0)')
      // fadeBot.addColorStop(1, 'rgba(232,217,176,1)')
      // ctx.fillStyle = fadeBot
      // ctx.fillRect(px, py + ph - ph*0.22, pw, ph*0.22)
    }

    // ── TEXT — left 52% ──
    // Title
    ctx.fillStyle = '#100800'
    ctx.font = 'bold 128px Georgia, serif'
    ctx.fillText("I'M SHAURYA.", 118, 195)

    // Taglines
    ctx.font = 'italic 50px Georgia, serif'
    ctx.fillStyle = 'rgba(20,10,2,0.80)'
    ctx.fillText('I build things that look good and work well.', 118, 268)
    ctx.font = 'italic 42px Georgia, serif'
    ctx.fillStyle = 'rgba(20,10,2,0.65)'
    ctx.fillText('Designer by instinct. Developer by choice. AI/ML by curiosity.', 118, 325)

    // Separator
    ctx.strokeStyle = 'rgba(60,38,12,0.38)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(118, 352); ctx.lineTo(W*0.50, 352); ctx.stroke()

    // Bio paragraphs
    const lines = [
      'Currently 3rd year at VIT Vellore —',
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
    ctx.font = '44px Georgia, serif'
    ctx.fillStyle = 'rgba(18,8,1,0.85)'
    let py2 = 408
    lines.forEach(line => {
      if (line === '') { py2 += 22; return }
      ctx.fillText(line, 118, py2); py2 += 57
    })

    // Ornament divider
    ctx.strokeStyle = 'rgba(70,45,15,0.50)'; ctx.lineWidth = 1.5
    const ox = 160, oy = H - 120, ow = 200
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox+ow, oy); ctx.stroke()
    ctx.beginPath(); ctx.arc(ox+ow+16, oy, 7, 0, Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(ox+ow+33, oy); ctx.lineTo(ox+ow*2+33, oy); ctx.stroke()

    // Grommets along top
    for (let gx = 0.06; gx <= 0.94; gx += 0.085) {
      ctx.beginPath(); ctx.arc(W*gx, 28, 10, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(50,30,10,0.55)'; ctx.fill()
      ctx.beginPath(); ctx.arc(W*gx, 28, 6, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(25,14,4,0.75)'; ctx.fill()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    setAboutTex(tex)
    }

    // Load photo then draw
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => drawAll(img)
    img.onerror = () => drawAll(null) // draw without photo if it fails
    img.src = '/image copy.png'
  }, [])

  // Blank linen sail texture (for the other two sails)
  const blankTex = useMemo(() => {
    const W = 1024, H = 800
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Base warm linen ──
  const baseGrad = ctx.createLinearGradient(0, 0, W, H)
  baseGrad.addColorStop(0,   '#f0e6c8')
  baseGrad.addColorStop(0.5, '#e8d9b0')
  baseGrad.addColorStop(1,   '#e0cfa0')
  ctx.fillStyle = baseGrad
  ctx.fillRect(0, 0, W, H)

  // ── Vertical rope stitch lines ──
  ctx.strokeStyle = 'rgba(90,60,22,0.10)'
  ctx.lineWidth = 1.5
  for (let x = 0; x <= W; x += W / 12) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }

  // ── Grain noise ──
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * W, y = Math.random() * H
    ctx.fillStyle = `rgba(70,48,18,${Math.random() * 0.035})`
    ctx.fillRect(x, y, 1.2, 1.2)
  }

  // ── Edge vignette ──
  const vg = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.82)
  vg.addColorStop(0, 'rgba(255,248,225,0.12)')
  vg.addColorStop(1, 'rgba(45,26,6,0.26)')
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H)

  // ── Border ──
  ctx.strokeStyle = 'rgba(80,52,16,0.28)'; ctx.lineWidth = 4
  ctx.strokeRect(40, 40, W-80, H-80)
  ctx.strokeStyle = 'rgba(80,52,16,0.14)'; ctx.lineWidth = 1.5
  ctx.strokeRect(52, 52, W-104, H-104)

  // ── Anchor corners ──
  const drawAnchor = (cx, cy, size) => {
    ctx.save(); ctx.translate(cx, cy)
    ctx.strokeStyle = 'rgba(55,35,10,0.35)'
    ctx.lineWidth = size * 0.09; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(0, -size*0.35, size*0.22, 0, Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, -size*0.13); ctx.lineTo(0, size*0.52); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(-size*0.28, size*0.05); ctx.lineTo(size*0.28, size*0.05); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, size*0.52)
    ctx.bezierCurveTo(-size*0.06, size*0.42, -size*0.30, size*0.38, -size*0.28, size*0.52); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, size*0.52)
    ctx.bezierCurveTo(size*0.06, size*0.42, size*0.30, size*0.38, size*0.28, size*0.52); ctx.stroke()
    ctx.restore()
  }
  drawAnchor(75, 72, 44); drawAnchor(W-75, 72, 44)
  drawAnchor(75, H-72, 44); drawAnchor(W-75, H-72, 44)

  // ── Grommets along top ──
  for (let gx = 0.06; gx <= 0.94; gx += 0.10) {
    ctx.beginPath(); ctx.arc(W*gx, 20, 8, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(45,26,8,0.52)'; ctx.fill()
    ctx.beginPath(); ctx.arc(W*gx, 20, 5, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(20,10,2,0.72)'; ctx.fill()
  }

  // ════════════════════════════════
  // COMPASS ROSE — center of sail
  // ════════════════════════════════
  const cx = W / 2, cy = H / 2 + 30
  const R = 210  // outer radius

  // Outer decorative rings
  ctx.strokeStyle = 'rgba(55,35,10,0.22)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, cy, R + 12, 0, Math.PI*2); ctx.stroke()
  ctx.strokeStyle = 'rgba(55,35,10,0.12)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(cx, cy, R + 22, 0, Math.PI*2); ctx.stroke()

  // Degree tick marks around outer ring
  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180
    const isMain = deg % 45 === 0
    const isMed  = deg % 15 === 0
    const r1 = R + 12
    const r2 = isMain ? R - 8 : isMed ? R + 4 : R + 8
    ctx.strokeStyle = isMain
      ? 'rgba(55,35,10,0.55)'
      : 'rgba(55,35,10,0.22)'
    ctx.lineWidth = isMain ? 2 : 1
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(rad)*r1, cy + Math.sin(rad)*r1)
    ctx.lineTo(cx + Math.cos(rad)*r2, cy + Math.sin(rad)*r2)
    ctx.stroke()
  }

  // 16-point star base (alternating long/short)
  const drawStar = (points, outerR, innerR, color, alpha) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    ctx.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2
      const r = i % 2 === 0 ? outerR : innerR
      i === 0
        ? ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r)
        : ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r)
    }
    ctx.closePath(); ctx.fill()
    ctx.globalAlpha = 1; ctx.restore()
  }

  // Shadow star
  ctx.save(); ctx.translate(3, 5)
  drawStar(8, R * 0.82, R * 0.12, 'rgba(30,16,4,0.18)', 1)
  ctx.restore()

  // Main 8-point compass star — dark ink
  drawStar(8, R * 0.82, R * 0.12, '#2a1505', 0.72)

  // Inner 8-point star — rotated 22.5°, lighter
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI/8); ctx.translate(-cx, -cy)
  drawStar(8, R * 0.55, R * 0.10, '#3d2008', 0.55)
  ctx.restore()

  // Inner decorative rings
  ctx.strokeStyle = 'rgba(55,35,10,0.38)'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.30, 0, Math.PI*2); ctx.stroke()
  ctx.strokeStyle = 'rgba(55,35,10,0.22)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.20, 0, Math.PI*2); ctx.stroke()

  // Center hub
  const hubGrad = ctx.createRadialGradient(cx-4, cy-4, 2, cx, cy, R*0.14)
  hubGrad.addColorStop(0, 'rgba(200,170,110,0.9)')
  hubGrad.addColorStop(1, 'rgba(80,48,14,0.85)')
  ctx.fillStyle = hubGrad
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.13, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = 'rgba(40,20,4,0.60)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.13, 0, Math.PI*2); ctx.stroke()

  // Center dot
  ctx.fillStyle = 'rgba(20,10,2,0.85)'
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.04, 0, Math.PI*2); ctx.fill()

  // Cardinal direction labels — N S E W
  const dirs = [
    { label: 'N', angle: -Math.PI/2, dist: R * 0.92 },
    { label: 'S', angle:  Math.PI/2, dist: R * 0.92 },
    { label: 'E', angle:  0,         dist: R * 0.92 },
    { label: 'W', angle:  Math.PI,   dist: R * 0.92 },
  ]
  ctx.font = 'bold 52px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  dirs.forEach(({ label, angle, dist }) => {
    const x = cx + Math.cos(angle) * dist
    const y = cy + Math.sin(angle) * dist
    // shadow
    ctx.fillStyle = 'rgba(220,200,160,0.7)'
    ctx.fillText(label, x+2, y+2)
    // main
    ctx.fillStyle = 'rgba(22,10,2,0.88)'
    ctx.fillText(label, x, y)
  })

  // Intercardinal labels — NE NW SE SW (smaller)
  const interDirs = [
    { label: 'NE', angle: -Math.PI/4 },
    { label: 'NW', angle: -3*Math.PI/4 },
    { label: 'SE', angle:  Math.PI/4 },
    { label: 'SW', angle:  3*Math.PI/4 },
  ]
  ctx.font = 'bold 30px Georgia, serif'
  interDirs.forEach(({ label, angle }) => {
    const x = cx + Math.cos(angle) * (R * 0.88)
    const y = cy + Math.sin(angle) * (R * 0.88)
    ctx.fillStyle = 'rgba(22,10,2,0.65)'
    ctx.fillText(label, x, y)
  })

  // ── TOP TITLE: "GRAND LINE" ──
  ctx.font = 'bold 68px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '6px'
  // shadow
  ctx.fillStyle = 'rgba(180,155,100,0.5)'
  ctx.fillText('GRAND  LINE', cx+2, 118)
  // main
  ctx.fillStyle = 'rgba(18,8,1,0.88)'
  ctx.fillText('GRAND  LINE', cx, 116)

  // thin rule under title
  ctx.strokeStyle = 'rgba(60,38,12,0.35)'; ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 200, 138); ctx.lineTo(cx + 200, 138)
  ctx.stroke()

  // ── BOTTOM tagline ──
  ctx.font = 'italic 32px Georgia, serif'
  ctx.fillStyle = 'rgba(22,10,2,0.55)'
  ctx.fillText('— charting unknown waters —', cx, H - 72)

  // Grommets along top (redraw on top of everything)
  for (let gx = 0.06; gx <= 0.94; gx += 0.10) {
    ctx.beginPath(); ctx.arc(W*gx, 20, 8, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(45,26,8,0.55)'; ctx.fill()
    ctx.beginPath(); ctx.arc(W*gx, 20, 5, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(20,10,2,0.75)'; ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}, [])

  // Shared curved geometry for side/fore sails
  const sideGeo = useMemo(() => {
    const W = 16, H = 9, seg = 24
    const geo = new THREE.PlaneGeometry(W, H, seg, seg)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      const nx = x/(W/2), ny = y/(H/2)
      const bulge = (1 - nx*nx) * (1 - ny*ny*0.20) * (W*0.22)
      pos.setZ(i, bulge)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group>
      {/* ── MAIN SAIL — about content ── */}
      <group position={position}>
        {/* Top spar */}
        <mesh position={[0, 7.2, -0.4]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 19.5, 10]} rotation={[0,0,Math.PI/2]} />
          <meshStandardMaterial color="#2a1505" roughness={0.78} />
        </mesh>
        {/* Bottom spar */}
        <mesh position={[0, -7.2, -0.4]} castShadow>
          <cylinderGeometry args={[0.10, 0.10, 18.5, 10]} rotation={[0,0,Math.PI/2]} />
          <meshStandardMaterial color="#2a1505" roughness={0.78} />
        </mesh>
        {/* Sail cloth with about content */}
        {aboutTex && (
  <mesh ref={meshRef} geometry={sailGeo} castShadow receiveShadow>
    <meshStandardMaterial map={aboutTex} roughness={0.90} metalness={0.0} side={THREE.DoubleSide} />
  </mesh>
)}
        {/* Grommets */}
        {[-8.5,-6,-3.5,-1,1.5,4,6.5,9].map((x,i) => (
          <mesh key={i} position={[x, 6.85, 0.15]} castShadow>
            <torusGeometry args={[0.16, 0.04, 8, 14]} />
            <meshStandardMaterial color="#3d1a00" roughness={0.5} metalness={0.35} />
          </mesh>
        ))}
      </group>

      {/* ── FORE SAIL — plain linen ── */}
<group position={[0, 13.5, -19]}>
  <mesh castShadow receiveShadow>
    <primitive object={sideGeo} />
    <meshStandardMaterial map={blankTex} roughness={0.90} metalness={0.0} side={THREE.DoubleSide} />
  </mesh>
  {/* Top spar */}
  <mesh position={[0, 4.2, -0.3]} castShadow>
    <cylinderGeometry args={[0.10, 0.10, 15, 8]} rotation={[0,0,Math.PI/2]} />
    <meshStandardMaterial color="#2a1505" roughness={0.78} />
  </mesh>
  {/* Bottom spar */}
  <mesh position={[0, -4.2, -0.3]} castShadow>
    <cylinderGeometry args={[0.08, 0.08, 13, 8]} rotation={[0,0,Math.PI/2]} />
    <meshStandardMaterial color="#2a1505" roughness={0.78} />
  </mesh>
  {[-5,-2.5,0,2.5,5].map((x,i) => (
    <mesh key={i} position={[x, 3.9, 0.1]} castShadow>
      <torusGeometry args={[0.12, 0.03, 7, 12]} />
      <meshStandardMaterial color="#3d1a00" roughness={0.5} metalness={0.3} />
    </mesh>
  ))}
</group>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPARENT CLICK OUTSIDE INTERACTION HANDLING
// ─────────────────────────────────────────────────────────────────────────────
function SailInteractiveOverlay({ active, onClose }) {
  const [showUI, setShowUI] = useState(false)
  const [hov, setHov]       = useState(null)

  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setShowUI(true), 1800)
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 215, cursor: 'pointer' }} />

      <div style={{
        position: 'fixed', top: '9%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 220, width: 'clamp(540px, 78vw, 1100px)', height: '62vh',
        pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        paddingLeft: 'clamp(24px, 4vw, 50px)', paddingBottom: 'clamp(18px, 3vh, 38px)'
      }}>
        
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

        <div style={{ display: 'flex', gap: 'clamp(15px, 2.5vw, 40px)', opacity: showUI ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: 'all' }}>
          {ABOUT.links.map((link, i) => (
            <a
              key={link.label} href={link.href} target="_blank" rel="noreferrer"
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(14px, 1.2vw, 18px)',
                fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: hov === i ? '#1a0f05' : 'rgba(48, 30, 10, 0.45)',
                borderBottom: hov === i ? '1.5px solid #1a0f05' : '1.5px solid transparent',
                transition: 'all 0.2s ease', paddingBottom: '2px',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

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

export function AboutTransitionOverlay({ active }) { return null }
export function SectionTransitionLabel({ active }) { return null }
export function WindCompass({ visible }) { return null }

// REPLACE the entire default export at the bottom:
export default function AboutSection({ active, onClose }) {
  return null
}
