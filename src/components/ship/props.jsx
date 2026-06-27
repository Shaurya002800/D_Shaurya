import * as THREE from 'three'
import { SailMaterial, RopeMaterial } from './materials.jsx'
import { Lantern, RigLine } from './utils.jsx'

// Straw Hat Pirates Jolly Roger emblem — used on a back sail panel.
export function JollyRoger({ position }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[2.5, 24, 24]} />
        <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh position={[-0.85, 0.5, -2.4]}>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color="#f5e6cc" side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      <mesh position={[0.85, 0.5, -2.4]}>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color="#f5e6cc" side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.0, 0]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[2.8, 0.35, 10, 32]} />
        <meshStandardMaterial color="#c8a020" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.4, -0.3]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[1.3, 2.1, 1.1, 24]} />
        <meshStandardMaterial color="#d4a820" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.0, -0.2]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[1.9, 0.18, 8, 28]} />
        <meshStandardMaterial color="#8B1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[-1.8, -1.5, -2.2]} rotation={[0, 0, 0.7]} castShadow>
        <capsuleGeometry args={[0.18, 3.5, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[1.8, -1.5, -2.2]} rotation={[0, 0, -0.7]} castShadow>
        <capsuleGeometry args={[0.18, 3.5, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Main sail panel — white linen with red horizontal stripes.
export function MainSail({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <planeGeometry args={[22, 17, 10, 10]} />
        <SailMaterial repeat={[3, 2]} color="#fafaf8" />
      </mesh>
      {[-5, 0, 5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <planeGeometry args={[22, 1.2]} />
          <meshStandardMaterial color="#c0392b" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

// Trapdoor entrance to the basement / aquarium room with a glow rim.
export function BasementHatch({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.15, 2.5]} />
        <meshStandardMaterial color="#3d2410" roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[3.1, 0.12, 2.1]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <torusGeometry args={[0.3, 0.04, 8, 20]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
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

// Decorative cannon — barrel + reinforcement rings + wooden wheels.
export function Cannon({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.28, 2.2, 14]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.55} metalness={0.5} />
      </mesh>
      {[-0.6, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} castShadow>
          <torusGeometry args={[0.25, 0.04, 8, 18]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[-0.55, -0.32, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 14]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      <mesh position={[0.55, -0.32, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 14]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
    </group>
  )
}

// Decorative anchor on the bow.
export function Anchor({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.5, 10]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[-0.55, -1.1, 0]} rotation={[0, 0, 0.6]} castShadow>
        <boxGeometry args={[0.85, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0.55, -1.1, 0]} rotation={[0, 0, -0.6]} castShadow>
        <boxGeometry args={[0.85, 0.14, 0.14]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <torusGeometry args={[0.22, 0.055, 10, 20]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

// Wooden supply barrel with metal hoops.
export function Barrel({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.85, 14]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 14]} />
        <meshStandardMaterial color="#3d2410" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <torusGeometry args={[0.39, 0.035, 8, 20]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.25, 0]} castShadow>
        <torusGeometry args={[0.39, 0.035, 8, 20]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

// Coiled rope pile, stacked torus rings.
export function CoiledRope({ position }) {
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

// Lantern mounted on a rail arm — rope + bracket + lantern body.
export function RailLanternMount({ position }) {
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
