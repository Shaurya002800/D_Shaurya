// Skill section data + metadata.
// Each direction shows a One Piece crew member theme with categorized skills.
// All icon URLs come from the simple-icons CDN and gracefully fall back to
// a text label if the SVG fails to load.

const ICONS = (name) => `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${name}.svg`

export const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
}

export const DIR_ORDER = [
  DIRECTIONS.NORTH,
  DIRECTIONS.EAST,
  DIRECTIONS.SOUTH,
  DIRECTIONS.WEST,
]

export const DIR_META = [
  { dir: DIRECTIONS.NORTH, compass: 'N', shortName: 'Languages' },
  { dir: DIRECTIONS.EAST,  compass: 'E', shortName: 'Frontend' },
  { dir: DIRECTIONS.SOUTH, compass: 'S', shortName: 'Dev Tools' },
  { dir: DIRECTIONS.WEST,  compass: 'W', shortName: 'AI / ML' },
]

export const SKILL_DATA = {
  [DIRECTIONS.NORTH]: {
    character: 'ZORO',
    title: 'PROGRAMMING LANGUAGES',
    subtitle: "The Swordsman's Arsenal",
    bearing: 'NORTH BLUE',
    symbol: '三',
    characterImg: '/characters/zoro.png',
    boardRect: { left: '9.5%', top: '28%', width: '80.5%', height: '58%' },
    accentColor: '#54e58a',
    accentSoft: 'rgba(84,229,138,0.22)',
    titleColor: '#b8ffd0',
    atmosphere: 'rgba(23,92,59,0.24)',
    quote: '"I’ll become the world’s greatest swordsman."',
    effect: 'slashes',
    skills: [
      { name: 'JavaScript', iconUrl: ICONS('javascript'), color: '#F7DF1E', fallback: 'JS', level: 92, bounty: '92M', note: 'Interactive frontends, game logic, and expressive web experiences.' },
      { name: 'TypeScript', iconUrl: ICONS('typescript'), color: '#3178C6', fallback: 'TS', level: 86, bounty: '86M', note: 'Reliable application architecture with safer, scalable code.' },
      { name: 'Python', iconUrl: ICONS('python'), color: '#3776AB', fallback: 'Py', level: 90, bounty: '90M', note: 'AI systems, automation, data workflows, and rapid prototypes.' },
      { name: 'C++', iconUrl: ICONS('cplusplus'), color: '#00599C', fallback: 'C++', level: 72, bounty: '72M', note: 'Performance-minded programming and core problem solving.' },
      { name: 'Java', iconUrl: ICONS('openjdk'), color: '#ED8B00', fallback: 'J', level: 78, bounty: '78M', note: 'Object-oriented systems, APIs, and production fundamentals.' },
    ],
  },
  [DIRECTIONS.EAST]: {
    character: 'SANJI',
    title: 'FRONTEND & DESIGN',
    subtitle: "The Chef's Craft",
    bearing: 'EAST BLUE',
    symbol: '火',
    characterImg: '/characters/sanji.png',
    boardRect: { left: '10%', top: '28%', width: '80%', height: '57%' },
    accentColor: '#ffbf47',
    accentSoft: 'rgba(255,191,71,0.22)',
    titleColor: '#ffe1a2',
    atmosphere: 'rgba(141,77,18,0.22)',
    quote: '"A first-class cook never wastes the ingredients."',
    effect: 'embers',
    skills: [
      { name: 'React.js', iconUrl: ICONS('react'), color: '#61DAFB', fallback: 'R', level: 92, bounty: '92M', note: 'Component systems, stateful interfaces, and polished interactions.' },
      { name: 'Tailwind CSS', iconUrl: ICONS('tailwindcss'), color: '#38BDF8', fallback: 'TW', level: 88, bounty: '88M', note: 'Fast, consistent visual systems with responsive precision.' },
      { name: 'Streamlit', iconUrl: ICONS('streamlit'), color: '#FF4B4B', fallback: 'S', level: 82, bounty: '82M', note: 'Useful data and AI products shipped from idea to interface quickly.' },
      { name: 'Figma', iconUrl: ICONS('figma'), color: '#F24E1E', fallback: 'F', level: 78, bounty: '78M', note: 'Interface exploration, prototypes, visual hierarchy, and handoff.' },
      { name: 'Photoshop', iconUrl: ICONS('adobephotoshop'), color: '#31A8FF', fallback: 'PS', level: 70, bounty: '70M', note: 'Asset preparation, image treatment, and atmospheric compositions.' },
    ],
  },
  [DIRECTIONS.SOUTH]: {
    character: 'BOA HANCOCK',
    title: 'DEV TOOLS & INTEGRATION',
    subtitle: "The Empress's Domain",
    bearing: 'CALM BELT',
    symbol: '心',
    characterImg: '/characters/boa.png',
    boardRect: { left: '15.5%', top: '27%', width: '74%', height: '58%' },
    accentColor: '#ef77c8',
    accentSoft: 'rgba(239,119,200,0.22)',
    titleColor: '#ffd0ef',
    atmosphere: 'rgba(118,25,91,0.20)',
    quote: '"Beauty is power, but precision makes it useful."',
    effect: 'petals',
    skills: [
      { name: 'Git', iconUrl: ICONS('git'), color: '#F05032', fallback: 'G', level: 88, bounty: '88M', note: 'Clean histories, safe collaboration, and deliberate delivery.' },
      { name: 'GitHub', iconUrl: ICONS('github'), color: '#1f2328', fallback: 'GH', level: 90, bounty: '90M', note: 'Repository workflows, reviews, automation, and project stewardship.' },
      { name: 'VS Code', iconUrl: ICONS('visualstudiocode'), color: '#007ACC', fallback: 'VS', level: 92, bounty: '92M', note: 'A tuned development cockpit for focused, efficient building.' },
      { name: 'Cursor', iconUrl: ICONS('cursor'), color: '#333333', fallback: 'C', level: 84, bounty: '84M', note: 'AI-assisted iteration while keeping engineering judgment in control.' },
      { name: 'REST API', iconUrl: ICONS('swagger'), color: '#65b93c', fallback: 'API', level: 86, bounty: '86M', note: 'Clear contracts connecting products, services, and real-world data.' },
    ],
  },
  [DIRECTIONS.WEST]: {
    character: 'SHANKS',
    title: 'AI / ML & BLOCKCHAIN',
    subtitle: "The Emperor's Power",
    bearing: 'NEW WORLD',
    symbol: '覇',
    characterImg: '/characters/shanks.png',
    boardRect: { left: '16%', top: '30%', width: '74%', height: '59%' },
    accentColor: '#ef6161',
    accentSoft: 'rgba(239,97,97,0.22)',
    titleColor: '#ffc3c3',
    atmosphere: 'rgba(116,22,22,0.22)',
    quote: '"The future is worth betting an arm on."',
    effect: 'haki',
    skills: [
      { name: 'LangChain', iconUrl: ICONS('langchain'), color: '#1C3C3C', fallback: 'LC', level: 84, bounty: '84M', note: 'RAG and agentic systems with composable prompt + tool chains.' },
      { name: 'TensorFlow', iconUrl: ICONS('tensorflow'), color: '#FF6F00', fallback: 'TF', level: 78, bounty: '78M', note: 'Classic model training and edge inference (Lite Micro) pipelines.' },
      { name: 'XGBoost', iconUrl: ICONS('xgboost'), color: '#0062AC', fallback: 'XGB', level: 80, bounty: '80M', note: 'Reliable gradient-boosted models for tabular prediction work.' },
      { name: 'Solidity', iconUrl: ICONS('solidity'), color: '#363636', fallback: 'Sol', level: 76, bounty: '76M', note: 'Smart contracts and on-chain verification primitives.' },
      { name: 'Web3.py', iconUrl: ICONS('python'), color: '#F16822', fallback: 'W3', level: 74, bounty: '74M', note: 'Python integrations for chains, contracts, and transaction workflows.' },
      { name: 'Polygon', iconUrl: ICONS('polygon'), color: '#8247E5', fallback: 'POLY', level: 72, bounty: '72M', note: 'Scalable EVM application patterns and ecosystem integrations.' },
    ],
  },
}
