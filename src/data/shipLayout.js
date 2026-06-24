export const SHIP_DECK_BOUNDS = {
  minX: -7.0,
  maxX: 7.0,
  minZ: -22.0,
  maxZ: 24.0,
}

export const SHIP_STAIRS = {
  stern: {
    minX: -4.1,
    maxX: 4.1,
    startZ: 10.4,
    endZ: 13.6,
    topY: 2.65,
  },
  bow: {
    minX: -4.1,
    maxX: 4.1,
    startZ: -10.4,
    endZ: -13.6,
    topY: 2.65,
  },
}

export const SHIP_PROP_LAYOUT = {
  orchard: {
    planter: [-5.65, 2.8, 18.65],
    trees: [
      { position: [-6.35, 2.74, 18.0], scale: 1.0 },
      { position: [-4.9, 2.74, 19.35], scale: 0.88 },
    ],
  },
  barrelClusters: [
    {
      side: 'port',
      barrels: [
        { position: [-6.45, 0.85, -9.8], scale: 1.0 },
        { position: [-5.72, 0.82, -9.95], scale: 0.84 },
      ],
      rope: [-6.05, 0.5, -8.95],
    },
    {
      side: 'starboard',
      barrels: [
        { position: [6.45, 0.85, -9.8], scale: 1.0 },
        { position: [5.72, 0.82, -9.95], scale: 0.84 },
      ],
      rope: [6.05, 0.5, -8.95],
    },
  ],
  anchors: [
    [-8.1, 0.55, -21.7],
    [8.1, 0.55, -21.7],
  ],
  railLanterns: [
    [-7.72, 2.12, 11.5],
    [7.72, 2.12, 11.5],
    [-7.72, 2.12, 3.6],
    [7.72, 2.12, 3.6],
    [-7.72, 2.12, -3.8],
    [7.72, 2.12, -3.8],
    [-7.72, 2.12, -11.5],
    [7.72, 2.12, -11.5],
  ],
  bollards: [
    [-7.55, -12],
    [7.55, -12],
    [-7.55, 10],
    [7.55, 10],
  ],
}

export const SHIP_DECK_BOX_OBSTACLES = [
  {
    id: 'orchard',
    minX: -7.9,
    maxX: -3.35,
    minZ: 16.25,
    maxZ: 21.2,
    colliderY: 3.65,
    colliderHeight: 1.1,
  },
  {
    id: 'wheel',
    minX: -1.25,
    maxX: 1.25,
    minZ: 17.15,
    maxZ: 19.35,
    colliderY: 3.75,
    colliderHeight: 1.2,
  },
  {
    id: 'stern-cabin',
    minX: -5.55,
    maxX: 5.55,
    minZ: 23.55,
    maxZ: 24.0,
    colliderY: 4.5,
    colliderHeight: 2.2,
  },
  {
    id: 'bow-figurehead',
    minX: -4.7,
    maxX: 4.7,
    minZ: -28.0,
    maxZ: -24.1,
    colliderY: 2.0,
    colliderHeight: 2.0,
  },
  {
    id: 'port-service',
    minX: -7.25,
    maxX: -5.05,
    minZ: -10.95,
    maxZ: -8.25,
    colliderY: 0.9,
    colliderHeight: 0.9,
  },
  {
    id: 'starboard-service',
    minX: 5.05,
    maxX: 7.25,
    minZ: -10.95,
    maxZ: -8.25,
    colliderY: 0.9,
    colliderHeight: 0.9,
  },
  {
    id: 'stern-wall-port',
    minX: -8.1,
    maxX: -4.1,
    minZ: 12.45,
    maxZ: 13.75,
    colliderY: 1.35,
    colliderHeight: 1.35,
  },
  {
    id: 'stern-wall-starboard',
    minX: 4.1,
    maxX: 8.1,
    minZ: 12.45,
    maxZ: 13.75,
    colliderY: 1.35,
    colliderHeight: 1.35,
  },
  {
    id: 'bow-wall-port',
    minX: -8.1,
    maxX: -4.1,
    minZ: -13.75,
    maxZ: -12.45,
    colliderY: 1.35,
    colliderHeight: 1.35,
  },
  {
    id: 'bow-wall-starboard',
    minX: 4.1,
    maxX: 8.1,
    minZ: -13.75,
    maxZ: -12.45,
    colliderY: 1.35,
    colliderHeight: 1.35,
  },
]

export const SHIP_DECK_CIRCLE_OBSTACLES = [
  { id: 'main-mast', x: 0, z: -3, radius: 1.15 },
  { id: 'fore-mast', x: 0, z: -19, radius: 0.82 },
]
