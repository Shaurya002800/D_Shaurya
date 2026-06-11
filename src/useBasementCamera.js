/**
 * useBasementCamera.js
 * ─────────────────────────────────────────────────────────────────────
 * Drop-in hook that overrides the third-person camera whenever Luffy
 * is inside the AquariumBasement.
 *
 * HOW IT WORKS
 * ────────────
 * The basement lives at world-Y ≈ -14 (ship's RigidBody baseline + the
 * AquariumBasement position of [0, -14, 2]).  We detect "inside basement"
 * by checking whether the character's world-Y is below a threshold
 * (BASEMENT_Y_THRESHOLD).
 *
 * Inside the basement the camera is repositioned to a slightly-elevated
 * "corridor" view — same X as Luffy, fixed Y above the floor, and pulled
 * back on Z so the whole aisle between the two tank walls is visible.
 * This eliminates wall/tank clipping entirely while keeping Luffy and
 * both tank rows in view.
 *
 * USAGE (in your Experience / Scene component)
 * ─────────────────────────────────────────────
 *   import { useBasementCamera } from './useBasementCamera'
 *
 *   // Inside your scene component:
 *   useBasementCamera(luffyRef)   // luffyRef = ref to Luffy's RigidBody
 *
 * The hook plugs into useFrame and takes over camera positioning when
 * underground.  It does NOT conflict with your existing camera code
 * because it writes camera.position / camera.quaternion directly and
 * runs AFTER the normal camera logic (order: 1, so it fires last).
 *
 * If you already call useFrame for camera following, set the priority
 * of the normal camera to 0 (default) and this hook stays at 1 —
 * last-write-wins in R3F.
 *
 * ─────────────────────────────────────────────────────────────────────
 */

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Tuneable constants ───────────────────────────────────────────────

/**
 * Character world-Y below this value → we consider the player
 * inside the basement.  The basement floor sits at worldY ≈ -14
 * (ship offset) + 0 (AquariumBasement local floor).
 * The deck is at worldY ≈ 0.  Use -5 as a safe midpoint.
 */
const BASEMENT_Y_THRESHOLD = -5

/**
 * Height of the camera above the basement floor in world-space.
 * The basement is 12 units tall.  Eye at ~4 units = comfortable
 * mid-room view that shows the floor decals and tank labels.
 */
const CAM_HEIGHT_ABOVE_FLOOR = 4          // relative to character Y

/**
 * How far behind (along +Z) the camera sits in the aisle.
 * The room is 14 units deep (Z: -7 → +7).  Pulling back ~10 units
 * frames both tank rows in the frustum at 60° FOV.
 */
const CAM_Z_PULLBACK = 10

/**
 * Slight downward tilt so the camera looks at chest-height on Luffy
 * rather than at his head.  In radians.
 */
const CAM_PITCH = -0.18   // negative = looking slightly down

/**
 * Lerp factor per frame for smooth transition.
 * 0.07 = buttery smooth, 0.15 = snappier.
 */
const LERP_FACTOR = 0.09

/**
 * How quickly the "inBasement" weight blends in/out (0-1).
 * Multiplied each frame; controls how fast normal cam resumes on exit.
 */
const BLEND_SPEED = 0.06

// ─── Internal helpers ─────────────────────────────────────────────────

const _targetPos   = new THREE.Vector3()
const _lookAt      = new THREE.Vector3()
const _blendedPos  = new THREE.Vector3()
const _quat        = new THREE.Quaternion()
const _mat         = new THREE.Matrix4()

// ─────────────────────────────────────────────────────────────────────
export function useBasementCamera(characterRef) {
  const { camera } = useThree()

  /**
   * blend: 0 = fully normal camera, 1 = fully basement camera.
   * Stored in a ref so it persists across frames without re-renders.
   */
  const blend = useRef(0)

  /**
   * Smoothed camera position — prevents jitter when transitioning.
   */
  const smoothPos = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (!characterRef?.current) return

    // ── 1. Get Luffy's current world position ──────────────────────
    let charPos
    try {
      // Rapier RigidBody exposes translation()
      const t = characterRef.current.translation()
      charPos = new THREE.Vector3(t.x, t.y, t.z)
    } catch {
      // Fallback: plain Object3D / group
      charPos = new THREE.Vector3()
      characterRef.current.getWorldPosition(charPos)
    }

    // ── 2. Determine target blend weight ──────────────────────────
    const isUnderground = charPos.y < BASEMENT_Y_THRESHOLD
    const targetBlend   = isUnderground ? 1 : 0

    // Lerp blend weight
    blend.current += (targetBlend - blend.current) * Math.min(1, BLEND_SPEED * 60 * delta)

    // Skip heavy work if fully on surface
    if (blend.current < 0.001) return

    // ── 3. Compute desired basement-camera position ────────────────
    //
    // The camera sits:
    //   X: same X as Luffy (tracks side-to-side as he walks the aisle)
    //   Y: fixed height above Luffy
    //   Z: pulled back along +Z so we see him from behind, facing -Z
    //      (tanks are on ±X walls, the aisle runs along Z)
    //
    _targetPos.set(
      charPos.x,                             // track X
      charPos.y + CAM_HEIGHT_ABOVE_FLOOR,    // elevated
      charPos.z + CAM_Z_PULLBACK,            // pulled back
    )

    // ── 4. Smooth the basement-cam position ───────────────────────
    if (blend.current > 0.99 && !smoothPos.current.lengthSq()) {
      // First frame we enter — snap instead of lerping from (0,0,0)
      smoothPos.current.copy(_targetPos)
    }
    smoothPos.current.lerp(_targetPos, Math.min(1, LERP_FACTOR * 60 * delta))

    // ── 5. Build the look-at target (Luffy's chest) ───────────────
    _lookAt.set(
      charPos.x,
      charPos.y + 1.0,   // chest height
      charPos.z,
    )

    // ── 6. Build the rotation from the smoothed camera position ───
    _mat.lookAt(smoothPos.current, _lookAt, camera.up)
    _quat.setFromRotationMatrix(_mat)

    // ── 7. Blend between normal cam and basement cam ───────────────
    _blendedPos.lerpVectors(camera.position, smoothPos.current, blend.current)
    camera.position.copy(_blendedPos)
    camera.quaternion.slerp(_quat, blend.current)
  }, 1)  // priority 1 = runs AFTER default camera (priority 0)
}


// ─────────────────────────────────────────────────────────────────────
// OPTIONAL: exported constant so Ship.jsx / Experience can read it
// ─────────────────────────────────────────────────────────────────────
export { BASEMENT_Y_THRESHOLD }