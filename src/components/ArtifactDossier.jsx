import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function ArtifactDossier({ artifact, onClose }) {
  useEffect(() => {
    if (!artifact) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [artifact, onClose])

  const hasAction = Boolean(artifact?.href)
  const actionProps = hasAction
    ? {
        href: artifact.href,
        download: artifact.download,
        target: artifact.download || artifact.href?.startsWith('mailto:') ? undefined : '_blank',
        rel: artifact.download || artifact.href?.startsWith('mailto:') ? undefined : 'noreferrer',
      }
    : null

  return (
    <AnimatePresence>
      {artifact && (
        <motion.div
          className="artifact-dossier"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDownCapture={(event) => event.stopPropagation()}
          onKeyUpCapture={(event) => event.stopPropagation()}
        >
          <motion.aside
            className="artifact-dossier__sheet"
            initial={{ y: 28, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            style={{
              '--artifact-accent': artifact.accent,
              '--artifact-glow': artifact.color,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="artifact-title"
          >
            <button className="artifact-dossier__close" onClick={onClose} aria-label="Close artifact dossier">
              x
            </button>

            <div className="artifact-dossier__seal" aria-hidden="true">
              <span />
            </div>

            <p className="artifact-dossier__eyebrow">{artifact.eyebrow || 'Ship artifact'}</p>
            <h2 id="artifact-title">{artifact.title}</h2>
            <p className="artifact-dossier__subtitle">{artifact.subtitle}</p>
            <p className="artifact-dossier__body">{artifact.body}</p>

            <div className="artifact-dossier__intel">
              <div>
                <strong>Why here</strong>
                <p>{artifact.placement}</p>
              </div>
              <div>
                <strong>Hidden read</strong>
                <p>{artifact.secret}</p>
              </div>
            </div>

            <div className="artifact-dossier__actions">
              {hasAction ? (
                <a className="artifact-dossier__primary" {...actionProps}>
                  {artifact.actionLabel}
                </a>
              ) : (
                <button className="artifact-dossier__primary" onClick={onClose}>
                  {artifact.actionLabel || 'Close'}
                </button>
              )}
              <button className="artifact-dossier__secondary" onClick={onClose}>
                Back to Deck
              </button>
            </div>
          </motion.aside>

          <style>{`
            .artifact-dossier {
              position: fixed;
              inset: 0;
              z-index: 12000;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              padding: clamp(14px, 3vw, 34px);
              background:
                linear-gradient(90deg, rgba(0,0,0,.18), rgba(4,10,18,.56)),
                radial-gradient(circle at 82% 42%, color-mix(in srgb, var(--artifact-glow) 24%, transparent), transparent 34%);
              backdrop-filter: blur(4px);
            }

            .artifact-dossier__sheet {
              position: relative;
              width: min(420px, calc(100vw - 28px));
              max-height: min(82vh, 720px);
              overflow: auto;
              padding: 26px;
              color: #281508;
              background:
                linear-gradient(135deg, rgba(255,248,225,.98), rgba(233,208,152,.96)),
                repeating-linear-gradient(0deg, rgba(92,58,31,.05) 0 1px, transparent 1px 9px);
              border: 1px solid rgba(88,50,18,.34);
              border-radius: 8px;
              box-shadow:
                0 24px 70px rgba(0,0,0,.38),
                inset 0 0 0 1px rgba(255,255,255,.42);
            }

            .artifact-dossier__sheet::before {
              content: "";
              position: absolute;
              inset: 10px;
              border: 1px solid color-mix(in srgb, var(--artifact-accent) 42%, transparent);
              border-radius: 5px;
              pointer-events: none;
            }

            .artifact-dossier__close {
              position: absolute;
              top: 14px;
              right: 14px;
              width: 34px;
              height: 34px;
              border: 1px solid rgba(62,35,14,.22);
              border-radius: 50%;
              background: rgba(255,255,255,.36);
              color: #4d2c12;
              font: 700 15px/1 system-ui, sans-serif;
              cursor: pointer;
            }

            .artifact-dossier__seal {
              width: 46px;
              height: 46px;
              display: grid;
              place-items: center;
              margin-bottom: 14px;
              border-radius: 50%;
              background: color-mix(in srgb, var(--artifact-accent) 88%, #2a1505);
              box-shadow: 0 0 24px color-mix(in srgb, var(--artifact-glow) 52%, transparent);
            }

            .artifact-dossier__seal span {
              width: 22px;
              height: 22px;
              border: 2px solid rgba(255,255,255,.78);
              border-radius: 50%;
              box-shadow: inset 0 0 0 5px rgba(255,255,255,.18);
            }

            .artifact-dossier__eyebrow {
              color: var(--artifact-accent);
              font: 700 11px/1.1 system-ui, sans-serif;
              letter-spacing: .14em;
              text-transform: uppercase;
            }

            .artifact-dossier h2 {
              margin-top: 8px;
              font: 400 clamp(28px, 4.5vw, 42px)/.95 "Pirata One", Georgia, serif;
              letter-spacing: 0;
              color: #2a1505;
            }

            .artifact-dossier__subtitle {
              margin-top: 9px;
              color: rgba(42,21,5,.68);
              font: 700 12px/1.35 system-ui, sans-serif;
              letter-spacing: .04em;
              text-transform: uppercase;
            }

            .artifact-dossier__body {
              margin-top: 18px;
              font: 500 15px/1.65 system-ui, sans-serif;
              color: rgba(35,20,8,.86);
            }

            .artifact-dossier__intel {
              display: grid;
              gap: 10px;
              margin-top: 20px;
            }

            .artifact-dossier__intel div {
              padding: 12px 13px;
              border-left: 3px solid var(--artifact-accent);
              background: rgba(255,255,255,.28);
            }

            .artifact-dossier__intel strong {
              display: block;
              color: #2a1505;
              font: 800 11px/1.2 system-ui, sans-serif;
              letter-spacing: .1em;
              text-transform: uppercase;
            }

            .artifact-dossier__intel p {
              margin-top: 6px;
              color: rgba(35,20,8,.78);
              font: 500 13px/1.5 system-ui, sans-serif;
            }

            .artifact-dossier__actions {
              display: flex;
              gap: 10px;
              margin-top: 22px;
            }

            .artifact-dossier__primary,
            .artifact-dossier__secondary {
              min-height: 44px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0 16px;
              border-radius: 6px;
              font: 800 12px/1 system-ui, sans-serif;
              letter-spacing: .08em;
              text-decoration: none;
              text-transform: uppercase;
              cursor: pointer;
            }

            .artifact-dossier__primary {
              flex: 1;
              border: 1px solid var(--artifact-accent);
              background: var(--artifact-accent);
              color: #fff8e5;
              box-shadow: 0 10px 22px color-mix(in srgb, var(--artifact-accent) 24%, transparent);
            }

            .artifact-dossier__secondary {
              border: 1px solid rgba(62,35,14,.2);
              background: rgba(255,255,255,.3);
              color: #3e230e;
            }

            @media (max-width: 720px) {
              .artifact-dossier {
                align-items: flex-end;
                justify-content: center;
                padding: 10px;
              }

              .artifact-dossier__sheet {
                width: 100%;
                max-height: 74vh;
                padding: 22px 18px 18px;
              }

              .artifact-dossier__actions {
                flex-direction: column;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
