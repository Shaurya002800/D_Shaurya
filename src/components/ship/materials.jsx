import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// PBR texture loader for ambientcg folders under /public/textures.
function usePBR(folder, repeat = [1, 1]) {
  const maps = useTexture({
    map:          `/textures/${folder}/${folder}_Color.jpg`,
    normalMap:    `/textures/${folder}/${folder}_NormalGL.jpg`,
    roughnessMap: `/textures/${folder}/${folder}_Roughness.jpg`,
    aoMap:        `/textures/${folder}/${folder}_AmbientOcclusion.jpg`,
  })
  useMemo(() => {
    Object.values(maps).forEach((t) => {
      if (t?.isTexture) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(...repeat)
        t.needsUpdate = true
      }
    })
  }, [repeat[0], repeat[1]])
  return maps
}

// Stable Vector2 refs so material instances don't change every frame.
export const NORMAL_SCALE_DECK = new THREE.Vector2(1.2, 1.2)
export const NORMAL_SCALE_WOOD = new THREE.Vector2(1.5, 1.5)

export function DeckMaterial({ repeat = [3, 8] }) {
  const maps = usePBR('WoodFloor040_1K-JPG', repeat)
  return (
    <meshStandardMaterial
      {...maps}
      roughness={0.82}
      metalness={0.0}
      aoMapIntensity={1.2}
      normalScale={NORMAL_SCALE_DECK}
    />
  )
}

export function WoodMaterial({ repeat = [2, 2], roughness = 0.88 }) {
  const maps = usePBR('WoodFloor041_1K-JPG', repeat)
  return (
    <meshStandardMaterial
      {...maps}
      roughness={roughness}
      metalness={0.0}
      aoMapIntensity={1.3}
      normalScale={NORMAL_SCALE_WOOD}
    />
  )
}

function useGrassTexture() {
  return useMemo(() => {
    const rand = (seed) => {
      const value = Math.sin(seed * 91.17) * 10000
      return value - Math.floor(value)
    }
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#2f8f3b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < 1300; i += 1) {
      const x = rand(i + 1) * canvas.width
      const y = rand(i + 2) * canvas.height
      const length = 3 + rand(i + 3) * 9
      ctx.strokeStyle = rand(i + 4) > 0.55 ? 'rgba(174,231,89,0.42)' : 'rgba(19,92,37,0.42)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (rand(i + 5) - 0.5) * 2, y - length)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(7, 16)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

export function GrassMaterial() {
  const texture = useGrassTexture()
  return (
    <meshStandardMaterial
      map={texture}
      color="#57b84b"
      roughness={0.96}
      metalness={0.0}
    />
  )
}

export function SailMaterial({ repeat = [2, 1.5], color = '#fdfdfd' }) {
  const maps = usePBR('Carpet016_1K-JPG', repeat)
  return (
    <meshStandardMaterial
      {...maps}
      color={color}
      roughness={0.95}
      metalness={0.0}
      side={THREE.DoubleSide}
      aoMapIntensity={0.8}
    />
  )
}

export function RopeMaterial() {
  return <meshStandardMaterial color="#c8a050" roughness={1.0} metalness={0.0} />
}
