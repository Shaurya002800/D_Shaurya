import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareWorldScene } from '../src/utils/prepareWorldScene.js'

function fixture({ compiling = Promise.resolve(), renderError } = {}) {
  const sharedTexture = { isTexture: true }
  const posterTexture = { isTexture: true }
  const glyphTexture = { isTexture: true }
  const equipment = { isMesh: true, visible: true, frustumCulled: true, material: { map: sharedTexture } }
  const poster = { isMesh: true, visible: true, frustumCulled: false, material: { map: posterTexture } }
  const hiddenObject = { isMesh: true, visible: false, frustumCulled: true, material: { map: sharedTexture } }
  const label = { isMesh: true, frustumCulled: true, textRenderInfo: { sdfTexture: glyphTexture }, material: { uniforms: { atlas: { value: glyphTexture } } } }
  const scene = { traverse: fn => [equipment, poster, hiddenObject, label].forEach(fn) }
  const camera = {}
  const calls = []
  const originalTarget = {}
  let target = originalTarget
  let status = 1
  const context = {
    SYNC_GPU_COMMANDS_COMPLETE: 0, ALREADY_SIGNALED: 1, TIMEOUT_EXPIRED: 2, WAIT_FAILED: 3,
    fenceSync: () => { calls.push('fence'); return {} },
    flush: () => calls.push('flush'),
    clientWaitSync: () => status,
    deleteSync: () => calls.push('deleteFence'),
  }
  const renderer = {
    initTexture: texture => calls.push(texture),
    compileAsync: (preparedScene, preparedCamera) => {
      assert.equal(preparedScene, scene)
      assert.equal(preparedCamera, camera)
      calls.push('compile')
      return compiling
    },
    getRenderTarget: () => target,
    getActiveCubeFace: () => 2,
    getActiveMipmapLevel: () => 1,
    setRenderTarget: (next, face, level) => {
      target = next
      if (next === originalTarget) { assert.equal(face, 2); assert.equal(level, 1) }
    },
    render: () => {
      calls.push('render')
      assert.equal(target.width, 1)
      assert.equal(target.height, 1)
      assert.equal(equipment.frustumCulled, false)
      assert.equal(hiddenObject.visible, false)
      if (renderError) throw renderError
    },
    getContext: () => context,
  }
  return { renderer, scene, camera, calls, equipment, poster, hiddenObject, textures: [sharedTexture, posterTexture, glyphTexture], getTarget: () => target, originalTarget, setStatus: value => { status = value } }
}

test('whole-ship preparation uploads shared, poster and text textures once, then restores scene state', async () => {
  const originalCancel = globalThis.cancelAnimationFrame
  globalThis.cancelAnimationFrame = () => {}
  try {
    const world = fixture()
    await prepareWorldScene(world.renderer, world.scene, world.camera)
    assert.deepEqual(world.calls, [...world.textures, 'compile', 'render', 'fence', 'flush', 'deleteFence'])
    assert.equal(world.equipment.frustumCulled, true)
    assert.equal(world.poster.frustumCulled, false)
    assert.equal(world.hiddenObject.visible, false)
    assert.equal(world.getTarget(), world.originalTarget)
  } finally { globalThis.cancelAnimationFrame = originalCancel }
})

test('readiness waits for shader compilation and the actual GPU completion signal', async () => {
  const originalRequest = globalThis.requestAnimationFrame
  const originalCancel = globalThis.cancelAnimationFrame
  let nextFrame
  globalThis.requestAnimationFrame = callback => { nextFrame = callback; return 1 }
  globalThis.cancelAnimationFrame = () => {}
  try {
    let finishCompile
    const world = fixture({ compiling: new Promise(resolve => { finishCompile = resolve }) })
    world.setStatus(2)
    let ready = false
    const preparing = prepareWorldScene(world.renderer, world.scene, world.camera).then(() => { ready = true })
    await Promise.resolve()
    assert.equal(world.calls.includes('render'), false)
    assert.equal(ready, false)
    finishCompile()
    await Promise.resolve()
    assert.equal(world.calls.includes('render'), true)
    assert.equal(ready, false)
    nextFrame()
    assert.equal(ready, false)
    world.setStatus(1)
    nextFrame()
    await preparing
    assert.equal(ready, true)
    assert.equal(world.calls.filter(call => call === 'deleteFence').length, 1)
  } finally {
    globalThis.requestAnimationFrame = originalRequest
    globalThis.cancelAnimationFrame = originalCancel
  }
})

test('failed preparation restores culling and the original render target', async () => {
  const error = new Error('GPU draw failed')
  const world = fixture({ renderError: error })
  await assert.rejects(prepareWorldScene(world.renderer, world.scene, world.camera), error)
  assert.equal(world.equipment.frustumCulled, true)
  assert.equal(world.getTarget(), world.originalTarget)
  assert.equal(world.calls.includes('fence'), false)
})

test('unmounting while shaders compile cancels preparation without drawing a disposed scene', async () => {
  let finishCompile
  const world = fixture({ compiling: new Promise(resolve => { finishCompile = resolve }) })
  const controller = new AbortController()
  const preparing = prepareWorldScene(world.renderer, world.scene, world.camera, controller.signal)
  controller.abort()
  finishCompile()
  await assert.rejects(preparing, { name: 'AbortError' })
  assert.equal(world.calls.includes('render'), false)
})
