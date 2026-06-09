import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, Sparkles } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { LuffyCharacter3D } from '../components/LuffyCharacter'
import Ship from '../components/Ship'
import { AboutCameraController } from '../components/AboutSection'

// ─── SKILLS CAMERA CONTROLLER ────────────────────────────────────────────────
const CAM_EXPLORE = {
  position: new THREE.Vector3(0, 8.5, 16),
  target: new THREE.Vector3(0, 1.5, 0),
}

const CAM_SKILLS = {
  position: new THREE.Vector3(0, 34, 10), 
  target: new THREE.Vector3(0, 31, -10),  
}

export function SkillsCameraTransition({ active }) {
  const isAnimating = useRef(false)
  const currentTarget = useRef(new THREE.Vector3(0, 1.5, 0))

  useFrame((state, delta) => {
    const speed = 2.5 * delta
    
    if (active) {
      isAnimating.current = true
      state.camera.position.lerp(CAM_SKILLS.position, speed)
      currentTarget.current.lerp(CAM_SKILLS.target, speed)
      state.camera.lookAt(currentTarget.current)
    } else if (isAnimating.current) {
      state.camera.position.lerp(CAM_EXPLORE.position, speed)
      currentTarget.current.lerp(CAM_EXPLORE.target, speed)
      state.camera.lookAt(currentTarget.current)
      
      if (state.camera.position.distanceTo(CAM_EXPLORE.position) < 0.1) {
         isAnimating.current = false
      }
    }
  })

  return null
}

// ─── WORK/BASEMENT CAMERA CONTROLLER ─────────────────────────────────────────
// FIND and REPLACE entire WorkCameraTransition:
const CAM_WORK = {
  position: new THREE.Vector3(0, -9.5, 9),
  target:   new THREE.Vector3(0, -11, -2),
  fov: 75,
}

export function WorkCameraTransition({ active }) {
  const isAnimating  = useRef(false)
  const hasEntered   = useRef(false)
  const currentTarget = useRef(new THREE.Vector3(0, 1.5, 0))
  const settled      = useRef(false)

  useFrame((state, delta) => {
    const speed = 2.8 * delta

    if (active) {
      isAnimating.current = true
      hasEntered.current  = true
      settled.current     = false
      state.camera.position.lerp(CAM_WORK.position, speed)
      currentTarget.current.lerp(CAM_WORK.target, speed)
      state.camera.lookAt(currentTarget.current)
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, CAM_WORK.fov, speed)
      state.camera.updateProjectionMatrix()
      state.scene.fog = null
      // Mark settled once we're close enough
      if (state.camera.position.distanceTo(CAM_WORK.position) < 0.3) {
        settled.current = true
      }
    } else if (hasEntered.current) {
      settled.current = false
      state.camera.position.lerp(CAM_EXPLORE.position, speed)
      currentTarget.current.lerp(CAM_EXPLORE.target, speed)
      state.camera.lookAt(currentTarget.current)
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 68, speed)
      state.camera.updateProjectionMatrix()
      state.scene.fog = new THREE.Fog('#e4f0f6', 60, 260)
      if (state.camera.position.distanceTo(CAM_EXPLORE.position) < 0.1) {
        isAnimating.current = false
        hasEntered.current  = false
      }
    }
  })
  return null
}

// ─── WORK BASEMENT FREE-LOOK (mouse drag) ────────────────────────────────────
function WorkOrbitControl({ active }) {
  const isDragging = useRef(false)
  const lastMouse  = useRef({ x: 0, y: 0 })
  const yaw        = useRef(0)
  const pitch      = useRef(-0.12)

  // Reset on toggle
  useEffect(() => {
    if (!active) { yaw.current = 0; pitch.current = -0.12 }
  }, [active])

  useEffect(() => {
    if (!active) return
    const onDown = (e) => {
      isDragging.current = true
      lastMouse.current  = { x: e.clientX, y: e.clientY }
    }
    const onUp   = () => { isDragging.current = false }
    const onMove = (e) => {
      if (!isDragging.current) return
      const dx = (e.clientX - lastMouse.current.x) * 0.0035
      const dy = (e.clientY - lastMouse.current.y) * 0.0025
      yaw.current    -= dx
      pitch.current   = Math.max(-0.55, Math.min(0.35, pitch.current - dy))
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    // Touch support
    const onTouchStart = (e) => {
      isDragging.current = true
      lastMouse.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e) => {
      if (!isDragging.current) return
      const dx = (e.touches[0].clientX - lastMouse.current.x) * 0.004
      const dy = (e.touches[0].clientY - lastMouse.current.y) * 0.003
      yaw.current    -= dx
      pitch.current   = Math.max(-0.55, Math.min(0.35, pitch.current - dy))
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    window.addEventListener('mousedown',  onDown)
    window.addEventListener('mouseup',    onUp)
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend',   onUp)
    window.addEventListener('touchmove',  onTouchMove)
    return () => {
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onUp)
      window.removeEventListener('touchmove',  onTouchMove)
    }
  }, [active])

  useFrame((state) => {
    if (!active) return
    const BASE = CAM_WORK.position
    const r    = 13
    const tx   = BASE.x + Math.sin(yaw.current) * r
    const ty   = BASE.y + Math.sin(pitch.current) * r - 1
    const tz   = BASE.z + (-Math.cos(yaw.current)) * r
    state.camera.position.copy(BASE)
    state.camera.lookAt(tx, ty, tz)
  })

  return null
}



// ─── STYLIZED "GRAND LINE" OCEAN ──────────────────────────────────────────────
function Ocean() {
  const matRef = useRef()

  const shader = useMemo(() => ({
    uniforms: {
      uTime:         { value: 0 },
      uColorDeep:    { value: new THREE.Color('#022640') }, 
      uColorSurface: { value: new THREE.Color('#085c91') },
      uColorShallow: { value: new THREE.Color('#10a4db') },
      uColorFoam:    { value: new THREE.Color('#ffffff') },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vWorldPos;

      float getWaves(vec2 p) {
        float time = uTime * 1.2;
        float h = 0.0;
        h += sin(dot(p, vec2(0.3, 0.7)) * 0.03 + time * 0.8) * 1.8;
        h += sin(dot(p, vec2(0.8, -0.4)) * 0.07 + time * 1.2) * 0.6;
        h += sin(dot(p, vec2(-0.5, 0.5)) * 0.15 + time * 1.5) * 0.3;
        return h;
      }

      void main() {
        vUv = uv;
        vec3 pos = position;
        float height = getWaves(pos.xy);
        pos.z += height; 
        vElevation = height;
        vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorDeep;
      uniform vec3 uColorSurface;
      uniform vec3 uColorShallow;
      uniform vec3 uColorFoam;
      uniform float uTime;

      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vWorldPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        float h = (vElevation + 2.5) / 5.0;
        vec3 color = mix(uColorDeep, uColorSurface, smoothstep(0.1, 0.4, h));
        color = mix(color, uColorShallow, smoothstep(0.4, 0.7, h));

        float foamNoise = noise(vWorldPos.xz * 0.4 + uTime * 0.6);
        float foamThreshold = 0.75 - (foamNoise * 0.1);
        float foamAmount = smoothstep(foamThreshold - 0.02, foamThreshold + 0.02, h);
        color = mix(color, uColorFoam, foamAmount);

        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        vec3 fakeNormal = normalize(vec3(sin(vWorldPos.x * 0.3 + uTime), 3.0, sin(vWorldPos.z * 0.3 + uTime)));
        vec3 sunDir = normalize(vec3(0.8, 0.3, 0.5)); 
        
        float spec = pow(max(dot(reflect(-sunDir, fakeNormal), viewDir), 0.0), 40.0);
        float glitter = noise(vWorldPos.xz * 0.8 - uTime) * spec;
        
        color += vec3(1.0, 0.9, 0.6) * smoothstep(0.6, 0.9, glitter) * 0.4;

        float dist = length(cameraPosition - vWorldPos);
        float fog = smoothstep(200.0, 600.0, dist);
        color = mix(color, vec3(0.62, 0.76, 0.85), fog);

        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  }), [])


  

  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow={false}>

      <planeGeometry args={[2500, 2500, 64, 64]} />
      <shaderMaterial ref={matRef} args={[shader]} />
    </mesh>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.42} color="#fff0dc" />
      <directionalLight
  position={[70, 95, 40]}
  intensity={1.8}
  color="#fff3db"
  castShadow
  shadow-mapSize={[1024, 1024]}
  shadow-camera-far={200}
  shadow-camera-near={1}
  shadow-camera-left={-60}
  shadow-camera-right={60}
  shadow-camera-top={60}
  shadow-camera-bottom={-60}
/>
      <hemisphereLight skyColor="#b9ddf0" groundColor="#1e5266" intensity={0.72} />
    </>
  )
}

export default function WorldScene({
  debugRef,
  onZoneChange,
  onStateChange,
  onNavigate,
  onProjectSelect,
  aboutActive = false,
  skillsActive = false,
  workActive = false,
}) {
  const [cloudsCleared, setCloudsCleared] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCloudsCleared(true), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(180deg, #cfe6f5 0%, #9fc6df 46%, #6f9dbd 100%)',
    }}>
      <Canvas
          shadows="soft"
  camera={{ position: [0, 8.5, 16], fov: 68, near: 0.1, far: 2000 }}
  performance={{ min: 0.5 }}
  dpr={[1, 2]}
        onCreated={({ camera }) => camera.lookAt(0, 1.5, 0)}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.84 }}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      >
        <fog attach="fog" args={['#e4f0f6', workActive ? 2 : 60, workActive ? 120 : 260]} />
        <Lighting />
        <Sky distance={4500} sunPosition={[82, 18, 46]} inclination={0.53} azimuth={0.21} rayleigh={0.78} turbidity={4.6} />
        <Sparkles count={220} scale={60} size={1.25} speed={0.18} opacity={0.11} color="#ffffff" position={[0, 8, 0]} />

        <AboutCameraController active={aboutActive} />
        <SkillsCameraTransition active={skillsActive} />
        <WorkCameraTransition active={workActive} />
        <WorkOrbitControl active={workActive} />

        <Ocean />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} debug={false}>
            <Ship aboutActive={aboutActive} onProjectSelect={onProjectSelect} />
            <RigidBody type="kinematicPosition" colliders={false} lockRotations>
              <CuboidCollider args={[0.35, 0.9, 0.35]} position={[0, 0.9, 0]} />
              <LuffyCharacter3D
                position={[0, 0.15, 5]}
                onStateChange={onStateChange}
                onZoneChange={onZoneChange}
                onNavigate={onNavigate}
                debugRef={debugRef}
                aboutActive={aboutActive}
                skillsActive={skillsActive}
                workActive={workActive}
              />
            </RigidBody>
          </Physics>
        </Suspense>

        <EffectComposer disableNormalPass multisampling={0}>
  <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.3} levels={4} />
  <Vignette eskil={false} offset={0.12} darkness={0.75} />
</EffectComposer>
      </Canvas>

      <AnimatePresence>
        {!cloudsCleared && (
          <motion.div
            key="cloud-wipe" initial={{ y: '0%' }}
            exit={{ y: '105%', transition: { duration: 2.2, ease: [0.65, 0, 0.25, 1] } }}
            style={{ position: 'absolute', inset: 0, zIndex: 9999, backgroundColor: '#ffffff', pointerEvents: 'none' }}
          >
            <div style={{ width: '100%', height: '160px', position: 'absolute', bottom: '-158px' }}>
              <svg viewBox="0 0 1440 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path fill="#ffffff" d="M0,80L48,72C96,64,192,48,288,53.3C384,59,480,85,576,96C672,107,768,101,864,88C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
