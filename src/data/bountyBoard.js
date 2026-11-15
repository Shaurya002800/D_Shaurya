import { PROFILE } from './profile.js'

export const BOUNTY_BOARD_TITLE = 'The Bounty Board'
export const BOUNTY_PAPER_TEXTURE = '/textures/bounty-parchment.webp'

export const BOUNTY_ROUTES = [
  { key: 'projects', destination: 'Projects', object: 'Wanted Posters', character: 'Portgas D. Ace', epithet: 'Fire Fist', image: '/characters/bounty/ace.webp', clue: 'Discover the builds, ideas, and decisions behind the work.', action: 'Explore Projects', tilt: '-2deg' },
  { key: 'resume', destination: 'Resume', object: 'Treasure Chest', character: 'Nico Robin', epithet: 'Devil Child', image: '/characters/bounty/robin.webp', clue: 'The full story of skills, education, and experience in one PDF.', action: 'View Resume', tilt: '1.5deg' },
  { key: 'skills', destination: 'Skills', object: 'Sword Deck', character: 'Monkey D. Garp', epithet: 'The Hero', image: '/characters/bounty/garp.webp', clue: 'Meet the tools and techniques behind every adventure.', action: 'Visit Skills Deck', tilt: '-1deg' },
  { key: 'experience', destination: 'Experience', object: 'Captain Log', character: PROFILE.shortName, epithet: 'The Captain', image: '/characters/captain.webp', clue: 'Read the captain’s log: my background and the journey so far.', action: 'Read Experience', tilt: '2deg' },
  { key: 'contact', destination: 'Contact', object: 'Den Den Mushi', character: 'Rocks D. Xebec', epithet: 'Rocks Pirates', image: '/characters/bounty/rocks.webp', clue: 'Have an idea or an opportunity? Send a signal my way.', action: 'Contact Me', tilt: '-1.5deg' },
]
