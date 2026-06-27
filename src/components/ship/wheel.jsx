// Thousand Sunny's ship wheel — identity anchor at the stern.
function WheelSpoke({ angle }) {
  return (
    <mesh rotation={[0, 0, angle]}>
      <boxGeometry args={[0.07, 1.75, 0.07]} />
      <meshStandardMaterial color="#2a1505" roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

export function ShipWheel({ position }) {
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
