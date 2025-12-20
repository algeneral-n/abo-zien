/**
 * RARE 4N - RARE Character Component
 * الشخصية الرئيسية - RARE Character
 */

import React from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RARECharacterProps {
  size?: number;
  animation?: 'idle' | 'thinking' | 'speaking' | 'listening' | 'reacting';
  emotion?: any;
}

export default function RARECharacter({ 
  size = 180, 
  animation = 'idle',
  emotion 
}: RARECharacterProps) {
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (animation === 'listening' || animation === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0.3);
    }
  }, [animation]);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.5,
            height: size * 1.5,
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(0, 234, 255, 0.3)', 'rgba(0, 234, 255, 0)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.character,
          {
            width: size,
            height: size,
            transform: [
              { translateY: floatTranslate },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <Image
          source={require('../assets/character/rare-hero.png')}
          style={[styles.characterImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
  },
  character: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    borderRadius: 1000,
    overflow: 'hidden',
  },
});

