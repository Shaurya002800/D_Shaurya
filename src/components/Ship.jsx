import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Text } from '@react-three/drei'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { configureTextBuilder } from 'troika-three-text'
import { AnimatedSail } from './AboutSection.jsx'
import { PROJECTS, PROJECT_GALLERY_SPOTS } from '../data/projects.js'
import { SHIP_ARTIFACTS } from '../data/shipArtifacts.js'
import {
  SHIP_DECK_BOX_OBSTACLES,
  SHIP_PROP_LAYOUT,
} from '../data/shipLayout.js'

configureTextBuilder({
  defaultFontURL: '/fonts/kenpixel.ttf',
  useWorker: false,
})

// ─────────────────────────────────────────────────────────────────────
// Lightweight PBR texture helper for the live deck.
// Color + roughness keeps the material readable without a heavy texture burst.
// ─────────────────────────────────────────────────────────────────────
function usePBR(folder, repeat = [1, 1]) {
  const maps = useTexture({
    map:          `/textures/${folder}/${folder}_Color.jpg`,
    roughnessMap: `/textures/${folder}/${folder}_Roughness.jpg`,
  })
  useMemo(() => {
    Object.values(maps).forEach(t => {
      if (t?.isTexture) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(...repeat)
        t.needsUpdate = true
      }
    })
  }, [repeat[0], repeat[1]])
  return maps
}

// ─────────────────────────────────────────────────────────────────────
// Ship footprint constants.
const BASEMENT_MIN_Z = -23
const BASEMENT_MAX_Z = 17
const BASEMENT_HALF_WIDTH = 8.5
const BASEMENT_HEIGHT = 12

function createBasementFootprintShape(inset = 0) {
  const halfWidth = BASEMENT_HALF_WIDTH - inset
  const minZ = BASEMENT_MIN_Z + inset
  const maxZ = BASEMENT_MAX_Z - inset

  const shape = new THREE.Shape()
  const moveTo = (x, z) => shape.moveTo(x, -z)
  const lineTo = (x, z) => shape.lineTo(x, -z)
  const curveTo = (cp1x, cp1z, cp2x, cp2z, x, z) => {
    shape.bezierCurveTo(cp1x, -cp1z, cp2x, -cp2z, x, -z)
  }

  moveTo(0, minZ)
  curveTo(halfWidth * 0.58, minZ + 1.2, halfWidth, minZ + 5.8, halfWidth, minZ + 10.8)
  lineTo(halfWidth, maxZ - 5.2)
  curveTo(halfWidth, maxZ - 1.4, halfWidth * 0.64, maxZ, 0, maxZ)
  curveTo(-halfWidth * 0.64, maxZ, -halfWidth, maxZ - 1.4, -halfWidth, maxZ - 5.2)
  lineTo(-halfWidth, minZ + 10.8)
  curveTo(-halfWidth, minZ + 5.8, -halfWidth * 0.58, minZ + 1.2, 0, minZ)
  shape.closePath()

  return shape
}

function createBasementWallShape() {
  const outer = createBasementFootprintShape(0)
  const innerShape = createBasementFootprintShape(0.52)
  const points = innerShape.getPoints(96).reverse()
  const hole = new THREE.Path()
  points.forEach((point, index) => {
    if (index === 0) hole.moveTo(point.x, point.y)
    else hole.lineTo(point.x, point.y)
  })
  hole.closePath()
  outer.holes.push(hole)
  return outer
}

const SUNNY_HULL_SECTIONS = [
  { z: -31, width: 1.1, top: -0.5, depth: 4.0 },
  { z: -28, width: 5.2, top: -0.25, depth: 5.8 },
  { z: -24, width: 8.2, top: 0.0, depth: 7.15 },
  { z: -16, width: 9.35, top: 0.1, depth: 8.0 },
  { z: -4, width: 9.65, top: 0.12, depth: 8.45 },
  { z: 9, width: 9.55, top: 0.12, depth: 8.35 },
  { z: 19, width: 9.2, top: 0.25, depth: 7.85 },
  { z: 26, width: 8.0, top: 0.5, depth: 6.8 },
  { z: 30, width: 4.6, top: 0.0, depth: 5.4 },
]

function createSunnyHullGeometry() {
  const ringSegments = 18
  const positions = []
  const uvs = []
  const indices = []

  SUNNY_HULL_SECTIONS.forEach((section, sectionIndex) => {
    for (let index = 0; index <= ringSegments; index += 1) {
      const angle = (index / ringSegments) * Math.PI
      const x = Math.cos(angle) * section.width
      const y = section.top - Math.sin(angle) * section.depth
      positions.push(x, y, section.z)
      uvs.push(index / ringSegments, sectionIndex / (SUNNY_HULL_SECTIONS.length - 1))
    }
  })

  const ringSize = ringSegments + 1
  for (let section = 0; section < SUNNY_HULL_SECTIONS.length - 1; section += 1) {
    for (let index = 0; index < ringSegments; index += 1) {
      const current = section * ringSize + index
      const next = current + ringSize
      indices.push(current, next, current + 1)
      indices.push(current + 1, next, next + 1)
    }
  }

  const addCap = (sectionIndex, reverse = false) => {
    const section = SUNNY_HULL_SECTIONS[sectionIndex]
    const centerIndex = positions.length / 3
    positions.push(0, section.top - section.depth * 0.48, section.z)
    uvs.push(0.5, 0.5)
    const offset = sectionIndex * ringSize
    for (let index = 0; index < ringSegments; index += 1) {
      if (reverse) indices.push(centerIndex, offset + index + 1, offset + index)
      else indices.push(centerIndex, offset + index, offset + index + 1)
    }
  }

  addCap(0, true)
  addCap(SUNNY_HULL_SECTIONS.length - 1)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function createSunnyDeckShape(inset = 0) {
  const shape = new THREE.Shape()
  const bow = -27 + inset
  const stern = 27 - inset
  const halfWidth = 8.55 - inset

  shape.moveTo(0, -bow)
  shape.bezierCurveTo(halfWidth * 0.55, -bow + 1.2, halfWidth, -bow + 5.0, halfWidth, -bow + 9.0)
  shape.lineTo(halfWidth, -stern + 5.5)
  shape.bezierCurveTo(halfWidth, -stern + 1.7, halfWidth * 0.62, -stern, 0, -stern)
  shape.bezierCurveTo(-halfWidth * 0.62, -stern, -halfWidth, -stern + 1.7, -halfWidth, -stern + 5.5)
  shape.lineTo(-halfWidth, -bow + 9.0)
  shape.bezierCurveTo(-halfWidth, -bow + 5.0, -halfWidth * 0.55, -bow + 1.2, 0, -bow)
  shape.closePath()
  return shape
}

function createRaisedDeckShape(section, inset = 0) {
  const shape = new THREE.Shape()
  const isBow = section === 'bow'
  const minZ = isBow ? -26 + inset : 13 + inset
  const maxZ = isBow ? -13 - inset : 27 - inset
  const wide = 8.45 - inset
  const narrow = (isBow ? 3.2 : 5.4) - inset * 0.5
  const openingHalfWidth = 4.1 - inset * 0.25
  const openingDepth = 0.78

  if (isBow) {
    shape.moveTo(0, -minZ)
    shape.bezierCurveTo(narrow * 0.72, -minZ + 0.8, wide, -minZ + 5.6, wide, -maxZ)
    shape.lineTo(openingHalfWidth, -maxZ)
    shape.lineTo(openingHalfWidth, -(maxZ - openingDepth))
    shape.lineTo(-openingHalfWidth, -(maxZ - openingDepth))
    shape.lineTo(-openingHalfWidth, -maxZ)
    shape.lineTo(-wide, -maxZ)
    shape.bezierCurveTo(-wide, -minZ + 5.6, -narrow * 0.72, -minZ + 0.8, 0, -minZ)
  } else {
    shape.moveTo(wide, -minZ)
    shape.lineTo(wide, -maxZ + 5.2)
    shape.bezierCurveTo(wide, -maxZ + 1.4, narrow * 0.75, -maxZ, 0, -maxZ)
    shape.bezierCurveTo(-narrow * 0.75, -maxZ, -wide, -maxZ + 1.4, -wide, -maxZ + 5.2)
    shape.lineTo(-wide, -minZ)
    shape.lineTo(-openingHalfWidth, -minZ)
    shape.lineTo(-openingHalfWidth, -(minZ + openingDepth))
    shape.lineTo(openingHalfWidth, -(minZ + openingDepth))
    shape.lineTo(openingHalfWidth, -minZ)
  }
  shape.closePath()
  return shape
}

function useGrassTexture() {
  return useMemo(() => {
    const rand = (seed) => {
      const value = Math.sin(seed * 91.17) * 10000
      return value - Math.floor(value)
    }
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#2f8f3b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < 1300; i += 1) {
      const x = rand(i + 1) * canvas.width
      const y = rand(i + 2) * canvas.height
      const length = 3 + rand(i + 3) * 9
      ctx.strokeStyle = rand(i + 4) > 0.55 ? 'rgba(174,231,89,0.42)' : 'rgba(19,92,37,0.42)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (rand(i + 5) - 0.5) * 2, y - length)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(7, 16)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

function DeckMaterial({ repeat = [3, 8] }) {
  const maps = usePBR('WoodFloor040_1K-JPG', repeat)
  return (
    <meshStandardMaterial
      {...maps}
      roughness={0.82}
      metalness={0.0}
    />
  )
}

function WoodMaterial({ repeat = [2, 2], roughness = 0.88 }) {
  const maps = usePBR('WoodFloor041_1K-JPG', repeat)
  return (
    <meshStandardMaterial
      {...maps}
      roughness={roughness}
      metalness={0.0}
    />
  )
}

function GrassMaterial() {
  const texture = useGrassTexture()
  return (
    <meshStandardMaterial
      map={texture}
      color="#57b84b"
      roughness={0.96}
      metalness={0.0}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────
// SAIL FABRIC MATERIAL
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// ROPE MATERIAL — rigging
// ─────────────────────────────────────────────────────────────────────
function RopeMaterial() {
  return <meshStandardMaterial color="#c8a050" roughness={1.0} metalness={0.0} />
}

// ─────────────────────────────────────────────────────────────────────
// RIGGING LINE — draws a rope between two 3D points
// ─────────────────────────────────────────────────────────────────────
function RigLine({ from, to, thickness = 0.045 }) {
  const start = new THREE.Vector3(...from)
  const end   = new THREE.Vector3(...to)
  const mid   = start.clone().lerp(end, 0.5)
  const len   = start.distanceTo(end)
  const dir   = end.clone().sub(start).normalize()
  const quat  = new THREE.Quaternion()
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  return (
    <mesh position={mid} quaternion={quat} castShadow>
      <cylinderGeometry args={[thickness, thickness, len, 5]} />
      <RopeMaterial />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────
// WHEEL SPOKE — single spoke of the ship wheel
// ─────────────────────────────────────────────────────────────────────
function WheelSpoke({ angle }) {
  return (
    <mesh rotation={[0, 0, angle]}>
      <boxGeometry args={[0.07, 1.75, 0.07]} />
      <meshStandardMaterial color="#2a1505" roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SHIP WHEEL COMPONENT
// ─────────────────────────────────────────────────────────────────────
function ShipWheel({ position }) {
  return (
    <group position={position} rotation={[0.12, 0, 0]} scale={1.22}>
      {/* Outer ring */}
      <mesh castShadow>
        <torusGeometry args={[0.88, 0.085, 10, 28]} />
        <meshStandardMaterial color="#6a3214" roughness={0.48} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, -0.035]}>
        <torusGeometry args={[0.98, 0.025, 8, 32]} />
        <meshStandardMaterial color="#d5a93a" roughness={0.32} metalness={0.62} />
      </mesh>
      {/* Inner hub ring */}
      <mesh castShadow>
        <torusGeometry args={[0.18, 0.065, 10, 20]} />
        <meshStandardMaterial color="#d5a93a" roughness={0.36} metalness={0.55} />
      </mesh>
      {/* Hub center */}
      <mesh castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.14, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a0d00" roughness={0.4} metalness={0.25} />
      </mesh>
      {/* 8 Spokes */}
      {Array.from({ length: 8 }, (_, i) => (
        <WheelSpoke key={i} angle={(i * Math.PI) / 4} />
      ))}
      {/* Handle knobs on outer ring */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI * 2) / 8
        return (
          <mesh key={i} position={[Math.cos(a) * 0.88, Math.sin(a) * 0.88, 0]} castShadow>
            <sphereGeometry args={[0.065, 10, 10]} />
            <meshStandardMaterial color="#3d1a00" roughness={0.4} metalness={0.2} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// LION FIGUREHEAD — Thousand Sunny's iconic face
// ─────────────────────────────────────────────────────────────────────
function LionFigurehead({ position }) {
  return (
    <group position={position}>
      {/* thick carved mane body keeps the lion readable from side views */}
      <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[3.38, 3.1, 1.65, 24]} />
        <meshStandardMaterial color="#E56A16" roughness={0.58} />
      </mesh>
      {/* Sun-ray mane plates */}
      {Array.from({ length: 14 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 14
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3.55, Math.sin(angle) * 3.55, -0.18]}
            rotation={[0, 0, Math.PI / 2 - angle]}
            castShadow
          >
            <coneGeometry args={[0.38, 1.05, 4]} />
            <meshStandardMaterial color={i % 2 ? '#f57c00' : '#ffb300'} roughness={0.58} />
          </mesh>
        )
      })}
      {/* Main head */}
      <mesh castShadow>
        <sphereGeometry args={[2.8, 20, 20]} />
        <meshStandardMaterial color="#FFB300" roughness={0.45} metalness={0.0} />
      </mesh>
      {/* Mane ring */}
      <mesh castShadow>
        <torusGeometry args={[3.5, 0.72, 12, 24]} />
        <meshStandardMaterial color="#E65100" roughness={0.5} metalness={0.0} />
      </mesh>
      {/* Inner mane detail ring */}
      <mesh castShadow>
        <torusGeometry args={[3.0, 0.35, 10, 24]} />
        <meshStandardMaterial color="#FF8F00" roughness={0.55} metalness={0.0} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, -0.3, -2.4]} castShadow>
        <sphereGeometry args={[1.2, 20, 20]} />
        <meshStandardMaterial color="#FFC107" roughness={0.5} metalness={0.0} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.1, -3.9]} castShadow>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.0} />
      </mesh>
      {/* Gaon cannon mouth hidden inside the lion face */}
      <mesh position={[0, -0.78, -3.42]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.72, 24]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
      <mesh position={[0, -0.78, -3.36]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.74, 0.08, 10, 24]} />
        <meshStandardMaterial color="#6b350f" roughness={0.5} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-1.1, 0.9, -2.4]} castShadow>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Right eye */}
      <mesh position={[1.1, 0.9, -2.4]} castShadow>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Eye shine left */}
      <mesh position={[-0.9, 1.1, -2.75]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.0} emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      {/* Eye shine right */}
      <mesh position={[0.9, 1.1, -2.75]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.0} emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      {/* Eyebrows left */}
      <mesh position={[-1.1, 1.55, -2.45]} rotation={[0.3, 0.2, -0.4]}>
        <boxGeometry args={[0.6, 0.14, 0.14]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Eyebrows right */}
      <mesh position={[1.1, 1.55, -2.45]} rotation={[0.3, -0.2, 0.4]}>
        <boxGeometry args={[0.6, 0.14, 0.14]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Smile teeth */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x, -1.08, -3.6]} castShadow>
          <boxGeometry args={[0.3, 0.38, 0.18]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.0} />
        </mesh>
      ))}
      {/* Cheek blush left */}
      <mesh position={[-1.8, -0.2, -2.6]}>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color="#FF6060" roughness={1.0} metalness={0.0} transparent opacity={0.45} />
      </mesh>
      {/* Cheek blush right */}
      <mesh position={[1.8, -0.2, -2.6]}>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color="#FF6060" roughness={1.0} metalness={0.0} transparent opacity={0.45} />
      </mesh>
      {/* carved neck and gold collar tie the figurehead into the bow */}
      <mesh position={[0, -0.25, 2.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.75, 3.2, 18]} />
        <meshStandardMaterial color="#7a3c17" roughness={0.82} />
      </mesh>
      <mesh position={[0, -0.25, 0.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.55, 0.18, 10, 28]} />
        <meshStandardMaterial color="#d5a93a" roughness={0.45} metalness={0.2} />
      </mesh>
    </group>
  )
}


// ─────────────────────────────────────────────────────────────────────
// LADDER — from deck to crow's nest
// ─────────────────────────────────────────────────────────────────────
function Ladder({ position, height = 30, rungs = 18, rotation = [0, 0, 0] }) {
  const bottom = -height / 2
  const top = height / 2
  return (
    <group position={position} rotation={rotation}>
      {/* rope rails */}
      {[-0.46, 0.46].map((x) => (
        <mesh key={`ladder-rail-${x}`} position={[x, 0, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, height, 10]} />
          <meshStandardMaterial color="#6f4b21" roughness={0.92} />
        </mesh>
      ))}

      {/* darker side shadows so the ladder reads from distance */}
      {[-0.56, 0.56].map((x) => (
        <mesh key={`ladder-shadow-${x}`} position={[x, 0, -0.045]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, height * 0.98, 8]} />
          <meshStandardMaterial color="#241407" roughness={0.95} />
        </mesh>
      ))}

      {/* thicker end clamps */}
      {[bottom + 0.45, top - 0.45].map((y) => (
        <mesh key={`ladder-clamp-${y}`} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.18, 10]} />
          <meshStandardMaterial color="#3d2410" roughness={0.9} />
        </mesh>
      ))}

      {/* wooden rungs */}
      {Array.from({ length: rungs }, (_, i) => {
        const y = bottom + 1.05 + i * ((height - 2.1) / Math.max(1, rungs - 1))
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.065, 0.065, 1.0, 10]} />
              <meshStandardMaterial color="#8a5a26" roughness={0.88} />
            </mesh>
            {[-0.46, 0.46].map((x) => (
              <mesh key={x} position={[x, 0, 0.01]} castShadow>
                <torusGeometry args={[0.105, 0.018, 6, 12]} />
                <meshStandardMaterial color="#2a1708" roughness={0.9} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* tiny deck foot plates */}
      {[-0.46, 0.46].map((x) => (
        <mesh key={`ladder-foot-${x}`} position={[x, bottom - 0.1, 0.1]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
          <meshStandardMaterial color="#2a1708" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function CrowsNestFlag() {
  return (
    <group>
      <mesh position={[0, 2.65, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 5.1, 8]} />
        <meshStandardMaterial color="#2a1505" roughness={0.82} />
      </mesh>
      <mesh position={[1.25, 4.55, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[2.35, 1.35]} />
        <meshStandardMaterial color="#111111" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <mesh position={[0.75, 4.56, 0.015]}>
        <circleGeometry args={[0.33, 18]} />
        <meshStandardMaterial color="#f3eee2" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh position={[0.75, 4.83, 0.025]} rotation={[0.05, 0, 0]}>
        <torusGeometry args={[0.39, 0.065, 8, 22]} />
        <meshStandardMaterial color="#caa23d" side={THREE.DoubleSide} roughness={0.82} />
      </mesh>
    </group>
  )
}

function CrowsNestBaseOnly({ position = [0, 31.5, -3] }) {
  const railingPoints = [
    [-2.18, 0.42, 0.25],
    [-2.02, 0.42, -1.08],
    [-1.18, 0.42, -2.02],
    [0, 0.42, -2.32],
    [1.18, 0.42, -2.02],
    [2.02, 0.42, -1.08],
    [2.18, 0.42, 0.25],
  ]

  return (
    <group position={position}>
      <mesh position={[0, -0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.35, 2.55, 0.3, 24]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.12, 0]} castShadow>
        <torusGeometry args={[2.44, 0.075, 8, 28]} />
        <meshStandardMaterial color="#c8a050" roughness={0.78} />
      </mesh>
      <mesh position={[0, -0.23, 0]} castShadow>
        <torusGeometry args={[2.12, 0.08, 8, 24]} />
        <meshStandardMaterial color="#2a1708" roughness={0.9} />
      </mesh>

      {/* Low rear/side boundary. The camera-facing front stays open. */}
      {railingPoints.map(([x, y, z], index) => (
        <group key={`skills-rail-post-${index}`} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.055, 0.07, 0.88, 8]} />
            <meshStandardMaterial color={index % 2 ? '#f2ead8' : '#8b1f16'} roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.47, 0]}>
            <sphereGeometry args={[0.095, 10, 8]} />
            <meshStandardMaterial color="#c8a050" roughness={0.55} metalness={0.18} />
          </mesh>
        </group>
      ))}
      {railingPoints.slice(0, -1).map((point, index) => {
        const next = railingPoints[index + 1]
        return (
          <group key={`skills-rail-line-${index}`}>
            <RigLine
              from={[point[0], 0.78, point[2]]}
              to={[next[0], 0.78, next[2]]}
              thickness={0.035}
            />
            <RigLine
              from={[point[0], 0.42, point[2]]}
              to={[next[0], 0.42, next[2]]}
              thickness={0.025}
            />
          </group>
        )
      })}

      {/* Front step visually anchors the open entrance and bottom navigation. */}
      <mesh position={[0, -0.04, 2.46]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.22, 0.62]} />
        <meshStandardMaterial color="#6b3b18" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.09, 2.44]}>
        <boxGeometry args={[1.66, 0.06, 0.5]} />
        <meshStandardMaterial color="#c8a050" roughness={0.6} metalness={0.12} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// JOLLY ROGER ON SAIL — Straw Hat Pirates emblem
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// MAIN SAIL PANEL
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// BASEMENT HATCH — entry to aquarium room
// ─────────────────────────────────────────────────────────────────────
function BasementHatch({ position }) {
  return (
    <group position={position}>
      {/* Hatch frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.15, 2.5]} />
        <meshStandardMaterial color="#3d2410" roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Hatch door panel */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[3.1, 0.12, 2.1]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      {/* Hatch handle */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <torusGeometry args={[0.3, 0.04, 8, 20]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Glow rim to indicate interactivity */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[3.2, 0.05, 2.2]} />
        <meshStandardMaterial
          color="#f0c040"
          emissive="#f0c040"
          emissiveIntensity={0.3}
          roughness={1}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// CANNON — decorative, one per side
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// ANCHOR — decorative on bow
// ─────────────────────────────────────────────────────────────────────
function Anchor({ position }) {
  return (
    <group position={position}>
      {/* Vertical shaft */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.5, 10]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Left fluke */}
      <mesh position={[-0.55, -1.1, 0]} rotation={[0, 0, 0.6]} castShadow>
        <boxGeometry args={[0.85, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Right fluke */}
      <mesh position={[0.55, -1.1, 0]} rotation={[0, 0, -0.6]} castShadow>
        <boxGeometry args={[0.85, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Ring at top */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <torusGeometry args={[0.22, 0.055, 10, 20]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// BARREL — scattered on deck for detail
// ─────────────────────────────────────────────────────────────────────
function Barrel({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.85, 14]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      {/* Top rim */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 14]} />
        <meshStandardMaterial color="#3d2410" roughness={0.8} />
      </mesh>
      {/* Metal hoop top */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <torusGeometry args={[0.39, 0.035, 8, 20]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Metal hoop bottom */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <torusGeometry args={[0.39, 0.035, 8, 20]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// COILED ROPE — on deck corners
// ─────────────────────────────────────────────────────────────────────
function CoiledRope({ position }) {
  return (
    <group position={position}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, i * 0.065, 0]} castShadow>
          <torusGeometry args={[0.28 - i * 0.02, 0.045, 8, 20]} />
          <RopeMaterial />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// LANTERN — hanging from ropes
// ─────────────────────────────────────────────────────────────────────
// AFTER — remove the pointLight entirely, emissive on the glass is enough
function Lantern({ position, castShadow = true }) {
  return (
    <group position={position}>
      <mesh castShadow={castShadow}>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#ffdd88" roughness={0.1} transparent opacity={0.6} emissive="#ffcc44" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.16, 0.2, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.08, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 4]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* NO pointLight — emissive glow looks just as good, costs nothing */}
    </group>
  )
}

function RailLanternMount({ position }) {
  const side = Math.sign(position[0]) || 1
  const railX = side * 8.17
  const armX = side * 7.72
  const z = position[2]

  return (
    <group>
      <RigLine from={[railX, 1.48, z]} to={[railX, 2.78, z]} thickness={0.035} />
      <RigLine from={[railX, 2.78, z]} to={[armX, 2.76, z]} thickness={0.04} />
      <RigLine from={[armX, 2.76, z]} to={[position[0], position[1] + 0.45, z]} thickness={0.02} />
      <mesh position={[railX, 1.48, z]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#d5a93a" roughness={0.42} metalness={0.35} />
      </mesh>
      <Lantern position={position} />
    </group>
  )
}

function NightDeckLights({ active }) {
  const intensity = active ? 1 : 0

  return (
    <group>
      <pointLight position={[0, 4.4, 5.5]} color="#ffd789" intensity={3.1 * intensity} distance={15} decay={2.1} />
      <pointLight position={[0, 5.2, -7.2]} color="#ffd789" intensity={2.6 * intensity} distance={14} decay={2.05} />
      <pointLight position={[0, 6.4, 18.2]} color="#ffe5a8" intensity={2.8 * intensity} distance={13} decay={2.1} />
      <pointLight position={[-6.7, 2.45, 10.8]} color="#ffc96f" intensity={1.8 * intensity} distance={8} decay={2.2} />
      <pointLight position={[6.7, 2.45, 10.8]} color="#ffc96f" intensity={1.8 * intensity} distance={8} decay={2.2} />
      <pointLight position={[-6.7, 2.45, 3.6]} color="#ffd184" intensity={1.35 * intensity} distance={7} decay={2.25} />
      <pointLight position={[6.7, 2.45, 3.6]} color="#ffd184" intensity={1.35 * intensity} distance={7} decay={2.25} />
      <pointLight position={[-6.7, 2.45, -3.8]} color="#ffd184" intensity={1.35 * intensity} distance={7} decay={2.25} />
      <pointLight position={[6.7, 2.45, -3.8]} color="#ffd184" intensity={1.35 * intensity} distance={7} decay={2.25} />
      <pointLight position={[-6.7, 2.45, -11]} color="#ffc96f" intensity={1.6 * intensity} distance={8} decay={2.2} />
      <pointLight position={[6.7, 2.45, -11]} color="#ffc96f" intensity={1.6 * intensity} distance={8} decay={2.2} />
    </group>
  )
}

function ArtifactBeacon({ color = '#ffd76a', radius = 0.72 }) {
  return (
    <group>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.72, radius, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.32} transparent opacity={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.24, 18]} />
        <meshStandardMaterial color="#f7e7aa" emissive={color} emissiveIntensity={0.16} transparent opacity={0.74} />
      </mesh>
    </group>
  )
}

function ArtifactPlaque({ children, color = '#f5df91', position = [0, 0.095, 0.78], rotation = [-Math.PI / 2, 0, 0] }) {
  return (
    <Text
      position={position}
      rotation={rotation}
      fontSize={0.135}
      color={color}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.06}
      outlineWidth={0.008}
      outlineColor="#170b04"
    >
      {children}
    </Text>
  )
}

function GitHubLogbook({ artifact, onOpen }) {
  return (
    <group
      position={artifact.center}
      onClick={(event) => { event.stopPropagation(); onOpen?.(artifact) }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <ArtifactBeacon color={artifact.color} />
      <mesh position={[0, 0.45, 0]} rotation={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[1.05, 0.22, 0.78]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.18} emissive="#0b1020" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.59, 0]} rotation={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.94, 0.05, 0.68]} />
        <meshStandardMaterial color="#f5f0df" roughness={0.82} />
      </mesh>
      <Text position={[0, 0.63, 0.02]} rotation={[-Math.PI / 2, -0.35, 0]} fontSize={0.18} color="#111827" anchorX="center" anchorY="middle">
        GIT
      </Text>
      {[-0.24, 0, 0.24].map((x, index) => (
        <mesh key={`repo-dot-${index}`} position={[x, 0.665, -0.14 + index * 0.13]} rotation={[0, -0.35, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#111827" emissive="#111827" emissiveIntensity={0.24} />
        </mesh>
      ))}
      <RigLine from={[-0.24, 0.67, -0.14]} to={[0, 0.67, -0.01]} thickness={0.012} />
      <RigLine from={[0, 0.67, -0.01]} to={[0.24, 0.67, 0.12]} thickness={0.012} />
      <ArtifactPlaque color="#ffffff">REPO LOG</ArtifactPlaque>
    </group>
  )
}

function LinkedInVivreCard({ artifact, onOpen }) {
  return (
    <group
      position={artifact.center}
      rotation={[0, -0.28, 0]}
      onClick={(event) => { event.stopPropagation(); onOpen?.(artifact) }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <ArtifactBeacon color={artifact.color} />
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.94, 1.1, 0.1]} />
        <meshStandardMaterial color="#0a66c2" roughness={0.42} metalness={0.18} emissive="#0a66c2" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.92, -0.075]}>
        <boxGeometry args={[1.1, 1.28, 0.08]} />
        <meshStandardMaterial color="#f4ead8" roughness={0.8} />
      </mesh>
      <Text position={[0, 1.08, 0.08]} fontSize={0.34} color="#ffffff" anchorX="center" anchorY="middle">
        in
      </Text>
      <Text position={[0, 0.64, 0.08]} fontSize={0.11} color="#dff4ff" anchorX="center" anchorY="middle" letterSpacing={0.08}>
        VIVRE CARD
      </Text>
      <RigLine from={[-0.42, 1.58, -0.03]} to={[-0.42, 2.35, -0.03]} thickness={0.018} />
      <RigLine from={[0.42, 1.58, -0.03]} to={[0.42, 2.35, -0.03]} thickness={0.018} />
      <ArtifactPlaque color="#bfe7ff" position={[0, 0.09, 0.82]} rotation={[-Math.PI / 2, 0.28, 0]}>VIVRE</ArtifactPlaque>
    </group>
  )
}

function ResumeChest({ artifact, onOpen }) {
  return (
    <group
      position={artifact.center}
      rotation={[0, 0.36, 0]}
      onClick={(event) => { event.stopPropagation(); onOpen?.(artifact) }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <ArtifactBeacon color={artifact.color} />
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.2, 0.55, 0.78]} />
        <meshStandardMaterial color="#6b3b18" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.41, 0.41, 1.22, 18, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#8a4b17" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.62, -0.42]} castShadow>
        <boxGeometry args={[0.3, 0.28, 0.08]} />
        <meshStandardMaterial color="#d5a93a" roughness={0.34} metalness={0.55} emissive="#d5a93a" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0.48, 0.95, 0.24]} rotation={[0.6, 0.2, 0.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.74, 14]} />
        <meshStandardMaterial color="#f7e7aa" roughness={0.75} />
      </mesh>
      <Text position={[0.18, 0.93, 0.47]} rotation={[-1.05, 0.2, 0.08]} fontSize={0.12} color="#5f3417" anchorX="center" anchorY="middle">
        CV
      </Text>
      <ArtifactPlaque color="#ffe58f">RESUME</ArtifactPlaque>
    </group>
  )
}

function ContactSnail({ artifact, onOpen }) {
  return (
    <group
      position={artifact.center}
      rotation={[0, -0.55, 0]}
      onClick={(event) => { event.stopPropagation(); onOpen?.(artifact) }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <ArtifactBeacon color={artifact.color} />
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 12]} />
        <meshStandardMaterial color="#f7a8ce" roughness={0.75} />
      </mesh>
      <mesh position={[-0.27, 0.64, 0.18]} castShadow>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#f8e7bd" roughness={0.68} />
      </mesh>
      <mesh position={[0.27, 0.64, 0.18]} castShadow>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#f8e7bd" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.38, -0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.32, 0.09, 10, 20]} />
        <meshStandardMaterial color="#8f4d2d" roughness={0.78} />
      </mesh>
      <ArtifactPlaque color="#ffd5e8">SIGNAL</ArtifactPlaque>
    </group>
  )
}

function MysteryPoneglyph({ artifact, onOpen }) {
  return (
    <group
      position={artifact.center}
      rotation={[0, 0.32, 0]}
      onClick={(event) => { event.stopPropagation(); onOpen?.(artifact) }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <ArtifactBeacon color={artifact.color} />
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.88, 1.16, 0.42]} />
        <meshStandardMaterial color="#3b285f" roughness={0.95} emissive="#4c1d95" emissiveIntensity={0.18} />
      </mesh>
      {['I', 'X', 'III'].map((glyph, index) => (
        <Text key={glyph} position={[0, 1.02 - index * 0.24, 0.23]} fontSize={0.16} color="#d8b4fe" anchorX="center" anchorY="middle">
          {glyph}
        </Text>
      ))}
      <ArtifactPlaque color="#e9d5ff">DECODE</ArtifactPlaque>
    </group>
  )
}

function RouteCipherMap({ artifact, onOpen }) {
  return (
    <group
      position={artifact.center}
      rotation={[0, -0.18, 0]}
      onClick={(event) => { event.stopPropagation(); onOpen?.(artifact) }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <ArtifactBeacon color={artifact.color} radius={0.62} />
      <mesh position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, 0.12]} castShadow>
        <boxGeometry args={[1.15, 0.04, 0.82]} />
        <meshStandardMaterial color="#ecd9a7" roughness={0.86} />
      </mesh>
      <mesh position={[-0.48, 0.43, 0.16]} rotation={[-Math.PI / 2, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.84, 12]} />
        <meshStandardMaterial color="#8a5a26" roughness={0.82} />
      </mesh>
      {[[-0.28, -0.18], [0.03, 0.0], [0.31, 0.16]].map(([x, z], index) => (
        <mesh key={`route-mark-${index}`} position={[x, 0.43, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.065, 16]} />
          <meshStandardMaterial color="#187245" emissive="#187245" emissiveIntensity={0.12} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <RigLine from={[-0.28, 0.44, -0.18]} to={[0.03, 0.44, 0]} thickness={0.012} />
      <RigLine from={[0.03, 0.44, 0]} to={[0.31, 0.44, 0.16]} thickness={0.012} />
      <ArtifactPlaque color="#b7f7cd" position={[0, 0.095, 0.72]}>CIPHER</ArtifactPlaque>
    </group>
  )
}

function ShipArtifacts({ onArtifactOpen }) {
  const byId = Object.fromEntries(SHIP_ARTIFACTS.map((artifact) => [artifact.id, artifact]))
  const open = (artifact) => onArtifactOpen?.(artifact)

  return (
    <group>
      <GitHubLogbook artifact={byId.github} onOpen={open} />
      <LinkedInVivreCard artifact={byId.linkedin} onOpen={open} />
      <ResumeChest artifact={byId.resume} onOpen={open} />
      <ContactSnail artifact={byId.contact} onOpen={open} />
      <MysteryPoneglyph artifact={byId.poneglyph} onOpen={open} />
      <RouteCipherMap artifact={byId.cipher} onOpen={open} />
    </group>
  )
}

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

function ProjectPaintingFrame({ project, spot, onSelect }) {
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
        onClick={(event) => {
          event.stopPropagation()
          onSelect?.(project)
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
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

function ProjectInteractionCircle({ project, spot }) {
  return (
    <group position={spot.circle}>
      <mesh position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[spot.radius * 1.08, 24]} />
        <meshStandardMaterial color="#17351e" roughness={0.9} transparent opacity={0.76} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[spot.radius * 0.82, spot.radius, 32]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={0.72}
          roughness={0.55}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[spot.radius * 0.27, spot.radius * 0.36, 20]} />
        <meshStandardMaterial
          color="#f2cf78"
          emissive={project.color}
          emissiveIntensity={0.35}
          roughness={0.58}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * spot.radius * 1.01, 0.055, Math.sin(angle) * spot.radius * 1.01]}
          rotation={[-Math.PI / 2, 0, angle]}
        >
          <boxGeometry args={[0.12, 0.28, 0.05]} />
          <meshStandardMaterial color="#f2cf78" emissive={project.color} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  )
}





// ─────────────────────────────────────────────────────────────────────
// NAMI'S MIKAN (TANGERINE) TREE (FIXED PHYSICS)
// ─────────────────────────────────────────────────────────────────────
function MikanTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.2, 8]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.9} />
      </mesh>

      {/* Main Leaf Cluster */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      
      {/* Secondary Leaf Clusters */}
      <mesh position={[-0.3, 1.2, 0.3]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#1b5e20" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 1.5, -0.2]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>

      {/* Tangerines */}
      {[
        [-0.4, 1.4, 0.5], [0.4, 1.2, 0.4], [0.1, 1.8, 0.3],
        [-0.2, 1.5, -0.5], [0.5, 1.6, -0.2], [-0.5, 1.1, -0.2]
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#ff9800" roughness={0.3} metalness={0.1} />
        </mesh>
      ))}

      {/* THE FIX: Just the raw collider inheriting the group's position */}
      <CuboidCollider args={[0.2, 1.0, 0.2]} position={[0, 1.0, 0]} />
    </group>
  )
}



// ─────────────────────────────────────────────────────────────────────
// SLIDE & SWING (FIXED PHYSICS)
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// SOLDIER DOCK SYSTEM HATCHES
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// COUP DE BURST EXHAUST ENGINE
// ─────────────────────────────────────────────────────────────────────
function CoupDeBurst({ position }) {
  return (
    <group position={position}>
      {/* Main Exhaust Barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[2.2, 2.8, 3.5, 16]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.9} />
      </mesh>
      {/* Heavy Metal Reinforcement Rings */}
      {[-1.2, 0, 1.2].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[2.3 + (i * 0.15), 0.15, 12, 24]} />
          <meshStandardMaterial color="#333" roughness={0.6} metalness={0.7} />
        </mesh>
      ))}
      {/* Dark Hole (The Exhaust Nozzle) */}
      <mesh position={[0, 0, 1.76]}>
        <circleGeometry args={[2.0, 24]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// AQUARIUM BAR SKYLIGHT (GLASS FLOOR)
// ─────────────────────────────────────────────────────────────────────
function AquariumSkylight({ position }) {
  return (
    <group position={position}>
      {/* Metal Frame Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <ringGeometry args={[2.8, 3.2, 32]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Inner Frame Crossbars */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[6.0, 0.2, 0.1]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[6.0, 0.2, 0.1]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.8} />
      </mesh>
      
      {/* The Glass Pane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[2.8, 32]} />
        <meshStandardMaterial
          color="#44aaff"
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      
      {/* Fake Water/Depth Illusion underneath the deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <circleGeometry args={[2.8, 24]} />
        <meshStandardMaterial color="#022640" roughness={0.8} />
      </mesh>
    </group>
  )
}







// ─────────────────────────────────────────────────────────────────────
// FISH — animated fish swimming in the aquarium
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// BUBBLE — rising bubble in water
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// PROJECT CARD — 3D panel inside aquarium with project info
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// DIGITAL SCREEN — animated canvas texture that updates every frame
// Renders scanlines, typing cursor, live "data" readouts per project
// ─────────────────────────────────────────────────────────────────────
// Wrapper mesh — drop this inside ProjectTank instead of the old card group
// ─────────────────────────────────────────────────────────────────────
// DIGITAL SCREEN — Shrunk and Optimized for Tank Space
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// CAUSTIC LIGHT PANEL — animated underwater light shimmer on floor
// ─────────────────────────────────────────────────────────────────────
function ArchiveHullDetails() {
  const ribZ = [-18, -11.5, -3, 5.5, 13]

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={`archive-wall-${side}`}>
          <mesh position={[side * 8.02, 1.25, -2.5]} receiveShadow>
            <boxGeometry args={[0.2, 2.5, 34]} />
            <meshStandardMaterial color="#4a2914" roughness={0.9} />
          </mesh>
          <mesh position={[side * 7.88, 2.55, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 34, 6]} />
            <meshStandardMaterial color="#c29347" roughness={0.4} metalness={0.58} />
          </mesh>
          {ribZ.map((z) => (
            <group key={`archive-rib-${side}-${z}`}>
              <mesh position={[side * 7.72, 5.5, z]}>
                <boxGeometry args={[0.34, 10.5, 0.32]} />
                <meshStandardMaterial color="#5b3217" roughness={0.88} />
              </mesh>
              <mesh position={[side * 7.54, 3.3, z]} rotation={[0, 0, side * 0.18]}>
                <boxGeometry args={[0.22, 2.2, 0.5]} />
                <meshStandardMaterial color="#b78942" roughness={0.5} metalness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

function ArchivePromenade() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, -3]} receiveShadow>
        <planeGeometry args={[5.7, 32.5]} />
        <meshStandardMaterial color="#5a3219" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.075, -3]} receiveShadow>
        <planeGeometry args={[4.55, 31.8]} />
        <meshStandardMaterial color="#4fa444" roughness={0.94} />
      </mesh>
      {[-2.52, 2.52].map((x) => (
        <mesh key={`promenade-edge-${x}`} position={[x, 0.12, -3]}>
          <boxGeometry args={[0.16, 0.14, 32.4]} />
          <meshStandardMaterial color="#d0a451" roughness={0.55} metalness={0.22} />
        </mesh>
      ))}
      {[-14, -8.5, -3, 2.5, 8, 13.5].map((z) => (
        <group key={`compass-${z}`} position={[0, 0.095, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.62, 0.77, 20]} />
            <meshStandardMaterial color="#d8b45e" roughness={0.54} metalness={0.2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <boxGeometry args={[0.14, 1.15, 0.035]} />
            <meshStandardMaterial color="#f5df91" emissive="#d8b45e" emissiveIntensity={0.12} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.14, 1.15, 0.035]} />
            <meshStandardMaterial color="#f5df91" emissive="#d8b45e" emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function GrandLineArchiveCrest() {
  const toBeContinuedTexture = useTexture('/image copy 2.png')

  return (
    <group position={[0, 3.9, -20.45]}>
      {/* Layer 1: High-contrast framing plate to separate the logo from the wood grain */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[6.8, 2.8]} />
        <meshBasicMaterial 
          color="#0d0805" 
          transparent 
          opacity={0.9} 
        />
      </mesh>

      {/* Layer 2: Hard-edged 3D Drop Shadow (The black silhouette layer) */}
      <mesh position={[0.05, -0.05, 0.03]}>
        <planeGeometry args={[6.5, 2.5]} />
        <meshBasicMaterial 
          map={toBeContinuedTexture} 
          transparent={true} 
          alphaTest={0.1}
          color="#000000" /* Forces the texture asset into a crisp black shadow */
          toneMapped={false}
        />
      </mesh>

      {/* Layer 3: Main vibrant foreground text */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[6.5, 2.5]} />
        <meshBasicMaterial 
          map={toBeContinuedTexture} 
          transparent={true} 
          alphaTest={0.1} 
          toneMapped={false} /* Prevents 3D scene lighting/shadows from washing out the red */
        />
      </mesh>
    </group>
  )
}

function ArchivePropCluster({ side = 1, z = 10 }) {
  return (
    <group position={[side * 7.05, 0.12, z]} rotation={[0, side > 0 ? -0.28 : 0.28, 0]}>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.76, 8]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.9} />
      </mesh>
      {[-0.22, 0.22].map((y) => (
        <mesh key={`archive-barrel-ring-${y}`} position={[0, 0.48 + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.025, 6, 12]} />
          <meshStandardMaterial color="#665845" roughness={0.55} metalness={0.35} />
        </mesh>
      ))}
      {[0, 0.07].map((y, index) => (
        <mesh key={`archive-rope-${y}`} position={[side * -0.62, 0.08 + y, 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24 - index * 0.025, 0.04, 6, 14]} />
          <RopeMaterial />
        </mesh>
      ))}
      <mesh position={[side * -0.55, 0.35, -0.42]} rotation={[0, side * 0.18, 0]}>
        <boxGeometry args={[0.9, 0.68, 0.78]} />
        <meshStandardMaterial color="#6b3b18" roughness={0.9} />
      </mesh>
      <mesh position={[side * -0.55, 0.72, -0.42]}>
        <boxGeometry args={[0.94, 0.08, 0.82]} />
        <meshStandardMaterial color="#b78942" roughness={0.58} metalness={0.2} />
      </mesh>
    </group>
  )
}

function ArchiveLanternRow() {
  return (
    <group>
      {[-14, -6, 2, 10].map((z) => (
        <group key={`archive-lantern-${z}`}>
          <mesh position={[0, 11.35, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.85, 6]} />
            <meshStandardMaterial color="#342719" roughness={0.65} metalness={0.32} />
          </mesh>
          <Lantern position={[0, 10.62, z]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// BASEMENT ROOM — Grand Line project archive inside the Sunny
// ─────────────────────────────────────────────────────────────────────
function AquariumBasement({ position = [0, -14, 2], onProjectSelect }) {
  const floorShape = useMemo(() => createBasementFootprintShape(0.38), [])
  const ceilingShape = useMemo(() => createBasementFootprintShape(0.18), [])
  const wallShape = useMemo(() => createBasementWallShape(), [])

  return (
    <group position={position}>
 
      {/* Grass floor using the same long ship footprint as the upper deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <shapeGeometry args={[floorShape, 48]} />
        <GrassMaterial />
      </mesh>

      <ArchivePromenade />

      {/* Slightly raised grassy edge so the floor reads as a soft indoor lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <extrudeGeometry args={[createBasementWallShape(), { depth: 0.08, bevelEnabled: false, steps: 1 }]} />
        <meshStandardMaterial color="#7fd45a" roughness={0.92} />
      </mesh>

      {/* Curved painted shell, following the outer-ship footprint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[wallShape, { depth: BASEMENT_HEIGHT, bevelEnabled: false, steps: 1 }]} />
        <meshStandardMaterial
          color="#f6e5b8"
          roughness={0.82}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <ArchiveHullDetails />

      {PROJECT_GALLERY_SPOTS.map((spot) => {
        const project = PROJECTS[spot.projectIndex]
        return (
          <group key={project.name}>
            <ProjectPaintingFrame project={project} spot={spot} onSelect={onProjectSelect} />
            <ProjectInteractionCircle project={project} spot={spot} />
          </group>
        )
      })}

      <GrandLineArchiveCrest />

      {/* Grass creeps up the wall base */}
      {[-16, -10, -4, 2, 8, 14].map((z, i) => (
        <group key={`wall-grass-${z}`}>
          <mesh position={[-8.07, 0.86, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[3.2, 1.45]} />
            <meshStandardMaterial color={i % 2 ? '#3fa34d' : '#6ecf58'} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[8.07, 0.86, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[3.2, 1.45]} />
            <meshStandardMaterial color={i % 2 ? '#6ecf58' : '#3fa34d'} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      <ArchivePropCluster side={-1} z={11.8} />
      <ArchivePropCluster side={1} z={11.8} />
      <ArchivePropCluster side={-1} z={-19.1} />
      <ArchivePropCluster side={1} z={-19.1} />

      {/* Ceiling and roof beams */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BASEMENT_HEIGHT, 0]}>
        <shapeGeometry args={[ceilingShape, 48]} />
        <meshStandardMaterial color="#f7e6b6" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {[-12, -4, 4, 12].map((z) => (
        <mesh key={`basement-beam-${z}`} position={[0, 11.75, z]}>
          <boxGeometry args={[15.5, 0.28, 0.28]} />
          <meshStandardMaterial color="#6b3b18" roughness={0.85} />
        </mesh>
      ))}
      {[-6.8, 6.8].map((x) => (
        <mesh key={`basement-longitudinal-${x}`} position={[x, 11.58, -2.5]}>
          <boxGeometry args={[0.24, 0.24, 35]} />
          <meshStandardMaterial color="#9b6b31" roughness={0.66} metalness={0.16} />
        </mesh>
      ))}

      <ArchiveLanternRow />
      <pointLight position={[0, 8.8, -11]} color="#ffe3a0" intensity={11} distance={19} decay={1.65} />
      <pointLight position={[0, 8.8, 7]} color="#ffd27a" intensity={9} distance={18} decay={1.7} />
    </group>
  )
}
 

// ─────────────────────────────────────────────────────────────────────
// CHICKEN VOYAGE PADDLE WHEELS — Sunny's emergency propulsion  
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// TREASURE CHEST — for atmosphere on deck
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// CROW'S NEST — Observation basket & invisible ladder collision
// ─────────────────────────────────────────────────────────────────────
export function CrowsNest({ position = [0, 31.5, -3], rotation = [0, 0, 0], ...props }) {
  // ── Physics Ramp for Climbing ──
  // Adjust these to match the exact slope and length of your GLTF ladder
  const rampLength = 32; 
  const rampAngle = 0.15; // Tilt angle (radians)
  const rampZOffset = 1.5; // How far forward from the mast the ladder base sits

  return (
    <group position={position} rotation={rotation} {...props}>
      
      {/* Open Sunny lookout basket. Kept low and airy so Luffy stays visible. */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2.25, 2.45, 0.38, 28]} />
          <meshStandardMaterial color="#5C3A21" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <torusGeometry args={[2.35, 0.11, 10, 32]} />
          <meshStandardMaterial color="#2a1708" roughness={0.86} />
        </mesh>
        <mesh position={[0, 1.08, 0]}>
          <torusGeometry args={[2.42, 0.085, 10, 36]} />
          <meshStandardMaterial color="#c8a050" roughness={0.75} />
        </mesh>
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 16
          return (
            <mesh key={i} position={[Math.cos(angle) * 2.42, 0.65, Math.sin(angle) * 2.42]} castShadow>
              <cylinderGeometry args={[0.045, 0.055, 0.9, 8]} />
              <meshStandardMaterial color={i % 2 ? '#f5efe1' : '#8b1f16'} roughness={0.82} />
            </mesh>
          )
        })}
      </RigidBody>

      <CrowsNestFlag />

      {/* Invisible climb ramp, aligned with the starboard ladder. */}
      <RigidBody type="fixed">
        <mesh 
          position={[2.2, -rampLength / 2, rampZOffset]} 
          rotation={[rampAngle, 0, 0]}
          visible={false}
        >
          <boxGeometry args={[1.2, rampLength, 0.2]} />
          <meshBasicMaterial color="red" wireframe /> 
        </mesh>
      </RigidBody>

    </group>
  )
}



// ─────────────────────────────────────────────────────────────────────
// SANJI'S KITCHEN + DINING HALL — restaurant-style, stern second floor
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// DOME CROW'S NEST — proper dome-shaped hut with gym equipment
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// LOG POSE PILLAR — navigation instrument behind the helm
// ─────────────────────────────────────────────────────────────────────
function LogPosePillar({ position }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.15, 1.4, 12]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Base plate */}
      <mesh position={[0, -0.72, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 12]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Log Pose globe housing */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Glass dome */}
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial color="#88ddff" roughness={0.05} metalness={0.1} transparent opacity={0.45} emissive="#44aaff" emissiveIntensity={0.15} />
      </mesh>
      {/* Needle */}
      <mesh position={[0.05, 0.92, 0]} rotation={[0,0,0.4]} castShadow>
        <boxGeometry args={[0.04, 0.28, 0.03]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Decorative rings on post */}
      {[0.2, -0.2].map((y,i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <torusGeometry args={[0.14, 0.025, 8, 16]} />
          <meshStandardMaterial color="#b8860b" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ROBIN'S FLOWER GARDEN — observation deck flowers
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// THE THOUSAND SUNNY — COMPLETE SHIP
// ─────────────────────────────────────────────────────────────────────

function SunnyGalleonHull() {
  const geometry = useMemo(() => createSunnyHullGeometry(), [])

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <WoodMaterial repeat={[5, 2.5]} roughness={0.9} />
      </mesh>

      {/* dark keel gives the hull a readable galleon belly */}
      <mesh position={[0, -6.35, 1.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.48, 45, 10]} />
        <meshStandardMaterial color="#2b170b" roughness={0.94} />
      </mesh>

      {/* layered waterline bands follow the long hull instead of boxing it in */}
      {[-1, 1].map((side) => (
        <group key={`waterline-${side}`}>
          <mesh position={[side * 9.12, -0.72, 1.5]} castShadow>
            <boxGeometry args={[0.22, 0.54, 39]} />
            <meshStandardMaterial color="#2f7a43" roughness={0.8} />
          </mesh>
          <mesh position={[side * 9.18, -0.34, 1.5]} castShadow>
            <boxGeometry args={[0.18, 0.18, 40]} />
            <meshStandardMaterial color="#f6ead0" roughness={0.68} />
          </mesh>
          <mesh position={[side * 9.04, -4.85, 1.8]} castShadow>
            <boxGeometry args={[0.16, 0.2, 35]} />
            <meshStandardMaterial color="#3b2110" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SunnyDeckSurface() {
  const deckShape = useMemo(() => createSunnyDeckShape(0), [])
  const trimShape = useMemo(() => {
    const outer = createSunnyDeckShape(0)
    const inner = createSunnyDeckShape(0.48)
    const hole = new THREE.Path()
    inner.getPoints(80).reverse().forEach((point, index) => {
      if (index === 0) hole.moveTo(point.x, point.y)
      else hole.lineTo(point.x, point.y)
    })
    hole.closePath()
    outer.holes.push(hole)
    return outer
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]} receiveShadow>
        <shapeGeometry args={[deckShape, 80]} />
        <DeckMaterial repeat={[3, 8]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.27, 0]} receiveShadow>
        <extrudeGeometry args={[trimShape, { depth: 0.13, bevelEnabled: false }]} />
        <meshStandardMaterial color="#6a3518" roughness={0.86} />
      </mesh>
    </group>
  )
}

function SunnyRaisedDeck({ section }) {
  const shellShape = useMemo(() => createRaisedDeckShape(section, 0), [section])
  const topShape = useMemo(() => createRaisedDeckShape(section, 0.16), [section])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]} castShadow receiveShadow>
        <extrudeGeometry
          args={[
            shellShape,
            {
              depth: 2.42,
              steps: 1,
              bevelEnabled: true,
              bevelSize: 0.14,
              bevelThickness: 0.12,
              bevelSegments: 2,
            },
          ]}
        />
        <WoodMaterial repeat={[2.5, 2]} roughness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.67, 0]} receiveShadow>
        <shapeGeometry args={[topShape, 56]} />
        <DeckMaterial repeat={[2, 2.5]} />
      </mesh>
    </group>
  )
}

function SunnyBowArmor() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={`bow-armor-${side}`} position={[side * 4.25, -1.15, -25.4]} rotation={[0, side * -0.2, side * -0.08]}>
          <mesh castShadow>
            <cylinderGeometry args={[3.55, 4.15, 0.48, 5, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#a92e2b" roughness={0.64} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, side * 0.27]} castShadow>
            <torusGeometry args={[2.72, 0.16, 9, 36]} />
            <meshStandardMaterial color="#f4e8c8" roughness={0.58} />
          </mesh>
          {[[-1.55, 1.15], [0, -1.55], [1.55, 1.15]].map(([x, y], index) => (
            <mesh key={index} position={[x, y, side * 0.31]} castShadow>
              <sphereGeometry args={[0.25, 12, 10]} />
              <meshStandardMaterial color="#e4b743" roughness={0.38} metalness={0.35} />
            </mesh>
          ))}
        </group>
      ))}

      {/* central red breastplate behind the lion */}
      <mesh position={[0, -1.0, -27.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[4.3, 5.2, 0.52, 12]} />
        <meshStandardMaterial color="#a92e2b" roughness={0.62} />
      </mesh>
      <mesh position={[0, -1.0, -27.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[3.55, 0.2, 10, 42]} />
        <meshStandardMaterial color="#f5ead0" roughness={0.6} />
      </mesh>
    </group>
  )
}

function SunnySideGalleries() {
  const galleryZ = [-14, -6, 2, 10, 18]

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={`sunny-gallery-${side}`}>
          {/* white/red gallery ribbon makes the side profile unmistakably Sunny */}
          <mesh position={[side * 9.02, 1.45, 3]} castShadow>
            <boxGeometry args={[0.42, 2.35, 39]} />
            <meshStandardMaterial color="#f4ead8" roughness={0.72} />
          </mesh>
          <mesh position={[side * 9.27, 2.35, 3]} castShadow>
            <boxGeometry args={[0.2, 0.42, 39.5]} />
            <meshStandardMaterial color="#b9352e" roughness={0.62} />
          </mesh>
          <mesh position={[side * 9.28, 0.45, 3]} castShadow>
            <boxGeometry args={[0.18, 0.28, 39]} />
            <meshStandardMaterial color="#d5a93a" roughness={0.48} metalness={0.2} />
          </mesh>

          {galleryZ.map((z) => (
            <group key={`${side}-${z}`} position={[side * 9.36, 1.35, z]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <ringGeometry args={[0.5, 0.72, 28]} />
                <meshStandardMaterial color="#b9352e" roughness={0.58} side={THREE.DoubleSide} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.43, 28]} />
                <meshStandardMaterial color="#173c4c" roughness={0.2} emissive="#1d6f87" emissiveIntensity={0.12} side={THREE.DoubleSide} />
              </mesh>
              {Array.from({ length: 8 }, (_, index) => {
                const angle = (index / 8) * Math.PI * 2
                return (
                  <mesh key={index} position={[side * 0.04, Math.sin(angle) * 0.61, Math.cos(angle) * 0.61]}>
                    <sphereGeometry args={[0.07, 7, 6]} />
                    <meshStandardMaterial color="#e2b849" roughness={0.42} metalness={0.3} />
                  </mesh>
                )
              })}
            </group>
          ))}

          {/* blue Chicken Voyage fins add the Sunny's playful side silhouette */}
          <mesh position={[side * 10.65, -2.35, 7.5]} rotation={[0, 0, side * -0.12]} castShadow>
            <sphereGeometry args={[3.0, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#2879c8" roughness={0.55} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[side * 10.45, -2.3, 7.5]} rotation={[0, 0, side * -0.12]} castShadow>
            <sphereGeometry args={[2.34, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e8f3f6" roughness={0.62} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SunnySternArchitecture() {
  return (
    <group>
      <mesh position={[0, 3.85, 25.35]} castShadow receiveShadow>
        <boxGeometry args={[10.6, 2.35, 3.25]} />
        <meshStandardMaterial color="#f0dfbc" roughness={0.78} />
      </mesh>

      <mesh position={[0, 3.86, 23.68]} castShadow>
        <boxGeometry args={[11.15, 2.55, 0.18]} />
        <meshStandardMaterial color="#a9342f" roughness={0.65} />
      </mesh>

      {[-3.35, 0, 3.35].map((x) => (
        <group key={x} position={[x, 4.05, 23.55]}>
          <mesh>
            <circleGeometry args={[0.78, 28]} />
            <meshStandardMaterial
              color="#153f51"
              roughness={0.16}
              transparent
              opacity={0.82}
              emissive="#1b7d9b"
              emissiveIntensity={0.16}
            />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <ringGeometry args={[0.82, 0.98, 28]} />
            <meshStandardMaterial color="#d5a93a" roughness={0.36} metalness={0.48} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 5.18, 25.35]} castShadow>
        <boxGeometry args={[11.35, 0.22, 3.75]} />
        <meshStandardMaterial color="#6d3418" roughness={0.8} />
      </mesh>

      <mesh position={[0, 5.08, 25.35]} scale={[1, 0.54, 0.43]} castShadow>
        <sphereGeometry args={[5.25, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f0d56b" roughness={0.68} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 5.18, 23.42]} castShadow>
        <boxGeometry args={[10.75, 0.2, 0.34]} />
        <meshStandardMaterial color="#b6352e" roughness={0.58} />
      </mesh>

      <mesh position={[0, 7.92, 25.35]} castShadow>
        <sphereGeometry args={[0.38, 14, 12]} />
        <meshStandardMaterial color="#b6352e" roughness={0.5} />
      </mesh>
    </group>
  )
}

function SunnyLawnDetails() {
  return (
    <group>
      {/* circular Sunny lawn motif around the mast */}
      <mesh position={[0, 0.565, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.78, 40]} />
        <meshStandardMaterial color="#d7f27a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.568, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.35, 2.48, 48]} />
        <meshStandardMaterial color="#1f6f2a" roughness={0.96} />
      </mesh>

      {/* lawn mowing bands so the grass feels intentional, not a flat rectangle */}
      {[-10.5, -6.5, -1.5, 3.5, 7.2].map((z, i) => (
        <mesh key={`lawn-band-${z}`} position={[0, 0.555, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13.8, 1.15]} />
          <meshStandardMaterial
            color={i % 2 ? '#3fa34d' : '#65bf55'}
            roughness={1}
            transparent
            opacity={0.32}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

    </group>
  )
}

function SunnySideDeckTrim() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={`side-trim-${side}`}>
          {[-18, -10, -2, 6, 14].map((z) => (
            <mesh key={`${side}-${z}`} position={[side * 8.08, 1.62, z]} castShadow>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#f4ead2" roughness={0.72} />
            </mesh>
          ))}
          <RigLine from={[side * 8.08, 1.62, -18]} to={[side * 8.08, 1.62, 14]} thickness={0.035} />
        </group>
      ))}
    </group>
  )
}

// signature — add skillsActive to whatever props Ship already receives
export default function Ship({ aboutActive = false, skillsActive = false, weatherId = 'sunny', onProjectSelect, onArtifactOpen }){
  const shipRef = useRef()
  const isNightWeather = weatherId === 'night'

  // Gentle ocean rocking — kinematic physics body moves with waves
  useFrame(({ clock }) => {
    if (!shipRef.current) return
    const t = clock.getElapsedTime()
    shipRef.current.setNextKinematicTranslation({
      x: 0,
      y: Math.sin(t * 0.5) * 0.15,
      z: 0,
    })
    const euler = new THREE.Euler(
      Math.sin(t * 0.3) * 0.004,
      0,
      Math.sin(t * 0.4) * 0.006,
    )
    shipRef.current.setNextKinematicRotation(
      new THREE.Quaternion().setFromEuler(euler)
    )
  })

  return (
    <RigidBody ref={shipRef} type="kinematicPosition" colliders={false}>

      {/* ════════════════════════════════════════════════════════════
          PHYSICS COLLIDERS
          Invisible boxes/cylinders that stop Luffy walking through
      ════════════════════════════════════════════════════════════ */}
      {/* Main deck floor */}
      <CuboidCollider args={[8.5, 0.25, 20]} position={[0, 0.1, -1]} />
      <CuboidCollider args={[8.5, 0.25, 20]} position={[0, -13.75, -1]} />

      {/* Basement shell walls — broad collision matching the new ship footprint */}
      <CuboidCollider args={[0.18, 6, 16]} position={[-8.65, -8, -1]} />
      <CuboidCollider args={[0.18, 6, 16]} position={[ 8.65, -8, -1]} />
      <CuboidCollider args={[7.2, 6, 0.18]} position={[0, -8, 17.2]} />
      <CuboidCollider args={[2.4, 6, 0.18]} position={[0, -8, -22.2]} />
      {/* The Basement Hatch (Allows Luffy to step up onto the wood panel) */}
      <CuboidCollider args={[1.75, 0.1, 1.25]} position={[0, 0.46, 5]} />

      {/* Shared visual/navigation blockers. These exact footprints also drive
          Luffy's custom movement resolver in LuffyCharacter.jsx. */}
      {SHIP_DECK_BOX_OBSTACLES.map((obstacle) => (
        <CuboidCollider
          key={obstacle.id}
          args={[
            (obstacle.maxX - obstacle.minX) / 2,
            obstacle.colliderHeight,
            (obstacle.maxZ - obstacle.minZ) / 2,
          ]}
          position={[
            (obstacle.minX + obstacle.maxX) / 2,
            obstacle.colliderY,
            (obstacle.minZ + obstacle.maxZ) / 2,
          ]}
        />
      ))}

      {/* ════════════════════════════════════════════════════════════
          NAMI'S MIKAN ORCHARD PLANTER (FIXED PHYSICS)
      ════════════════════════════════════════════════════════════ */}
      {SHIP_PROP_LAYOUT.orchard.trees.map((tree) => (
        <MikanTree key={tree.position.join('-')} position={tree.position} scale={tree.scale} />
      ))}
      
      <group position={SHIP_PROP_LAYOUT.orchard.planter}>
        {/* Wooden container */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.5, 0.3, 4.5]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        {/* Dirt */}
        <mesh position={[0, 0.14, 0]} receiveShadow>
          <boxGeometry args={[4.3, 0.05, 4.3]} />
          <meshStandardMaterial color="#3e2723" roughness={1.0} />
        </mesh>
      </group>

      {/* ════════════════════════════════════════════════════════════
          ICONIC EXTERIOR DETAILS
      ════════════════════════════════════════════════════════════ */}
      <CuboidCollider args={[8.5, 0.25, 6]} position={[0, 2.65, 19]} />
      {/* Forecastle floor */}
      <CuboidCollider args={[8.5, 0.25, 6]} position={[0, 2.65, -19]} />
      {/* Left railing wall */}
      <CuboidCollider args={[0.15, 1.5, 25]} position={[-8.3, 0.8, 0]} />
      {/* Right railing wall */}
      <CuboidCollider args={[0.15, 1.5, 25]} position={[8.3, 0.8, 0]} />
      {/* Bow wall */}
      <CuboidCollider args={[8.5, 2.0, 0.2]} position={[0, 1.0, -25]} />
      {/* Stern wall */}
      <CuboidCollider args={[8.5, 2.0, 0.2]} position={[0, 1.0, 25]} />
      {/* Main mast */}
      <CylinderCollider args={[17, 0.55]} position={[0, 16, -3]} />
      {/* Fore mast */}
      <CylinderCollider args={[9, 0.35]} position={[0, 9, -19]} />

      {/* ════════════════════════════════════════════════════════════
          HULL
          The main wooden body of the Thousand Sunny
      ════════════════════════════════════════════════════════════ */}
      <SunnyGalleonHull />
      <SunnySideGalleries />

      {/* ════════════════════════════════════════════════════════════
          MAIN DECK
          Wood floor with visible planks
      ════════════════════════════════════════════════════════════ */}
      <SunnyDeckSurface />

      {/* ════════════════════════════════════════════════════════════
          GRASS LAWN — Thousand Sunny's iconic mid-deck grass
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, 0.42, -3]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.12, 24]} />
        <GrassMaterial />
      </mesh>
      {/* Grass texture overlay */}
      <mesh position={[0, 0.49, -3]}>
        <boxGeometry args={[15, 0.04, 24]} />
        <meshStandardMaterial color="#4CAF50" roughness={1.0} metalness={0.0} transparent opacity={0.6} />
      </mesh>
      {/* Grass border trim */}
      <AquariumSkylight position={[0, 0.54, -7]} />
      {[[-7.6, -3], [7.6, -3], [0, -15.1], [0, 9.1]].map(([x, z], i) => {
        const isHoriz = i < 2
        return (
          <mesh key={i} position={[x, 0.38, z]} receiveShadow>
            <boxGeometry args={isHoriz ? [0.35, 0.18, 24] : [15, 0.18, 0.35]} />
            <meshStandardMaterial color="#1b5e20" roughness={0.9} />
          </mesh>
        )
      })}
      <SunnyLawnDetails />
      <ShipArtifacts onArtifactOpen={onArtifactOpen} />

      {/* ════════════════════════════════════════════════════════════
          RAILINGS — Red and white Thousand Sunny style
      ════════════════════════════════════════════════════════════ */}
      {[-8.2, 8.2].map((x, si) => (
        <group key={si}>
          {/* Top horizontal rail — red */}
          <mesh position={[x, 1.45, -1]} castShadow>
            <boxGeometry args={[0.38, 0.22, 42]} />
            <meshStandardMaterial color="#c0392b" roughness={0.6} metalness={0.05} />
          </mesh>
          {/* Mid horizontal rail — white */}
          <mesh position={[x, 0.85, -1]}>
            <boxGeometry args={[0.28, 0.14, 42]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.75} />
          </mesh>
          {/* Vertical balusters — white */}
          {Array.from({ length: 15 }, (_, j) => (
            <mesh key={j} position={[x, 0.72, j * 2.9 - 19.5]} castShadow>
              <boxGeometry args={[0.18, 1.44, 0.18]} />
              <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      <SunnySideDeckTrim />

      {/* ════════════════════════════════════════════════════════════
          QUARTERDECK — raised rear deck with wheel
      ════════════════════════════════════════════════════════════ */}
      <SunnyRaisedDeck section="stern" />
      {/* Steps from main deck to quarterdeck */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 0.35 + i * 0.5, 10.8 + i * 0.62]} receiveShadow castShadow>
          <boxGeometry args={[8.15, 0.48, 0.72]} />
          <DeckMaterial repeat={[2, 1]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={`stern-stair-cheek-${side}`}>
          <mesh position={[side * 4.24, 1.45, 12.05]} castShadow receiveShadow>
            <boxGeometry args={[0.28, 2.7, 3.25]} />
            <WoodMaterial repeat={[1, 1.5]} roughness={0.88} />
          </mesh>
          <mesh position={[side * 4.24, 2.86, 12.05]} castShadow>
            <boxGeometry args={[0.38, 0.15, 3.3]} />
            <meshStandardMaterial color="#d5a93a" roughness={0.46} metalness={0.18} />
          </mesh>
        </group>
      ))}
      {/* Split railing leaves the visible central staircase open. */}
      {[-6.35, 6.35].map((x) => (
        <mesh key={x} position={[x, 3.9, 13.5]} castShadow>
          <boxGeometry args={[4.25, 0.2, 0.3]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
      ))}

      {/* ════════════════════════════════════════════════════════════
          FORECASTLE — raised front deck
      ════════════════════════════════════════════════════════════ */}
      <SunnyRaisedDeck section="bow" />
      {/* Forecastle steps */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 0.35 + i * 0.5, -10.8 - i * 0.62]} receiveShadow castShadow>
          <boxGeometry args={[8.15, 0.48, 0.72]} />
          <DeckMaterial repeat={[2, 1]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={`bow-stair-cheek-${side}`}>
          <mesh position={[side * 4.24, 1.45, -12.05]} castShadow receiveShadow>
            <boxGeometry args={[0.28, 2.7, 3.25]} />
            <WoodMaterial repeat={[1, 1.5]} roughness={0.88} />
          </mesh>
          <mesh position={[side * 4.24, 2.86, -12.05]} castShadow>
            <boxGeometry args={[0.38, 0.15, 3.3]} />
            <meshStandardMaterial color="#d5a93a" roughness={0.46} metalness={0.18} />
          </mesh>
        </group>
      ))}

      {/* ════════════════════════════════════════════════════════════
          SHIP WHEEL
      ════════════════════════════════════════════════════════════ */}
      <ShipWheel position={[0, 4.05, 18.25]} />
      <LogPosePillar position={[-2.2, 3.95, 18.25]} />
      {/* Wheel post */}
      <mesh position={[0, 3.18, 18.48]} castShadow>
        <boxGeometry args={[0.52, 1.45, 0.48]} />
        <meshStandardMaterial color="#5f3117" roughness={0.78} />
      </mesh>
      <mesh position={[0, 2.72, 18.48]} castShadow>
        <cylinderGeometry args={[0.52, 0.62, 0.22, 16]} />
        <meshStandardMaterial color="#d5a93a" roughness={0.38} metalness={0.35} />
      </mesh>
      <mesh position={[0, 2.76, 18.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.35, 1.62, 32]} />
        <meshStandardMaterial color="#d5a93a" roughness={0.42} metalness={0.28} side={THREE.DoubleSide} />
      </mesh>

      {/* ════════════════════════════════════════════════════════════
          MAIN MAST
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, 17, -3]} castShadow>
        <cylinderGeometry args={[0.55, 0.75, 34, 14]} />
        <WoodMaterial repeat={[1, 7]} roughness={0.82} />
      </mesh>
      {/* Mast base reinforcement */}
      <mesh position={[0, 0.5, -3]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.1, 1.2, 14]} />
        <WoodMaterial repeat={[1, 1]} roughness={0.85} />
      </mesh>
      {/* Mast metal rings */}
      {[5, 12, 20, 28].map((y, i) => (
        <mesh key={i} position={[0, y, -3]} castShadow>
          <torusGeometry args={[0.68 - i * 0.04, 0.07, 10, 24]} />
          <meshStandardMaterial color="#555" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* ════════════════════════════════════════════════════════════
          CROW'S NEST
      ════════════════════════════════════════════════════════════ */}
      {skillsActive
        ? <CrowsNestBaseOnly position={[0, 31.5, -3]} />
        : <CrowsNest position={[0, 31.5, -3]} />}

      {/* ════════════════════════════════════════════════════════════
          MAIN CROSS SPAR + SAIL
      ════════════════════════════════════════════════════════════ */}
      {!skillsActive && (
        <>
          {/* Upper cross spar */}
          <mesh position={[0, 25, -3]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 26, 10]} />
            <WoodMaterial repeat={[1, 5]} roughness={0.82} />
          </mesh>
          {/* Lower cross spar */}
          <mesh position={[0, 14, -3]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 20, 8]} />
            <WoodMaterial repeat={[1, 4]} roughness={0.82} />
          </mesh>
          {/* Main printed sail */}
          {/* THE REAL MULTI-TEXTURED SHADER SAIL */}
          <AnimatedSail position={[0, 18, -2.5]} active={aboutActive} />
        </>
      )}
      {/* ════════════════════════════════════════════════════════════
          LADDER TO CROW'S NEST
      ════════════════════════════════════════════════════════════ */}
      {!aboutActive && !skillsActive && (
        <Ladder position={[2.2, 17, -1.55]} height={30} rungs={23} rotation={[0.04, 0, -0.015]} />
      )}

      {/* ════════════════════════════════════════════════════════════
          RIGGING ROPES — full network
      ════════════════════════════════════════════════════════════ */}
      {/* Main shrouds */}
      {!aboutActive && (
        <>
          <RigLine from={[8.5, 1, 0]}   to={[0, 25, -3]} thickness={0.048} />
          <RigLine from={[-8.5, 1, 0]}  to={[0, 25, -3]} thickness={0.048} />
          <RigLine from={[8.5, 1, -6]}  to={[0, 25, -3]} thickness={0.042} />
          <RigLine from={[-8.5, 1, -6]} to={[0, 25, -3]} thickness={0.042} />
          <RigLine from={[0, 25, -3]}   to={[0, 4.5, -24]} thickness={0.055} />
          <RigLine from={[0, 14, -3]}   to={[0, 3.5, -20]} thickness={0.042} />
          <RigLine from={[6, 2.5, 18]}  to={[0, 25, -3]} thickness={0.04} />
          <RigLine from={[-6, 2.5, 18]} to={[0, 25, -3]} thickness={0.04} />
          <RigLine from={[-12, 25, -3]} to={[0, 28, -3]} thickness={0.035} />
          <RigLine from={[12, 25, -3]}  to={[0, 28, -3]} thickness={0.035} />
          <RigLine from={[-9, 14, -3]}  to={[-8.5, 1, 0]} thickness={0.03} />
          <RigLine from={[9, 14, -3]}   to={[8.5, 1, 0]}  thickness={0.03} />
          {[4, 8, 12, 16, 20].map((y, i) => (
            <RigLine key={i}
              from={[8.5 - y * 0.29, y, i * 0.3 - 3]}
              to={[-8.5 + y * 0.29, y, i * 0.3 - 3]}
              thickness={0.022}
            />
          ))}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          FORE MAST
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, 10, -19]} castShadow>
        <cylinderGeometry args={[0.32, 0.42, 20, 12]} />
        <WoodMaterial repeat={[1, 4]} roughness={0.82} />
      </mesh>
      {/* Fore mast cross spar */}
      <mesh position={[0, 14.5, -19]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 14, 8]} />
        <WoodMaterial repeat={[1, 3]} roughness={0.82} />
      </mesh>
      {/* Fore rigging */}
      <RigLine from={[7, 1, -15]}  to={[0, 14.5, -19]} thickness={0.038} />
      <RigLine from={[-7, 1, -15]} to={[0, 14.5, -19]} thickness={0.038} />
      <RigLine from={[0, 14.5, -19]} to={[0, 25, -3]}  thickness={0.040} />

      {/* ════════════════════════════════════════════════════════════
          BOW — Lion Figurehead
      ════════════════════════════════════════════════════════════ */}
      <SunnyBowArmor />
      {/* Bowsprit — horizontal pole pointing forward */}
      <mesh position={[0, 1.5, -32]} rotation={[-0.25, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 10, 10]} />
        <WoodMaterial repeat={[1, 2]} roughness={0.82} />
      </mesh>
      {/* Lion figurehead */}
      <LionFigurehead position={[0, 1.65, -30.2]} />

      {/* ════════════════════════════════════════════════════════════
          STERN — rear of ship
      ════════════════════════════════════════════════════════════ */}
      <SunnySternArchitecture />
      {/* Rudder */}
      <mesh position={[0, -3.8, 27.5]} castShadow>
        <boxGeometry args={[1.2, 4.5, 0.3]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>

      {/* NEW: The ultimate escape engine */}
      <CoupDeBurst position={[0, -3.8, 28]} />

      {/* ════════════════════════════════════════════════════════════
          BASEMENT HATCH — entry to work section aquarium
      ════════════════════════════════════════════════════════════ */}
      <BasementHatch position={[0, 0.46, 5]} />

      {/* ════════════════════════════════════════════════════════════
          ANCHORS — bow sides
      ════════════════════════════════════════════════════════════ */}
      {SHIP_PROP_LAYOUT.anchors.map((position) => (
        <Anchor key={position.join('-')} position={position} />
      ))}

      {/* ════════════════════════════════════════════════════════════
          SERVICE STATIONS — compact against the side lanes
      ════════════════════════════════════════════════════════════ */}
      {SHIP_PROP_LAYOUT.barrelClusters.map((cluster) => (
        <group key={cluster.side}>
          {cluster.barrels.map((barrel) => (
            <Barrel
              key={barrel.position.join('-')}
              position={barrel.position}
              scale={barrel.scale}
            />
          ))}
          <CoiledRope position={cluster.rope} />
        </group>
      ))}

      {/* ════════════════════════════════════════════════════════════
          LANTERNS — atmospheric lighting
      ════════════════════════════════════════════════════════════ */}
      {SHIP_PROP_LAYOUT.railLanterns.map((position) => (
        <RailLanternMount key={position.join('-')} position={position} />
      ))}
      <NightDeckLights active={isNightWeather} />

      {/* ════════════════════════════════════════════════════════════
          MASTHEAD LANTERN — top of mast area
      ════════════════════════════════════════════════════════════ */}
      <Lantern position={[0, 27, -3]} />

      {/* ════════════════════════════════════════════════════════════
          BOLLARDS — rope post pairs on deck edge
      ════════════════════════════════════════════════════════════ */}
      {SHIP_PROP_LAYOUT.bollards.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.75, z]} castShadow>
          <cylinderGeometry args={[0.14, 0.18, 1.1, 10]} />
          <meshStandardMaterial color="#333" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}

      {/* ════════════════════════════════════════════════════════════
          COUP DE VENT CANNON — giant front cannon
      ════════════════════════════════════════════════════════════ */}
      {/* The Sunny's main cannon is now represented inside the lion mouth. */}

          {/* ══════════════════════════════════════════════════════
          GARDEN BASEMENT — work section held for now
        Positioned below deck (y = -14 puts it under the ship floor)
    ══════════════════════════════════════════════════════ */}
    <AquariumBasement position={[0, -14, 2]} onProjectSelect={onProjectSelect} />
    </RigidBody>
  )
}
