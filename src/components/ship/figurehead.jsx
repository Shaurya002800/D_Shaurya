// Thousand Sunny's iconic lion figurehead.
// The Gaon cannon mouth is hidden inside the lion's grin.
export function LionFigurehead({ position }) {
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
