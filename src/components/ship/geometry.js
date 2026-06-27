import * as THREE from 'three'

export const BASEMENT_MIN_Z = -23
export const BASEMENT_MAX_Z = 17
export const BASEMENT_HALF_WIDTH = 8.5
export const BASEMENT_HEIGHT = 12

// Build the curved ship-footprint that defines the basement shell.
// Mirrors the upper-deck galleon outline so the room reads as inside-the-ship.
export function createBasementFootprintShape(inset = 0) {
  const halfWidth = BASEMENT_HALF_WIDTH - inset
  const minZ = BASEMENT_MIN_Z + inset
  const maxZ = BASEMENT_MAX_Z - inset

  const shape = new THREE.Shape()
  const moveTo = (x, z) => shape.moveTo(x, -z)
  const lineTo = (x, z) => shape.lineTo(x, -z)
  const curveTo = (cp1x, cp1z, cp2x, cp2z, x, z) => {
    shape.bezierCurveTo(cp1x, -cp1z, cp2x, -cp2z, x, -z)
  }

  moveTo(0, minZ)
  curveTo(halfWidth * 0.58, minZ + 1.2, halfWidth, minZ + 5.8, halfWidth, minZ + 10.8)
  lineTo(halfWidth, maxZ - 5.2)
  curveTo(halfWidth, maxZ - 1.4, halfWidth * 0.64, maxZ, 0, maxZ)
  curveTo(-halfWidth * 0.64, maxZ, -halfWidth, maxZ - 1.4, -halfWidth, maxZ - 5.2)
  lineTo(-halfWidth, minZ + 10.8)
  curveTo(-halfWidth, minZ + 5.8, -halfWidth * 0.58, minZ + 1.2, 0, minZ)
  shape.closePath()

  return shape
}

// Outer footprint minus inner footprint — used for extruding the wall shell.
export function createBasementWallShape() {
  const outer = createBasementFootprintShape(0)
  const innerShape = createBasementFootprintShape(0.52)
  const points = innerShape.getPoints(96).reverse()
  const hole = new THREE.Path()
  points.forEach((point, index) => {
    if (index === 0) hole.moveTo(point.x, point.y)
    else hole.lineTo(point.x, point.y)
  })
  hole.closePath()
  outer.holes.push(hole)
  return outer
}

// Ring sections along Z that define the Thousand Sunny hull profile.
const SUNNY_HULL_SECTIONS = [
  { z: -31, width: 1.1, top: -0.5, depth: 4.0 },
  { z: -28, width: 5.2, top: -0.25, depth: 5.8 },
  { z: -24, width: 8.2, top: 0.0, depth: 7.15 },
  { z: -16, width: 9.35, top: 0.1, depth: 8.0 },
  { z: -4, width: 9.65, top: 0.12, depth: 8.45 },
  { z: 9, width: 9.55, top: 0.12, depth: 8.35 },
  { z: 19, width: 9.2, top: 0.25, depth: 7.85 },
  { z: 26, width: 8.0, top: 0.5, depth: 6.8 },
  { z: 30, width: 4.6, top: 0.0, depth: 5.4 },
]

// Procedurally build the Sunny's hull as a half-cylinder ring sweep.
export function createSunnyHullGeometry() {
  const ringSegments = 18
  const positions = []
  const uvs = []
  const indices = []

  SUNNY_HULL_SECTIONS.forEach((section, sectionIndex) => {
    for (let index = 0; index <= ringSegments; index += 1) {
      const angle = (index / ringSegments) * Math.PI
      const x = Math.cos(angle) * section.width
      const y = section.top - Math.sin(angle) * section.depth
      positions.push(x, y, section.z)
      uvs.push(index / ringSegments, sectionIndex / (SUNNY_HULL_SECTIONS.length - 1))
    }
  })

  const ringSize = ringSegments + 1
  for (let section = 0; section < SUNNY_HULL_SECTIONS.length - 1; section += 1) {
    for (let index = 0; index < ringSegments; index += 1) {
      const current = section * ringSize + index
      const next = current + ringSize
      indices.push(current, next, current + 1)
      indices.push(current + 1, next, next + 1)
    }
  }

  const addCap = (sectionIndex, reverse = false) => {
    const section = SUNNY_HULL_SECTIONS[sectionIndex]
    const centerIndex = positions.length / 3
    positions.push(0, section.top - section.depth * 0.48, section.z)
    uvs.push(0.5, 0.5)
    const offset = sectionIndex * ringSize
    for (let index = 0; index < ringSegments; index += 1) {
      if (reverse) indices.push(centerIndex, offset + index + 1, offset + index)
      else indices.push(centerIndex, offset + index, offset + index + 1)
    }
  }

  addCap(0, true)
  addCap(SUNNY_HULL_SECTIONS.length - 1)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function createSunnyDeckShape(inset = 0) {
  const shape = new THREE.Shape()
  const bow = -27 + inset
  const stern = 27 - inset
  const halfWidth = 8.55 - inset

  shape.moveTo(0, -bow)
  shape.bezierCurveTo(halfWidth * 0.55, -bow + 1.2, halfWidth, -bow + 5.0, halfWidth, -bow + 9.0)
  shape.lineTo(halfWidth, -stern + 5.5)
  shape.bezierCurveTo(halfWidth, -stern + 1.7, halfWidth * 0.62, -stern, 0, -stern)
  shape.bezierCurveTo(-halfWidth * 0.62, -stern, -halfWidth, -stern + 1.7, -halfWidth, -stern + 5.5)
  shape.lineTo(-halfWidth, -bow + 9.0)
  shape.bezierCurveTo(-halfWidth, -bow + 5.0, -halfWidth * 0.55, -bow + 1.2, 0, -bow)
  shape.closePath()
  return shape
}

export function createRaisedDeckShape(section, inset = 0) {
  const shape = new THREE.Shape()
  const isBow = section === 'bow'
  const minZ = isBow ? -26 + inset : 13 + inset
  const maxZ = isBow ? -13 - inset : 27 - inset
  const wide = 8.45 - inset
  const narrow = (isBow ? 3.2 : 5.4) - inset * 0.5
  const openingHalfWidth = 4.1 - inset * 0.25
  const openingDepth = 0.78

  if (isBow) {
    shape.moveTo(0, -minZ)
    shape.bezierCurveTo(narrow * 0.72, -minZ + 0.8, wide, -minZ + 5.6, wide, -maxZ)
    shape.lineTo(openingHalfWidth, -maxZ)
    shape.lineTo(openingHalfWidth, -(maxZ - openingDepth))
    shape.lineTo(-openingHalfWidth, -(maxZ - openingDepth))
    shape.lineTo(-openingHalfWidth, -maxZ)
    shape.lineTo(-wide, -maxZ)
    shape.bezierCurveTo(-wide, -minZ + 5.6, -narrow * 0.72, -minZ + 0.8, 0, -minZ)
  } else {
    shape.moveTo(wide, -minZ)
    shape.lineTo(wide, -maxZ + 5.2)
    shape.bezierCurveTo(wide, -maxZ + 1.4, narrow * 0.75, -maxZ, 0, -maxZ)
    shape.bezierCurveTo(-narrow * 0.75, -maxZ, -wide, -maxZ + 1.4, -wide, -maxZ + 5.2)
    shape.lineTo(-wide, -minZ)
    shape.lineTo(-openingHalfWidth, -minZ)
    shape.lineTo(-openingHalfWidth, -(minZ + openingDepth))
    shape.lineTo(openingHalfWidth, -(minZ + openingDepth))
    shape.lineTo(openingHalfWidth, -minZ)
  }
  shape.closePath()
  return shape
}
