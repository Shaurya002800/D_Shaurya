export default function ProjectDossier({ project }) {
  return (
    <article className="project-dossier" aria-label={`${project.name} dossier`}>
      <header className="project-dossier__masthead"><span>WANTED · PROJECT DOSSIER</span><span>{project.category} · {project.year}</span></header>
      <div className="project-dossier__title"><div><p>{project.status}</p><h2>{project.name}</h2></div><span className="project-dossier__stamp" aria-hidden="true">SOURCE<br />ON FILE</span></div>
      <div className="project-dossier__grid">
        <figure className="project-dossier__figure"><a href={project.image} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size ${project.name} screenshot`}><img src={project.image} alt={`${project.name} interface screenshot`} width="1440" height="900" decoding="async" /></a><figcaption>{project.screenshotCaption} <span>Open image for full size ↗</span></figcaption></figure>
        <div className="project-dossier__problem"><p className="project-dossier__kicker">The problem</p><h3>{project.problem}</h3><p className="project-dossier__kicker">My contribution</p><p>{project.contribution}</p><p className="project-dossier__note">{project.ownershipNote}</p></div>
        <section className="project-dossier__decisions"><h3>Implementation decisions</h3><ol>{project.decisions.map(decision => <li key={decision}>{decision}</li>)}</ol></section>
        <section className="project-dossier__scope"><h3>Status & scope</h3><p>{project.scope}</p>{project.availabilityNote && <p>{project.availabilityNote}</p>}<ul className="project-dossier__stack" aria-label="Relevant technologies">{project.stack.map(tool => <li key={tool}>{tool}</li>)}</ul></section>
      </div>
      <footer className="project-dossier__footer"><div className="project-dossier__actions">{project.liveUrl && <a className="project-dossier__live" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo ↗</a>}<a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">Source Code ↗</a></div><details><summary>Implementation evidence</summary><ul>{project.evidence.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul></details></footer>
    </article>
  )
}
