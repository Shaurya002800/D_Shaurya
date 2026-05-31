import { useRef, useEffect, useCallback, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF }            from '@react-three/drei'
import * as THREE              from 'three'
import { FBXLoader }           from 'three-stdlib'
import { useKeyboard }         from '../hooks/useKeyboard'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — tune these to perfect the feel
// ─────────────────────────────────────────────────────────────────────────────

/** How far Luffy can walk in each direction from ship centre */
const BOUNDS = {
  minX: -7.0,
  maxX:  7.0,
  minZ: -22.0,
  maxZ:  28.0, // ✨ INCREASED from 22.0 to 28.0
}

/** Movement feel */
const MOVE = {
  walkSpeed:   4.8,   // units/sec at full walk
  runSpeed:    9.2,   // units/sec at full run
  accel:       14.0,  // how quickly velocity builds
  friction:    11.0,  // how quickly velocity dies when no input
  rotSpeed:    12.0,  // how fast Luffy turns to face direction
  runThresh:   6.5,   // velocity threshold to switch walk → run anim
  stopThresh:  0.06,  // velocity below this = fully stopped
}

/** Camera feel */
const CAM = {
  normalDist:   8.0,  // distance behind Luffy
  normalHeight:  3.2,  // height above Luffy
  runDist:      11.0,  // camera pulls back when running
  runHeight:     3.8,
  posLerp:       0.055, // how smoothly camera position follows
  lookLerp:      0.08,  // how smoothly camera look target follows
  lookOffset:    1.85,  // how high above Luffy camera looks
  fovNormal:    68,
  fovRun:       74,
  fovLerp:       0.04,
}

/** Animation crossfade durations (seconds) */
const FADE = {
  toIdle:  0.35,
  toWalk:  0.22,
  toRun:   0.18,
  toStop:  0.28,
  toWave:  0.25,
  toExamine: 0.3,
  toClimb: 0.2,
  toJump:  0.15,
}

/** Shadow quality */
const SHADOW = {
  castShadow:    true,
  receiveShadow: true,
  shadowBias:   -0.001,
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER STATES — finite state machine
// ─────────────────────────────────────────────────────────────────────────────
const STATE = {
  IDLE:    'idle',
  WALK:    'walk',
  RUN:     'run',
  EXAMINE: 'examine',
  WAVE:    'wave',
  CLIMB:   'climb',
  JUMP:    'jump',
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION FILE MAP — maps state names to FBX file paths
// ─────────────────────────────────────────────────────────────────────────────
const ANIM_FILES = {
  [STATE.IDLE]:    '/animations/Idle.fbx',
  [STATE.WALK]:    '/animations/Start Walking.fbx',
  [STATE.RUN]:     '/animations/Running.fbx',
  [STATE.EXAMINE]: '/animations/Standing Idle 03 Examine.fbx',
  [STATE.WAVE]:    '/animations/Wave Hip Hop Dance.fbx',
  [STATE.CLIMB]:   '/animations/Climbing Ladder.fbx',
  [STATE.JUMP]:    '/animations/Jumping Down.fbx',
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips the "Armature|" prefix from Mixamo FBX track names
 * so clips loaded from different FBX files share the same bone names
 * and can be applied to one AnimationMixer.
 */
function retargetClip(clip) {
  clip.tracks.forEach(track => {
    // "Armature|mixamorigHips.position" → "mixamorigHips.position"
    track.name = track.name.replace(/^[^|]+\|/, '')
  })
  return clip
}

/**
 * Clamp a value between min and max.
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

/**
 * Wrap an angle into [-PI, PI].
 */
function wrapAngle(a) {
  while (a >  Math.PI) a -= 2 * Math.PI
  while (a < -Math.PI) a += 2 * Math.PI
  return a
}

/**
 * Smooth lerp between two angles (handles 360° wrap).
 */
function lerpAngle(current, target, t) {
  const diff = wrapAngle(target - current)
  return current + diff * t
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION LOADER — loads all FBX clips onto a single mixer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads one FBX animation file and returns an AnimationAction
 * bound to the given mixer and base mesh.
 */
function loadAnim(loader, path, mixer, name) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (fbx) => {
        if (!fbx.animations || fbx.animations.length === 0) {
          console.warn(`[Luffy] No animation found in ${path}`)
          reject(new Error(`No animation in ${path}`))
          return
        }
        const clip   = retargetClip(fbx.animations[0])
        const action = mixer.clipAction(clip)
        action.setLoop(THREE.LoopRepeat)
        // Pre-warm — play then immediately pause so first frame is set
        action.play()
        action.paused = true
        console.log(`[Luffy] ✅ ${name} loaded — ${clip.tracks.length} tracks`)
        resolve(action)
      },
      undefined,
      (err) => {
        console.error(`[Luffy] ❌ Failed to load ${name}:`, err)
        reject(err)
      }
    )
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL TRANSFER — applies GLB PBR materials onto FBX mesh
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collects all unique materials from the GLB scene in traverse order.
 */
function collectGLBMaterials(glbScene) {
  const seen = new Set()
  const list = []
  glbScene.traverse((child) => {
    if (!child.isMesh) return
    const mats = Array.isArray(child.material)
      ? child.material
      : [child.material]
    mats.forEach((m) => {
      if (m && !seen.has(m.uuid)) {
        seen.add(m.uuid)
        list.push(m)
      }
    })
  })
  return list
}

/**
 * Applies GLB material list to an FBX mesh by index.
 */
function applyMaterialsToFBX(fbx, matList) {
  let idx = 0
  fbx.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow    = SHADOW.castShadow
    child.receiveShadow = SHADOW.receiveShadow
    if (child.material?.shadowSide !== undefined) {
      child.material.shadowSide = THREE.FrontSide
    }
    if (matList[idx]) {
      child.material = matList[idx]
    }
    idx++
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTSTEP SYSTEM — triggers visual dust puffs on footfall
// ─────────────────────────────────────────────────────────────────────────────

function createFootpuff(scene, position) {
  const group = new THREE.Group()
  group.position.copy(position)
  group.position.y += 0.05

  for (let i = 0; i < 5; i++) {
    const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.05, 5, 5)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xd4a574,
      transparent: true,
      opacity: 0.55,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(
      (Math.random() - 0.5) * 0.3,
      0,
      (Math.random() - 0.5) * 0.3,
    )
    group.add(mesh)
  }

  scene.add(group)

  let age = 0
  const tick = () => {
    age += 0.016
    group.children.forEach((m, i) => {
      m.position.y += 0.012
      m.position.x += (Math.random() - 0.5) * 0.01
      m.material.opacity = Math.max(0, 0.55 - age * 1.4)
    })
    if (age < 0.4) {
      requestAnimationFrame(tick)
    } else {
      scene.remove(group)
      group.children.forEach((m) => {
        m.geometry.dispose()
        m.material.dispose()
      })
    }
  }
  requestAnimationFrame(tick)
}

// ─────────────────────────────────────────────────────────────────────────────
// SHADOW BLOB — fake circular shadow beneath Luffy
// ─────────────────────────────────────────────────────────────────────────────
function ShadowBlob({ groupRef }) {
  const blobRef = useRef()

  useFrame(() => {
    if (!blobRef.current || !groupRef.current) return
    blobRef.current.position.x = groupRef.current.position.x
    blobRef.current.position.z = groupRef.current.position.z
  })

  return (
    <mesh
      ref={blobRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.22, 0]}
      receiveShadow={false}
    >
      <circleGeometry args={[0.55, 18]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

class CameraController {
  constructor() {
    this.position    = new THREE.Vector3(0, CAM.normalHeight, CAM.normalDist)
    this.lookTarget  = new THREE.Vector3()
    this.currentFov  = CAM.fovNormal
    this._tmpVec     = new THREE.Vector3()
    this._tmpLook    = new THREE.Vector3()
  }

  update(camera, luffyPos, luffyRot, isRunning, dt) {
    const dist   = isRunning ? CAM.runDist   : CAM.normalDist
    const height = isRunning ? CAM.runHeight  : CAM.normalHeight
    const fov    = isRunning ? CAM.fovRun     : CAM.fovNormal

    this._tmpVec.set(
      luffyPos.x - Math.sin(luffyRot) * dist,
      luffyPos.y + height,
      luffyPos.z - Math.cos(luffyRot) * dist,
    )

    this.position.lerp(this._tmpVec, CAM.posLerp)
    camera.position.copy(this.position)

    this._tmpLook.set(
      luffyPos.x,
      luffyPos.y + CAM.lookOffset,
      luffyPos.z,
    )
    this.lookTarget.lerp(this._tmpLook, CAM.lookLerp)
    camera.lookAt(this.lookTarget)

    this.currentFov += (fov - this.currentFov) * CAM.fovLerp
    camera.fov = this.currentFov
    camera.updateProjectionMatrix()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VELOCITY CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

class VelocityController {
  constructor() {
    this.vel       = new THREE.Vector3()
    this.speed     = 0
    this._inputDir = new THREE.Vector3()
  }

  update(keys, shift, dt) {
    const fwd = keys.w || keys.W || keys.ArrowUp
    const bwd = keys.s || keys.S || keys.ArrowDown
    const lft = keys.a || keys.A || keys.ArrowLeft
    const rgt = keys.d || keys.D || keys.ArrowRight
    const moving = fwd || bwd || lft || rgt

    const maxSpeed = (shift && moving) ? MOVE.runSpeed : MOVE.walkSpeed

    this._inputDir.set(0, 0, 0)
    if (fwd) this._inputDir.z -= 1
    if (bwd) this._inputDir.z += 1
    if (lft) this._inputDir.x -= 1
    if (rgt) this._inputDir.x += 1

    if (this._inputDir.length() > 0) {
      this._inputDir.normalize()
    }

    if (moving) {
      this.vel.x += this._inputDir.x * MOVE.accel * dt
      this.vel.z += this._inputDir.z * MOVE.accel * dt
      const spd = this.vel.length()
      if (spd > maxSpeed) this.vel.multiplyScalar(maxSpeed / spd)
    } else {
      const friction = Math.max(0, 1 - MOVE.friction * dt)
      this.vel.x *= friction
      this.vel.z *= friction
      if (this.vel.length() < MOVE.stopThresh) {
        this.vel.set(0, 0, 0)
      }
    }

    this.speed = this.vel.length()

    return {
      moving:  this.speed > MOVE.stopThresh,
      running: this.speed > MOVE.runThresh,
      speed:   this.speed,
    }
  }

  get directionAngle() {
    return Math.atan2(this.vel.x, this.vel.z)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION STATE MACHINE
// ─────────────────────────────────────────────────────────────────────────────

class AnimStateMachine {
  constructor() {
    this.actions = {}
    this.current = STATE.IDLE
    this.locked  = false 
    this._mixer  = null
  }

  setMixer(mixer) {
    this._mixer = mixer
  }

  register(name, action) {
    this.actions[name] = action
  }

  transition(next, fadeDuration = 0.25, force = false) {
    if (!force && this.locked)       return
    if (this.current === next)       return
    if (!this.actions[next])         return

    const prev = this.actions[this.current]
    const nextA = this.actions[next]

    if (prev) {
      prev.fadeOut(fadeDuration)
    }

    nextA.paused = false
    nextA.reset().fadeIn(fadeDuration).play()

    this.current = next
  }

  playOnce(stateName, fadeDuration = 0.25, onComplete) {
    if (!this.actions[stateName]) return
    const action = this.actions[stateName]

    this.locked = true
    this.transition(stateName, fadeDuration, true)

    action.setLoop(THREE.LoopOnce)
    action.clampWhenFinished = true

    const onFinished = (e) => {
      if (e.action === action) {
        this._mixer.removeEventListener('finished', onFinished)
        this.locked = false
        action.setLoop(THREE.LoopRepeat)
        this.transition(STATE.IDLE, FADE.toIdle, true)
        if (onComplete) onComplete()
      }
    }
    this._mixer.addEventListener('finished', onFinished)
  }

  syncWalkSpeed(speed, maxSpeed) {
    const action = this.actions[STATE.WALK]
    if (!action) return
    const ratio = clamp(speed / maxSpeed, 0.3, 1.0)
    action.setEffectiveTimeScale(0.7 + ratio * 0.7)
  }

  syncRunSpeed(speed, maxSpeed) {
    const action = this.actions[STATE.RUN]
    if (!action) return
    const ratio = clamp(speed / maxSpeed, 0.5, 1.2)
    action.setEffectiveTimeScale(0.8 + ratio * 0.4)
  }

  updateLocomotion({ moving, running }) {
    if (this.locked) return

    if (!moving) {
      this.transition(STATE.IDLE, FADE.toIdle)
    } else if (running) {
      this.transition(STATE.RUN, FADE.toRun)
    } else {
      this.transition(STATE.WALK, FADE.toWalk)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTSTEP TIMER
// ─────────────────────────────────────────────────────────────────────────────

class FootstepTimer {
  constructor() {
    this._timer     = 0
    this._interval  = 0.42 
  }

  tick(dt, moving, speed, maxSpeed) {
    if (!moving) {
      this._timer = 0
      return false
    }
    const ratio     = clamp(speed / maxSpeed, 0.4, 1.0)
    this._timer    += dt
    const interval  = this._interval / ratio
    if (this._timer >= interval) {
      this._timer = 0
      return true
    }
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROTATION CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

class RotationController {
  constructor(initialAngle = Math.PI) {
    this.current = initialAngle
  }

  update(targetAngle, speed, dt) {
    this.current = lerpAngle(this.current, targetAngle, speed * dt)
    return this.current
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POSITION CONTROLLER (UPDATED WITH COLLISIONS & HEIGHT)
// ─────────────────────────────────────────────────────────────────────────────

class PositionController {
  constructor() {
    this._pos = new THREE.Vector3()
  }

  update(group, vel, dt) {
    const p = group.position
    let nextX = p.x + vel.x * dt
    let nextZ = p.z + vel.z * dt

    // 1. SHIP EXTERNAL BOUNDARIES
    nextX = clamp(nextX, BOUNDS.minX, BOUNDS.maxX)
    nextZ = clamp(nextZ, BOUNDS.minZ, BOUNDS.maxZ)

    // 2. SOLID OBSTACLES (The invisible boxes Luffy can't walk through)
    // 2. SOLID OBSTACLES (The invisible boxes Luffy can't walk through)
    const OBSTACLES = [
      // Mikan Tree Planter Box
      { minX: -8.0, maxX: -3.5, minZ: 16.5, maxZ: 21.0 },
      // Ship Wheel Column
      { minX: -1.0, maxX: 1.0,  minZ: 18.8, maxZ: 20.8 },
      // Main Mast
      { minX: -1.2, maxX: 1.2,  minZ: -4.2, maxZ: -1.8 },
      // Fore Mast
      { minX: -0.8, maxX: 0.8,  minZ: -20.0, maxZ: -18.0 },
      
      // ✨ NEW: LIBRARY & SURVEY ROOM ARCHITECTURE ✨
      // Left exterior wall
      { minX: -6.2, maxX: -5.7, minZ: 21.6, maxZ: 27.6 },
      // Right exterior wall
      { minX: 5.7,  maxX: 6.2,  minZ: 21.6, maxZ: 27.6 },
      // Back exterior wall (windows)
      { minX: -6.2, maxX: 6.2,  minZ: 27.3, maxZ: 27.6 },
      // Front Wall (Left of the door)
      { minX: -6.0, maxX: -1.0, minZ: 21.4, maxZ: 21.8 },
      // Front Wall (Right of the door)
      { minX: 1.0,  maxX: 6.0,  minZ: 21.4, maxZ: 21.8 },
      // Interior Prop: Bookshelf
      { minX: -5.7, maxX: -4.0, minZ: 22.5, maxZ: 26.5 },
      // Interior Prop: Nami's Desk
      { minX: -2.0, maxX: 2.0,  minZ: 25.2, maxZ: 27.0 },
    ]

    for (const obs of OBSTACLES) {
      // If the next step puts Luffy inside an obstacle box...
      if (nextX > obs.minX && nextX < obs.maxX && nextZ > obs.minZ && nextZ < obs.maxZ) {
        // Cancel movement on the axis that caused the collision
        if (p.x <= obs.minX || p.x >= obs.maxX) nextX = p.x
        if (p.z <= obs.minZ || p.z >= obs.maxZ) nextZ = p.z
      }
    }

    // Apply the X and Z movement
    p.x = nextX
    p.z = nextZ

    // 3. ELEVATION (Y-AXIS) CONTROL
    // The Slide (Walk up/down the ramp)
    if (p.x >= -3.8 && p.x <= -1.5 && p.z >= 9.0 && p.z <= 15.0) {
      // Calculate how far up the ramp he is (0 = bottom, 1 = top)
      const slopeProgress = (p.z - 9.0) / (15.0 - 9.0) 
      p.y = 0.15 + clamp(slopeProgress, 0, 1) * 2.5
    } 
    // Quarterdeck (Rear stairs/raised deck)
    else if (p.z > 13.0) {
      p.y = 2.65 
    }
    // Forecastle (Front stairs/raised deck)
    else if (p.z < -13.0) {
      p.y = 2.65 
    }
    // The Basement Hatch (Slight bump up when walking over it)
    else if (p.x > -1.75 && p.x < 1.75 && p.z > 3.75 && p.z < 6.25) {
      p.y = 0.28
    }
    // Main Deck (Default flat grass/wood floor)
    else {
      p.y = 0.15 
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTION ZONES
// ─────────────────────────────────────────────────────────────────────────────

const ZONES = [
  {
    id:       'wheel',
    label:    'Press E — Inspect Wheel',
    center:   new THREE.Vector3(0, 0.15, 19),
    radius:   2.5,
    state:    STATE.EXAMINE,
    section:  'about',
  },
  {
    id:       'hatch',
    label:    'Press E — Enter Basement',
    center:   new THREE.Vector3(0, 0.15, 5),
    radius:   2.2,
    state:    STATE.EXAMINE,
    section:  'work',
  },
  {
    id:       'ladder',
    label:    'Press E — Climb to Crow\'s Nest',
    center:   new THREE.Vector3(0.8, 0.15, -3),
    radius:   2.0,
    state:    STATE.CLIMB,
    section:  'skills',
  },
  {
    id:       'bow',
    label:    'Press E — Look at the Ocean',
    center:   new THREE.Vector3(0, 0.15, -20),
    radius:   3.0,
    state:    STATE.WAVE,
    section:  null,
  },
]

function getActiveZone(pos) {
  for (const zone of ZONES) {
    const dx = pos.x - zone.center.x
    const dz = pos.z - zone.center.z
    if (dx * dx + dz * dz < zone.radius * zone.radius) {
      return zone
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTION HINT
// ─────────────────────────────────────────────────────────────────────────────

function InteractionHint({ label }) {
  if (!label) return null
  return (
    <div
      style={{
        position:      'fixed',
        bottom:        '38px',
        left:          '50%',
        transform:     'translateX(-50%)',
        zIndex:        200,
        fontFamily:    '"Pirata One", cursive',
        fontSize:      '15px',
        letterSpacing: '0.08em',
        color:         '#f0c040',
        background:    'rgba(0,0,0,0.52)',
        border:        '1px solid rgba(240,192,64,0.35)',
        borderRadius:  '8px',
        padding:       '8px 22px',
        pointerEvents: 'none',
        textShadow:    '0 0 12px rgba(240,192,64,0.6)',
        backdropFilter:'blur(6px)',
        animation:     'hintPulse 1.8s ease-in-out infinite',
      }}
    >
      {label}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');
        @keyframes hintPulse {
          0%,100% { opacity:0.85; }
          50%      { opacity:1.0;  }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEED INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function SpeedIndicator({ speed, state }) {
  if (process.env.NODE_ENV === 'production') return null
  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 999,
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#fff',
      background: 'rgba(0,0,0,0.5)',
      padding: '6px 12px',
      borderRadius: '6px',
      pointerEvents: 'none',
    }}>
      <div>state: <span style={{ color: '#f0c040' }}>{state}</span></div>
      <div>speed: <span style={{ color: '#44ffaa' }}>{speed.toFixed(2)}</span></div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LUFFY 3D — Main Component
// ─────────────────────────────────────────────────────────────────────────────

function Luffy3D({
  position,
  onStateChange,
  onZoneChange,
  onNavigate,
  debugRef,
  aboutActive = false,
}) {
  const groupRef     = useRef()
  const mixerRef     = useRef(null)
  const loadedRef    = useRef(false)
  const stateRef     = useRef(STATE.IDLE)
  const zoneRef      = useRef(null)

  const camCtrl   = useRef(new CameraController())
  const velCtrl   = useRef(new VelocityController())
  const rotCtrl   = useRef(new RotationController(Math.PI))
  const posCtrl   = useRef(new PositionController())
  const animSM    = useRef(new AnimStateMachine())
  const footstep  = useRef(new FootstepTimer())
  const wasMoving = useRef(false)

  const keys = useKeyboard()
  const { camera, scene } = useThree()
  const { scene: glbScene } = useGLTF('/models/monkey_d_luffy.glb')

  useEffect(() => {
    if (!glbScene || !groupRef.current) return

    const matList = collectGLBMaterials(glbScene)
    const loader  = new FBXLoader()
    let fbxMesh   = null

    loader.load(
      ANIM_FILES[STATE.IDLE],
      async (fbx) => {
        fbx.scale.setScalar(0.0099)
        fbx.rotation.set(0, 0, 0)
        applyMaterialsToFBX(fbx, matList)
        fbxMesh = fbx

        const mixer = new THREE.AnimationMixer(fbx)
        mixerRef.current = mixer
        animSM.current.setMixer(mixer)

        const idleClip   = retargetClip(fbx.animations[0])
        const idleAction = mixer.clipAction(idleClip)
        idleAction.setLoop(THREE.LoopRepeat)
        idleAction.play()
        idleAction.paused = false
        animSM.current.register(STATE.IDLE, idleAction)
        stateRef.current = STATE.IDLE

        if (groupRef.current) groupRef.current.add(fbx)
        loadedRef.current = true
        console.log('[Luffy] ✅ Base mesh + idle ready')

        const animKeys = Object.keys(ANIM_FILES).filter(k => k !== STATE.IDLE)
        const results  = await Promise.allSettled(
          animKeys.map(k => loadAnim(loader, ANIM_FILES[k], mixer, k))
        )
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            animSM.current.register(animKeys[i], result.value)
          }
        })
        console.log('[Luffy] ✅ All animations loaded')
      },
      undefined,
      (err) => console.error('[Luffy] ❌ Failed to load base mesh:', err)
    )

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = null
      }
      if (groupRef.current && fbxMesh) {
        groupRef.current.remove(fbxMesh)
      }
      loadedRef.current = false
    }
  }, [glbScene])

  useFrame((_, dt) => {
    if (!loadedRef.current || !groupRef.current || !mixerRef.current) return

    const safeDt = Math.min(dt, 0.05)
    mixerRef.current.update(safeDt)

    if (aboutActive) {
      animSM.current.updateLocomotion({ moving: false, running: false })
      if (stateRef.current !== animSM.current.current) {
        stateRef.current = animSM.current.current
        if (onStateChange) onStateChange(stateRef.current)
      }
      return
    }

    // 🚨 BUG FIX: Handle the hook returning an object OR a ref. 
    const currentKeys = keys?.current || keys || {}

    // Support Shift key to run
    const shift = currentKeys.Shift || currentKeys.ShiftLeft || currentKeys.ShiftRight || false

    const { moving, running, speed } = velCtrl.current.update(
      currentKeys,
      shift,
      safeDt,
    )

    posCtrl.current.update(
      groupRef.current,
      velCtrl.current.vel,
      safeDt,
    )

    if (moving) {
      const targetAngle = rotCtrl.current.update(
        velCtrl.current.directionAngle,
        MOVE.rotSpeed,
        safeDt,
      )
      groupRef.current.rotation.y = targetAngle
    }

    animSM.current.updateLocomotion({ moving, running })
    if (moving && running) {
      animSM.current.syncRunSpeed(speed, MOVE.runSpeed)
    } else if (moving) {
      animSM.current.syncWalkSpeed(speed, MOVE.walkSpeed)
    }

    if (footstep.current.tick(safeDt, moving, speed, MOVE.walkSpeed)) {
      createFootpuff(scene, groupRef.current.position)
    }

    const zone = getActiveZone(groupRef.current.position)
    if (zone?.id !== zoneRef.current?.id) {
      zoneRef.current = zone
      if (onZoneChange) onZoneChange(zone)
    }

    // Safely consume E key
    if ((currentKeys.e || currentKeys.E) && zone && !animSM.current.locked) {
      if (keys.current) {
        keys.current.e = false
        keys.current.E = false
      } else {
        keys.e = false
        keys.E = false
      }
      
      animSM.current.playOnce(zone.state, 0.25, () => {
        if (zone.section && onNavigate) {
          onNavigate(zone.section)
        }
      })
    }

    if (stateRef.current !== animSM.current.current) {
      stateRef.current = animSM.current.current
      if (onStateChange) onStateChange(stateRef.current)
    }

    camCtrl.current.update(
      camera,
      groupRef.current.position,
      groupRef.current.rotation.y,
      running,
      safeDt,
    )

    if (debugRef) {
      debugRef.current = {
        speed: speed,
        state: stateRef.current,
        pos:   groupRef.current.position.clone(),
      }
    }

    wasMoving.current = moving
  })

  return (
    <>
      <group ref={groupRef} position={position} />
      <ShadowBlob groupRef={groupRef} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LUFFY CHARACTER — main export
// ─────────────────────────────────────────────────────────────────────────────

export default function LuffyCharacter({
  position = [0, 0.15, 5],
  onNavigate,
  aboutActive = false,
}) {
  const [hintLabel,   setHintLabel]   = useState(null)
  const [charState,   setCharState]   = useState(STATE.IDLE)
  const [speed,       setSpeed]       = useState(0)
  const debugRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (debugRef.current) {
        setSpeed(debugRef.current.speed ?? 0)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handleZoneChange = useCallback((zone) => {
    setHintLabel(zone ? zone.label : null)
  }, [])

  const handleStateChange = useCallback((state) => {
    setCharState(state)
  }, [])

  return (
    <>
      <Luffy3D
        position={position}
        onStateChange={handleStateChange}
        onZoneChange={handleZoneChange}
        onNavigate={onNavigate}
        debugRef={debugRef}
        aboutActive={aboutActive}
      />
      <InteractionHint label={hintLabel} />
      <SpeedIndicator  speed={speed} state={charState} />
    </>
  )
}

useGLTF.preload('/models/monkey_d_luffy.glb')
export const LuffyCharacter3D = Luffy3D
export function LuffyUI({ hintLabel, speed, charState }) {
  const label = typeof hintLabel === 'string' ? hintLabel : hintLabel?.label ?? null

  return (
    <>
      <InteractionHint label={label} />
      <SpeedIndicator speed={speed} state={charState} />
    </>
  )
}