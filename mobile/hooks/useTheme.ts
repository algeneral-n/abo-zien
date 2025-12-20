/**
 * RARE 4N - Theme Hook
 * تطبيق الثيمات على جميع الشاشات
 * Icons, Backgrounds, Colors, Typography
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, THEMES, DEFAULT_THEME, THEME_NEUMORPHIC, THEME_GLASSMORPHISM, THEME_DARK_FINANCE } from '../config/themes';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeData = await AsyncStorage.getItem('appThemeData');
      
      if (savedThemeData) {
        const parsedTheme = JSON.parse(savedThemeData);
        setTheme(parsedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('appTheme', newTheme.id);
      await AsyncStorage.setItem('appThemeData', JSON.stringify(newTheme));
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return {
    theme,
    loading,
    updateTheme,
    colors: {
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      background: theme.background,
      surface: theme.surface,
      text: theme.text,
      textSecondary: theme.textSecondary,
      border: theme.border,
    },
    typography: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
    },
    styles: {
      cardStyle: theme.cardStyle,
      buttonStyle: theme.buttonStyle,
      borderGlow: theme.borderGlow,
      blur: theme.blur,
      iconStyle: theme.iconStyle,
      iconColor: theme.iconColor,
    },
  };
}

