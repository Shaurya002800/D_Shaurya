import { useEffect } from 'react'

const VIRTUAL_KEY_EVENT = 'portfolio-virtual-key'
const INTERACT_EVENT = 'portfolio-interact'

function setVirtualKey(key, pressed) {
  window.dispatchEvent(new CustomEvent(VIRTUAL_KEY_EVENT, {
    detail: { key, pressed },
  }))
}

function releaseAllVirtualKeys() {
  ;['w', 'a', 's', 'd'].forEach((key) => setVirtualKey(key, false))
}

function HoldButton({ className = '', label, keyName }) {
  const press = (event) => {
    event.preventDefault()
    setVirtualKey(keyName, true)
  }

  const release = (event) => {
    event.preventDefault()
    setVirtualKey(keyName, false)
  }

  return (
    <button
      className={`mobile-helm__key ${className}`}
      type="button"
      aria-label={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onContextMenu={(event) => event.preventDefault()}
    />
  )
}

export default function MobileControls({ visible = true }) {
  useEffect(() => {
    if (!visible) return undefined
    window.addEventListener('blur', releaseAllVirtualKeys)
    window.addEventListener('pointerup', releaseAllVirtualKeys)
    window.addEventListener('touchend', releaseAllVirtualKeys)
    return () => {
      releaseAllVirtualKeys()
      window.removeEventListener('blur', releaseAllVirtualKeys)
      window.removeEventListener('pointerup', releaseAllVirtualKeys)
      window.removeEventListener('touchend', releaseAllVirtualKeys)
    }
  }, [visible])

  if (!visible) return null

  const interact = (event) => {
    event.preventDefault()
    window.dispatchEvent(new Event(INTERACT_EVENT))
  }

  return (
    <div className="mobile-helm" aria-label="Mobile ship controls">
      <div className="mobile-helm__pad" aria-label="Move character">
        <HoldButton className="mobile-helm__key--up" label="Move forward" keyName="w" />
        <HoldButton className="mobile-helm__key--left" label="Move left" keyName="a" />
        <HoldButton className="mobile-helm__key--down" label="Move backward" keyName="s" />
        <HoldButton className="mobile-helm__key--right" label="Move right" keyName="d" />
      </div>

      <button
        className="mobile-helm__interact"
        type="button"
        aria-label="Interact"
        onPointerDown={interact}
        onContextMenu={(event) => event.preventDefault()}
      >
        E
      </button>

      <style>{`
        .mobile-helm {
          position: fixed;
          inset: auto 0 0 0;
          z-index: 9800;
          display: none;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 max(14px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
        }

        .mobile-helm__pad {
          position: relative;
          width: 134px;
          height: 134px;
          border-radius: 50%;
          background:
            radial-gradient(circle, rgba(255,244,205,.16) 0 18%, transparent 19%),
            radial-gradient(circle, rgba(18,12,7,.44), rgba(18,12,7,.14) 68%, transparent 70%);
          border: 1px solid rgba(255,232,170,.18);
          box-shadow: 0 16px 38px rgba(0,0,0,.32);
          pointer-events: auto;
          touch-action: none;
        }

        .mobile-helm__key,
        .mobile-helm__interact {
          border: 1px solid rgba(255,232,170,.32);
          background: rgba(19,12,7,.64);
          color: #ffe58f;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 10px 22px rgba(0,0,0,.24);
          backdrop-filter: blur(8px);
          touch-action: none;
        }

        .mobile-helm__key {
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 50%;
        }

        .mobile-helm__key::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 12px solid #ffe58f;
          transform: translate(-50%, -58%);
        }

        .mobile-helm__key:active,
        .mobile-helm__interact:active {
          transform: scale(.94);
          background: rgba(117,68,22,.78);
        }

        .mobile-helm__key--up { left: 46px; top: 8px; }
        .mobile-helm__key--left { left: 8px; top: 46px; }
        .mobile-helm__key--down { left: 46px; bottom: 8px; }
        .mobile-helm__key--right { right: 8px; top: 46px; }
        .mobile-helm__key--left::before { transform: translate(-58%, -50%) rotate(-90deg); }
        .mobile-helm__key--down::before { transform: translate(-50%, -42%) rotate(180deg); }
        .mobile-helm__key--right::before { transform: translate(-42%, -50%) rotate(90deg); }

        .mobile-helm__interact {
          width: 72px;
          height: 72px;
          margin-bottom: 14px;
          border-radius: 50%;
          font: 800 22px/1 system-ui, sans-serif;
          letter-spacing: .03em;
          pointer-events: auto;
        }

        @media (hover: none), (pointer: coarse), (max-width: 760px) {
          .mobile-helm { display: flex; }
        }

        @media (max-width: 420px) {
          .mobile-helm__pad {
            width: 118px;
            height: 118px;
          }

          .mobile-helm__key {
            width: 38px;
            height: 38px;
          }

          .mobile-helm__key--up { left: 40px; top: 6px; }
          .mobile-helm__key--left { left: 6px; top: 40px; }
          .mobile-helm__key--down { left: 40px; bottom: 6px; }
          .mobile-helm__key--right { right: 6px; top: 40px; }
          .mobile-helm__interact {
            width: 64px;
            height: 64px;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  )
}
