import * as THREE from 'three'
import { RopeMaterial } from './materials.jsx'

// Draw a thin rope between two 3D points — used all over the ship for rigging.
export function RigLine({ from, to, thickness = 0.045 }) {
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

// Atmospheric lantern — emissive glass, no pointLight (costs nothing).
export function Lantern({ position, castShadow = true }) {
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
    </group>
  )
}

// Night-mode deck light cluster — pointLight intensities scale with `active`.
export function NightDeckLights({ active }) {
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
