import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { RigLine } from './utils.jsx'
import { SHIP_ARTIFACTS } from '../../data/shipArtifacts.js'

// Ground glow beacon placed under each interactive artifact.
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

// Pointer cursor + click handler applied to every artifact prop.
function artifactHandlers(artifact, onOpen) {
  return {
    onClick: (event) => { event.stopPropagation(); onOpen?.(artifact) },
    onPointerOver: (event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' },
    onPointerOut: () => { document.body.style.cursor = 'default' },
  }
}

function GitHubLogbook({ artifact, onOpen }) {
  return (
    <group position={artifact.center} {...artifactHandlers(artifact, onOpen)}>
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
    <group position={artifact.center} rotation={[0, -0.28, 0]} {...artifactHandlers(artifact, onOpen)}>
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
    <group position={artifact.center} rotation={[0, 0.36, 0]} {...artifactHandlers(artifact, onOpen)}>
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
    <group position={artifact.center} rotation={[0, -0.55, 0]} {...artifactHandlers(artifact, onOpen)}>
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
    <group position={artifact.center} rotation={[0, 0.32, 0]} {...artifactHandlers(artifact, onOpen)}>
      <ArtifactBeacon color={artifact.color} />
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.88, 1.16, 0.42]} />
        <meshStandardMaterial color="#3b285f" roughness={0.95} emissive="#4c1d95" emissiveIntensity={0.18} />
      </mesh>
      {['◆', 'X', '≋'].map((glyph, index) => (
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
    <group position={artifact.center} rotation={[0, -0.18, 0]} {...artifactHandlers(artifact, onOpen)}>
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

// Renders all six ship artifacts at once, keyed by id from SHIP_ARTIFACTS.
export function ShipArtifacts({ onArtifactOpen }) {
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
