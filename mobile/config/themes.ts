/**
 * RARE 4N - Themes System
 * ???????? ?????????????? ???????????? - ???????? ?????? ???? ?????? ???? ??????????????
 * Icons, Backgrounds, Colors, Styles
 * 
 * Theme 1: Neumorphic (Fitness Style)
 * Theme 2: Glassmorphism (Music Style)
 * Theme 3: Dark Finance (Dashboard Style)
 */

export interface Theme {
  id: string;
  name: string;
  nameAr: string;
  
  // Colors
  primary: string;
  secondary: string;
  accent: string;
  background: string[];
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  
  // Styles
  cardStyle: 'glass' | 'solid' | 'gradient' | 'neumorphic';
  buttonStyle: '3d-glow' | 'flat' | 'outline' | 'neumorphic';
  borderGlow: boolean;
  blur: number;
  
  // Icons
  iconStyle: 'filled' | 'outline' | 'gradient';
  iconColor: string;
  
  // Typography
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
}

// Theme 1: Neumorphic (Fitness Style)
export const THEME_NEUMORPHIC: Theme = {
  id: 'neumorphic',
  name: 'Neumorphic',
  nameAr: '??????????????????',
  primary: '#6C7CE7', // Soft purple-blue
  secondary: '#FF8A65', // Soft orange
  accent: '#81C784', // Soft green
  background: ['#E8ECF1', '#F0F4F8', '#E8ECF1'], // Light blue-grey gradient
  surface: '#F5F7FA', // Light grey surface
  text: '#2C3E50', // Dark blue-grey text
  textSecondary: '#7F8C8D', // Medium grey
  border: '#D5DBE1', // Light border
  cardStyle: 'neumorphic',
  buttonStyle: 'neumorphic',
  borderGlow: false,
  blur: 0,
  iconStyle: 'outline',
  iconColor: '#6C7CE7',
  fontFamily: 'System',
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
};

// Theme 2: Glassmorphism (Music Style)
export const THEME_GLASSMORPHISM: Theme = {
  id: 'glassmorphism',
  name: 'Glassmorphism',
  nameAr: '???????? ??????????????',
  primary: '#4A90E2', // Bright blue
  secondary: '#E94B8B', // Pink
  accent: '#FFD700', // Gold
  background: ['#1E3A5F', '#2D4A6B', '#1E3A5F'], // Dark blue gradient (mountain sky)
  surface: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
  text: '#FFFFFF', // White text
  textSecondary: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white
  border: 'rgba(255, 255, 255, 0.2)', // Semi-transparent border
  cardStyle: 'glass',
  buttonStyle: 'flat',
  borderGlow: false,
  blur: 20, // Frosted glass effect
  iconStyle: 'filled',
  iconColor: '#FFFFFF',
  fontFamily: 'System',
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
};

// Theme 3: Dark Finance (Dashboard Style)
export const THEME_DARK_FINANCE: Theme = {
  id: 'dark-finance',
  name: 'Dark Finance',
  nameAr: '???????? ????????',
  primary: '#FF6B35', // Orange
  secondary: '#4ECDC4', // Teal/Cyan
  accent: '#95E1D3', // Light green
  background: ['#0F1419', '#1A1F2E', '#0F1419'], // Dark blue-black gradient
  surface: '#1E2532', // Dark surface
  text: '#FFFFFF', // White text
  textSecondary: '#A0AEC0', // Light grey
  border: '#2D3748', // Dark border
  cardStyle: 'solid',
  buttonStyle: '3d-glow',
  borderGlow: true,
  blur: 0,
  iconStyle: 'filled',
  iconColor: '#FF6B35',
  fontFamily: 'System',
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
};

export const THEMES: Theme[] = [
  THEME_NEUMORPHIC,
  THEME_GLASSMORPHISM,
  THEME_DARK_FINANCE,
];

export const DEFAULT_THEME = THEME_NEUMORPHIC;

