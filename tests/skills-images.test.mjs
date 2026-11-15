import test from 'node:test'
import assert from 'node:assert/strict'
import { statSync } from 'node:fs'
import { preloadImages, SKILL_CHARACTER_IMAGES } from '../src/utils/skillsImages.js'

test('preloading shares downloads and waits for image decoding before reporting readiness', async () => {
  const OriginalImage = globalThis.Image
  const created = []
  let decode
  const decoding = new Promise(resolve => { decode = resolve })
  globalThis.Image = class {
    constructor() { created.push(this) }
    decode() { return decoding }
  }
  try {
    let ready = false
    const first = preloadImages(['/test-first.webp', '/test-second.webp', '/test-first.webp']).then(images => { ready = true; return images })
    const second = preloadImages(['/test-first.webp'])
    assert.equal(created.length, 2)
    const loading = created.map(image => image.onload())
    await Promise.resolve()
    assert.equal(ready, false)
    decode()
    await Promise.all(loading)
    assert.deepEqual(await first, created)
    assert.equal((await second)[0], created[0])
    await preloadImages(['/test-second.webp'])
    assert.equal(created.length, 2)
  } finally { globalThis.Image = OriginalImage }
})

test('a failed image does not strand the opening loader and can be retried', async () => {
  const OriginalImage = globalThis.Image
  const created = []
  globalThis.Image = class {
    constructor() { created.push(this) }
    decode() { return Promise.resolve() }
  }
  try {
    const failed = preloadImages(['/test-retry.webp'])
    created[0].onerror()
    assert.deepEqual(await failed, [null])
    const retried = preloadImages(['/test-retry.webp'])
    assert.equal(created.length, 2)
    await created[1].onload()
    assert.deepEqual(await retried, [created[1]])
  } finally { globalThis.Image = OriginalImage }
})

test('all four skill characters use local optimized assets with a small combined download', () => {
  assert.deepEqual(Object.keys(SKILL_CHARACTER_IMAGES), ['zoro', 'sanji', 'boa', 'shanks'])
  let bytes = 0
  for (const source of Object.values(SKILL_CHARACTER_IMAGES)) {
    assert(source.endsWith('.webp'))
    bytes += statSync(new URL(`../public${source}`, import.meta.url)).size
  }
  assert(bytes < 1_500_000)
})
