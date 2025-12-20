/**
 * RARE 4N - Themed Card Component
 * ?????????? ?????????? ?????? ??????????
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur'; // Will be added if needed
import { useTheme } from '../hooks/useTheme';

interface ThemedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function ThemedCard({ children, style, variant = 'default' }: ThemedCardProps) {
  const { theme, colors, styles: themeStyles } = useTheme();

  // Neumorphic style
  if (theme.cardStyle === 'neumorphic') {
    return (
      <View
        style={[
          styles.neumorphicCard,
          {
            bREMOVED: colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Glassmorphism style
  if (theme.cardStyle === 'glass') {
    return (
      <View
        style={[
          styles.glassCard,
          {
            bREMOVED: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            opacity: 0.9,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Solid/Gradient style
  return (
    <View
      style={[
        styles.solidCard,
        {
          bREMOVED: colors.surface,
          borderColor: colors.border,
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        themeStyles.borderGlow && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  neumorphicCard: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 8,
  },
  glassContent: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  solidCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
});


