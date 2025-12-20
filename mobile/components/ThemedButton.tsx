/**
 * RARE 4N - Themed Button Component
 * ???? ???????? ?????? ??????????
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ThemedButtonProps) {
  const { theme, colors, styles: themeStyles } = useTheme();

  // Neumorphic button
  if (theme.buttonStyle === 'neumorphic') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.neumorphicButton,
          {
            bREMOVED: variant === 'primary' ? colors.primary : colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 3, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 6,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: variant === 'primary' ? '#FFFFFF' : colors.text,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  // Glass button
  if (theme.cardStyle === 'glass') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.glassButton,
          {
            bREMOVED: variant === 'primary' ? colors.primary + '40' : 'transparent',
            borderColor: colors.border,
            borderWidth: variant === 'outline' ? 1 : 0,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: colors.text,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  // 3D Glow button
  if (themeStyles.borderGlow) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.glowButton,
          {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 15,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={
            variant === 'primary'
              ? [colors.primary, colors.secondary]
              : [colors.surface, colors.surface]
          }
          style={styles.gradientButton}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: variant === 'primary' ? '#FFFFFF' : colors.text,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Default flat button
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.flatButton,
        {
          bREMOVED: variant === 'primary' ? colors.primary : 'transparent',
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: variant === 'primary' ? '#FFFFFF' : colors.text,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  neumorphicButton: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassButton: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatButton: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});



