import { PROFILE } from './profile.js'
import { PROJECTS } from './projects.js'
export function portfolioStructuredData() {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Person', '@id': PROFILE.links.portfolio + '/#person', name: PROFILE.name, url: PROFILE.links.portfolio, description: PROFILE.summary, email: PROFILE.email, affiliation: { '@type': 'CollegeOrUniversity', name: PROFILE.academics.institution }, sameAs: [PROFILE.links.github, PROFILE.links.linkedin] },
    { '@type': 'CollectionPage', name: 'Grand Line Project Archive', url: PROFILE.links.portfolio, about: { '@id': PROFILE.links.portfolio + '/#person' }, mainEntity: { '@type': 'ItemList', numberOfItems: PROJECTS.length, itemListElement: PROJECTS.map((project, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'SoftwareSourceCode', name: project.name, description: project.problem + ' ' + project.scope, codeRepository: project.sourceUrl, url: project.liveUrl || project.sourceUrl, creativeWorkStatus: project.status } })) } },
  ] }
}
