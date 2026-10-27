import { useIdeaStore } from '../store/useIdeaStore';

export interface ThemeColors {
  bg: string;
  bgGradient: [string, string];
  card: string;
  cardBorder: string;
  cardSecondary: string;
  cardHighlight: string;
  text: string;
  textSecondary: string;
  muted: string;
  primary: string;
  primaryEnd: string;
  accent: string;
  accentGlow: string;
  gradient: [string, string];
  gradients: {
    primary: [string, string];
    card: [string, string];
    surface: [string, string];
    gold: [string, string];
    silver: [string, string];
    bronze: [string, string];
    accent: [string, string];
    success: [string, string];
    shimmer: [string, string, string, string, string];
  };
  tabBar: {
    bg: string;
    border: string;
    activeText: string;
    inactiveText: string;
    pillBg: string;
  };
  shadow: {
    color: string;
    soft: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    glow: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    card: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  success: string;
  danger: string;
  gold: string;
  silver: string;
  bronze: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  overlay: string;
  outerBg: string;
}

export const darkColors: ThemeColors = {
  bg: '#0A0618',
  bgGradient: ['#0A0618', '#110C24'],
  card: '#161033',
  cardBorder: '#2A1F52',
  cardSecondary: '#1F1744',
  cardHighlight: '#291F5B',
  text: '#F8FAFC',
  textSecondary: '#A78BFA',
  muted: '#94A3B8',
  primary: '#8B5CF6',
  primaryEnd: '#06B6D4',
  accent: '#06B6D4',
  accentGlow: 'rgba(6, 182, 212, 0.45)',
  gradient: ['#8B5CF6', '#06B6D4'],
  gradients: {
    primary: ['#8B5CF6', '#06B6D4'],
    card: ['#1A1238', '#140D2D'],
    surface: ['#1F1744', '#150E33'],
    gold: ['#F59E0B', '#D97706'],
    silver: ['#94A3B8', '#64748B'],
    bronze: ['#F97316', '#EA580C'],
    accent: ['#06B6D4', '#3B82F6'],
    success: ['#10B981', '#059669'],
    shimmer: [
      'transparent',
      'rgba(139, 92, 246, 0.25)',
      'rgba(6, 182, 212, 0.4)',
      'rgba(139, 92, 246, 0.25)',
      'transparent',
    ],
  },
  tabBar: {
    bg: 'rgba(22, 16, 51, 0.92)',
    border: 'rgba(139, 92, 246, 0.35)',
    activeText: '#FFFFFF',
    inactiveText: '#94A3B8',
    pillBg: 'rgba(139, 92, 246, 0.25)',
  },
  shadow: {
    color: '#8B5CF6',
    soft: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 6,
    },
    glow: {
      shadowColor: '#06B6D4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 5,
    },
  },
  success: '#10B981',
  danger: '#EF4444',
  gold: '#FBBF24',
  silver: '#CBD5E1',
  bronze: '#F97316',
  inputBg: 'rgba(22, 16, 51, 0.75)',
  inputBorder: '#2E2259',
  inputFocusBorder: '#8B5CF6',
  overlay: 'rgba(5, 3, 14, 0.85)',
  outerBg: '#05030E',
};

export const lightColors: ThemeColors = {
  bg: '#F6F4FF', // off-white lavender background
  bgGradient: ['#F6F4FF', '#ECE8FF'],
  card: '#FFFFFF',
  cardBorder: '#E2DCF8',
  cardSecondary: '#F1ECFD',
  cardHighlight: '#EDE6FD',
  text: '#0F172A', // dark navy text with strong contrast
  textSecondary: '#6D28D9',
  muted: '#64748B',
  primary: '#7C3AED',
  primaryEnd: '#0891B2',
  accent: '#0891B2',
  accentGlow: 'rgba(8, 145, 178, 0.3)',
  gradient: ['#7C3AED', '#0891B2'],
  gradients: {
    primary: ['#7C3AED', '#0891B2'],
    card: ['#FFFFFF', '#F8F6FF'],
    surface: ['#F8F6FF', '#F1ECFD'],
    gold: ['#F59E0B', '#D97706'],
    silver: ['#94A3B8', '#64748B'],
    bronze: ['#F97316', '#EA580C'],
    accent: ['#0891B2', '#2563EB'],
    success: ['#059669', '#047857'],
    shimmer: [
      'transparent',
      'rgba(124, 58, 237, 0.18)',
      'rgba(8, 145, 178, 0.25)',
      'rgba(124, 58, 237, 0.18)',
      'transparent',
    ],
  },
  tabBar: {
    bg: 'rgba(255, 255, 255, 0.94)',
    border: 'rgba(124, 58, 237, 0.22)',
    activeText: '#FFFFFF',
    inactiveText: '#64748B',
    pillBg: 'rgba(124, 58, 237, 0.15)',
  },
  shadow: {
    color: '#6D28D9',
    soft: {
      shadowColor: '#6D28D9',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      elevation: 4,
    },
    glow: {
      shadowColor: '#0891B2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    card: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },
  },
  success: '#059669',
  danger: '#DC2626',
  gold: '#D97706',
  silver: '#64748B',
  bronze: '#EA580C',
  inputBg: 'rgba(255, 255, 255, 0.95)',
  inputBorder: '#E2DCF8',
  inputFocusBorder: '#7C3AED',
  overlay: 'rgba(15, 23, 42, 0.65)',
  outerBg: '#E8E3FA',
};

export const darkTheme = darkColors;
export const lightTheme = lightColors;

export function getSystemDefaultIsDark(): boolean {
  return false; // Default to Light mode
}

export function useTheme() {
  const isDarkMode = useIdeaStore((s) => s.isDarkMode);
  const toggleTheme = useIdeaStore((s) => s.toggleTheme);
  const colors = isDarkMode ? darkColors : lightColors;

  return {
    ...colors,
    theme: colors,
    isDarkMode: Boolean(isDarkMode),
    toggleTheme,
  };
}

export default {
  light: lightColors,
  dark: darkColors,
};
