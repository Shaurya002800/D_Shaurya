import { useState } from 'react'
function ProjectCoverArt({ project, ink, paper }) {
  const hasImage = Boolean(project.image)

  return (
    <a href={project.image} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size ${project.name} screenshot`} style={{
      width: '100%', height: '188px',
      background: `repeating-linear-gradient(45deg, ${ink} 0px, ${ink} 1.5px, transparent 1.5px, transparent 7px)`,
      backgroundColor: '#e7e0cd',
      border: `3px solid ${ink}`,
      marginBottom: '18px',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {hasImage && (
        <>
          <img
            src={project.image}
            alt={`${project.name} project screenshot`}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'top center',
              filter: 'contrast(1.05) saturate(0.92)',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(21,18,15,0.04), rgba(21,18,15,0.28))',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }} />
        </>
      )}
      <span style={{
        position: 'relative',
        zIndex: 1,
        fontFamily: '"Courier New", monospace',
        color: hasImage ? paper : paper,
        background: hasImage ? 'rgba(21,18,15,0.86)' : ink,
        fontSize: '11px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        padding: '4px 10px',
        border: `1px solid ${paper}`,
        boxShadow: hasImage ? '0 8px 20px rgba(0,0,0,0.28)' : 'none',
      }}>
        {project.status}
      </span>
    </a>
  )
}


export default function MangaProjectPage({ project, onClose }) {
  const [coverHover, setCoverHover] = useState(false)

  const ink = '#15120f'
  const paper = '#f3eee2'
  const hanko = '#c1272d'
  const inkSoft = '#3c352a'
  const tone = '#b9b19c'

  const year = project.year || new Date().getFullYear()
  const isLive = Boolean(project.liveUrl)

  const halftone = {
    backgroundImage: `radial-gradient(${tone} 1px, transparent 1.6px)`,
    backgroundSize: '8px 8px',
  }
  const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`

  return (
    <div
      className="manga-page project-carousel__manga-page" aria-label={`${project.name} dossier`}
      style={{
        width: 'min(1080px, 100%)',
        maxHeight: 'min(78vh, 760px)',
        display: 'flex', flexDirection: 'column',
        background: paper,
        border: `5px solid ${ink}`,
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.4)',
        animation: 'pageSlam 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="inkRough">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.09" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
        </filter>
      </svg>

      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none', zIndex: 0 }} />

      <button
        onClick={onClose} aria-label="Exit projects"
        style={{
          position: 'absolute', top: '14px', right: '14px', zIndex: 20,
          width: '34px', height: '34px',
          background: paper, border: `2.5px solid ${ink}`,
          color: ink, fontSize: '15px', fontWeight: 900, cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          transform: 'rotate(-6deg)',
          transition: 'all 0.2s',
          boxShadow: `2px 2px 0 ${ink}`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = ink
          e.currentTarget.style.color = paper
          e.currentTarget.style.transform = 'rotate(0deg) scale(1.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = paper
          e.currentTarget.style.color = ink
          e.currentTarget.style.transform = 'rotate(-6deg) scale(1)'
        }}
      >
        ✕
      </button>

      <div
        className="manga-grid"
        style={{
          flex: 1,
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '320px minmax(0, 1fr)',
          gridTemplateRows: '78px auto auto minmax(70px, auto)',
          gap: '6px',
          padding: '6px',
          background: ink,
          overflowY: 'auto',
        }}
      >
        <div
          className="panel-cover"
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
          style={{
            gridColumn: 1, gridRow: '1 / span 4',
            background: paper, ...halftone,
            padding: '26px 20px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative',
            transform: coverHover ? 'scale(1.01)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            animation: 'panelIn 0.4s ease 0.05s both',
          }}
        >
          <div style={{
            fontFamily: '"Courier New", monospace', fontSize: '10px',
            fontWeight: 700, letterSpacing: '0.25em', color: inkSoft,
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            ※ {project.featured ? 'Featured Series' : 'Archive Series'}
          </div>

          <ProjectCoverArt project={project} ink={ink} paper={paper} />

          <h2 style={{
            fontFamily: '"Anton", Georgia, sans-serif',
            fontSize: 'clamp(1.6rem, 3.4vw, 2.5rem)',
            color: ink, textAlign: 'center', lineHeight: 1.04,
            textTransform: 'uppercase', marginBottom: '10px',
          }}>
            {project.name}
          </h2>

          <div style={{ width: '46px', height: '4px', background: hanko, marginBottom: '18px' }} />

          <p className="manga-cover-category">{project.category}</p>

          <div style={{
            position: 'absolute', bottom: '18px', right: '14px',
            width: '88px', height: '88px', borderRadius: '50%',
            border: `4px solid ${hanko}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: hanko, fontWeight: 900, transform: 'rotate(-12deg)',
            animation: 'stampDown 0.5s cubic-bezier(0.2, 2, 0.3, 1) 0.7s both',
            filter: 'url(#inkRough)', opacity: 0.9, pointerEvents: 'none',
          }}>
            <div style={{ position: 'absolute', inset: '4px', border: `1px solid rgba(193,39,45,0.5)`, borderRadius: '50%' }} />
            <span style={{ fontFamily: '"Anton", Georgia, sans-serif', fontSize: '13px', letterSpacing: '1px' }}>SOURCE</span>
            <span style={{ fontFamily: '"Anton", Georgia, sans-serif', fontSize: '13px', letterSpacing: '1px' }}>ON FILE</span>
          </div>
        </div>

        <div
          className="panel-title"
          style={{
            gridColumn: 2, gridRow: 1,
            background: ink,
            backgroundImage: 'repeating-conic-gradient(from 0deg at 0% 0%, rgba(255,255,255,0.07) 0deg 1.6deg, transparent 1.6deg 6deg)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 86%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px', position: 'relative', overflow: 'hidden',
            animation: 'panelIn 0.4s ease 0.1s both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontFamily: '"Anton", Georgia, sans-serif', fontSize: '1.8rem', color: paper, letterSpacing: '0.02em' }}>
              DOSSIER
            </span>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: 'rgba(243,238,226,0.55)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              vol. {year}
            </span>
          </div>

          <div style={{
            position: 'relative',
            fontFamily: '"Bangers", "Anton", cursive', fontSize: '11px',
            color: ink, background: hanko,
            padding: '6px 14px', transform: 'rotate(6deg)',
            clipPath: 'polygon(8% 0%, 92% 5%, 100% 50%, 94% 100%, 6% 95%, 0% 50%)',
            letterSpacing: '0.5px', textTransform: 'uppercase',
            animation: 'burstPop 0.45s cubic-bezier(0.2, 2, 0.3, 1) 0.35s both',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
          }}>
            {project.status}
          </div>
        </div>

        <div
          className="panel-synopsis"
          style={{
            gridColumn: 2, gridRow: 2,
            background: paper, position: 'relative',
            padding: '24px 28px',
            animation: 'panelIn 0.4s ease 0.18s both',
          }}
        >
          <div className="bubble-tail" aria-hidden="true" style={{ position: 'absolute', left: '-16px', top: '26px', width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderRight: `16px solid ${ink}` }} />
          <div className="bubble-tail" aria-hidden="true" style={{ position: 'absolute', left: '-12px', top: '29px', width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: `12px solid ${paper}` }} />

          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: hanko, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700 }}>
            [ Synopsis ]
          </div>
          <p style={{
            color: inkSoft, fontSize: '1.02rem', lineHeight: 1.75,
            margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 400,
          }}>
            {project.problem}
          </p>
          <details className="manga-evidence">
            <summary>Read contribution & implementation</summary>
            <h3>My contribution</h3><p>{project.contribution}</p><p>{project.ownershipNote}</p>
            <h3>Implementation decisions</h3><ol>{project.decisions.map(decision => <li key={decision}>{decision}</li>)}</ol>
            <h3>Status & scope</h3><p>{project.scope}</p>{project.availabilityNote && <p>{project.availabilityNote}</p>}
            <h3>Screenshot</h3><p>{project.screenshotCaption}</p>
            <h3>Source evidence</h3><ul>{project.evidence.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul>
          </details>
          <p className="manga-contribution-preview">{project.contribution}
          </p>
        </div>

        <div
          className="panel-techniques"
          style={{
            gridColumn: 2, gridRow: 3,
            background: paper, padding: '22px 28px',
            animation: 'panelIn 0.4s ease 0.26s both',
          }}
        >
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: hanko, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>
            [ Techniques Unlocked ]
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {project.stack?.map((item, i) => (
              <span
                key={item}
                style={{
                  '--chip-rot': `${i % 2 === 0 ? -2.5 : 2.5}deg`,
                  padding: '7px 14px',
                  background: paper,
                  border: `2.5px solid ${ink}`,
                  color: ink,
                  fontFamily: '"Anton", Georgia, sans-serif',
                  fontSize: '11.5px', letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0% 100%)',
                  animation: `chipFade 0.4s ease ${0.4 + i * 0.07}s both`,
                  cursor: 'default',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = ink
                  e.currentTarget.style.color = paper
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.07)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = paper
                  e.currentTarget.style.color = ink
                  e.currentTarget.style.transform = 'rotate(var(--chip-rot)) scale(1)'
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div
          className="panel-cta"
          style={{
            gridColumn: 2, gridRow: 4,
            background: paper,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px',
            animation: 'panelIn 0.4s ease 0.34s both',
          }}
        >
          <span style={{
            fontFamily: '"Courier New", monospace', fontSize: '10px',
            color: inkSoft, letterSpacing: '1.5px', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isLive ? hanko : '#999', display: 'inline-block' }} />
            {project.status}
          </span>

          <div className="manga-project-links">
            {isLive && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo ↗</a>}
            <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">Source Code ↗</a>
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 16px',
        borderTop: `2px solid ${ink}`,
        background: paper,
        fontFamily: '"Courier New", monospace', fontSize: '10px',
        color: inkSoft, letterSpacing: '1px',
      }}>
        <span>{project.category}</span>
        <span>VOL. {year} · {project.status}</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bangers&display=swap');
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pageSlam {
          0% { opacity: 0; transform: scale(0.86) rotate(-2deg); }
          60% { opacity: 1; transform: scale(1.015) rotate(0.4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes panelIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes burstPop {
          0% { opacity: 0; transform: rotate(-25deg) scale(0); }
          60% { opacity: 1; transform: rotate(10deg) scale(1.15); }
          100% { opacity: 1; transform: rotate(6deg) scale(1); }
        }
        @keyframes stampDown {
          0% { opacity: 0; transform: rotate(-30deg) scale(2.4); }
          55% { opacity: 1; transform: rotate(-6deg) scale(0.92); }
          100% { opacity: 0.9; transform: rotate(-12deg) scale(1); }
        }
        @keyframes chipFade {
          from { opacity: 0; transform: translateY(8px) rotate(0deg); }
          to { opacity: 1; transform: translateY(0) rotate(var(--chip-rot, 0deg)); }
        }
        @media (max-width: 900px) {
          .manga-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 240px auto auto auto auto !important;
          }
          .panel-cover { grid-column: 1 !important; grid-row: 1 !important; }
          .panel-title { grid-column: 1 !important; grid-row: 2 !important; clip-path: none !important; }
          .panel-synopsis { grid-column: 1 !important; grid-row: 3 !important; padding: 22px !important; }
          .panel-techniques { grid-column: 1 !important; grid-row: 4 !important; }
          .panel-cta { grid-column: 1 !important; grid-row: 5 !important; flex-wrap: wrap; gap: 12px; padding: 14px 18px !important; }
          .bubble-tail { display: none !important; }
        }
      `}</style>
    </div>
  )
}

