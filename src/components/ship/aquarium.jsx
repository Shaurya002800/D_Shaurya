import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animated fish swimming around the aquarium room.
export function Fish({ color = '#ff6b35', startPos = [0, 0, 0], speed = 0.4, radius = 3, yOffset = 0 }) {
  const ref = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const yWave = useMemo(() => 0.5 + Math.random() * 0.5, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase
    if (!ref.current) return
    ref.current.position.x = startPos[0] + Math.cos(t) * radius
    ref.current.position.y = startPos[1] + Math.sin(t * 0.5) * yWave + yOffset
    ref.current.position.z = startPos[2] + Math.sin(t) * radius * 0.6
    ref.current.rotation.y = -t + Math.PI / 2
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.22, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <coneGeometry args={[0.10, 0.24, 5]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

// Rising bubble — runs on every 3rd frame to stay cheap.
export function Bubble({ startPos, speed = 0.35 }) {
  const ref = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const xWobble = useMemo(() => (Math.random() - 0.5) * 0.5, [])
  const frameCount = useRef(0)

  useFrame(({ clock }) => {
    frameCount.current++
    if (frameCount.current % 3 !== 0) return
    if (!ref.current) return
    const t = clock.getElapsedTime() * speed + phase
    ref.current.position.y = startPos[1] + ((t * 1.0) % 7)
    ref.current.position.x = startPos[0] + Math.sin(t * 2) * xWobble
  })

  return (
    <mesh ref={ref} position={startPos}>
      <sphereGeometry args={[0.04 + Math.random() * 0.04, 5, 5]} />
      <meshStandardMaterial color="#88ddff" transparent opacity={0.3} emissive="#44aaff" emissiveIntensity={0.1} />
    </mesh>
  )
}

// Animated canvas texture used by DigitalScreen — scanlines, typing cursor,
// live "data" readouts. The static background is baked once into a separate
// canvas and stamped each frame to keep the per-frame cost low.
function useDigitalScreenTexture(project) {
  const canvasRef = useRef(null)
  const texRef = useRef(null)
  const staticRef = useRef(null)
  const frameRef = useRef(0)
  const cursorOn = useRef(true)
  const cursorTick = useRef(0)
  const scrollRef = useRef(0)
  const initRef = useRef(false)

  if (!canvasRef.current) {
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 640
    canvasRef.current = c
    texRef.current = new THREE.CanvasTexture(c)
  }

  const bakeStatic = () => {
    const s = document.createElement('canvas')
    s.width = 1024; s.height = 640
    const sx = s.getContext('2d')
    const W = s.width, H = s.height

    sx.fillStyle = '#061828'
    sx.fillRect(0, 0, W, H)

    sx.strokeStyle = 'rgba(0,180,255,0.04)'
    sx.lineWidth = 1
    for (let x = 0; x < W; x += 40) { sx.beginPath(); sx.moveTo(x, 0); sx.lineTo(x, H); sx.stroke() }
    for (let y = 0; y < H; y += 40) { sx.beginPath(); sx.moveTo(0, y); sx.lineTo(W, y); sx.stroke() }

    sx.fillStyle = 'rgba(0,0,0,0.10)'
    for (let y = 0; y < H; y += 4) sx.fillRect(0, y, W, 2)

    sx.strokeStyle = 'rgba(255,255,255,0.06)'
    sx.lineWidth = 1
    sx.strokeRect(18, 18, W - 36, H - 36)

    staticRef.current = s
  }

  useFrame(({ clock }) => {
    if (!initRef.current) {
      bakeStatic()
      if (texRef.current) texRef.current.needsUpdate = true
      initRef.current = true
    }

    const canvas = canvasRef.current
    const tex = texRef.current
    if (!canvas || !tex || !staticRef.current) return

    const t = clock.getElapsedTime()
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    frameRef.current++

    ctx.drawImage(staticRef.current, 0, 0)

    const pulse = 0.5 + 0.5 * Math.sin(t * 2.0)
    ctx.save()
    ctx.shadowColor = project.color
    ctx.shadowBlur = 12 * pulse
    ctx.strokeStyle = project.color
    ctx.lineWidth = 2.5
    ctx.strokeRect(10, 10, W - 20, H - 20)
    ctx.restore()

    ctx.fillStyle = project.color
    ctx.globalAlpha = 0.8
    ctx.fillRect(10, 10, W - 20, 4)
    ctx.globalAlpha = 1

    ctx.font = 'bold 62px "Courier New", monospace'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(project.name, 38, 102)

    ctx.font = 'bold 20px "Courier New", monospace'
    ctx.fillStyle = project.color
    ctx.fillText(`[ ${project.year} ]`, 38, 136)

    ctx.strokeStyle = project.color
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.35
    ctx.beginPath(); ctx.moveTo(38, 152); ctx.lineTo(W - 38, 152); ctx.stroke()
    ctx.globalAlpha = 1

    ctx.font = '26px "Courier New", monospace'
    ctx.fillStyle = 'rgba(170,215,255,0.9)'
    const words = project.desc.split(' ')
    let line = '', lines = []
    words.forEach((w) => {
      const test = line + w + ' '
      if (ctx.measureText(test).width > W - 76 && line) {
        lines.push(line.trimEnd()); line = w + ' '
      } else line = test
    })
    lines.push(line.trimEnd())
    if (lines.length > 3 && frameRef.current % 100 === 0)
      scrollRef.current = (scrollRef.current + 1) % lines.length
    const vis = [...lines, ...lines].slice(scrollRef.current, scrollRef.current + 3)
    vis.forEach((l, i) => ctx.fillText(l, 38, 196 + i * 40))

    cursorTick.current++
    if (cursorTick.current % 30 === 0) cursorOn.current = !cursorOn.current
    if (cursorOn.current) {
      ctx.fillStyle = project.color
      ctx.fillText('▌', 38, 196 + Math.min(vis.length, 3) * 40)
    }

    let cx = 38
    const chipY = 362
    ctx.font = 'bold 19px "Courier New", monospace'
    project.stack.slice(0, 5).forEach((tag) => {
      const tw = ctx.measureText(tag).width + 24
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(cx, chipY, tw, 30)
      ctx.strokeStyle = project.color + '55'
      ctx.lineWidth = 1
      ctx.strokeRect(cx, chipY, tw, 30)
      ctx.fillStyle = project.color
      ctx.fillText(tag, cx + 12, chipY + 21)
      cx += tw + 8
    })

    const dataY = 416
    ctx.fillStyle = 'rgba(0,160,255,0.05)'
    ctx.fillRect(38, dataY, W - 76, 128)
    ctx.strokeStyle = 'rgba(0,160,255,0.15)'
    ctx.lineWidth = 1
    ctx.strokeRect(38, dataY, W - 76, 128)

    const bars = [
      { label: 'PERF',  val: 0.82 + 0.08 * Math.sin(t * 1.1) },
      { label: 'SCALE', val: 0.70 + 0.10 * Math.sin(t * 0.9 + 1) },
      { label: 'UX',    val: 0.91 + 0.05 * Math.sin(t * 1.3 + 2) },
      { label: 'CODE',  val: 0.76 + 0.09 * Math.sin(t * 0.7 + 3) },
    ]
    bars.forEach((bar, i) => {
      const bx = 54 + i * 232, bw = 200
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(bx, dataY + 18, bw, 12)
      ctx.fillStyle = project.color
      ctx.globalAlpha = 0.7
      ctx.fillRect(bx, dataY + 18, bw * bar.val, 12)
      ctx.globalAlpha = 1
      ctx.font = 'bold 16px "Courier New", monospace'
      ctx.fillStyle = 'rgba(190,225,255,0.65)'
      ctx.fillText(bar.label, bx, dataY + 50)
      ctx.fillStyle = project.color
      ctx.fillText(`${Math.round(bar.val * 100)}%`, bx, dataY + 68)
    })

    const pp = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.5))
    ctx.fillStyle = project.color
    ctx.globalAlpha = pp * 0.2
    ctx.fillRect(38, H - 84, 280, 44)
    ctx.globalAlpha = 1
    ctx.font = 'bold 23px "Courier New", monospace'
    ctx.fillStyle = project.color
    ctx.fillText('⬡  LIVE PROJECT', 62, H - 54)

    const cLen = 16
    ;[[10, 10, 1, 1], [W - 10, 10, -1, 1], [10, H - 10, 1, -1], [W - 10, H - 10, -1, -1]].forEach(([cx2, cy2, sx2, sy2]) => {
      ctx.strokeStyle = project.color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.75
      ctx.beginPath()
      ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + sx2 * cLen, cy2)
      ctx.moveTo(cx2, cy2); ctx.lineTo(cx2, cy2 + sy2 * cLen)
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    tex.needsUpdate = true
  })

  return texRef.current
}

// Display panel that wraps the live digital screen texture in a bezel + halo.
// facingRight=true rotates the screen to face the gallery aisle from a left-wall tank.
export function DigitalScreen({ project, facingRight }) {
  const tex = useDigitalScreenTexture(project)
  const rotY = facingRight ? Math.PI : 0
  const screenX = facingRight ? 2.95 : -2.95

  return (
    <>
      <mesh position={[screenX, 0, 0]} rotation={[0, facingRight ? Math.PI : 0, 0]}>
        <planeGeometry args={[3.8, 2.6]} />
        <meshBasicMaterial map={tex} color="#ffffff" transparent opacity={0.98} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[facingRight ? screenX - 0.05 : screenX + 0.05, 0, 0]}>
        <boxGeometry args={[0.06, 2.8, 4.0]} />
        <meshStandardMaterial color="#060e1a" roughness={0.5} metalness={0.7} />
      </mesh>

      <mesh position={[facingRight ? screenX + 0.06 : screenX - 0.06, 0, 0]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[4.2, 3.0]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </>
  )
}

// Animated caustic light shimmer panel on the aquarium floor.
export function CausticFloor({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current?.material) {
      ref.current.material.emissiveIntensity = 0.08 + Math.sin(clock.getElapsedTime() * 1.2) * 0.05
    }
  })
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[22, 16, 1, 1]} />
      <meshStandardMaterial
        color="#021830"
        emissive="#0a4a8a"
        emissiveIntensity={0.08}
        roughness={0.95}
      />
    </mesh>
  )
}
