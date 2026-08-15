// Themes applied to the whole page via data-theme on <html>.
// Each theme provides accent/text/marker colors for LineSidebar
// plus a Topography palette.
export const THEMES = [
  {
    id: 'amethyst',
    name: 'AMETHYST',
    swatch: ['#1e0a3c', '#A855F7', '#f0abfc', '#08080a'],
    sidebar:   { accent: '#A855F7', text: '#c4c4c4', marker: '#6c6c6c' },
    topography: { lowColor: '#1e0a3c', midColor: '#7c3aed', highColor: '#f0abfc' }
  },
  {
    id: 'arcade',
    name: 'ARCADE',
    swatch: ['#0a0a18', '#00d9ff', '#ffdd00', '#ff3e88'],
    sidebar:   { accent: '#00d9ff', text: '#c8c8e0', marker: '#4a4a7a' },
    topography: { lowColor: '#0a0a18', midColor: '#00d9ff', highColor: '#ffdd00' }
  },
  {
    id: 'gameboy',
    name: 'GAMEBOY',
    swatch: ['#0f380f', '#306230', '#8bac0f', '#cadc9f'],
    sidebar:   { accent: '#8bac0f', text: '#cadc9f', marker: '#306230' },
    topography: { lowColor: '#0f380f', midColor: '#306230', highColor: '#cadc9f' }
  },
  {
    id: 'cyberpunk',
    name: 'CYBERPUNK',
    swatch: ['#0d0015', '#ff00ea', '#00ffea', '#ff0066'],
    sidebar:   { accent: '#ff00ea', text: '#e0c0ff', marker: '#4a2a5a' },
    topography: { lowColor: '#0d0015', midColor: '#ff00ea', highColor: '#00ffea' }
  },
  {
    id: 'vaporwave',
    name: 'VAPORWAVE',
    swatch: ['#1a0033', '#ff66cc', '#00f0ff', '#ffcc00'],
    sidebar:   { accent: '#ff66cc', text: '#e0d0ff', marker: '#4a3a5a' },
    topography: { lowColor: '#1a0033', midColor: '#ff66cc', highColor: '#00f0ff' }
  }
];
