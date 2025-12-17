// ============================================
// SCENE THEMES
// ============================================

export interface SceneTheme {
  id: string;
  name: string;
  description: string;
  preview: string; // emoji or icon

  // Tree
  treeColor: string;
  snowAmount: number;

  // Sky & Environment
  skyColor: string;
  groundColor: string;
  fogColor: string;
  fogDensity: number;

  // Lighting
  ambientIntensity: number;
  ambientColor: string;
  mainLightColor: string;
  mainLightIntensity: number;
  accentLightColor: string;
  accentLightIntensity: number;

  // Particles
  snowfall: boolean;
  snowfallIntensity: number; // 0-1
  starsVisible: boolean;

  // Suggested ornament colors
  ornamentColors: string[];
}

export const SCENE_THEMES: Record<string, SceneTheme> = {
  winterWonderland: {
    id: 'winterWonderland',
    name: 'Winter Wonderland',
    description: 'Crisp blue winter evening',
    preview: '❄️',
    treeColor: '#1a472a',
    snowAmount: 0.5,
    skyColor: '#0a1628',
    groundColor: '#e8f4f8',
    fogColor: '#1a3a5c',
    fogDensity: 0.02,
    ambientIntensity: 0.4,
    ambientColor: '#b4d4e8',
    mainLightColor: '#ffffff',
    mainLightIntensity: 1.2,
    accentLightColor: '#4a9eff',
    accentLightIntensity: 0.5,
    snowfall: true,
    snowfallIntensity: 0.6,
    starsVisible: true,
    ornamentColors: ['#c0c0c0', '#87ceeb', '#ffffff', '#4a9eff', '#e8f4f8'],
  },

  classicChristmas: {
    id: 'classicChristmas',
    name: 'Classic Christmas',
    description: 'Traditional red & gold warmth',
    preview: '🎄',
    treeColor: '#0d3d1a',
    snowAmount: 0.2,
    skyColor: '#1a0a0a',
    groundColor: '#f5f0e8',
    fogColor: '#2d1a1a',
    fogDensity: 0.015,
    ambientIntensity: 0.5,
    ambientColor: '#ffeecc',
    mainLightColor: '#fff5e6',
    mainLightIntensity: 1.0,
    accentLightColor: '#ff6b35',
    accentLightIntensity: 0.6,
    snowfall: true,
    snowfallIntensity: 0.3,
    starsVisible: true,
    ornamentColors: ['#ff0000', '#ffd700', '#008000', '#c0c0c0', '#8b0000'],
  },

  midnightMagic: {
    id: 'midnightMagic',
    name: 'Midnight Magic',
    description: 'Deep purple mystical night',
    preview: '✨',
    treeColor: '#0a2818',
    snowAmount: 0.3,
    skyColor: '#0a0614',
    groundColor: '#d8d0e8',
    fogColor: '#1a0a28',
    fogDensity: 0.025,
    ambientIntensity: 0.35,
    ambientColor: '#9966cc',
    mainLightColor: '#e6d5ff',
    mainLightIntensity: 0.9,
    accentLightColor: '#ff66ff',
    accentLightIntensity: 0.4,
    snowfall: true,
    snowfallIntensity: 0.4,
    starsVisible: true,
    ornamentColors: ['#9966cc', '#ffd700', '#ff66ff', '#4a0080', '#c0c0c0'],
  },

  cozyFireside: {
    id: 'cozyFireside',
    name: 'Cozy Fireside',
    description: 'Warm indoor glow',
    preview: '🔥',
    treeColor: '#1a4a28',
    snowAmount: 0.0,
    skyColor: '#1a0f08',
    groundColor: '#8b7355',
    fogColor: '#2d1a0a',
    fogDensity: 0.01,
    ambientIntensity: 0.45,
    ambientColor: '#ffcc88',
    mainLightColor: '#ffaa66',
    mainLightIntensity: 1.3,
    accentLightColor: '#ff4400',
    accentLightIntensity: 0.7,
    snowfall: false,
    snowfallIntensity: 0,
    starsVisible: false,
    ornamentColors: ['#ff4400', '#ffd700', '#8b4513', '#cd853f', '#ff6347'],
  },

  frozenNorth: {
    id: 'frozenNorth',
    name: 'Frozen North',
    description: 'Arctic aurora borealis',
    preview: '🌌',
    treeColor: '#1a3830',
    snowAmount: 0.7,
    skyColor: '#050a14',
    groundColor: '#e0f0f8',
    fogColor: '#0a1a28',
    fogDensity: 0.018,
    ambientIntensity: 0.3,
    ambientColor: '#66ffcc',
    mainLightColor: '#ccffee',
    mainLightIntensity: 0.8,
    accentLightColor: '#00ff88',
    accentLightIntensity: 0.6,
    snowfall: true,
    snowfallIntensity: 0.8,
    starsVisible: true,
    ornamentColors: ['#66ffcc', '#ffffff', '#00ff88', '#88ddff', '#c0c0c0'],
  },

  candyLand: {
    id: 'candyLand',
    name: 'Candy Land',
    description: 'Sweet pink & pastel dream',
    preview: '🍭',
    treeColor: '#2d5a3d',
    snowAmount: 0.15,
    skyColor: '#1a0a14',
    groundColor: '#ffe8f0',
    fogColor: '#2d1a28',
    fogDensity: 0.012,
    ambientIntensity: 0.55,
    ambientColor: '#ffccdd',
    mainLightColor: '#fff0f5',
    mainLightIntensity: 1.1,
    accentLightColor: '#ff69b4',
    accentLightIntensity: 0.5,
    snowfall: true,
    snowfallIntensity: 0.25,
    starsVisible: true,
    ornamentColors: ['#ff69b4', '#ff1493', '#ffd700', '#ffffff', '#ff6b6b'],
  },
};

export const DEFAULT_THEME = SCENE_THEMES.classicChristmas;

export type ThemeId = keyof typeof SCENE_THEMES;
