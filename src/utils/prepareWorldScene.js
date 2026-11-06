import { WebGLRenderTarget } from 'three'

function waitForGPU(context, signal) {
  signal?.throwIfAborted()
  const fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0)
  if (!fence) return Promise.reject(new Error('Unable to prepare the ship on the GPU'))
  context.flush()

  return new Promise((resolve, reject) => {
    let frame
    const finish = (error) => {
      cancelAnimationFrame(frame)
      signal?.removeEventListener('abort', abort)
      context.deleteSync(fence)
      if (error) reject(error)
      else resolve()
    }
    const abort = () => finish(signal.reason)
    const check = () => {
      const status = context.clientWaitSync(fence, 0, 0)
      if (status === context.WAIT_FAILED) finish(new Error('Ship GPU preparation failed'))
      else if (status === context.TIMEOUT_EXPIRED) frame = requestAnimationFrame(check)
      else finish()
    }
    signal?.addEventListener('abort', abort, { once: true })
    check()
  })
}

// Prepare the whole ship, including equipment outside the starting camera view.
export async function prepareWorldScene(renderer, scene, camera, signal) {
  signal?.throwIfAborted()
  const textures = new Set()
  const addTexture = (value) => {
    if (value?.isTexture && !value.isRenderTargetTexture) textures.add(value)
    else if (Array.isArray(value)) value.forEach(addTexture)
  }
  addTexture(scene.background)
  addTexture(scene.environment)
  scene.traverse((object) => {
    addTexture(object.textRenderInfo?.sdfTexture)
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!material) continue
      Object.values(material).forEach(addTexture)
      Object.values(material.uniforms ?? {}).forEach((uniform) => addTexture(uniform.value))
    }
  })
  textures.forEach((texture) => renderer.initTexture(texture))
  await renderer.compileAsync(scene, camera)
  signal?.throwIfAborted()

  // A tiny offscreen draw uploads geometry for equipment in every direction.
  // Preserve the camera, visibility and render target used by the actual scene.
  const target = new WebGLRenderTarget(1, 1)
  const previousTarget = renderer.getRenderTarget()
  const previousFace = renderer.getActiveCubeFace()
  const previousLevel = renderer.getActiveMipmapLevel()
  const culling = new Map()
  try {
    scene.traverse((object) => {
      if (!object.isMesh && !object.isPoints && !object.isLine && !object.isSprite) return
      culling.set(object, object.frustumCulled)
      object.frustumCulled = false
    })
    renderer.setRenderTarget(target)
    renderer.render(scene, camera)
  } finally {
    culling.forEach((value, object) => { object.frustumCulled = value })
    renderer.setRenderTarget(previousTarget, previousFace, previousLevel)
    target.dispose()
  }

  // Downloaded and submitted is not the same as finished on a slower device.
  await waitForGPU(renderer.getContext(), signal)
  signal?.throwIfAborted()
}
