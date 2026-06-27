import { useMemo } from 'react'
import * as THREE from 'three'
import { DeckMaterial, WoodMaterial, GrassMaterial, RopeMaterial } from './materials.jsx'
import { RigLine } from './utils.jsx'
import { useTexture } from '@react-three/drei'
import {
  createSunnyDeckShape,
  createRaisedDeckShape,
  createSunnyHullGeometry,
  createBasementFootprintShape,
  createBasementWallShape,
  BASEMENT_HEIGHT,
} from './geometry.js'

// ───── Upper hull + decks ────────────────────────────────────────────────

export function SunnyGalleonHull() {
  const geometry = useMemo(() => createSunnyHullGeometry(), [])
  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <WoodMaterial repeat={[5, 2.5]} roughness={0.9} />
      </mesh>
      <mesh position={[0, -6.35, 1.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.48, 45, 10]} />
        <meshStandardMaterial color="#2b170b" roughness={0.94} />
      </mesh>
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

export function SunnyDeckSurface() {
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

export function SunnyRaisedDeck({ section }) {
  const shellShape = useMemo(() => createRaisedDeckShape(section, 0), [section])
  const topShape = useMemo(() => createRaisedDeckShape(section, 0.16), [section])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]} castShadow receiveShadow>
        <extrudeGeometry
          args={[
            shellShape,
            { depth: 2.42, steps: 1, bevelEnabled: true, bevelSize: 0.14, bevelThickness: 0.12, bevelSegments: 2 },
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

export function SunnyBowArmor() {
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

export function SunnySideGalleries() {
  const galleryZ = [-14, -6, 2, 10, 18]
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={`sunny-gallery-${side}`}>
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

export function SunnySternArchitecture() {
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

export function SunnyHullDetails() {
  const portHoles = [-18, -9, 0, 9, 18]
  const ribs = [-22, -16, -10, -4, 2, 8, 14, 20]
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={`hull-side-${side}`}>
          {ribs.map((z) => (
            <mesh key={`${side}-${z}`} position={[side * 9.62, -2.65, z]} castShadow>
              <boxGeometry args={[0.18, 4.6, 0.18]} />
              <meshStandardMaterial color="#2d190b" roughness={0.92} />
            </mesh>
          ))}
          {portHoles.map((z) => (
            <group key={`port-${side}-${z}`} position={[side * 9.68, -1.55, z]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <ringGeometry args={[0.34, 0.48, 24]} />
                <meshStandardMaterial color="#f4ead2" roughness={0.55} side={THREE.DoubleSide} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.31, 24]} />
                <meshStandardMaterial
                  color="#163b4d"
                  roughness={0.2}
                  metalness={0.05}
                  transparent
                  opacity={0.78}
                  emissive="#0e7ca1"
                  emissiveIntensity={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {[-5.8, -2.9, 0, 2.9, 5.8].map((x) => (
        <mesh key={`stern-trim-${x}`} position={[x, -1.35, 29.28]} castShadow>
          <boxGeometry args={[1.55, 0.28, 0.2]} />
          <meshStandardMaterial color="#f4ead2" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function SunnyLawnDetails() {
  return (
    <group>
      <mesh position={[0, 0.565, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.78, 40]} />
        <meshStandardMaterial color="#d7f27a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.568, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.35, 2.48, 48]} />
        <meshStandardMaterial color="#1f6f2a" roughness={0.96} />
      </mesh>
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

export function SunnySideDeckTrim() {
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

export function BowPlatform({ position }) {
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
      {[-4, -2.5, -1, 0, 1, 2.5, 4].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -2]}>
          <boxGeometry args={[0.15, 1.0, 0.15]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ───── Basement (aquarium / project archive) ──────────────────────────────

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
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[6.8, 2.8]} />
        <meshBasicMaterial color="#0d0805" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.05, -0.05, 0.03]}>
        <planeGeometry args={[6.5, 2.5]} />
        <meshBasicMaterial map={toBeContinuedTexture} transparent alphaTest={0.1} color="#000000" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[6.5, 2.5]} />
        <meshBasicMaterial map={toBeContinuedTexture} transparent alphaTest={0.1} toneMapped={false} />
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
          <mesh position={[0, 10.62, z]} castShadow={false}>
            <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
            <meshStandardMaterial color="#ffdd88" roughness={0.1} transparent opacity={0.6} emissive="#ffcc44" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Basement / aquarium room — the work-section holds eight project posters
// along a curved ship-footprint shell.
export function AquariumBasement({ position = [0, -14, 2], renderProject, renderCircle }) {
  const floorShape = useMemo(() => createBasementFootprintShape(0.38), [])
  const ceilingShape = useMemo(() => createBasementFootprintShape(0.18), [])
  const wallShape = useMemo(() => createBasementWallShape(), [])

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <shapeGeometry args={[floorShape, 48]} />
        <GrassMaterial />
      </mesh>
      <ArchivePromenade />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <extrudeGeometry args={[createBasementWallShape(), { depth: 0.08, bevelEnabled: false, steps: 1 }]} />
        <meshStandardMaterial color="#7fd45a" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[wallShape, { depth: BASEMENT_HEIGHT, bevelEnabled: false, steps: 1 }]} />
        <meshStandardMaterial color="#f6e5b8" roughness={0.82} metalness={0.0} side={THREE.DoubleSide} />
      </mesh>
      <ArchiveHullDetails />
      {renderProject?.()}
      <GrandLineArchiveCrest />
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
