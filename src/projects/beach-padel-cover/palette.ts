/**
 * Beach Padel Cover — flat sunset palette.
 * Every colour is a single value: no gradients and no blending. Glass is built
 * from a low-opacity pane plus hard 1px highlights, so the 384x216 grid stays
 * crisp at the 5x integer upscale.
 */
export const C = {
  // sky, top to horizon (14 bands of 8 px)
  sky: [
    '#140c28',
    '#1c1033',
    '#25133c',
    '#301645',
    '#3c1a4d',
    '#4a1e54',
    '#59225b',
    '#6a2961',
    '#7e3165',
    '#943b68',
    '#ac4767',
    '#c55665',
    '#dd6a61',
    '#f0805c',
  ],
  horizon: '#ffa066',

  sun: ['#fff6cf', '#ffe9a6', '#ffd685', '#ffc06e', '#f5a25c'],

  sea: ['#ffb877', '#d97a67', '#9a4a63', '#5f3358', '#332a4a', '#1f2440'],
  foam: ['#ffe4b8', '#f0b184', '#b46f63'],

  beach: ['#d09a5e', '#c08a4e', '#a97342', '#8f5c35'],
  sand: ['#f0c07c', '#e8b46e', '#dda760', '#d29a56', '#c68d4c'],
  sandDark: '#a86935',
  sandDeep: '#8a5226',
  sandLight: '#ffd9a0',

  line: '#fff6e0',
  lineShade: '#d6ad7e',

  glass: {
    frame: '#233447',
    frameDark: '#16222f',
    frameLit: '#7fa7b8',
    pane: '#9ad7e2',
    shine: '#dff8ff',
    top: '#f2ffff',
  },

  net: { tape: '#fff6e0', tapeShade: '#ccbf9f', mesh: '#3a2b2e', post: '#233447' },

  teamA: {
    jersey: '#f0564a',
    light: '#ff8570',
    dark: '#b02f2f',
    shorts: '#263553',
    shortsLight: '#3d5278',
    skin: '#f0b184',
    skinLight: '#ffcfa6',
    skinDark: '#c08356',
    hair: '#2a1720',
    shoe: '#fff3e0',
    shoeShade: '#cfbfa4',
    racket: '#ffd166',
    faceDark: '#c99a2e',
    edge: '#1b2233',
    grip: '#2a3346',
  },

  teamB: {
    jersey: '#12b3ae',
    light: '#4fe0d3',
    dark: '#0a7679',
    shorts: '#f6ecd7',
    shortsLight: '#fff9ea',
    skin: '#f4bb8e',
    skinDark: '#c98a5d',
    skinLight: '#ffd5ae',
    hair: '#201828',
    shoe: '#26314a',
    shoeShade: '#172136',
    racket: '#e2b8ff',
    faceDark: '#a97fd6',
    edge: '#14202e',
    grip: '#1b2536',
  },

  ball: '#ffe14d',
  ballLight: '#fffbd6',
  ballShade: '#d3ae2c',
  ballLine: '#4a3212',

  cloud: '#ffb08a',
  cloudShade: '#d97a86',
  flash: '#fffdf2',
  flashWarm: '#ffe49a',
  dark: '#120a1e',
  ink: '#1a1026',
} as const;
