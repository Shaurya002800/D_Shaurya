import { PROFILE, EXPERIENCE, ACHIEVEMENTS } from '../data/profile.js'
import { useDialog } from '../hooks/useDialog.js'
import './CaptainLog.css'

export default function CaptainLog({ onClose }) {
  const ref = useDialog(true, onClose)
  return (
    <div className="captain-log-backdrop">
      <section ref={ref} className="captain-log" role="dialog" aria-modal="true" aria-labelledby="captain-log-title" tabIndex={-1}>
        <header className="captain-log__header"><div><p>THE CAPTAIN’S JOURNAL</p><h1 id="captain-log-title">Captain Log</h1></div><button type="button" onClick={onClose} aria-label="Close Captain Log and return to deck">×</button></header>
        <div className="captain-log__pages">
          <section aria-labelledby="log-about"><p className="captain-log__eyebrow">About</p><h2 id="log-about">I’m Shaurya.</h2><p>{PROFILE.summary}</p><p>{PROFILE.tagline}</p></section>
          <section aria-labelledby="log-education"><h2 id="log-education">Education</h2>{PROFILE.education.map(item => <p key={item}>{item}</p>)}</section>
          <section aria-labelledby="log-experience"><h2 id="log-experience">Experience</h2>{EXPERIENCE.map(item => <article className="captain-log__entry" key={item.org + item.title}><p className="captain-log__eyebrow">{item.status}</p><h3>{item.org}</h3><p><strong>{item.title}</strong><br /><time>{item.period}</time></p><ul>{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul>{item.dateNote && <p className="captain-log__note">{item.dateNote}</p>}{item.endedOn && <p className="captain-log__note">Tenure completed on 26 October 2026.</p>}</article>)}</section>
          <section aria-labelledby="log-credits"><h2 id="log-credits">Selected credits</h2><ul>{ACHIEVEMENTS.map(item => <li key={item}>{item}</li>)}</ul></section>
          <footer className="captain-log__links"><a href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer">Resume PDF ↗</a><a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href={`mailto:${PROFILE.email}`}>Contact ↗</a></footer>
        </div>
      </section>
    </div>
  )
}
