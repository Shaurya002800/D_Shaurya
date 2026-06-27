import { CuboidCollider } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Nami's mikan (tangerine) tree — used in the orchard planter.
export function MikanTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.2, 8]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 1.2, 0.3]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#1b5e20" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 1.5, -0.2]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>
      {[
        [-0.4, 1.4, 0.5], [0.4, 1.2, 0.4], [0.1, 1.8, 0.3],
        [-0.2, 1.5, -0.5], [0.5, 1.6, -0.2], [-0.5, 1.1, -0.2],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#ff9800" roughness={0.3} metalness={0.1} />
        </mesh>
      ))}
      <CuboidCollider args={[0.2, 1.0, 0.2]} position={[0, 1.0, 0]} />
    </group>
  )
}

// Starboard-side playground: slide + swing, both with physics colliders.
export function SlideAndSwing() {
  return (
    <group>
      <group position={[2.5, 2, -3]}>
        <mesh position={[-0.6, 2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 4]} />
          <meshStandardMaterial color="#d4a373" roughness={1} />
        </mesh>
        <mesh position={[0.6, 2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 4]} />
          <meshStandardMaterial color="#d4a373" roughness={1} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        <CuboidCollider args={[0.8, 0.05, 0.3]} position={[0, 0, 0]} />
      </group>

      <group position={[-3, 1.6, 12]} rotation={[-0.6, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.2, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
        <mesh position={[-0.7, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 6]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        <mesh position={[0.7, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 6]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        <CuboidCollider args={[0.75, 0.1, 3]} position={[0, 0, 0]} />
      </group>
    </group>
  )
}

// Two Soldier Dock System hatches (numbered 1 and 3) on the hull sides.
export function SoldierDockHatches() {
  return (
    <group>
      <group position={[-8.1, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.6} />
        </mesh>
        <Text position={[0, 0, 0.15]} fontSize={3} color="#d32f2f" outlineWidth={0.05} outlineColor="#000">
          1
        </Text>
      </group>
      <group position={[8.1, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.6} />
        </mesh>
        <Text position={[0, 0, 0.15]} fontSize={3} color="#1976d2" outlineWidth={0.05} outlineColor="#000">
          3
        </Text>
      </group>
    </group>
  )
}

// Coup de Burst exhaust engine at the stern.
export function CoupDeBurst({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[2.2, 2.8, 3.5, 16]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.9} />
      </mesh>
      {[-1.2, 0, 1.2].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[2.3 + (i * 0.15), 0.15, 12, 24]} />
          <meshStandardMaterial color="#333" roughness={0.6} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0, 1.76]}>
        <circleGeometry args={[2.0, 24]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
    </group>
  )
}

// Glass skylight panel set into the deck — looks down into the aquarium room.
export function AquariumSkylight({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <ringGeometry args={[2.8, 3.2, 32]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[6.0, 0.2, 0.1]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[6.0, 0.2, 0.1]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.8} />
      </mesh>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <circleGeometry args={[2.8, 24]} />
        <meshStandardMaterial color="#022640" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Robin's library + Nami's survey table — interior prop of the basement.
export function LibrarySurveyRoom({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14.5, 7.5]} />
        <meshStandardMaterial color="#3d2410" />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 32]} />
        <meshStandardMaterial color="#8a1c1c" roughness={0.7} />
      </mesh>

      <mesh position={[0, 2.5, 3.8]} castShadow>
        <boxGeometry args={[14.5, 5, 0.2]} />
        <meshStandardMaterial color="#f0ead6" />
      </mesh>
      <mesh position={[-7.25, 2.5, 0]} castShadow>
        <boxGeometry args={[0.2, 5, 7.5]} />
        <meshStandardMaterial color="#f0ead6" />
      </mesh>
      <mesh position={[7.25, 2.5, 0]} castShadow>
        <boxGeometry args={[0.2, 5, 7.5]} />
        <meshStandardMaterial color="#f0ead6" />
      </mesh>

      {[-5.5, -4, 4, 5.5].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -2]} castShadow>
          <boxGeometry args={[1.2, 3, 0.5]} />
          <meshStandardMaterial color="#3d2410" />
        </mesh>
      ))}

      <group position={[0, 0, 1]}>
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[4.5, 0.2, 2.5]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
        <mesh position={[2, 2.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.5]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
      </group>

      <mesh position={[5, 1, 2]} castShadow>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#d4c4a8" />
      </mesh>

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

// Chicken Voyage paddle wheel — emergency propulsion on each side of the stern.
export function PaddleWheel({ position, side = 1 }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.5, 20]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.6, 12]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8
        return (
          <mesh key={i} position={[0, Math.sin(angle) * 1.6, Math.cos(angle) * 1.6]} rotation={[angle, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 0.25, 0.85]} />
            <meshStandardMaterial color="#c0392b" roughness={0.7} />
          </mesh>
        )
      })}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i * Math.PI) / 4 - Math.PI / 8
        return (
          <mesh key={i} rotation={[angle, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 4.4, 0.18]} />
            <meshStandardMaterial color="#5C3A21" roughness={0.85} />
          </mesh>
        )
      })}
      <mesh position={[side * 0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 4.8, 4.8]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// Decorative treasure chest — for atmosphere on the deck.
export function TreasureChest({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.55, 0.6]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.28, 20, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      {[[-0.45, 0, 0], [0.45, 0, 0], [0, 0, -0.3], [0, 0, 0.3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={i < 2 ? [0.06, 0.58, 0.62] : [0.92, 0.58, 0.06]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, -0.32]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.06]} />
        <meshStandardMaterial color="#c8a020" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.08, -0.36]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
    </group>
  )
}

// Stern balcony overlooking the ship's wake.
export function SternBalcony({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[18, 0.28, 3.5]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.7, 1.8]} castShadow>
        <boxGeometry args={[18, 1.2, 0.2]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[-8.2 + i * 1.64, 0.5, 1.75]} castShadow>
          <boxGeometry args={[0.15, 1.0, 0.15]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-8, 1.8, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#ffdd88" roughness={0.1} transparent opacity={0.6} emissive="#ffcc44" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[8, 1.8, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#ffdd88" roughness={0.1} transparent opacity={0.6} emissive="#ffcc44" emissiveIntensity={1.5} />
      </mesh>
      {[-5, 0, 5].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.12, 6]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// Log Pose navigation pillar — sits next to the wheel.
export function LogPosePillar({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.15, 1.4, 12]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.72, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 12]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial color="#88ddff" roughness={0.05} metalness={0.1} transparent opacity={0.45} emissive="#44aaff" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0.05, 0.92, 0]} rotation={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.04, 0.28, 0.03]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} metalness={0.3} />
      </mesh>
      {[0.2, -0.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <torusGeometry args={[0.14, 0.025, 8, 16]} />
          <meshStandardMaterial color="#b8860b" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Robin's flower garden planter on the observation deck.
export function FlowerGarden({ position }) {
  const flowers = [
    { p: [0, 0, 0], color: '#e91e63', stemH: 0.55 },
    { p: [0.7, 0, 0.4], color: '#9c27b0', stemH: 0.45 },
    { p: [-0.6, 0, 0.5], color: '#ff5722', stemH: 0.6 },
    { p: [0.3, 0, 0.9], color: '#ffeb3b', stemH: 0.5 },
    { p: [-0.9, 0, 0.2], color: '#ff9800', stemH: 0.4 },
    { p: [1.1, 0, 0.7], color: '#e91e63', stemH: 0.52 },
    { p: [-0.3, 0, 1.1], color: '#fff176', stemH: 0.48 },
    { p: [0.8, 0, -0.3], color: '#ce93d8', stemH: 0.58 },
  ]
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.35, 1.8]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[2.6, 0.15, 1.6]} />
        <meshStandardMaterial color="#2d1a08" roughness={1.0} />
      </mesh>
      {flowers.map(({ p, color, stemH }, i) => (
        <group key={i} position={[p[0] - 1.2, 0.28, p[2] - 0.7]}>
          <mesh position={[0, stemH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, stemH, 6]} />
            <meshStandardMaterial color="#388e3c" roughness={0.9} />
          </mesh>
          {[0, 1, 2, 3, 4].map((pi) => (
            <mesh
              key={pi}
              position={[Math.cos(pi * Math.PI * 2 / 5) * 0.1, stemH + 0.04, Math.sin(pi * Math.PI * 2 / 5) * 0.1]}
              castShadow
            >
              <sphereGeometry args={[0.085, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, stemH + 0.06, 0]} castShadow>
            <sphereGeometry args={[0.072, 8, 8]} />
            <meshStandardMaterial color="#fff176" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Sanji's kitchen + dining hall on the second floor.
export function KitchenDiningHall({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[14, 5.5, 8]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[14.8, 0.4, 8.8]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.0, 0]} castShadow>
        <boxGeometry args={[15, 0.35, 0.35]} />
        <meshStandardMaterial color="#2a1505" roughness={0.8} />
      </mesh>
      <mesh position={[-7.2, 3.55, 0]} rotation={[0, 0, 0.42]} castShadow>
        <boxGeometry args={[0.3, 1.8, 8.8]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>
      <mesh position={[7.2, 3.55, 0]} rotation={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[0.3, 1.8, 8.8]} />
        <meshStandardMaterial color="#3d2410" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, -4.1]} castShadow>
        <boxGeometry args={[14, 5.5, 0.25]} />
        <meshStandardMaterial color="#b8a88a" roughness={0.85} />
      </mesh>
      {[-4.5, 0, 4.5].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -4.18]}>
          <boxGeometry args={[3.2, 2.8, 0.08]} />
          <meshStandardMaterial color="#88ccdd" roughness={0.05} metalness={0.1} transparent opacity={0.55} emissive="#aaddee" emissiveIntensity={0.08} />
        </mesh>
      ))}
      {[-4.5, 0, 4.5].map((x, i) => (
        <group key={i} position={[x, 0.5, -4.12]}>
          <mesh><boxGeometry args={[3.3, 0.12, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
          <mesh position={[0, -1.5, 0]}><boxGeometry args={[3.3, 0.12, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
          <mesh position={[-1.6, 0, 0]}><boxGeometry args={[0.12, 3.0, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
          <mesh position={[1.6, 0, 0]}><boxGeometry args={[0.12, 3.0, 0.1]} /><meshStandardMaterial color="#3d2410" roughness={0.8} /></mesh>
        </group>
      ))}
      <mesh position={[0, -1.5, 1]} castShadow>
        <boxGeometry args={[10, 0.22, 2.2]} />
        <meshStandardMaterial color="#6b3d1e" roughness={0.7} />
      </mesh>
      {[[-4.2, -1], [4.2, -1], [-4.2, 1], [4.2, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x, -2.4, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.8, 8]} />
          <meshStandardMaterial color="#4a2510" roughness={0.8} />
        </mesh>
      ))}
      {[-3.5, -1.5, 0.5, 2.5].map((x, i) => (
        <group key={i} position={[x, -2.0, -1.5]}>
          <mesh castShadow><boxGeometry args={[0.7, 0.08, 0.7]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
          <mesh position={[0, 0.65, 0.3]} castShadow><boxGeometry args={[0.7, 1.3, 0.08]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
        </group>
      ))}
      {[-3.5, -1.5, 0.5, 2.5].map((x, i) => (
        <group key={i} position={[x, -2.0, 2.5]}>
          <mesh castShadow><boxGeometry args={[0.7, 0.08, 0.7]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
          <mesh position={[0, 0.65, -0.3]} castShadow><boxGeometry args={[0.7, 1.3, 0.08]} /><meshStandardMaterial color="#8B1a1a" roughness={0.7} /></mesh>
        </group>
      ))}
      <mesh position={[0, -1.6, 3.5]} castShadow>
        <boxGeometry args={[12, 1.8, 0.9]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.65, 3.5]} castShadow>
        <boxGeometry args={[12.2, 0.12, 1.0]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {[-4, -1.5, 1.5, 4].map((x, i) => (
        <mesh key={i} position={[x, -0.35, 3.5]} castShadow>
          <cylinderGeometry args={[0.28, 0.22, 0.45, 12]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#555' : '#c0392b'} roughness={0.5} metalness={i % 2 === 0 ? 0.6 : 0.1} />
        </mesh>
      ))}
      <mesh position={[0, 1.2, 3.2]} castShadow>
        <boxGeometry args={[10, 0.08, 0.08]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.7} />
      </mesh>
      {[-3.5, -1.5, 0.5, 2.5].map((x, i) => (
        <group key={i} position={[x, 0.8, 3.2]}>
          <mesh castShadow><cylinderGeometry args={[0.02, 0.02, 0.45, 6]} /><meshStandardMaterial color="#666" roughness={0.4} metalness={0.7} /></mesh>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.32, 10]} />
            <meshStandardMaterial color="#444" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}
      {[-6.8, 6.8].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {[-1.5, 0.5].map((z, j) => (
            <mesh key={j} position={[0, 0.2, z]} castShadow>
              <boxGeometry args={[0.08, 3.5, 1.8]} />
              <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[-5, 1.8, -2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#ffdd88" roughness={0.1} transparent opacity={0.6} emissive="#ffcc44" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[5, 1.8, -2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#ffdd88" roughness={0.1} transparent opacity={0.6} emissive="#ffcc44" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 1.8, 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#ffdd88" roughness={0.1} transparent opacity={0.6} emissive="#ffcc44" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

// Dome-shaped gym hut with the Straw Hat jolly roger.
export function DomeCrowsNest({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2.6, 2.8, 0.45, 24]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[2.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[2.52, 2.52, 0.35, 24]} />
        <meshStandardMaterial color="#b8a88a" roughness={0.8} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 6
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.15, 1.2, Math.sin(angle) * 2.15]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.9, 0.75, 0.08]} />
            <meshStandardMaterial color="#88ccdd" roughness={0.05} metalness={0.1} transparent opacity={0.6} emissive="#aaddee" emissiveIntensity={0.12} />
          </mesh>
        )
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 6
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.12, 1.2, Math.sin(angle) * 2.12]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[1.0, 0.88, 0.06]} />
            <meshStandardMaterial color="#3d2410" roughness={0.8} transparent opacity={0.0} />
          </mesh>
        )
      })}
      <mesh position={[0, 4.0, 0]} castShadow>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 5.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3.5, 8]} />
        <meshStandardMaterial color="#2a1505" roughness={0.8} />
      </mesh>
      <mesh position={[1.4, 6.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.0, 1.6]} />
        <meshStandardMaterial color="#111" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 6.9, 0.01]}>
        <circleGeometry args={[0.45, 20]} />
        <meshStandardMaterial color="#f0f0f0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.6, 7.28, 0.02]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.55, 0.1, 8, 24]} />
        <meshStandardMaterial color="#c8a020" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.8, 0.55, 0.5]} castShadow>
        <boxGeometry args={[1.2, 0.22, 0.4]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.6} />
      </mesh>
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x + 0.8, 0.78, 0.5]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 2.8, -1.8]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#666" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[-0.8, 0.5, -0.5]} castShadow>
        <boxGeometry args={[0.5, 0.18, 1.2]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.8} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 10
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.8, 0.42, Math.sin(angle) * 1.8]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[1.1, 0.22, 0.4]} />
            <meshStandardMaterial color="#5C3A21" roughness={0.85} />
          </mesh>
        )
      })}
      <mesh position={[0, 1.5, 0]} rotation={[0.3, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.8, 12]} />
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <torusGeometry args={[2.62, 0.07, 10, 36]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 16
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.62, 0.65, Math.sin(angle) * 2.62]} castShadow>
            <boxGeometry args={[0.1, 0.85, 0.1]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}
