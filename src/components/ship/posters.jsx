import { useMemo } from 'react'
import * as THREE from 'three'
import { RopeMaterial } from './materials.jsx'

// Word-wrap helper for canvas-based wanted posters.
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)
  lines.slice(0, maxLines).forEach((item, index) => {
    ctx.fillText(item, x, y + index * lineHeight)
  })
}

// Generates a parchment-styled wanted poster texture for a project.
function useWantedPosterTexture(project) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 960
    canvas.height = 1280
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const parchment = ctx.createLinearGradient(0, 0, W, H)
    parchment.addColorStop(0, '#f1d98d')
    parchment.addColorStop(0.46, '#d5ad62')
    parchment.addColorStop(1, '#a87336')
    ctx.fillStyle = parchment
    ctx.fillRect(0, 0, W, H)

    const rand = (seed) => {
      const value = Math.sin(seed * 43.71) * 10000
      return value - Math.floor(value)
    }
    for (let i = 0; i < 1800; i += 1) {
      const alpha = 0.018 + rand(i + 2) * 0.035
      ctx.fillStyle = rand(i + 1) > 0.45 ? `rgba(90,47,17,${alpha})` : `rgba(255,240,173,${alpha})`
      ctx.fillRect(rand(i + 3) * W, rand(i + 4) * H, 1 + rand(i + 5) * 3, 1 + rand(i + 6) * 3)
    }

    ctx.strokeStyle = '#4a210b'
    ctx.lineWidth = 26
    ctx.strokeRect(42, 42, W - 84, H - 84)
    ctx.strokeStyle = '#e8c06f'
    ctx.lineWidth = 8
    ctx.strokeRect(76, 76, W - 152, H - 152)

    ctx.fillStyle = '#56220f'
    ctx.fillRect(118, 110, W - 236, 118)
    ctx.fillStyle = '#f2d681'
    ctx.font = '900 78px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('WANTED', W / 2, 169)

    const photoX = 168
    const photoY = 285
    const photoW = W - 336
    const photoH = 390
    ctx.fillStyle = '#ead393'
    ctx.fillRect(photoX, photoY, photoW, photoH)
    ctx.strokeStyle = '#5b2a12'
    ctx.lineWidth = 12
    ctx.strokeRect(photoX, photoY, photoW, photoH)

    const accent = project.color
    ctx.fillStyle = '#2e1b0e'
    ctx.beginPath()
    ctx.arc(W / 2, 470, 116, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = accent
    ctx.lineWidth = 18
    ctx.stroke()
    ctx.fillStyle = '#f5d781'
    ctx.font = '900 42px Georgia, serif'
    ctx.fillText('GRAND', W / 2, 430)
    ctx.fillText('LINE', W / 2, 476)
    ctx.fillText('FILE', W / 2, 522)

    ctx.strokeStyle = '#6c3b18'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(194, 610)
    ctx.bezierCurveTo(270, 560, 340, 650, 432, 594)
    ctx.bezierCurveTo(530, 532, 608, 630, 764, 574)
    ctx.stroke()
    ;[[194, 610], [334, 622], [432, 594], [764, 574]].forEach(([x, y]) => {
      ctx.fillStyle = '#6c3b18'
      ctx.beginPath()
      ctx.arc(x, y, 11, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.fillStyle = '#321607'
    ctx.font = project.name.length > 15 ? '900 58px Georgia, serif' : '900 68px Georgia, serif'
    ctx.fillText(project.name, W / 2, 755)

    ctx.fillStyle = '#633016'
    ctx.font = '700 30px Georgia, serif'
    ctx.fillText(project.stack.slice(0, 3).join('  /  '), W / 2, 822)

    ctx.fillStyle = accent
    ctx.font = '900 38px Georgia, serif'
    ctx.fillText(`BOUNTY ${project.bounty}`, W / 2, 908)

    ctx.fillStyle = '#4d210d'
    ctx.font = '800 30px Georgia, serif'
    ctx.fillText(`DEAD OR ALIVE - ${project.year}`, W / 2, 960)

    ctx.fillStyle = '#5f2b12'
    ctx.font = '24px Georgia, serif'
    wrapCanvasText(ctx, project.desc, W / 2, 1032, 650, 34, 3)

    ctx.fillStyle = accent
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.arc(154, 1028, 46, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = '#3d1b0b'
    ctx.lineWidth = 5
    ctx.stroke()

    ctx.save()
    ctx.translate(W - 154, 1028)
    ctx.rotate(-0.18)
    ctx.strokeStyle = accent
    ctx.lineWidth = 7
    ctx.strokeRect(-62, -38, 124, 76)
    ctx.font = '900 24px Georgia, serif'
    ctx.fillStyle = accent
    ctx.fillText('LOG', 0, -7)
    ctx.fillText('POSE', 0, 22)
    ctx.restore()

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    texture.needsUpdate = true
    return texture
  }, [project])
}

// Wooden framed wanted poster, hung from a rope. Click surface selects the project.
export function ProjectPaintingFrame({ project, spot, onSelect }) {
  const rotationY = spot.side === 'left' ? Math.PI / 2 - 0.24 : -Math.PI / 2 + 0.24
  const posterTexture = useWantedPosterTexture(project)

  return (
    <group position={spot.frame} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.11]} castShadow receiveShadow>
        <boxGeometry args={[3.55, 4.95, 0.25]} />
        <meshStandardMaterial color="#4c2a12" roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.02]} castShadow>
        <planeGeometry args={[3.18, 4.48]} />
        <meshStandardMaterial map={posterTexture} roughness={0.74} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.62, 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 3.85, 10]} />
        <RopeMaterial />
      </mesh>
      <mesh position={[0, 2.82, 0.24]}>
        <boxGeometry args={[1.45, 0.1, 0.12]} />
        <meshStandardMaterial color="#b98a3d" roughness={0.38} metalness={0.62} />
      </mesh>
      <mesh position={[0, 2.7, 0.29]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.1, 0.14, 0.16]} />
        <meshStandardMaterial
          color="#fff0a8"
          emissive={project.color}
          emissiveIntensity={0.55}
          roughness={0.38}
        />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={`poster-rope-${x}`} position={[x, 2.25, 0.02]} castShadow>
          <cylinderGeometry args={[0.036, 0.036, 0.78, 8]} />
          <RopeMaterial />
        </mesh>
      ))}
      <mesh
        position={[0, 0, 0.08]}
        onClick={(event) => { event.stopPropagation(); onSelect?.(project) }}
        onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <planeGeometry args={[3.55, 4.95]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <mesh position={[0, -2.62, -0.08]} castShadow>
        <boxGeometry args={[3.35, 0.2, 0.28]} />
        <meshStandardMaterial color="#2b1a0c" roughness={0.82} />
      </mesh>
      <mesh position={[-1.55, -1.35, -0.09]} castShadow>
        <boxGeometry args={[0.16, 2.45, 0.16]} />
        <meshStandardMaterial color="#2b1a0c" roughness={0.82} />
      </mesh>
      <mesh position={[1.55, -1.35, -0.09]} castShadow>
        <boxGeometry args={[0.16, 2.45, 0.16]} />
        <meshStandardMaterial color="#2b1a0c" roughness={0.82} />
      </mesh>
    </group>
  )
}
