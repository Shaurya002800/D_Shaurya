import { RigidBody } from '@react-three/rapier'
import { RigLine } from './utils.jsx'

// Deck-to-crow's-nest ladder with rope rails, rungs, clamps, and foot plates.
export function Ladder({ position, height = 30, rungs = 18, rotation = [0, 0, 0] }) {
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

// Jolly Roger flag flying on top of the main mast.
export function CrowsNestFlag() {
  return (
    <group>
      <mesh position={[0, 2.65, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 5.1, 8]} />
        <meshStandardMaterial color="#2a1505" roughness={0.82} />
      </mesh>
      <mesh position={[1.25, 4.55, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[2.35, 1.35]} />
        <meshStandardMaterial color="#111111" side={2 /* DoubleSide */} roughness={0.9} />
      </mesh>
      <mesh position={[0.75, 4.56, 0.015]}>
        <circleGeometry args={[0.33, 18]} />
        <meshStandardMaterial color="#f3eee2" side={2} roughness={0.8} />
      </mesh>
      <mesh position={[0.75, 4.83, 0.025]} rotation={[0.05, 0, 0]}>
        <torusGeometry args={[0.39, 0.065, 8, 22]} />
        <meshStandardMaterial color="#caa23d" side={2} roughness={0.82} />
      </mesh>
    </group>
  )
}

// Skills-section variant of the crow's nest — open railing so the camera can read the compass UI.
export function CrowsNestBaseOnly({ position = [0, 31.5, -3] }) {
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

// Default crow's nest — physics-enabled basket with invisible climb ramp.
// Used when the skills section is not active.
export function CrowsNest({ position = [0, 31.5, -3], rotation = [0, 0, 0], ...props }) {
  const rampLength = 32
  const rampAngle = 0.15
  const rampZOffset = 1.5

  return (
    <group position={position} rotation={rotation} {...props}>
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
