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
  bg: '#090D16', // Obsidian midnight
  bgGradient: ['#090D16', '#0F172A'],
  card: '#0F172A',
  cardBorder: '#1E293B',
  cardSecondary: '#1E293B',
  cardHighlight: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  muted: '#64748B',
  primary: '#6366F1',
  primaryEnd: '#818CF8',
  accent: '#38BDF8',
  accentGlow: 'rgba(99, 102, 241, 0.35)',
  gradient: ['#6366F1', '#38BDF8'],
  gradients: {
    primary: ['#6366F1', '#4F46E5'],
    card: ['#0F172A', '#0B1120'],
    surface: ['#1E293B', '#0F172A'],
    gold: ['#F59E0B', '#D97706'],
    silver: ['#94A3B8', '#64748B'],
    bronze: ['#F97316', '#EA580C'],
    accent: ['#38BDF8', '#6366F1'],
    success: ['#10B981', '#059669'],
    shimmer: [
      'transparent',
      'rgba(99, 102, 241, 0.2)',
      'rgba(56, 189, 248, 0.35)',
      'rgba(99, 102, 241, 0.2)',
      'transparent',
    ],
  },
  tabBar: {
    bg: 'rgba(15, 23, 42, 0.95)',
    border: '#1E293B',
    activeText: '#F8FAFC',
    inactiveText: '#64748B',
    pillBg: 'rgba(99, 102, 241, 0.2)',
  },
  shadow: {
    color: '#6366F1',
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    glow: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  success: '#10B981',
  danger: '#EF4444',
  gold: '#FBBF24',
  silver: '#CBD5E1',
  bronze: '#F97316',
  inputBg: '#0F172A',
  inputBorder: '#1E293B',
  inputFocusBorder: '#6366F1',
  overlay: 'rgba(9, 13, 22, 0.85)',
  outerBg: '#05070D',
};

export const lightColors: ThemeColors = {
  bg: '#F8FAFC', // Slate 50 - clean, venture-grade enterprise background
  bgGradient: ['#F8FAFC', '#F1F5F9'],
  card: '#FFFFFF',
  cardBorder: '#E2E8F0', // Slate 200 crisp border
  cardSecondary: '#F1F5F9', // Slate 100
  cardHighlight: '#E2E8F0',
  text: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  muted: '#64748B', // Slate 500
  primary: '#4F46E5', // Venture Indigo 600
  primaryEnd: '#6366F1', // Indigo 500
  accent: '#0EA5E9', // Sky 500
  accentGlow: 'rgba(79, 70, 229, 0.15)',
  gradient: ['#4F46E5', '#6366F1'],
  gradients: {
    primary: ['#4F46E5', '#6366F1'],
    card: ['#FFFFFF', '#F8FAFC'],
    surface: ['#F8FAFC', '#F1F5F9'],
    gold: ['#F59E0B', '#D97706'],
    silver: ['#64748B', '#475569'],
    bronze: ['#EA580C', '#C2410C'],
    accent: ['#0EA5E9', '#2563EB'],
    success: ['#10B981', '#059669'],
    shimmer: [
      'transparent',
      'rgba(79, 70, 229, 0.08)',
      'rgba(14, 165, 233, 0.15)',
      'rgba(79, 70, 229, 0.08)',
      'transparent',
    ],
  },
  tabBar: {
    bg: 'rgba(255, 255, 255, 0.96)',
    border: '#E2E8F0',
    activeText: '#4F46E5',
    inactiveText: '#64748B',
    pillBg: '#EEF2FF',
  },
  shadow: {
    color: '#0F172A',
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    glow: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
  },
  success: '#10B981',
  danger: '#EF4444',
  gold: '#F59E0B',
  silver: '#64748B',
  bronze: '#EA580C',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputFocusBorder: '#4F46E5',
  overlay: 'rgba(15, 23, 42, 0.6)',
  outerBg: '#E2E8F0',
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
