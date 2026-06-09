import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
// Update this line at the top of your file
import { useTexture, Text } from '@react-three/drei'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { AnimatedSail } from './AboutSection.jsx'

// ─────────────────────────────────────────────────────────────────────
// PBR TEXTURE HELPER
// Loads full PBR set from ambientcg folders
// ─────────────────────────────────────────────────────────────────────
function usePBR(folder, repeat = [1, 1]) {
  const maps = useTexture({
    map:          `/textures/${folder}/${folder}_Color.jpg`,
    normalMap:    `/textures/${folder}/${folder}_NormalGL.jpg`,
    roughnessMap: `/textures/${folder}/${folder}_Roughness.jpg`,
    aoMap:        `/textures/${folder}/${folder}_AmbientOcclusion.jpg`,
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
// WOOD PLANK MATERIAL — deck floor
const NORMAL_SCALE_DECK = new THREE.Vector2(1.2, 1.2)
const NORMAL_SCALE_WOOD = new THREE.Vector2(1.5, 1.5)

function DeckMaterial({ repeat = [3, 8] }) {
  const maps = usePBR('WoodFloor040_1K-JPG', repeat)
  return (
    <meshStandardMaterial
      {...maps}
      roughness={0.82}
      metalness={0.0}
      aoMapIntensity={1.2}
      normalScale={NORMAL_SCALE_DECK}   // ← stable reference
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
      aoMapIntensity={1.3}
      normalScale={NORMAL_SCALE_WOOD}   // ← stable reference
    />
  )
}

// ─────────────────────────────────────────────────────────────────────
// SAIL FABRIC MATERIAL
// ─────────────────────────────────────────────────────────────────────
function SailMaterial({ repeat = [2, 1.5], color = '#fdfdfd' }) {
  const maps = usePBR('Carpet016_1K-JPG', repeat)
  return (
    <meshStandardMaterial
      {...maps}
      color={color}
      roughness={0.95}
      metalness={0.0}
      side={THREE.DoubleSide}
      aoMapIntensity={0.8}
    />
  )
}

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
    <group position={position} rotation={[0.28, 0, 0]}>
      {/* Outer ring */}
      <mesh castShadow>
        <torusGeometry args={[0.88, 0.075, 10, 24]} />
        <meshStandardMaterial color="#2a1505" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Inner hub ring */}
      <mesh castShadow>
        <torusGeometry args={[0.18, 0.065, 10, 20]} />
        <meshStandardMaterial color="#2a1505" roughness={0.5} metalness={0.15} />
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
      {/* Main head */}
      <mesh castShadow>
        <sphereGeometry args={[2.8, 20, 20]} />
        <meshStandardMaterial color="#FFB300" roughness={0.45} metalness={0.0} />
      </mesh>
      {/* Mane ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[3.5, 0.72, 12, 24]} />
        <meshStandardMaterial color="#E65100" roughness={0.5} metalness={0.0} />
      </mesh>
      {/* Inner mane detail ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
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
        <mesh key={i} position={[x, -1.0, -3.3]} castShadow>
          <boxGeometry args={[0.3, 0.45, 0.2]} />
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
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// CROW'S NEST — top of main mast
// ─────────────────────────────────────────────────────────────────────
function CrowsNest({ position }) {
  return (
    <group position={position}>
      {/* Floor platform */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.4, 22]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      {/* Circular railing */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <torusGeometry args={[2.22, 0.09, 10, 36]} />
        <meshStandardMaterial color="#3d2410" roughness={0.75} />
      </mesh>
      {/* Railing posts */}
      {Array.from({ length: 14 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 14
  return (
    <mesh key={i}
      position={[Math.cos(angle) * 2.22, 0.45, Math.sin(angle) * 2.22]}
    >
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#3d2410" roughness={0.8} />
          </mesh>
        )
      })}
      {/* Flag pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 5, 8]} />
        <meshStandardMaterial color="#2a1505" roughness={0.8} />
      </mesh>
      {/* Straw Hat Pirates Flag */}
      <mesh position={[1.2, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.4, 1.4]} />
        <meshStandardMaterial color="#111111" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* Flag skull */}
      <mesh position={[0.5, 4.7, 0.01]}>
        <circleGeometry args={[0.4, 20]} />
        <meshStandardMaterial color="#f0f0f0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// LADDER — from deck to crow's nest
// ─────────────────────────────────────────────────────────────────────
function Ladder({ position, height = 30, rungs = 18 }) {
  return (
    <group position={position}>
      {/* Left rail */}
      <mesh castShadow>
        <boxGeometry args={[0.07, height, 0.07]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>
      {/* Right rail */}
      <mesh position={[0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.07, height, 0.07]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>
      {/* Rungs */}
      {Array.from({ length: rungs }, (_, i) => (
  <mesh key={i}
    position={[0.3, -height / 2 + 1.5 + i * (height / rungs), 0]}
  >
          <boxGeometry args={[0.62, 0.07, 0.07]} />
          <meshStandardMaterial color="#5C3A21" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// JOLLY ROGER ON SAIL — Straw Hat Pirates emblem
// ─────────────────────────────────────────────────────────────────────
function JollyRoger({ position }) {
  return (
    <group position={position}>
      {/* Skull head */}
      <mesh>
        <sphereGeometry args={[2.5, 24, 24]} />
        <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      {/* Left eye socket */}
      <mesh position={[-0.85, 0.5, -2.4]}>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color="#f5e6cc" side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      {/* Right eye socket */}
      <mesh position={[0.85, 0.5, -2.4]}>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color="#f5e6cc" side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      {/* Straw hat on skull */}
      <mesh position={[0, 2.0, 0]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[2.8, 0.35, 10, 32]} />
        <meshStandardMaterial color="#c8a020" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.4, -0.3]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[1.3, 2.1, 1.1, 24]} />
        <meshStandardMaterial color="#d4a820" roughness={0.85} />
      </mesh>
      {/* Hat band */}
      <mesh position={[0, 2.0, -0.2]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[1.9, 0.18, 8, 28]} />
        <meshStandardMaterial color="#8B1a1a" roughness={0.7} />
      </mesh>
      {/* Crossbones left */}
      <mesh position={[-1.8, -1.5, -2.2]} rotation={[0, 0, 0.7]} castShadow>
        <capsuleGeometry args={[0.18, 3.5, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Crossbones right */}
      <mesh position={[1.8, -1.5, -2.2]} rotation={[0, 0, -0.7]} castShadow>
        <capsuleGeometry args={[0.18, 3.5, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// MAIN SAIL PANEL
// ─────────────────────────────────────────────────────────────────────
function MainSail({ position }) {
  return (
    <group position={position}>
      {/* Main white sail surface */}
      <mesh castShadow>
        <planeGeometry args={[22, 17, 10, 10]} />
        <SailMaterial repeat={[3, 2]} color="#fafaf8" />
      </mesh>
      {/* Red horizontal stripes */}
      {[-5, 0, 5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <planeGeometry args={[22, 1.2]} />
          <meshStandardMaterial color="#c0392b" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

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
function Cannon({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Barrel */}
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.28, 2.2, 14]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.55} metalness={0.5} />
      </mesh>
      {/* Barrel rings */}
      {[-0.6, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} castShadow>
          <torusGeometry args={[0.25, 0.04, 8, 18]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* Cannon wheel left */}
      <mesh position={[-0.55, -0.32, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 14]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      {/* Cannon wheel right */}
      <mesh position={[0.55, -0.32, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 14]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
    </group>
  )
}

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
function Lantern({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
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
function SlideAndSwing() {
  return (
    <group>
      {/* ═ THE SWING ═ */}
      <group position={[2.5, 2, -3]}> 
        <mesh position={[-0.6, 2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 4]} />
          <meshStandardMaterial color="#d4a373" roughness={1} />
        </mesh>
        <mesh position={[0.6, 2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 4]} />
          <meshStandardMaterial color="#d4a373" roughness={1} />
        </mesh>
        
        {/* Swing Seat */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 0.1, 0.6]} />
          {/* Note: If WoodMaterial gives an error, use meshStandardMaterial here */}
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        <CuboidCollider args={[0.8, 0.05, 0.3]} position={[0, 0, 0]} />
      </group>

      {/* ═ THE SLIDE ═ */}
      <group position={[-3, 1.6, 12]} rotation={[-0.6, 0, 0]}>
        {/* Slide Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.2, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
        {/* Left Railing */}
        <mesh position={[-0.7, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 6]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        {/* Right Railing */}
        <mesh position={[0.7, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 6]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        
        {/* THE FIX: The collider rotates perfectly with the group */}
        <CuboidCollider args={[0.75, 0.1, 3]} position={[0, 0, 0]} />
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SOLDIER DOCK SYSTEM HATCHES
// ─────────────────────────────────────────────────────────────────────
function SoldierDockHatches() {
  return (
    <group>
      {/* Channel 1: Port Side (Left) - Waver */}
      <group position={[-8.1, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.6} />
        </mesh>
        {/* The Giant Number 1 */}
        <Text position={[0, 0, 0.15]} fontSize={3} color="#d32f2f" outlineWidth={0.05} outlineColor="#000">
          1
        </Text>
      </group>

      {/* Channel 3: Starboard Side (Right) - Shark Submerge */}
      <group position={[8.1, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.6} />
        </mesh>
        {/* The Giant Number 3 */}
        <Text position={[0, 0, 0.15]} fontSize={3} color="#1976d2" outlineWidth={0.05} outlineColor="#000">
          3
        </Text>
      </group>
    </group>
  )
}







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







function LibrarySurveyRoom({ position }) {
  return (
    <group position={position}>
      {/* 1. EXPANDED FLOOR (Red Carpet) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14.5, 7.5]} /> {/* Increased from 11.6, 5.6 */}
        <meshStandardMaterial color="#3d2410" /> 
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 32]} /> {/* Increased size */}
        <meshStandardMaterial color="#8a1c1c" roughness={0.7} /> 
      </mesh>

      {/* 2. EXPANDED WALLS */}
      {/* Back Wall with Large Window */}
      <mesh position={[0, 2.5, 3.8]} castShadow>
        <boxGeometry args={[14.5, 5, 0.2]} />
        <meshStandardMaterial color="#f0ead6" />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-7.25, 2.5, 0]} castShadow>
        <boxGeometry args={[0.2, 5, 7.5]} />
        <meshStandardMaterial color="#f0ead6" />
      </mesh>
      <mesh position={[7.25, 2.5, 0]} castShadow>
        <boxGeometry args={[0.2, 5, 7.5]} />
        <meshStandardMaterial color="#f0ead6" />
      </mesh>

      {/* 3. INTERIOR PROPS - "FILLED" LOOK */}
      
      {/* Robin's Bookshelf (Multiple units) */}
      {[-5.5, -4, 4, 5.5].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -2]} castShadow>
          <boxGeometry args={[1.2, 3, 0.5]} />
          <meshStandardMaterial color="#3d2410" />
        </mesh>
      ))}

      {/* Nami's Large Survey Table (Center) */}
      <group position={[0, 0, 1]}>
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[4.5, 0.2, 2.5]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
        {/* Telescope on a stand */}
        <mesh position={[2, 2.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.5]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
      </group>

      {/* Globe Stand */}
      <mesh position={[5, 1, 2]} castShadow>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#d4c4a8" />
      </mesh>
      
      {/* 4. ROOF (Pergola style maintained for camera) */}
      <group position={[0, 5, 0]}>
        {[-4, -2, 0, 2, 4].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.2, 8]} />
            <meshStandardMaterial color="#2c1a0c" />
          </mesh>
        ))}
      </group>
    </group>
  )
}
// ─────────────────────────────────────────────────────────────────────
// FISH — animated fish swimming in the aquarium
// ─────────────────────────────────────────────────────────────────────
function Fish({ color = '#ff6b35', startPos = [0,0,0], speed = 0.4, radius = 3, yOffset = 0 }) {
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
        <coneGeometry args={[0.10, 0.24, 5]} rotation={[0,0,Math.PI/2]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// BUBBLE — rising bubble in water
// ─────────────────────────────────────────────────────────────────────
function Bubble({ startPos, speed = 0.35 }) {
  const ref = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const xWobble = useMemo(() => (Math.random() - 0.5) * 0.5, [])
  const frameCount = useRef(0)

  useFrame(({ clock }) => {
    frameCount.current++
    if (frameCount.current % 3 !== 0) return  // ← only run every 3rd frame
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

// ─────────────────────────────────────────────────────────────────────
// PROJECT CARD — 3D panel inside aquarium with project info
// ─────────────────────────────────────────────────────────────────────
function createProjectCardTexture(project) {
  const W = 1024, H = 640
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Dark underwater glass background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, 'rgba(2,22,48,0.96)')
  bg.addColorStop(1, 'rgba(0,12,30,0.98)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Glowing border
  ctx.strokeStyle = project.color
  ctx.lineWidth = 4
  ctx.shadowColor = project.color
  ctx.shadowBlur = 18
  ctx.strokeRect(8, 8, W-16, H-16)
  ctx.shadowBlur = 0

  // Inner subtle border
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.strokeRect(18, 18, W-36, H-36)

  // Top color bar
  ctx.fillStyle = project.color
  ctx.globalAlpha = 0.9
  ctx.fillRect(8, 8, W-16, 6)
  ctx.globalAlpha = 1

  // Stack tag chips
  const tagX = 40
  let tagCurX = tagX
  const tagY = 56
  ctx.font = 'bold 22px monospace'
  project.stack.slice(0, 4).forEach(tag => {
    const tw = ctx.measureText(tag).width + 24
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.roundRect(tagCurX, tagY, tw, 32, 6)
    ctx.fill()
    ctx.fillStyle = project.color
    ctx.fillText(tag, tagCurX + 12, tagY + 22)
    tagCurX += tw + 10
  })

  // Title
  ctx.font = 'bold 72px Georgia, serif'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = project.color
  ctx.shadowBlur = 12
  ctx.fillText(project.name, 40, 180)
  ctx.shadowBlur = 0

  // Separator line
  ctx.strokeStyle = project.color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.moveTo(40, 200); ctx.lineTo(W-40, 200); ctx.stroke()
  ctx.globalAlpha = 1

  // Description — word wrapped
  ctx.font = '32px Georgia, serif'
  ctx.fillStyle = 'rgba(200,220,255,0.88)'
  const words = project.desc.split(' ')
  let line = '', lines = [], maxW = W - 80
  words.forEach(word => {
    const test = line + word + ' '
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line); line = word + ' '
    } else line = test
  })
  lines.push(line)
  lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, 40, 260 + i * 46))

  // Bottom live link pill
  ctx.fillStyle = project.color
  ctx.globalAlpha = 0.18
  ctx.beginPath(); ctx.roundRect(40, H-100, 280, 52, 26); ctx.fill()
  ctx.globalAlpha = 1
  ctx.font = 'bold 28px monospace'
  ctx.fillStyle = project.color
  ctx.fillText('⬡  LIVE PROJECT', 65, H-68)

  // Bottom right — year
  ctx.font = 'bold 26px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.textAlign = 'right'
  ctx.fillText(project.year, W-40, H-68)
  ctx.textAlign = 'left'

  // Water caustic shimmer overlay
  const causticPoints = [[200,120],[600,80],[400,300],[150,400],[750,200],[500,500]]
  for (let i = 0; i < causticPoints.length; i++) {
    const [gx, gy] = causticPoints[i]
    const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, 100)
    gr.addColorStop(0, 'rgba(100,200,255,0.06)')
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function ProjectCard({ project, position, rotation = [0, 0, 0], onSelect }) {
  const ref = useRef()
  const tex = useMemo(() => createProjectCardTexture(project), [project])
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const handleSelect = (event) => {
    event.stopPropagation()
    if (onSelect) onSelect(project)
  }

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.4 + phase) * 0.12
    }
  })

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onClick={handleSelect}
      onPointerOver={(event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {/* Glass frame */}
      <mesh castShadow>
        <boxGeometry args={[5.2, 3.3, 0.08]} />
        <meshStandardMaterial
          color="#0a2040"
          roughness={0.05}
          metalness={0.4}
          transparent
          opacity={0.7}
          emissive="#001830"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Card texture face */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[5.0, 3.15]} />
        <meshStandardMaterial map={tex} roughness={0.1} transparent opacity={0.97} side={THREE.FrontSide} emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>
      {/* Glowing edge frame */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[5.22, 3.32, 0.02]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.0}
          wireframe
        />
      </mesh>
      {/* Corner bolts */}
      {[[-2.4,1.4],[ 2.4,1.4],[-2.4,-1.4],[2.4,-1.4]].map(([x,y],i) => (
        <mesh key={i} position={[x, y, 0.06]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 10]} rotation={[Math.PI/2,0,0]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// CAUSTIC LIGHT PANEL — animated underwater light shimmer on floor
// ─────────────────────────────────────────────────────────────────────
function CausticFloor({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current?.material) {
      ref.current.material.emissiveIntensity = 0.08 + Math.sin(clock.getElapsedTime() * 1.2) * 0.05
    }
  })
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
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

// ─────────────────────────────────────────────────────────────────────
// FULL AQUARIUM BASEMENT — the Work section
// ─────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    name: 'SentinelMesh',
    desc: 'Autonomous threat intelligence network — ESP32 swarm with on-device AI inference, blockchain audit log, live D3 attack heatmap.',
    stack: ['ESP32', 'TFLite', 'React', 'Web3'],
    color: '#ff4444',
    year: '2026',
    url: '#'
  },
  {
    name: 'Vivayu',
    desc: 'Proactive AgTech platform — XGBoost crop disease detection, voice-first RAG assistant, auto-generated pesticide reports.',
    stack: ['Python', 'LangChain', 'FAISS', 'Groq'],
    color: '#44ff88',
    year: '2025',
    url: 'https://ml-project-6c8bzwvgvr8xibunhdsjtt.streamlit.app'
  },
  {
    name: 'DevBoard',
    desc: 'Full-stack indie talent marketplace — founders post projects, developers pitch. JWT auth, PostgreSQL, fully deployed.',
    stack: ['Next.js', 'Node', 'PostgreSQL', 'Railway'],
    color: '#4488ff',
    year: '2025',
    url: 'https://devboard-gamma-gilt.vercel.app'
  },
  {
    name: 'Hack Battle',
    desc: '36-hour hackathon platform serving 500+ participants. Game-inspired visuals, high-concurrency registration — zero UI failures.',
    stack: ['React', 'Tailwind', 'Figma'],
    color: '#ff8844',
    year: '2025',
    url: 'https://hackbattle25.ieeecsvit.com'
  },
  {
    name: 'Model Arena',
    desc: 'Competitive ML hackathon platform — futuristic design system, strong visual hierarchy across the full event lifecycle.',
    stack: ['React', 'Tailwind', 'Figma'],
    color: '#cc44ff',
    year: '2025',
    url: 'https://model-arena.netlify.app'
  },
  {
    name: 'IEEE CS Website',
    desc: 'Official IEEE CS VIT chapter platform — modern UI, responsive architecture, brand consistency, accessibility standards.',
    stack: ['React', 'Tailwind', 'Figma'],
    color: '#44ddff',
    year: '2025',
    url: 'https://ieeecsvit.com'
  },
]

// ─────────────────────────────────────────────────────────────────────
// AQUARIUM TANK — one of 6 project tanks built into the wall
// ─────────────────────────────────────────────────────────────────────
function ProjectTank({ project, position, facingRight = true, onSelect }) {
  const cardRef = useRef()
  const phase   = useMemo(() => Math.random() * Math.PI * 2, [])
  const tex     = useMemo(() => createProjectCardTexture(project), [project])

  useFrame(({ clock }) => {
    if (!cardRef.current) return
    cardRef.current.position.y = 3.0 + Math.sin(clock.getElapsedTime() * 0.5 + phase) * 0.12
  })

  // dir: +1 = tank faces right (left wall), -1 = tank faces left (right wall)
  const dir = facingRight ? 1 : -1

  return (
    <group position={position}>
      {/* Back panel — flush against the wall */}
      <mesh position={[-dir * 2.0, 3, 0]}>
        <boxGeometry args={[0.2, 6, 5]} />
        <meshStandardMaterial color="#010d18" roughness={0.95} />
      </mesh>
      {/* Top */}
      <mesh position={[0, 6.06, 0]}>
        <boxGeometry args={[4.1, 0.12, 5.1]} />
        <meshStandardMaterial color="#1a3a5a" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Bottom rim */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[4.1, 0.12, 5.1]} />
        <meshStandardMaterial color="#1a3a5a" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Side glass — Z axis */}
      <mesh position={[0, 3, -2.5]}>
        <boxGeometry args={[4, 6, 0.07]} />
        <meshStandardMaterial color="#44aaff" roughness={0.04} transparent opacity={0.22} emissive="#0044bb" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 3, 2.5]}>
        <boxGeometry args={[4, 6, 0.07]} />
        <meshStandardMaterial color="#44aaff" roughness={0.04} transparent opacity={0.22} emissive="#0044bb" emissiveIntensity={0.1} />
      </mesh>
      {/* Front glass — faces INTO room — CLICKABLE */}
      <mesh
        position={[dir * 2.0, 3, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect && onSelect(project) }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <boxGeometry args={[0.07, 6, 5]} />
        <meshStandardMaterial color="#44aaff" roughness={0.02} transparent opacity={0.18} emissive="#0055cc" emissiveIntensity={0.1} />
      </mesh>
      {/* Corner frame posts */}
      {[[dir*2, 3, -2.5],[dir*2, 3, 2.5],[-dir*2, 3, -2.5],[-dir*2, 3, 2.5]].map(([x,y,z],i) => (
        <mesh key={i} position={[x,y,z]}>
          <boxGeometry args={[0.1, 6.1, 0.1]} />
          <meshStandardMaterial color="#1a3a5a" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* Water volume */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[3.9, 5.9, 4.9]} />
        <meshStandardMaterial color="#021428" roughness={0.05} transparent opacity={0.48} emissive="#010c1e" emissiveIntensity={0.08} />
      </mesh>

      {/* 2 fish */}
      <Fish color={project.color} startPos={[0, 3, 0]} radius={1.2} speed={0.4}  yOffset={0}   />
      <Fish color="#ffffff"       startPos={[0, 2.5, 0]} radius={0.8} speed={0.55} yOffset={0.4} />

      {/* 3 bubbles */}
      <Bubble startPos={[-0.8, 0.3, -0.6]} speed={0.25} />
      <Bubble startPos={[0.6,  0.3,  0.7]} speed={0.30} />
      <Bubble startPos={[0.1,  0.3, -0.2]} speed={0.27} />

      {/* Floating project card — faces into room */}
      <group ref={cardRef} position={[0, 3, 0]} rotation={[0, facingRight ? 0 : Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[3.6, 2.4]} />
          <meshStandardMaterial map={tex} roughness={0.1} transparent opacity={0.97} side={THREE.FrontSide} />
        </mesh>
      </group>

      {/* Tank floor sand */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[3.9, 4.9]} />
        <meshStandardMaterial color="#0a1520" roughness={0.95} />
      </mesh>
      {/* Small coral */}
      {[[-0.8,0.3,-1],[0.6,0.3,0.8],[-0.3,0.3,1.2]].map(([x,y,z],i) => (
        <mesh key={i} position={[x,y,z]}>
          <cylinderGeometry args={[0.05,0.08,0.4+i*0.1,6]} />
          <meshStandardMaterial color={i%2===0?'#ff5533':'#ff8800'} roughness={0.7} emissive={i%2===0?'#ff2200':'#ff5500'} emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* Top tank light */}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// BASEMENT ROOM — proper wooden room + 6 aquarium project tanks
// ─────────────────────────────────────────────────────────────────────
function AquariumBasement({ position = [0, -14, 2], onProjectSelect }) {
  return (
    <group position={position}>

      {/* ── FLOOR ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#3d2008" roughness={0.9} />
      </mesh>
      {/* Green grass center walkway */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[8, 14]} />
        <meshStandardMaterial color="#2d5a1b" roughness={0.95} />
      </mesh>

      {/* ── CEILING ── */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#1a0a02" roughness={0.95} />
      </mesh>
      {/* Ceiling beams */}
      {[-7, 0, 7].map((x, i) => (
        <mesh key={i} position={[x, 9.6, 0]}>
          <boxGeometry args={[0.5, 0.5, 18]} />
          <meshStandardMaterial color="#2a1005" roughness={0.9} />
        </mesh>
      ))}

      {/* ── 4 SOLID WALLS — fully closed room ── */}
      {/* Back wall */}
      <mesh position={[0, 5, -9]}>
        <boxGeometry args={[22, 10, 0.4]} />
        <meshStandardMaterial color="#2a1505" roughness={0.88} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 5, 9]}>
        <boxGeometry args={[22, 10, 0.4]} />
        <meshStandardMaterial color="#2a1505" roughness={0.88} />
      </mesh>
      {/* Left wall — tanks are built INTO this */}
      <mesh position={[-11, 5, 0]}>
        <boxGeometry args={[0.4, 10, 18]} />
        <meshStandardMaterial color="#2a1505" roughness={0.88} />
      </mesh>
      {/* Right wall */}
      <mesh position={[11, 5, 0]}>
        <boxGeometry args={[0.4, 10, 18]} />
        <meshStandardMaterial color="#2a1505" roughness={0.88} />
      </mesh>

      {/* ── FURNITURE ── */}
      {/* Center table */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[3, 0.18, 1.8]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.8} />
      </mesh>
      {[[-1,-1.4,-0.6],[1,-1.4,-0.6],[-1,-1.4,0.6],[1,-1.4,0.6]].map(([x,y,z],i) => (
        <mesh key={i} position={[x, y+1.5, z]}>
          <cylinderGeometry args={[0.07,0.07,1.8,7]} />
          <meshStandardMaterial color="#3d2410" roughness={0.85} />
        </mesh>
      ))}
      {/* Barrels */}
      <Barrel position={[-9.5, 0.45, 7.5]} />
      <Barrel position={[9.5,  0.45, 7.5]} />
      <Barrel position={[-9.5, 0.45,-7.5]} scale={0.85} />
      <Barrel position={[9.5,  0.45,-7.5]} scale={0.85} />

      {/* Lanterns */}
      <Lantern position={[0, 8.8, 0]} />
      <Lantern position={[-5, 8.8, -5]} />
      <Lantern position={[5, 8.8, -5]} />
      <Lantern position={[-5, 8.8, 5]} />
      <Lantern position={[5, 8.8, 5]} />

      {/* Skylight */}
      <mesh position={[0, 9.88, 5]} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[1.4, 2.5, 20]} />
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 9.85, 5]} rotation={[Math.PI/2, 0, 0]}>
        <circleGeometry args={[1.4, 20]} />
        <meshStandardMaterial color="#44aaff" roughness={0.05} transparent opacity={0.5} emissive="#44aaff" emissiveIntensity={0.5} />
      </mesh>

      {/* ── 6 PROJECT TANKS on left/right walls ── */}
      {/* LEFT wall tanks — flush against X=-11 wall, facing RIGHT into room */}
      <ProjectTank project={PROJECTS[0]} position={[-10.8, 0, -5.5]} facingRight={true} onSelect={onProjectSelect} />
      <ProjectTank project={PROJECTS[1]} position={[-10.8, 0,  0]}   facingRight={true} onSelect={onProjectSelect} />
      <ProjectTank project={PROJECTS[2]} position={[-10.8, 0,  5.5]} facingRight={true} onSelect={onProjectSelect} />
      {/* RIGHT wall tanks — flush against X=+11 wall, facing LEFT into room */}
      <ProjectTank project={PROJECTS[3]} position={[10.8,  0, -5.5]} facingRight={false} onSelect={onProjectSelect} />
      <ProjectTank project={PROJECTS[4]} position={[10.8,  0,  0]}   facingRight={false} onSelect={onProjectSelect} />
      <ProjectTank project={PROJECTS[5]} position={[10.8,  0,  5.5]} facingRight={false} onSelect={onProjectSelect} />

      {/* ── LIGHTS ── */}
      <pointLight position={[0, 8.5, 0]}  color="#ffcc88" intensity={18} distance={30} decay={0.7} />
      <pointLight position={[0, 4, 0]}    color="#2244aa" intensity={6}  distance={20} decay={1.0} />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// COUP DE VENT CANNON — the giant front cannon on Sunny
// ─────────────────────────────────────────────────────────────────────
function CoupDeVentCannon({ position }) {
  return (
    <group position={position} rotation={[0.15, 0, 0]}>
      {/* Main barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.72, 5.5, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Muzzle ring */}
      <mesh position={[0, 0, -2.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.58, 0.12, 10, 24]} />
        <meshStandardMaterial color="#444" roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Breech end cap */}
      <mesh position={[0, 0, 2.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.4, 16]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Reinforcement rings along barrel */}
      {[-1.8, -0.6, 0.6, 1.8].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <torusGeometry args={[0.62 + i*0.02, 0.07, 8, 20]} />
          <meshStandardMaterial color="#555" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      {/* Cannon mouth dark hole */}
      <mesh position={[0, 0, -2.95]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 20]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
      {/* Wooden carriage left */}
      <mesh position={[-0.85, -0.75, 0]} castShadow>
        <boxGeometry args={[0.25, 1.0, 4.5]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      {/* Wooden carriage right */}
      <mesh position={[0.85, -0.75, 0]} castShadow>
        <boxGeometry args={[0.25, 1.0, 4.5]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      {/* Carriage wheels */}
      {[-1.5, 1.5].map((z, i) => (
        <group key={i}>
          <mesh position={[-1.05, -1.05, z]} rotation={[0, 0, Math.PI/2]} castShadow>
            <torusGeometry args={[0.35, 0.07, 8, 16]} />
            <meshStandardMaterial color="#2a1505" roughness={0.8} />
          </mesh>
          <mesh position={[1.05, -1.05, z]} rotation={[0, 0, Math.PI/2]} castShadow>
            <torusGeometry args={[0.35, 0.07, 8, 16]} />
            <meshStandardMaterial color="#2a1505" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SUNNY'S ICONIC OBSERVATION DECK — the wraparound stern balcony
// ─────────────────────────────────────────────────────────────────────
function SternBalcony({ position }) {
  return (
    <group position={position}>
      {/* Balcony floor */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[18, 0.28, 3.5]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      {/* Back railing */}
      <mesh position={[0, 0.7, 1.8]} castShadow>
        <boxGeometry args={[18, 1.2, 0.2]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      {/* Balusters */}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[-8.2 + i * 1.64, 0.5, 1.75]} castShadow>
          <boxGeometry args={[0.15, 1.0, 0.15]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>
      ))}
      {/* Decorative stern lanterns */}
      <Lantern position={[-8, 1.8, 0]} />
      <Lantern position={[8, 1.8, 0]} />
      {/* Decorative carved sun panels on stern face */}
      {[-5, 0, 5].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.12, 6]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// CHICKEN VOYAGE PADDLE WHEELS — Sunny's emergency propulsion  
// ─────────────────────────────────────────────────────────────────────
function PaddleWheel({ position, side = 1 }) {
  return (
    <group position={position}>
      {/* Main wheel hub */}
      <mesh rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.5, 20]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      {/* Hub center */}
      <mesh rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.6, 12]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Paddle blades — 8 of them */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8
        return (
          <mesh
            key={i}
            position={[0, Math.sin(angle) * 1.6, Math.cos(angle) * 1.6]}
            rotation={[angle, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.55, 0.25, 0.85]} />
            <meshStandardMaterial color="#c0392b" roughness={0.7} />
          </mesh>
        )
      })}
      {/* Spokes */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i * Math.PI) / 4 - Math.PI/8
        return (
          <mesh key={i} rotation={[angle, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 4.4, 0.18]} />
            <meshStandardMaterial color="#5C3A21" roughness={0.85} />
          </mesh>
        )
      })}
      {/* Housing box */}
      <mesh position={[side * 0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 4.8, 4.8]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// TREASURE CHEST — for atmosphere on deck
// ─────────────────────────────────────────────────────────────────────
function TreasureChest({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Chest body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.55, 0.6]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      {/* Domed lid */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.28, 20, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI/2]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      {/* Metal corner banding */}
      {[[-0.45,0,0],[0.45,0,0],[0,0,-0.3],[0,0,0.3]].map(([x,y,z],i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={i < 2 ? [0.06, 0.58, 0.62] : [0.92, 0.58, 0.06]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      {/* Front lock */}
      <mesh position={[0, 0.08, -0.32]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.06]} />
        <meshStandardMaterial color="#c8a020" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Gold keyhole */}
      <mesh position={[0, 0.08, -0.36]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
    </group>
  )
}




// ─────────────────────────────────────────────────────────────────────
// SANJI'S KITCHEN + DINING HALL — restaurant-style, stern second floor
// ─────────────────────────────────────────────────────────────────────
function KitchenDiningHall({ position }) {
  return (
    <group position={position}>
      {/* Main building shell */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[14, 5.5, 8]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.85} />
      </mesh>

      {/* Roof — warm dark wood */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[14.8, 0.4, 8.8]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>
      {/* Roof ridge beam */}
      <mesh position={[0, 4.0, 0]} castShadow>
        <boxGeometry args={[15, 0.35, 0.35]} />
        <meshStandardMaterial color="#2a1505" roughness={0.8} />
      </mesh>
      {/* Roof slope left */}
      <mesh position={[-7.2, 3.55, 0]} rotation={[0, 0, 0.42]} castShadow>
        <boxGeometry args={[0.3, 1.8, 8.8]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>
      {/* Roof slope right */}
      <mesh position={[7.2, 3.55, 0]} rotation={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[0.3, 1.8, 8.8]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>

      {/* Front wall with big window opening */}
      <mesh position={[0, 0, -4.1]} castShadow>
        <boxGeometry args={[14, 5.5, 0.25]} />
        <meshStandardMaterial color="#b8a88a" roughness={0.85} />
      </mesh>
      {/* Large front windows — 3 across */}
      {[-4.5, 0, 4.5].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -4.18]}>
          <boxGeometry args={[3.2, 2.8, 0.08]} />
          <meshStandardMaterial color="#88ccdd" roughness={0.05} metalness={0.1} transparent opacity={0.55} emissive="#aaddee" emissiveIntensity={0.08} />
        </mesh>
      ))}
      {/* Window frames */}
      {[-4.5, 0, 4.5].map((x, i) => (
        <group key={i} position={[x, 0.5, -4.12]}>
          <mesh><boxGeometry args={[3.3, 0.12, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
          <mesh position={[0, -1.5, 0]}><boxGeometry args={[3.3, 0.12, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
          <mesh position={[-1.6, 0, 0]}><boxGeometry args={[0.12, 3.0, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
          <mesh position={[1.6, 0, 0]}><boxGeometry args={[0.12, 3.0, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
        </group>
      ))}

      {/* DINING AREA — long table */}
      <mesh position={[0, -1.5, 1]} castShadow>
        <boxGeometry args={[10, 0.22, 2.2]} />
        <meshStandardMaterial color="#6b3d1e" roughness={0.7} />
      </mesh>
      {/* Table legs */}
      {[[-4.2,-1],[4.2,-1],[-4.2,1],[4.2,1]].map(([x,z],i) => (
        <mesh key={i} position={[x, -2.4, z]} castShadow>
          <cylinderGeometry args={[0.1,0.1,1.8,8]} />
          <meshStandardMaterial color="#4a2510" roughness={0.8} />
        </mesh>
      ))}
      {/* Dining chairs — left row */}
      {[-3.5,-1.5,0.5,2.5].map((x,i) => (
        <group key={i} position={[x, -2.0, -1.5]}>
          <mesh castShadow><boxGeometry args={[0.7,0.08,0.7]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
          <mesh position={[0,0.65,0.3]} castShadow><boxGeometry args={[0.7,1.3,0.08]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
        </group>
      ))}
      {/* Dining chairs — right row */}
      {[-3.5,-1.5,0.5,2.5].map((x,i) => (
        <group key={i} position={[x, -2.0, 2.5]}>
          <mesh castShadow><boxGeometry args={[0.7,0.08,0.7]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
          <mesh position={[0,0.65,-0.3]} castShadow><boxGeometry args={[0.7,1.3,0.08]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
        </group>
      ))}

      {/* KITCHEN COUNTER — back wall */}
      <mesh position={[0, -1.6, 3.5]} castShadow>
        <boxGeometry args={[12, 1.8, 0.9]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.8} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, -0.65, 3.5]} castShadow>
        <boxGeometry args={[12.2, 0.12, 1.0]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Pots on counter */}
      {[-4, -1.5, 1.5, 4].map((x,i) => (
        <mesh key={i} position={[x, -0.35, 3.5]} castShadow>
          <cylinderGeometry args={[0.28,0.22,0.45,12]} />
          <meshStandardMaterial color={i%2===0?"#555":"#c0392b"} roughness={0.5} metalness={i%2===0?0.6:0.1} />
        </mesh>
      ))}
      {/* Overhead hanging pots rack */}
      <mesh position={[0, 1.2, 3.2]} castShadow>
        <boxGeometry args={[10, 0.08, 0.08]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.7} />
      </mesh>
      {[-3.5,-1.5,0.5,2.5].map((x,i) => (
        <group key={i} position={[x, 0.8, 3.2]}>
          <mesh castShadow><cylinderGeometry args={[0.02,0.02,0.45,6]} /><meshStandardMaterial color="#666" roughness={0.4} metalness={0.7} /></mesh>
          <mesh position={[0,-0.35,0]} castShadow>
            <cylinderGeometry args={[0.18,0.14,0.32,10]} />
            <meshStandardMaterial color="#444" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Side wall decorative wood panels */}
      {[-6.8, 6.8].map((x,i) => (
        <group key={i} position={[x, 0, 0]}>
          {[-1.5, 0.5].map((z,j) => (
            <mesh key={j} position={[0, 0.2, z]} castShadow>
              <boxGeometry args={[0.08, 3.5, 1.8]} />
              <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Lanterns inside */}
      <Lantern position={[-5, 1.8, -2]} />
      <Lantern position={[5,  1.8, -2]} />
      <Lantern position={[0,  1.8,  2]} />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────
// DOME CROW'S NEST — proper dome-shaped hut with gym equipment
// ─────────────────────────────────────────────────────────────────────
function DomeCrowsNest({ position }) {
  return (
    <group position={position}>
      {/* Platform floor */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2.6, 2.8, 0.45, 24]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      {/* Dome body */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[2.5, 16, 12, 0, Math.PI*2, 0, Math.PI/2]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* Dome base ring */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[2.52, 2.52, 0.35, 24]} />
        <meshStandardMaterial color="#b8a88a" roughness={0.8} />
      </mesh>
      {/* Windows — 6 around dome */}
      {Array.from({length:6},(_,i) => {
        const angle = (i * Math.PI*2)/6
        return (
          <mesh key={i}
            position={[Math.cos(angle)*2.15, 1.2, Math.sin(angle)*2.15]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.9, 0.75, 0.08]} />
            <meshStandardMaterial color="#88ccdd" roughness={0.05} metalness={0.1} transparent opacity={0.6} emissive="#aaddee" emissiveIntensity={0.12} />
          </mesh>
        )
      })}
      {/* Window frames */}
      {Array.from({length:6},(_,i) => {
        const angle = (i * Math.PI*2)/6
        return (
          <mesh key={i}
            position={[Math.cos(angle)*2.12, 1.2, Math.sin(angle)*2.12]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[1.0, 0.88, 0.06]} />
            <meshStandardMaterial color="#3d2410" roughness={0.8} transparent opacity={0.0} />
          </mesh>
        )
      })}
      {/* Dome top cap */}
      <mesh position={[0, 4.0, 0]} castShadow>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Flag pole */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3.5, 8]} />
        <meshStandardMaterial color="#2a1505" roughness={0.8} />
      </mesh>
      {/* Straw Hat Jolly Roger flag */}
      <mesh position={[1.4, 6.8, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[3.0, 1.6]} />
        <meshStandardMaterial color="#111" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* Flag skull circle */}
      <mesh position={[0.6, 6.9, 0.01]}>
        <circleGeometry args={[0.45, 20]} />
        <meshStandardMaterial color="#f0f0f0" side={THREE.DoubleSide} />
      </mesh>
      {/* Straw hat brim on flag skull */}
      <mesh position={[0.6, 7.28, 0.02]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.55, 0.1, 8, 24]} />
        <meshStandardMaterial color="#c8a020" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* GYM EQUIPMENT inside */}
      {/* Dumbbell rack */}
      <mesh position={[0.8, 0.55, 0.5]} castShadow>
        <boxGeometry args={[1.2, 0.22, 0.4]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.6} />
      </mesh>
      {[-0.3, 0.3].map((x,i) => (
        <mesh key={i} position={[x+0.8, 0.78, 0.5]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} rotation={[0,0,Math.PI/2]} />
          <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* Pull-up bar */}
      <mesh position={[0, 2.8, -1.8]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} rotation={[0,0,Math.PI/2]} />
        <meshStandardMaterial color="#666" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Bench */}
      <mesh position={[-0.8, 0.5, -0.5]} castShadow>
        <boxGeometry args={[0.5, 0.18, 1.2]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.8} />
      </mesh>

      {/* Circular bench around edge */}
      {Array.from({length:10},(_,i) => {
        const angle = (i*Math.PI*2)/10
        return (
          <mesh key={i} position={[Math.cos(angle)*1.8, 0.42, Math.sin(angle)*1.8]} rotation={[0,-angle,0]} castShadow>
            <boxGeometry args={[1.1, 0.22, 0.4]} />
            <meshStandardMaterial color="#5C3A21" roughness={0.85} />
          </mesh>
        )
      })}

      {/* Telescopic equipment */}
      <mesh position={[0, 1.5, 0]} rotation={[0.3, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.8, 12]} />
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Railing around platform */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <torusGeometry args={[2.62, 0.07, 10, 36]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      {Array.from({length:16},(_,i) => {
        const angle = (i*Math.PI*2)/16
        return (
          <mesh key={i} position={[Math.cos(angle)*2.62, 0.65, Math.sin(angle)*2.62]} castShadow>
            <boxGeometry args={[0.1, 0.85, 0.1]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

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
function FlowerGarden({ position }) {
  const flowers = [
    { p:[0,0,0], color:'#e91e63', stemH:0.55 },
    { p:[0.7,0,0.4], color:'#9c27b0', stemH:0.45 },
    { p:[-0.6,0,0.5], color:'#ff5722', stemH:0.6 },
    { p:[0.3,0,0.9], color:'#ffeb3b', stemH:0.5 },
    { p:[-0.9,0,0.2], color:'#ff9800', stemH:0.4 },
    { p:[1.1,0,0.7], color:'#e91e63', stemH:0.52 },
    { p:[-0.3,0,1.1], color:'#fff176', stemH:0.48 },
    { p:[0.8,0,-0.3], color:'#ce93d8', stemH:0.58 },
  ]
  return (
    <group position={position}>
      {/* Planter box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.35, 1.8]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[2.6, 0.15, 1.6]} />
        <meshStandardMaterial color="#2d1a08" roughness={1.0} />
      </mesh>
      {/* Flowers */}
      {flowers.map(({p,color,stemH},i) => (
        <group key={i} position={[p[0]-1.2, 0.28, p[2]-0.7]}>
          {/* Stem */}
          <mesh position={[0, stemH/2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, stemH, 6]} />
            <meshStandardMaterial color="#388e3c" roughness={0.9} />
          </mesh>
          {/* Petals */}
          {[0,1,2,3,4].map(pi => (
            <mesh key={pi}
              position={[Math.cos(pi*Math.PI*2/5)*0.1, stemH+0.04, Math.sin(pi*Math.PI*2/5)*0.1]}
              castShadow
            >
              <sphereGeometry args={[0.085, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
          {/* Center */}
          <mesh position={[0, stemH+0.06, 0]} castShadow>
            <sphereGeometry args={[0.072, 8, 8]} />
            <meshStandardMaterial color="#fff176" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}


// ─────────────────────────────────────────────────────────────────────
// THE THOUSAND SUNNY — COMPLETE SHIP
// ─────────────────────────────────────────────────────────────────────

function BowPlatform({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[10, 0.3, 4]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      <mesh position={[-5.1, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 1.2, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[5.1, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 1.2, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.7, -2.1]} castShadow>
        <boxGeometry args={[10, 1.2, 0.2]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      {[-4,-2.5,-1,0,1,2.5,4].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -2]}>
          <boxGeometry args={[0.15, 1.0, 0.15]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export default function Ship({ aboutActive = false, onProjectSelect }) {
  const shipRef = useRef()

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
      {/* ════════════════════════════════════════════════════════════
          NEW COLLIDERS (TREES, SLIDE, HATCH, WHEEL)
      ════════════════════════════════════════════════════════════ */}
      {/* Mikan Tree Planter & Trunks */}
      <CuboidCollider args={[2.25, 1.5, 2.25]} position={[-5.8, 3.5, 18.8]} />
      
      {/* The Slide (Matches rotation and angle so Luffy walks up/down it) */}
      <CuboidCollider args={[0.75, 0.2, 3]} position={[-3, 1.6, 12]} rotation={[-0.6, 0, 0]} />
      
      {/* The Basement Hatch (Allows Luffy to step up onto the wood panel) */}
      <CuboidCollider args={[1.75, 0.1, 1.25]} position={[0, 0.46, 5]} />
      
      {/* Ship Wheel Column */}
      <CuboidCollider args={[0.8, 1.0, 0.5]} position={[0, 3.5, 19.8]} />
      {/* Quarterdeck floor */}
      {/* ════════════════════════════════════════════════════════════
          NAMI'S MIKAN ORCHARD PLANTER (FIXED PHYSICS)
      ════════════════════════════════════════════════════════════ */}
      <MikanTree position={[-6.0, 2.74, 17.5]} scale={1.1} />
      <MikanTree position={[-4.5, 2.74, 19.0]} scale={0.9} />
      <MikanTree position={[-7.0, 2.74, 20.0]} scale={1.0} />
      
      {/* THE FIX: Changed RigidBody to group */}
      <group position={[-5.8, 2.8, 18.8]}>
        {/* Wooden container */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.5, 0.3, 4.5]} />
          {/* Note: Ensure WoodMaterial is defined, or use meshStandardMaterial */}
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        {/* Dirt */}
        <mesh position={[0, 0.14, 0]} receiveShadow>
          <boxGeometry args={[4.3, 0.05, 4.3]} />
          <meshStandardMaterial color="#3e2723" roughness={1.0} />
        </mesh>
        {/* Planter Box Physical Hitbox */}
        <CuboidCollider args={[2.25, 0.2, 2.25]} position={[0, 0, 0]} />
      </group>

      {/* ════════════════════════════════════════════════════════════
          ICONIC EXTERIOR DETAILS
      ════════════════════════════════════════════════════════════ */}
      <SlideAndSwing />
      <SoldierDockHatches />
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
      {/* Step to quarterdeck */}
      <CuboidCollider args={[8.5, 1.5, 0.4]} position={[0, 1.2, 13.0]} />
      {/* Step to forecastle */}
      <CuboidCollider args={[8.5, 1.5, 0.4]} position={[0, 1.2, -13.0]} />
      {/* Barrel cluster blocker */}
      <CuboidCollider args={[1.0, 1.0, 1.0]} position={[-6.5, 1.0, -10]} />
      <CuboidCollider args={[1.0, 1.0, 1.0]} position={[6.5, 1.0, -10]} />

      {/* ════════════════════════════════════════════════════════════
          HULL
          The main wooden body of the Thousand Sunny
      ════════════════════════════════════════════════════════════ */}
      {/* Main hull body */}
      <mesh position={[0, -3.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[18, 5.2, 52, 4, 2, 6]} />
        <WoodMaterial repeat={[5, 2]} />
      </mesh>
      {/* Hull left side darker planks */}
      <mesh position={[-9.3, -3.0, 0]} castShadow>
        <boxGeometry args={[0.55, 5.0, 52]} />
        <WoodMaterial repeat={[8, 1]} roughness={0.95} />
      </mesh>
      {/* Hull right side darker planks */}
      <mesh position={[9.3, -3.0, 0]} castShadow>
        <boxGeometry args={[0.55, 5.0, 52]} />
        <WoodMaterial repeat={[8, 1]} roughness={0.95} />
      </mesh>
      {/* Keel/bottom */}
      <mesh position={[0, -5.6, 0]} receiveShadow>
        <boxGeometry args={[18, 0.45, 52]} />
        <WoodMaterial repeat={[4, 8]} roughness={0.95} />
      </mesh>
      {/* Green stripe on hull — Sunny's iconic band */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[18.2, 0.5, 52.2]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.85} />
      </mesh>
      {/* White trim above green */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[18.2, 0.18, 52.2]} />
        <meshStandardMaterial color="#fafafa" roughness={0.7} />
      </mesh>

      {/* ════════════════════════════════════════════════════════════
          MAIN DECK
          Wood floor with visible planks
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, 0.18, -1]} receiveShadow>
        <boxGeometry args={[17.2, 0.38, 42, 10, 1, 14]} />
        <DeckMaterial repeat={[3, 7]} />
      </mesh>
      {/* Plank groove lines */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[0, 0.38, i * 2.7 - 20]} receiveShadow>
          <boxGeometry args={[17.2, 0.04, 0.05]} />
          <meshStandardMaterial color="#2a1505" roughness={1} />
        </mesh>
      ))}

      {/* ════════════════════════════════════════════════════════════
          GRASS LAWN — Thousand Sunny's iconic mid-deck grass
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, 0.42, -3]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.12, 24]} />
        <meshStandardMaterial color="#388e3c" roughness={1.0} metalness={0.0} />
      </mesh>
      {/* Grass texture overlay */}
      <mesh position={[0, 0.49, -3]}>
        <boxGeometry args={[15, 0.04, 24]} />
        <meshStandardMaterial color="#4CAF50" roughness={1.0} metalness={0.0} transparent opacity={0.6} />
      </mesh>
      {/* Grass border trim */}
      <AquariumSkylight position={[0, 0.54, -7]} />
      {[[-7.6, 0, -3], [7.6, 0, -3], [0, 0, -15.1], [0, 0, 9.1]].map(([x, y, z], i) => {
        const isHoriz = i < 2
        return (
          <mesh key={i} position={[x, 0.38, z]} receiveShadow>
            <boxGeometry args={isHoriz ? [0.35, 0.18, 24] : [15, 0.18, 0.35]} />
            <meshStandardMaterial color="#1b5e20" roughness={0.9} />
          </mesh>
        )
      })}

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

      {/* ════════════════════════════════════════════════════════════
          QUARTERDECK — raised rear deck with wheel
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, 1.3, 19]} castShadow receiveShadow>
        <boxGeometry args={[17.2, 2.6, 12]} />
        <WoodMaterial repeat={[2, 1.5]} />
      </mesh>
      {/* Quarterdeck floor surface */}
      <mesh position={[0, 2.63, 19]} receiveShadow>
        <boxGeometry args={[16.8, 0.22, 11.5]} />
        <DeckMaterial repeat={[2, 2]} />
      </mesh>
      {/* Steps from main deck to quarterdeck */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.22 + i * 0.4, 13.2 - i * 0.75]} receiveShadow castShadow>
          <boxGeometry args={[8.5, 0.42, 0.85]} />
          <DeckMaterial repeat={[2, 1]} />
        </mesh>
      ))}
      {/* Quarterdeck front railing */}
      <mesh position={[0, 3.9, 13.5]} castShadow>
        <boxGeometry args={[17, 0.2, 0.3]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>

      {/* ════════════════════════════════════════════════════════════
          FORECASTLE — raised front deck
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, 1.3, -19]} castShadow receiveShadow>
        <boxGeometry args={[17.2, 2.6, 12]} />
        <WoodMaterial repeat={[2, 1.5]} />
      </mesh>
      {/* Forecastle floor surface */}
      <mesh position={[0, 2.63, -19]} receiveShadow>
        <boxGeometry args={[16.8, 0.22, 11.5]} />
        <DeckMaterial repeat={[2, 2]} />
      </mesh>
      {/* Forecastle steps */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.22 + i * 0.4, -13.2 + i * 0.75]} receiveShadow castShadow>
          <boxGeometry args={[8.5, 0.42, 0.85]} />
          <DeckMaterial repeat={[2, 1]} />
        </mesh>
      ))}

      {/* ════════════════════════════════════════════════════════════
          SHIP WHEEL
      ════════════════════════════════════════════════════════════ */}
      <ShipWheel position={[0, 3.62, 19.5]} />
      <LogPosePillar position={[0, 4.05, 18.2]} />
      <FlowerGarden position={[-5.5, 2.85, 22]} />
<FlowerGarden position={[5.5,  2.85, 22]} />
      {/* Wheel post */}
      <mesh position={[0, 2.9, 19.8]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 1.5, 10]} />
        <meshStandardMaterial color="#2a1505" roughness={0.75} />
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
      <DomeCrowsNest position={[0, 33.5, -3]} />

      {/* ════════════════════════════════════════════════════════════
          MAIN CROSS SPAR + SAIL
      ════════════════════════════════════════════════════════════ */}
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
      {/* ════════════════════════════════════════════════════════════
          LADDER TO CROW'S NEST
      ════════════════════════════════════════════════════════════ */}
      {!aboutActive && <Ladder position={[0.8, 17, -2.2]} height={30} rungs={20} />}

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
      {/* Bow body */}
      <mesh position={[0, -1.5, -27]} castShadow>
        <boxGeometry args={[14, 4, 5]} />
        <WoodMaterial repeat={[2, 1]} roughness={0.85} />
      </mesh>
      {/* Bowsprit — horizontal pole pointing forward */}
      <mesh position={[0, 1.5, -32]} rotation={[-0.25, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 10, 10]} />
        <WoodMaterial repeat={[1, 2]} roughness={0.82} />
      </mesh>
      {/* Lion figurehead */}
      <LionFigurehead position={[0, 1.8, -29]} />

      {/* ════════════════════════════════════════════════════════════
          STERN — rear of ship
      ════════════════════════════════════════════════════════════ */}
      <mesh position={[0, -1, 27]} castShadow>
        <boxGeometry args={[18, 4, 4]} />
        <WoodMaterial repeat={[3, 1]} roughness={0.85} />
      </mesh>

        {/* NEW: The Library & Survey Room Architecture */}
      <KitchenDiningHall position={[0, 2.65, 24.5]} />



      {/* Stern decorative transom */}
      <mesh position={[0, 1.5, 26.8]}>
        <boxGeometry args={[17.5, 3, 0.4]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.8} />
      </mesh>
      {/* Stern windows */}
      {[-4, 0, 4].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 27.1]}>
          <boxGeometry args={[2.5, 2, 0.1]} />
          <meshStandardMaterial color="#88bbcc" roughness={0.1} metalness={0.0} transparent opacity={0.5} />
        </mesh>
      ))}
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
          CANNONS — decorative pair on quarterdeck
      ════════════════════════════════════════════════════════════ */}
      <Cannon position={[-7, 2.85, 15]} rotation={[0, -Math.PI / 2, 0]} />
      <Cannon position={[7, 2.85, 15]}  rotation={[0, Math.PI / 2, 0]} />
      <Cannon position={[-7, 0.65, 3]}  rotation={[0, -Math.PI / 2, -0.15]} />
      <Cannon position={[7, 0.65, 3]}   rotation={[0, Math.PI / 2, 0.15]} />

      {/* ════════════════════════════════════════════════════════════
          ANCHORS — bow sides
      ════════════════════════════════════════════════════════════ */}
      <Anchor position={[-7, 0.8, -22]} />
      <Anchor position={[7, 0.8, -22]} />

      {/* ════════════════════════════════════════════════════════════
          BARRELS — scattered on deck
      ════════════════════════════════════════════════════════════ */}
      <Barrel position={[-6.2, 0.85, -10]} scale={1.0} />
      <Barrel position={[-5.4, 0.85, -10]} scale={0.9} />
      <Barrel position={[-6.2, 1.72, -10]} scale={0.85} />
      <Barrel position={[6.2, 0.85, -10]}  scale={1.0} />
      <Barrel position={[5.4, 0.85, -10]}  scale={0.9} />
      <Barrel position={[-6.2, 0.85, 8]}   scale={0.95} />
      <Barrel position={[6.2, 0.85, 8]}    scale={0.95} />

      {/* ════════════════════════════════════════════════════════════
          COILED ROPES — deck corners
      ════════════════════════════════════════════════════════════ */}
      <CoiledRope position={[-7, 0.5, 20]} />
      <CoiledRope position={[7, 0.5, 20]} />
      <CoiledRope position={[-7, 0.5, -18]} />
      <CoiledRope position={[7, 0.5, -18]} />

      {/* ════════════════════════════════════════════════════════════
          LANTERNS — atmospheric lighting
      ════════════════════════════════════════════════════════════ */}
      <Lantern position={[-8, 3.5, 12]} />
      <Lantern position={[8, 3.5, 12]} />
      <Lantern position={[-8, 3.5, -12]} />
      <Lantern position={[8, 3.5, -12]} />
      <Lantern position={[0, 5.5, 20]} />

      {/* ════════════════════════════════════════════════════════════
          MASTHEAD LANTERN — top of mast area
      ════════════════════════════════════════════════════════════ */}
      <Lantern position={[0, 27, -3]} />

      {/* ════════════════════════════════════════════════════════════
          DECK CLEATS — rope tie-off points
      ════════════════════════════════════════════════════════════ */}
      {[[-6, 0.52, -5], [6, 0.52, -5], [-6, 0.52, 5], [6, 0.52, 5],
        [-6, 0.52, -14], [6, 0.52, -14]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.45, 0.18, 0.18]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      {/* ════════════════════════════════════════════════════════════
          BOLLARDS — rope post pairs on deck edge
      ════════════════════════════════════════════════════════════ */}
      {[[-7.5, -12], [-7.5, 0], [-7.5, 12], [7.5, -12], [7.5, 0], [7.5, 12]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.75, z]} castShadow>
          <cylinderGeometry args={[0.14, 0.18, 1.1, 10]} />
          <meshStandardMaterial color="#333" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* ════════════════════════════════════════════════════════════
          BOW PLATFORM — Sunny's extended front deck
      ════════════════════════════════════════════════════════════ */}
      <BowPlatform position={[0, 2.78, -26.5]} />

      {/* ════════════════════════════════════════════════════════════
          COUP DE VENT CANNON — giant front cannon
      ════════════════════════════════════════════════════════════ */}
      <CoupDeVentCannon position={[0, 3.4, -25]} />

      {/* ════════════════════════════════════════════════════════════
          STERN BALCONY — observation deck at the rear
      ════════════════════════════════════════════════════════════ */}
      <SternBalcony position={[0, 3.8, 28.5]} />

      {/* ════════════════════════════════════════════════════════════
          PADDLE WHEELS — Chicken Voyage emergency propulsion
      ════════════════════════════════════════════════════════════ */}
      <PaddleWheel position={[-9.8, -1.5, 8]}  side={-1} />
      <PaddleWheel position={[9.8,  -1.5, 8]}  side={1}  />

      {/* ════════════════════════════════════════════════════════════
          TREASURE CHESTS — atmospheric detail
      ════════════════════════════════════════════════════════════ */}
      <TreasureChest position={[-6.5, 0.85, 15]} rotation={[0, 0.4, 0]} />
      <TreasureChest position={[6.5,  0.85, 15]} rotation={[0, -0.3, 0]} />
      <TreasureChest position={[6.2,  0.85, -5]} rotation={[0, 0.8, 0]} />

          {/* ══════════════════════════════════════════════════════
        AQUARIUM BASEMENT — Work Section
        Positioned below deck (y = -14 puts it under the ship floor)
    ══════════════════════════════════════════════════════ */}
    <AquariumBasement position={[0, -14, 2]} onProjectSelect={onProjectSelect} />
    </RigidBody>
  )
}
