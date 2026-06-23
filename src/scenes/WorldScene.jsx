import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
// Added OrbitControls to the drei import
import { Sky, Sparkles, OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
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

const SKILLS_RETURN_CAMERA = {
  position: new THREE.Vector3(0.8, 4.8, 9),
  target: new THREE.Vector3(4.6, 1.8, 1.2),
  fov: 68,
}

const CROWS_NEST_CAMERA = {
  fov: 46,
  views: {
    north: {
      position: new THREE.Vector3(1.2, 37.2, 12.5),
      target:   new THREE.Vector3(0, 42, -320),
    },
    east: {
      position: new THREE.Vector3(-16.5, 37.2, -1.8),
      target:   new THREE.Vector3(320, 42, -3),
    },
    south: {
      position: new THREE.Vector3(-1.2, 37.2, -18.5),
      target:   new THREE.Vector3(0, 42, 320),
    },
    west: {
      position: new THREE.Vector3(16.5, 37.2, -4.2),
      target:   new THREE.Vector3(-320, 42, -3),
    },
  },
}

const WEATHER_DURATION_MS = 180000
const WEATHER_SEQUENCE = [
  {
    id: 'sunny',
    label: 'Sunny Seas',
    sky: '#9fd5f2',
    fog: '#d9edf6',
    fogNear: 72,
    fogFar: 300,
    ambient: 0.48,
    sun: 1.85,
    hemi: 0.78,
    exposure: 0.84,
    rayleigh: 0.78,
    turbidity: 4.6,
    sunPosition: [82, 18, 46],
    ocean: ['#022640', '#085c91', '#10a4db', '#ffffff'],
    waveStrength: 1,
    waveSpeed: 1,
  },
  {
    id: 'rain',
    label: 'Grand Line Rain',
    sky: '#637b8c',
    fog: '#8295a0',
    fogNear: 38,
    fogFar: 190,
    ambient: 0.3,
    sun: 0.55,
    hemi: 0.46,
    exposure: 0.68,
    rayleigh: 1.8,
    turbidity: 12,
    sunPosition: [18, 4, 30],
    ocean: ['#021725', '#063d59', '#0b6982', '#c6d9dc'],
    waveStrength: 1.28,
    waveSpeed: 1.25,
  },
  {
    id: 'night',
    label: 'Moonlit Watch',
    sky: '#020917',
    fog: '#09182a',
    fogNear: 60,
    fogFar: 235,
    ambient: 0.16,
    sun: 0.34,
    hemi: 0.3,
    exposure: 0.5,
    rayleigh: 0.18,
    turbidity: 1.8,
    sunPosition: [-55, -8, -35],
    ocean: ['#010711', '#031a32', '#08415d', '#9ec7dc'],
    waveStrength: 0.78,
    waveSpeed: 0.72,
  },
  {
    id: 'storm',
    label: 'Thunderstorm',
    sky: '#1d2630',
    fog: '#394550',
    fogNear: 24,
    fogFar: 145,
    ambient: 0.2,
    sun: 0.25,
    hemi: 0.34,
    exposure: 0.58,
    rayleigh: 2.8,
    turbidity: 18,
    sunPosition: [-25, 2, 12],
    ocean: ['#010b12', '#042a3b', '#075166', '#b9d2d5'],
    waveStrength: 1.72,
    waveSpeed: 1.65,
  },
]

function getInitialWeatherIndex() {
  const requestedWeather = new URLSearchParams(window.location.search).get('weather')
  const requestedIndex = WEATHER_SEQUENCE.findIndex((weather) => weather.id === requestedWeather)
  return requestedIndex >= 0 ? requestedIndex : 0
}

export function SkillsCameraTransition({
  active,
  direction = 'north',
  cameraClaimedByOtherSection = false,
  onCameraLockChange,
}) {
  const isAnimating = useRef(false)
  const cameraLocked = useRef(false)
  const currentTarget = useRef(new THREE.Vector3(0, 1.5, 0))

  const setCameraLocked = (locked) => {
    if (cameraLocked.current === locked) return
    cameraLocked.current = locked
    onCameraLockChange?.(locked)
  }

  useEffect(() => () => onCameraLockChange?.(false), [onCameraLockChange])

  useFrame((state, delta) => {
    const speed = 1 - Math.exp(-delta * 4.2)
    const view = CROWS_NEST_CAMERA.views[direction] ?? CROWS_NEST_CAMERA.views.north

    if (!active && cameraClaimedByOtherSection) {
      isAnimating.current = false
      currentTarget.current.copy(CAM_EXPLORE.target)
      setCameraLocked(false)
      return
    }

    if (active) {
      isAnimating.current = true
      setCameraLocked(true)
      state.camera.position.lerp(view.position, speed)
      currentTarget.current.lerp(view.target, speed)
      state.camera.lookAt(currentTarget.current)
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, CROWS_NEST_CAMERA.fov, speed)
      state.camera.updateProjectionMatrix()
    } else if (isAnimating.current) {
      setCameraLocked(true)
      state.camera.position.lerp(SKILLS_RETURN_CAMERA.position, speed)
      currentTarget.current.lerp(SKILLS_RETURN_CAMERA.target, speed)
      state.camera.lookAt(currentTarget.current)
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, SKILLS_RETURN_CAMERA.fov, speed)
      state.camera.updateProjectionMatrix()

      const cameraSettled = state.camera.position.distanceTo(SKILLS_RETURN_CAMERA.position) < 0.06
      const targetSettled = currentTarget.current.distanceTo(SKILLS_RETURN_CAMERA.target) < 0.06
      if (cameraSettled && targetSettled) {
        state.camera.position.copy(SKILLS_RETURN_CAMERA.position)
        currentTarget.current.copy(SKILLS_RETURN_CAMERA.target)
        state.camera.lookAt(currentTarget.current)
        state.camera.fov = SKILLS_RETURN_CAMERA.fov
        state.camera.updateProjectionMatrix()
        isAnimating.current = false
        setCameraLocked(false)
      }
    } else {
      setCameraLocked(false)
    }
  })

  return null
}

// ─── WORK/BASEMENT CAMERA CONTROLLER ─────────────────────────────────────────
// Basement group is at world [0, -14, 2].
// Room: ship-footprint floor matching the upper deck, 12 tall (Y 0..12)
// World: floor Y=-14, ceiling Y=-2, Z roughly -21..+19
//
// Camera: low enough to see the grass floor, pulled back enough to read depth.
const CAM_WORK = {
  position: new THREE.Vector3(0, -10.0, 13.5),
  target:   new THREE.Vector3(0, -13.25, -4.5),
  fov:      78,
}

export function WorkCameraTransition({ active }) {
  const isAnimating   = useRef(false)
  const hasEntered    = useRef(false)
  const currentTarget = useRef(new THREE.Vector3(0, 1.5, 0))
  // FIX: track fog state with a ref so we only write to scene.fog ONCE on
  // enter and ONCE on exit — not every single frame (which was causing GC churn)
  const fogCleared    = useRef(false)

  useFrame((state, delta) => {
    const speed = 2.8 * delta

    if (active) {
      isAnimating.current = true
      hasEntered.current  = true

      state.camera.position.lerp(CAM_WORK.position, speed)
      currentTarget.current.lerp(CAM_WORK.target, speed)
      state.camera.lookAt(currentTarget.current)
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, CAM_WORK.fov, speed)
      state.camera.updateProjectionMatrix()

      // Only null the fog once on entry, not every frame
      if (!fogCleared.current) {
        state.scene.fog = null
        fogCleared.current = true
      }
    } else if (hasEntered.current) {
      // Restore fog once on exit, not every frame
      if (fogCleared.current) {
        state.scene.fog    = new THREE.Fog('#e4f0f6', 60, 260)
        fogCleared.current = false
      }

      state.camera.position.lerp(CAM_EXPLORE.position, speed)
      currentTarget.current.lerp(CAM_EXPLORE.target, speed)
      state.camera.lookAt(currentTarget.current)
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 68, speed)
      state.camera.updateProjectionMatrix()

      if (state.camera.position.distanceTo(CAM_EXPLORE.position) < 0.1) {
        isAnimating.current = false
        // FIX: reset hasEntered so re-entering the work section works cleanly
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
  const pitch      = useRef(-0.08)
  const activeRef  = useRef(active)
 
  useEffect(() => { activeRef.current = active }, [active])
 
  useEffect(() => {
    if (!active) {
      isDragging.current = false
      yaw.current        = 0
      pitch.current      = -0.08
    }
  }, [active])
 
  useEffect(() => {
    if (!active) return
 
    const onDown = (e) => {
      isDragging.current = true
      lastMouse.current  = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => { isDragging.current = false }
    const onMove = (e) => {
      if (!isDragging.current) return
      yaw.current -= (e.clientX - lastMouse.current.x) * 0.003
      // CLAMP yaw: ±55° (≈ ±0.96 rad) — prevents wall clipping
      yaw.current = Math.max(-0.96, Math.min(0.96, yaw.current))
      pitch.current = Math.max(-0.45, Math.min(0.30,
        pitch.current - (e.clientY - lastMouse.current.y) * 0.0022
      ))
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const onTouchStart = (e) => {
      isDragging.current = true
      lastMouse.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e) => {
      if (!isDragging.current) return
      yaw.current -= (e.touches[0].clientX - lastMouse.current.x) * 0.0035
      yaw.current = Math.max(-0.96, Math.min(0.96, yaw.current))
      pitch.current = Math.max(-0.45, Math.min(0.30,
        pitch.current - (e.touches[0].clientY - lastMouse.current.y) * 0.0028
      ))
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
 
    window.addEventListener('mousedown',  onDown,       { passive: true })
    window.addEventListener('mouseup',    onUp,         { passive: true })
    window.addEventListener('mousemove',  onMove,       { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onUp,         { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
 
    return () => {
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onUp)
      window.removeEventListener('touchmove',  onTouchMove)
      isDragging.current = false
    }
  }, [active])
 
  useFrame((state) => {
    if (!activeRef.current) return

    const base = CAM_WORK.position
    const forward = CAM_WORK.target.clone().sub(base)
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)

    const lookTarget = base.clone().add(forward)
    lookTarget.y += Math.sin(pitch.current + 0.08) * 8
    state.camera.lookAt(lookTarget)
  })
 
  return null
}

// ─── STYLIZED "GRAND LINE" OCEAN ──────────────────────────────────────────────
function Ocean({ weather }) {
  const matRef = useRef()
  const targetColors = useMemo(() => ({
    deep: new THREE.Color(),
    surface: new THREE.Color(),
    shallow: new THREE.Color(),
    foam: new THREE.Color(),
    fog: new THREE.Color(),
  }), [])

  const shader = useMemo(() => ({
    uniforms: {
      uTime:         { value: 0 },
      uColorDeep:    { value: new THREE.Color('#022640') },
      uColorSurface: { value: new THREE.Color('#085c91') },
      uColorShallow: { value: new THREE.Color('#10a4db') },
      uColorFoam:    { value: new THREE.Color('#ffffff') },
      uFogColor:     { value: new THREE.Color('#9ec2d9') },
      uWaveStrength: { value: 1 },
      uWaveSpeed:    { value: 1 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uWaveStrength;
      uniform float uWaveSpeed;
      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vWorldPos;

      float getWaves(vec2 p) {
        float time = uTime * 1.2 * uWaveSpeed;
        float h = 0.0;
        h += sin(dot(p, vec2(0.3, 0.7)) * 0.03 + time * 0.8) * 1.8;
        h += sin(dot(p, vec2(0.8, -0.4)) * 0.07 + time * 1.2) * 0.6;
        h += sin(dot(p, vec2(-0.5, 0.5)) * 0.15 + time * 1.5) * 0.3;
        return h * uWaveStrength;
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
      uniform vec3 uFogColor;
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
        color = mix(color, uFogColor, fog);

        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  }), [])

  useFrame(({ clock }, delta) => {
    if (!matRef.current) return
    const uniforms = matRef.current.uniforms
    const blend = 1 - Math.exp(-delta * 0.75)
    uniforms.uTime.value = clock.getElapsedTime()
    targetColors.deep.set(weather.ocean[0])
    targetColors.surface.set(weather.ocean[1])
    targetColors.shallow.set(weather.ocean[2])
    targetColors.foam.set(weather.ocean[3])
    targetColors.fog.set(weather.fog)
    uniforms.uColorDeep.value.lerp(targetColors.deep, blend)
    uniforms.uColorSurface.value.lerp(targetColors.surface, blend)
    uniforms.uColorShallow.value.lerp(targetColors.shallow, blend)
    uniforms.uColorFoam.value.lerp(targetColors.foam, blend)
    uniforms.uFogColor.value.lerp(targetColors.fog, blend)
    uniforms.uWaveStrength.value = THREE.MathUtils.lerp(uniforms.uWaveStrength.value, weather.waveStrength, blend)
    uniforms.uWaveSpeed.value = THREE.MathUtils.lerp(uniforms.uWaveSpeed.value, weather.waveSpeed, blend)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow={false}>
      <planeGeometry args={[2500, 2500, 64, 64]} />
      <shaderMaterial ref={matRef} args={[shader]} />
    </mesh>
  )
}

function WeatherEnvironment({ weather, workActive }) {
  const skyRef = useRef()
  const ambientRef = useRef()
  const sunRef = useRef()
  const hemiRef = useRef()
  const lightningRef = useRef()
  const lightningTimer = useRef(0)
  const nextLightning = useRef(1.2)
  const targetColor = useMemo(() => new THREE.Color(), [])
  const sunTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const blend = 1 - Math.exp(-delta * 0.72)
    const scene = state.scene

    targetColor.set(weather.sky)
    if (!scene.background?.isColor) scene.background = targetColor.clone()
    scene.background.lerp(targetColor, blend)

    if (!workActive) {
      if (!scene.fog) scene.fog = new THREE.Fog(weather.fog, weather.fogNear, weather.fogFar)
      scene.fog.color.lerp(targetColor.set(weather.fog), blend)
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, weather.fogNear, blend)
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, weather.fogFar, blend)
    }

    state.gl.toneMappingExposure = THREE.MathUtils.lerp(
      state.gl.toneMappingExposure,
      weather.exposure,
      blend,
    )

    ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, weather.ambient, blend)
    sunRef.current.intensity = THREE.MathUtils.lerp(sunRef.current.intensity, weather.sun, blend)
    hemiRef.current.intensity = THREE.MathUtils.lerp(hemiRef.current.intensity, weather.hemi, blend)

    targetColor.set(weather.id === 'night' ? '#9fb9ff' : weather.id === 'storm' ? '#c7d4e8' : '#fff3db')
    sunRef.current.color.lerp(targetColor, blend)
    targetColor.set(weather.id === 'night' ? '#1c315d' : '#b9ddf0')
    hemiRef.current.color.lerp(targetColor, blend)

    const uniforms = skyRef.current?.material?.uniforms
    if (uniforms) {
      uniforms.rayleigh.value = THREE.MathUtils.lerp(uniforms.rayleigh.value, weather.rayleigh, blend)
      uniforms.turbidity.value = THREE.MathUtils.lerp(uniforms.turbidity.value, weather.turbidity, blend)
      sunTarget.set(...weather.sunPosition)
      uniforms.sunPosition.value.lerp(sunTarget, blend)
    }

    if (weather.id === 'storm') {
      lightningTimer.current += delta
      if (lightningTimer.current >= nextLightning.current) {
        lightningTimer.current = 0
        nextLightning.current = 2.2 + Math.random() * 4.8
        lightningRef.current.intensity = 8 + Math.random() * 7
        lightningRef.current.position.set(
          -35 + Math.random() * 70,
          28 + Math.random() * 35,
          -35 + Math.random() * 50,
        )
      }
      lightningRef.current.intensity *= Math.exp(-delta * 10)
    } else {
      lightningTimer.current = 0
      lightningRef.current.intensity = 0
    }
  })

  return (
    <>
      <Sky ref={skyRef} distance={4500} sunPosition={weather.sunPosition} rayleigh={weather.rayleigh} turbidity={weather.turbidity} />
      <ambientLight ref={ambientRef} intensity={0.42} color="#fff0dc" />
      <directionalLight
        ref={sunRef}
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
      <hemisphereLight ref={hemiRef} skyColor="#b9ddf0" groundColor="#101b20" intensity={0.72} />
      <pointLight ref={lightningRef} color="#dce8ff" intensity={0} distance={240} decay={1.2} />
    </>
  )
}

function WeatherOverlay({ weather }) {
  const particles = useMemo(() => Array.from({ length: 64 }, (_, index) => ({
    left: `${(index * 37) % 103}%`,
    delay: `${-((index * 0.17) % 2.8)}s`,
    duration: `${0.5 + (index % 7) * 0.055}s`,
    opacity: 0.32 + (index % 5) * 0.11,
  })), [])

  return (
    <div className={`world-weather world-weather--${weather.id}`} aria-hidden="true">
      <div className="world-weather__clouds" />
      <div className="world-weather__rain">
        {particles.map((particle, index) => (
          <i key={index} style={{
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            opacity: particle.opacity,
          }} />
        ))}
      </div>
      <div className="world-weather__mist" />
      <div className="world-weather__moon" />
      <div className="world-weather__lightning" />
      <div className="world-weather__badge">
        <span>{weather.id === 'storm' ? 'ϟ' : weather.id === 'night' ? '☾' : weather.id === 'rain' ? '☂' : '☀'}</span>
        <strong>{weather.label}</strong>
        <small>Grand Line weather · 3 min cycle</small>
      </div>
      <style>{`
        .world-weather { position: fixed; inset: 0; z-index: 6; overflow: hidden; pointer-events: none; transition: background 4s ease; }
        .world-weather__clouds, .world-weather__rain, .world-weather__mist, .world-weather__moon, .world-weather__lightning { position: absolute; inset: 0; opacity: 0; transition: opacity 3.5s ease; }
        .world-weather__clouds { background: radial-gradient(ellipse at 18% -12%, rgba(24,34,45,.8), transparent 44%), radial-gradient(ellipse at 76% -16%, rgba(28,37,48,.74), transparent 52%), linear-gradient(180deg, rgba(0,0,0,.14), transparent 48%); filter: blur(18px); animation: weather-cloud-drift 20s ease-in-out infinite alternate; }
        .world-weather--rain .world-weather__clouds { opacity: .7; }
        .world-weather--storm .world-weather__clouds { opacity: .94; }
        .world-weather--night { background: radial-gradient(circle at 72% 16%, rgba(118,148,220,.18), transparent 24%), linear-gradient(180deg, rgba(0,4,18,.52), rgba(1,8,22,.2)); }
        .world-weather--rain { background: linear-gradient(180deg, rgba(20,36,46,.2), rgba(10,24,32,.1)); }
        .world-weather--storm { background: linear-gradient(180deg, rgba(0,0,0,.2), rgba(5,8,16,.18)); }
        .world-weather--night .world-weather__moon { opacity: .7; }
        .world-weather__moon { left: auto; right: 8vw; top: 10vh; width: 72px; height: 72px; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #fff8c7, #b9cffc 46%, transparent 66%); filter: blur(.2px) drop-shadow(0 0 24px rgba(182,211,255,.56)); }
        .world-weather--rain .world-weather__mist, .world-weather--storm .world-weather__mist { opacity: .55; }
        .world-weather__mist { background: linear-gradient(180deg, transparent 36%, rgba(160,200,220,.14) 64%, transparent 100%); animation: weather-mist 16s ease-in-out infinite alternate; }
        .world-weather--rain .world-weather__rain { opacity: .62; }
        .world-weather--storm .world-weather__rain { opacity: .9; }
        .world-weather__rain i { position: absolute; top: -14vh; width: 1px; height: 13vh; background: linear-gradient(transparent, rgba(220,240,255,.78)); transform: rotate(12deg); animation: weather-rain linear infinite; }
        .world-weather--storm .world-weather__lightning { opacity: 1; animation: weather-lightning 6.7s steps(1) infinite; }
        .world-weather__lightning { background: rgba(220,235,255,.72); mix-blend-mode: screen; }
        .world-weather__badge { position: fixed; top: 78px; right: 18px; display: grid; grid-template-columns: 26px auto; column-gap: 8px; min-width: 170px; padding: 8px 12px; border: 1px solid rgba(255,255,255,.16); border-radius: 12px; opacity: .78; background: rgba(4,12,18,.5); color: #eef8ff; backdrop-filter: blur(8px); box-shadow: 0 12px 30px rgba(0,0,0,.18); transition: border-color 2s ease, background 2s ease; }
        .world-weather__badge span { grid-row: 1 / 3; align-self: center; color: #e8c75a; font-size: 22px; text-align: center; }
        .world-weather__badge strong { font: 400 13px/1.1 "Pirata One", serif; letter-spacing: .1em; }
        .world-weather__badge small { margin-top: 2px; color: rgba(255,255,255,.48); font: 8px/1.2 monospace; letter-spacing: .05em; }
        .world-weather--storm .world-weather__badge { border-color: rgba(158,186,255,.36); background: rgba(5,9,18,.7); }
        @keyframes weather-rain { to { transform: translate(18vw, 125vh) rotate(12deg); } }
        @keyframes weather-mist { from { transform: translateY(2vh); } to { transform: translateY(-2vh); } }
        @keyframes weather-cloud-drift { from { transform: translateX(-3%) scale(1.05); } to { transform: translateX(4%) scale(1.12); } }
        @keyframes weather-lightning { 0%, 78%, 82%, 100% { opacity: 0; } 79% { opacity: .76; } 80% { opacity: .1; } 81% { opacity: .52; } }
        @media (prefers-reduced-motion: reduce) { .world-weather * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>
    </div>
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
  onSkillsClimbingChange,
  skillsDirection = 'north',
  workActive = false,
}) {
  const [cloudsCleared, setCloudsCleared] = useState(false)
  const [skillsCameraLocked, setSkillsCameraLocked] = useState(false)
  const [weatherIndex, setWeatherIndex] = useState(getInitialWeatherIndex)
  const weather = WEATHER_SEQUENCE[weatherIndex]
  
  // ─── NEW: Global Free Camera State ───
  const [freeCam, setFreeCam] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCloudsCleared(true), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherIndex((current) => (current + 1) % WEATHER_SEQUENCE.length)
    }, WEATHER_DURATION_MS)
    return () => clearInterval(interval)
  }, [])

  // ─── NEW: Keyboard Listener for 'O' key ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Pressing 'o' or 'O' toggles the free camera mode
      if (e.key.toLowerCase() === 'o') {
        setFreeCam((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.84 }}
  style={{ position: 'absolute', inset: 0, zIndex: 1 }}
>
  {/* 1. OrbitControls is ALWAYS mounted, but disabled until you press 'O' */}
  <OrbitControls makeDefault enabled={freeCam} target={[0, 0, 0]} />

  {/* 2. Your Camera Controllers */}
  {!freeCam && (
    <>
      <AboutCameraController active={aboutActive} />
      <SkillsCameraTransition
        active={skillsActive}
        direction={skillsDirection}
        cameraClaimedByOtherSection={aboutActive || workActive}
        onCameraLockChange={setSkillsCameraLocked}
      />
    </>
  )}
  {/* 3. The rest of your scene... */}
  <WeatherEnvironment weather={weather} workActive={workActive} />
  <Sparkles
    count={weather.id === 'night' ? 420 : 170}
    scale={weather.id === 'night' ? [240, 90, 240] : 60}
    size={weather.id === 'night' ? 1.8 : 1.25}
    speed={weather.id === 'storm' ? 0.34 : 0.18}
    opacity={weather.id === 'night' ? 0.72 : 0.11}
    color={weather.id === 'night' ? '#c9dcff' : '#ffffff'}
    position={[0, weather.id === 'night' ? 35 : 8, 0]}
  />
  
  <Ocean weather={weather} />

  <Suspense fallback={null}>
    <Physics gravity={[0, -9.81, 0]} debug={false}>
      <Ship onProjectSelect={onProjectSelect} aboutActive={aboutActive} skillsActive={skillsActive} weatherId={weather.id} />
      <LuffyCharacter3D
        position={[0, 0.15, 5]}
        onStateChange={onStateChange}
        onZoneChange={onZoneChange}
        onNavigate={onNavigate}
        onProjectSelect={onProjectSelect}
        debugRef={debugRef}
        aboutActive={aboutActive}
        skillsActive={skillsActive}
        cameraLocked={skillsCameraLocked}
        onSkillsClimbingChange={onSkillsClimbingChange}
        skillsDirection={skillsDirection}
        workActive={workActive}
        freeCam={freeCam}
      />
    </Physics>
  </Suspense>

  <EffectComposer disableNormalPass multisampling={0}>
    <Bloom luminanceThreshold={workActive ? 1.8 : 1.1} mipmapBlur={!workActive} intensity={workActive ? 0.06 : 0.3} levels={workActive ? 2 : 4} />
    <Vignette eskil={false} offset={0.12} darkness={workActive ? 0.35 : 0.75} />
  </EffectComposer>
</Canvas>
      {!workActive && <WeatherOverlay weather={weather} />}

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
