/**
 * RARE 4N - Root Layout
 * Initialize Kernel and Cognitive Loop
 * Splash Screen with 4N animation
 */

import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { RAREKernel } from '../core/RAREKernel';
import { CognitiveLoop } from '../core/CognitiveLoop';
import { AwarenessSystem } from '../core/AwarenessSystem';
import { ConsciousnessEngine } from '../core/ConsciousnessEngine';

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    async function prepare() {
      try {
        // ??? Initialize step by step with error handling
        console.log('???? Starting initialization...');
        
        // ??? ?????????? ?????? initialization ???????????? ?????????? crash
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Step 1: Initialize Kernel (with try-catch for each step)
        let kernel;
        try {
          kernel = RAREKernel.getInstance();
          if (kernel && !kernel.getState().initialized) {
            await kernel.init();
            console.log('??? RAREKernel initialized');
          }
        } catch (error: any) {
          console.error('??? Kernel init error:', error?.message || error);
          // Continue anyway - app should still work
        }

        // Step 2: Initialize Cognitive Loop
        let cognitiveLoop;
        try {
          cognitiveLoop = CognitiveLoop.getInstance();
          if (kernel && cognitiveLoop) {
            await cognitiveLoop.init(kernel);
            console.log('??? CognitiveLoop initialized');
          }
        } catch (error: any) {
          console.error('??? CognitiveLoop init error:', error?.message || error);
          // Continue anyway
        }

        // Step 3: Start Kernel (optional - can fail)
        try {
          if (kernel && kernel.getState().initialized && !kernel.getState().running) {
            await kernel.start();
            console.log('??? System started');
          }
        } catch (error: any) {
          console.error('??? Kernel start error:', error?.message || error);
          // Continue anyway
        }

        // Step 4: Initialize Awareness System (optional)
        try {
          if (kernel) {
            const awarenessSystem = AwarenessSystem.getInstance();
            await awarenessSystem.init(kernel);
            console.log('??? AwarenessSystem initialized');
          }
        } catch (error: any) {
          console.error('??? AwarenessSystem init error:', error?.message || error);
          // Continue anyway
        }

        // Step 5: Initialize Consciousness Engine (optional)
        try {
          if (kernel && cognitiveLoop) {
            const consciousnessEngine = ConsciousnessEngine.getInstance();
            await consciousnessEngine.init(kernel, cognitiveLoop);
            console.log('??? ConsciousnessEngine initialized');
          }
        } catch (error: any) {
          console.error('??? ConsciousnessEngine init error:', error?.message || error);
          // Continue anyway
        }

        // ??? Always show splash animation even if initialization fails
        // Animate 4N text appearing from nothing (1.5 seconds)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start(async () => {
          // Wait a bit more then hide splash
          await new Promise(resolve => setTimeout(resolve, 300));
          setAppIsReady(true);
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            // Ignore splash screen errors
          }
          setShowSplash(false);
        });
      } catch (error: any) {
        console.error('??? Critical initialization error:', error?.message || error);
        // ??? Always show app even if initialization fails
        setAppIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // Ignore splash screen errors
        }
        setShowSplash(false);
      }
    }

    // ??? ?????????? ???????? ?????? ??????????
    setTimeout(() => {
      prepare();
    }, 50);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View
          style={[
            styles.splashContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.splashText}>4N</Text>
        </Animated.View>
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    bREMOVED: '#000000', // Dark background
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#00eaff', // Primary color
    letterSpacing: 8,
  },
});

