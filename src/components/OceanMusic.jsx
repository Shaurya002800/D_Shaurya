import { useCallback, useEffect, useRef, useState } from 'react'

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
      <style>{`
        .ocean-music {
          position: fixed;
          top: 132px;
          right: 18px;
          z-index: 9998;
          display: grid;
          grid-template-columns: 26px minmax(0, 1fr) 18px;
          align-items: center;
          column-gap: 8px;
          width: 300px;
          max-width: min(300px, calc(100vw - 36px));
          min-height: 60px;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 14px;
          background:
            radial-gradient(circle at 12% 50%, rgba(255, 214, 96, 0.14), transparent 34%),
            rgba(4, 12, 18, 0.52);
          color: #eef8ff;
          text-align: left;
          cursor: pointer;
          opacity: 0.82;
          backdrop-filter: blur(8px);
          box-shadow: 0 12px 30px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.04);
          transition: transform .18s ease, border-color .18s ease, background .18s ease, opacity .18s ease;
        }

        .ocean-music:hover {
          border-color: rgba(255, 225, 118, 0.42);
          background:
            radial-gradient(circle at 12% 50%, rgba(255, 214, 96, 0.2), transparent 38%),
            rgba(4, 12, 18, 0.64);
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .ocean-music__sun {
          position: relative;
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          color: #f7d75f;
        }

        .ocean-music__sun::before,
        .ocean-music__sun::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background:
            linear-gradient(currentColor, currentColor) center / 2px 100% no-repeat,
            linear-gradient(90deg, currentColor, currentColor) center / 100% 2px no-repeat;
          opacity: .82;
        }

        .ocean-music__sun::after {
          transform: rotate(45deg);
          opacity: .62;
        }

        .ocean-music__sun i {
          position: relative;
          z-index: 1;
          display: block;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 14px rgba(247, 215, 95, .42);
        }

        .ocean-music__copy {
          display: grid;
          gap: 5px;
          min-width: 0;
        }

        .ocean-music__copy strong {
          color: #eef8ff;
          font: 400 13px/1.05 "Pirata One", Georgia, serif;
          letter-spacing: .11em;
          white-space: nowrap;
        }

        .ocean-music__copy small {
          color: rgba(255,255,255,.5);
          font: 8px/1.2 monospace;
          letter-spacing: .05em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ocean-music__bars {
          display: inline-flex;
          align-items: end;
          gap: 3px;
          width: 22px;
          height: 16px;
          justify-content: flex-end;
          color: #7cffad;
        }

        .ocean-music__bars i {
          display: block;
          width: 4px;
          height: 7px;
          border-radius: 999px;
          background: currentColor;
          opacity: .55;
        }

        .ocean-music:not(.ocean-music--playing) .ocean-music__bars {
          color: rgba(255,255,255,.45);
        }

        .ocean-music--playing .ocean-music__bars i {
          animation: ocean-music-bars .78s ease-in-out infinite;
          opacity: .95;
        }

        .ocean-music--playing .ocean-music__bars i:nth-child(2) {
          animation-delay: .12s;
        }

        .ocean-music--playing .ocean-music__bars i:nth-child(3) {
          animation-delay: .24s;
        }

        @keyframes ocean-music-bars {
          0%, 100% { height: 6px; }
          50% { height: 14px; }
        }

        @media (max-width: 760px) {
          .ocean-music {
            top: 126px;
            right: max(10px, env(safe-area-inset-right));
            width: min(260px, calc(100vw - 20px));
            min-height: 54px;
            grid-template-columns: 24px minmax(0, 1fr) 18px;
            padding: 7px 10px;
          }

          .ocean-music__copy strong {
            font-size: 12px;
          }

          .ocean-music__copy small {
            font-size: 7px;
          }
        }
      `}</style>
    </button>
  )
}
