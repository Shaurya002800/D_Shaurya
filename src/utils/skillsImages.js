export const SKILL_CHARACTER_IMAGES = {
  zoro: '/characters/zoro.webp',
  sanji: '/characters/sanji.webp',
  boa: '/characters/boa.webp',
  shanks: '/characters/shanks.webp',
}

// Keep the decoded images available between visits and category changes.
const images = new Map()

export function preloadImages(sources) {
  if (typeof Image === 'undefined') return Promise.resolve([])
  return Promise.all([...new Set(sources)].map((source) => {
    if (images.has(source)) return images.get(source)
    const image = new Image()
    image.decoding = 'async'
    const ready = new Promise((resolve) => {
      image.onload = async () => {
        try { await image.decode() } catch { /* A loaded image can still render without decode(). */ }
        resolve(image)
      }
      image.onerror = () => {
        images.delete(source)
        resolve(null)
      }
    })
    images.set(source, ready)
    image.src = source
    return ready
  }))
}

export function preloadSkillCharacters() {
  return preloadImages(Object.values(SKILL_CHARACTER_IMAGES))
}
