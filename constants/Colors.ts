type GradientConfig = {
  primary: [string, string];
  primaryLocations: [number, number];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  // Gradient colors used throughout the app
  gradient: {
    primary: ['#1354AD', '#1B114D'],
    primaryLocations: [0, 0.40],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } satisfies GradientConfig,
  // Text colors
  text: {
    primary: '#F1F5F9',
    secondary: '#E6FAFF',
    muted: '#708090',
  },
  // Background colors
  background: {
    primary: '#021A40',
    secondary: '#13203a',
    card: '#2B42B6',
  },
  // Accent colors
  accent: {
    primary: '#33CFFF',
    secondary: '#154FA6',
    tertiary: '#2E84FD',
  },
};
