import { useCallback, useEffect, useRef, useState } from 'react'
import './OceanMusic.css'

const MUSIC_SRC = '/audio/morning-surf-boracay.mp3'
const DEFAULT_VOLUME = 0.38

export default function OceanMusic({ visible = true }) {
  const audioRef = useRef(null)
  const userPausedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = DEFAULT_VOLUME
    audioRef.current = audio

    const handleCanPlay = () => setReady(true)
    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)

    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.pause()
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audioRef.current = null
    }
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || userPausedRef.current) return

    try {
      audio.volume = DEFAULT_VOLUME
      await audio.play()
    } catch {
      setPlaying(false)
    }
  }, [])

  useEffect(() => {
    if (!visible) return undefined

    const beginOnGesture = () => {
      play()
      window.removeEventListener('pointerdown', beginOnGesture)
      window.removeEventListener('keydown', beginOnGesture)
    }

    window.addEventListener('pointerdown', beginOnGesture, { once: true })
    window.addEventListener('keydown', beginOnGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', beginOnGesture)
      window.removeEventListener('keydown', beginOnGesture)
    }
  }, [play, visible])

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      userPausedRef.current = false
      await play()
    } else {
      userPausedRef.current = true
      audio.pause()
    }
  }, [play])

  if (!visible) return null

  return (
    <button
      type="button"
      className={`ocean-music${playing ? ' ocean-music--playing' : ''}`}
      onClick={toggleMusic}
      aria-label={playing ? 'Pause ocean music' : 'Play ocean music'}
      aria-pressed={playing}
    >
      <span className="ocean-music__sun" aria-hidden="true">
        <i />
      </span>
      <span className="ocean-music__copy">
        <strong>{playing ? 'Morning Surf' : 'Silent Seas'}</strong>
        <small>{ready ? 'Grand Line radio · click to toggle' : 'Loading deck radio'}</small>
      </span>
      <span className="ocean-music__bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}
