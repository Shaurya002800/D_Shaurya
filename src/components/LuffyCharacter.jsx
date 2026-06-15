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
const BOUNDS_DECK = {
  minX: -7.0, maxX: 7.0,
  minZ: -22.0, maxZ: 28.0,
}

// ── FIX 1: BOUNDS_BASEMENT in WORLD coordinates ───────────────────────────
// Luffy teleports to world [0, -13.85, 5] when workActive.
// Basement group sits at world [0, -14, 2], with a ship-footprint floor
// matching the main deck: local Z -23..17, so world Z -21..19.
// Kept safely inside the curved wall shell.
const BOUNDS_BASEMENT = {
  minX: -7.1, maxX: 7.1,
  minZ: -20.2, maxZ: 16.2,
}

// keep BOUNDS pointing to deck for backward compat
const BOUNDS = BOUNDS_DECK

/** Movement feel */
const MOVE = {
  walkSpeed:   4.8,
  runSpeed:    9.2,
  accel:       14.0,
  friction:    11.0,
  rotSpeed:    12.0,
  runThresh:   6.5,
  stopThresh:  0.06,
}

/** Camera feel */
const CAM = {
  normalDist:   8.0,
  normalHeight:  3.2,
  runDist:      11.0,
  runHeight:     3.8,
  basementDist:  7.0,
  basementHeight: 3.0,
  posLerp:       0.055,
  lookLerp:      0.08,
  lookOffset:    1.85,
  basementLookOffset: 1.55,
  fovNormal:    68,
  fovRun:       74,
  fovBasement:  76,
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
// ANIMATION FILE MAP
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

function retargetClip(clip) {
  clip.tracks.forEach(track => {
    track.name = track.name.replace(/^[^|]+\|/, '')
  })
  return clip
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function wrapAngle(a) {
  while (a >  Math.PI) a -= 2 * Math.PI
  while (a < -Math.PI) a += 2 * Math.PI
  return a
}

function lerpAngle(current, target, t) {
  const diff = wrapAngle(target - current)
  return current + diff * t
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION LOADER
// ─────────────────────────────────────────────────────────────────────────────

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
// MATERIAL TRANSFER
// ─────────────────────────────────────────────────────────────────────────────

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
// FOOTSTEP SYSTEM
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
    group.children.forEach((m) => {
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
// SHADOW BLOB
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

  update(camera, luffyPos, luffyRot, isRunning, dt, workActive = false) {
    const dist   = workActive ? CAM.basementDist : (isRunning ? CAM.runDist : CAM.normalDist)
    const height = workActive ? CAM.basementHeight : (isRunning ? CAM.runHeight : CAM.normalHeight)
    const fov    = workActive ? CAM.fovBasement : (isRunning ? CAM.fovRun : CAM.fovNormal)
    const lookOffset = workActive ? CAM.basementLookOffset : CAM.lookOffset

    this._tmpVec.set(
      luffyPos.x - Math.sin(luffyRot) * dist,
      luffyPos.y + height,
      luffyPos.z - Math.cos(luffyRot) * dist,
    )

    if (workActive) {
      this._tmpVec.x = clamp(this._tmpVec.x, BOUNDS_BASEMENT.minX, BOUNDS_BASEMENT.maxX)
      this._tmpVec.z = clamp(this._tmpVec.z, BOUNDS_BASEMENT.minZ, BOUNDS_BASEMENT.maxZ)
      this._tmpVec.y = Math.min(this._tmpVec.y, -9.6)
    }

    this.position.lerp(this._tmpVec, workActive ? 0.16 : CAM.posLerp)
    camera.position.copy(this.position)

    this._tmpLook.set(
      luffyPos.x,
      luffyPos.y + lookOffset,
      luffyPos.z,
    )
    this.lookTarget.lerp(this._tmpLook, workActive ? 0.18 : CAM.lookLerp)
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

    const prev  = this.actions[this.current]
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
// POSITION CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

class PositionController {
  constructor() {
    this._pos = new THREE.Vector3()
  }

  update(group, vel, dt) {
    const p = group.position
    let nextX = p.x + vel.x * dt
    let nextZ = p.z + vel.z * dt

    nextX = clamp(nextX, BOUNDS.minX, BOUNDS.maxX)
    nextZ = clamp(nextZ, BOUNDS.minZ, BOUNDS.maxZ)

    const OBSTACLES = [
      { minX: -8.0, maxX: -3.5, minZ: 16.5, maxZ: 21.0 },
      { minX: -1.0, maxX: 1.0,  minZ: 18.8, maxZ: 20.8 },
      { minX: -1.2, maxX: 1.2,  minZ: -4.2, maxZ: -1.8 },
      { minX: -0.8, maxX: 0.8,  minZ: -20.0, maxZ: -18.0 },
      { minX: -6.2, maxX: -5.7, minZ: 21.6, maxZ: 27.6 },
      { minX: 5.7,  maxX: 6.2,  minZ: 21.6, maxZ: 27.6 },
      { minX: -6.2, maxX: 6.2,  minZ: 27.3, maxZ: 27.6 },
      { minX: -6.0, maxX: -1.0, minZ: 21.4, maxZ: 21.8 },
      { minX: 1.0,  maxX: 6.0,  minZ: 21.4, maxZ: 21.8 },
      { minX: -5.7, maxX: -4.0, minZ: 22.5, maxZ: 26.5 },
      { minX: -2.0, maxX: 2.0,  minZ: 25.2, maxZ: 27.0 },
    ]

    for (const obs of OBSTACLES) {
      if (nextX > obs.minX && nextX < obs.maxX && nextZ > obs.minZ && nextZ < obs.maxZ) {
        if (p.x <= obs.minX || p.x >= obs.maxX) nextX = p.x
        if (p.z <= obs.minZ || p.z >= obs.maxZ) nextZ = p.z
      }
    }

    p.x = nextX
    p.z = nextZ

    if (p.x >= -3.8 && p.x <= -1.5 && p.z >= 9.0 && p.z <= 15.0) {
      const slopeProgress = (p.z - 9.0) / (15.0 - 9.0)
      p.y = 0.15 + clamp(slopeProgress, 0, 1) * 2.5
    }
    else if (p.z > 13.0) {
      p.y = 2.65
    }
    else if (p.z < -13.0) {
      p.y = 2.65
    }
    else if (p.x > -1.75 && p.x < 1.75 && p.z > 3.75 && p.z < 6.25) {
      p.y = 0.28
    }
    else {
      p.y = 0.15
    }
  }

  // ── Basement movement in WORLD coordinates ───────────────────────────────
  // The old aquarium tank blockers are intentionally removed while the work
  // section is on hold, leaving one open grass-floor room.
  updateBasement(group, vel, dt) {
    const p = group.position

    let nextX = clamp(p.x + vel.x * dt, BOUNDS_BASEMENT.minX, BOUNDS_BASEMENT.maxX)
    let nextZ = clamp(p.z + vel.z * dt, BOUNDS_BASEMENT.minZ, BOUNDS_BASEMENT.maxZ)

    p.x = nextX
    p.z = nextZ
    p.y = -13.85  // basement floor world Y
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
  skillsActive = false,
  skillsDirection = 'north',
  workActive = false,
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

  useEffect(() => {
    if (!groupRef.current) return
    if (workActive) {
      // Teleport Luffy to basement start — world position directly under hatch
      groupRef.current.position.set(0, -13.85, 5)
      velCtrl.current.vel.set(0, 0, 0)
    } else if (!workActive && groupRef.current.position.y < -5) {
      // Teleport back to deck hatch position on exit
      groupRef.current.position.set(0, 0.15, 5)
      velCtrl.current.vel.set(0, 0, 0)
    }
  }, [workActive])

  useEffect(() => {
    if (!groupRef.current) return
    if (skillsActive) {
      const directionRotation = {
        north: Math.PI,
        east: Math.PI / 2,
        south: 0,
        west: -Math.PI / 2,
      }
      const directionPosition = {
        north: [0, 32.1, -1.85],
        east: [-1.85, 32.1, -3],
        south: [0, 32.1, -4.15],
        west: [1.85, 32.1, -3],
      }
      groupRef.current.position.set(...(directionPosition[skillsDirection] ?? directionPosition.north))
      groupRef.current.rotation.y = directionRotation[skillsDirection] ?? Math.PI
      velCtrl.current.vel.set(0, 0, 0)
    } else if (!skillsActive && groupRef.current.position.y > 20) {
      groupRef.current.position.set(0.8, 0.15, -3)
      groupRef.current.rotation.y = Math.PI
      velCtrl.current.vel.set(0, 0, 0)
    }
  }, [skillsActive, skillsDirection])

  useFrame((_, dt) => {
    if (!loadedRef.current || !groupRef.current || !mixerRef.current) return

    const safeDt = Math.min(dt, 0.05)
    mixerRef.current.update(safeDt)

    if (aboutActive || skillsActive) {
      animSM.current.updateLocomotion({ moving: false, running: false })
      if (stateRef.current !== animSM.current.current) {
        stateRef.current = animSM.current.current
        if (onStateChange) onStateChange(stateRef.current)
      }
      return
    }

    const currentKeys = keys?.current || keys || {}
    const shift = currentKeys.Shift || currentKeys.ShiftLeft || currentKeys.ShiftRight || false

    const { moving, running, speed } = velCtrl.current.update(
      currentKeys,
      shift,
      safeDt,
    )

    if (workActive) {
      posCtrl.current.updateBasement(groupRef.current, velCtrl.current.vel, safeDt)
    } else {
      posCtrl.current.update(groupRef.current, velCtrl.current.vel, safeDt)
    }

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

    // Let the camera follow Luffy in the basement too; fixed POV made the
    // room unreadable from several entry angles.
    camCtrl.current.update(
      camera,
      groupRef.current.position,
      groupRef.current.rotation.y,
      running,
      safeDt,
      workActive,
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
  skillsActive = false,
  skillsDirection = 'north',
  workActive = false,
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
        skillsActive={skillsActive}
        skillsDirection={skillsDirection}
        workActive={workActive}
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
