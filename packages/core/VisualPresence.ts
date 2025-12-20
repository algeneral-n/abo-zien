/**
 * RARE 4N - Visual Presence System
 * نظام الحضور البصري - RARE Character دائم الحضور
 */

import { RAREKernel } from './RAREKernel';
import { ContextStore, Emotion } from './ContextStore';
import { Animated } from 'react-native';

export interface SystemState {
  kernel: 'initializing' | 'running' | 'paused' | 'stopped';
  ai: 'idle' | 'thinking' | 'responding' | 'listening';
  emotion: Emotion | null;
  activity: string;
}

export interface VisualState {
  characterVisible: boolean;
  characterAnimation: 'idle' | 'thinking' | 'speaking' | 'listening' | 'reacting';
  emotion: Emotion | null;
  glowIntensity: number;
  motion: {
    float: number;
    pulse: number;
  };
}

export class VisualPresence {
  private static instance: VisualPresence;
  private kernel: RAREKernel | null = null;
  private contextStore: ContextStore;
  private currentState: VisualState;
  private animationValues: {
    float: Animated.Value;
    pulse: Animated.Value;
    glow: Animated.Value;
  };

  private constructor() {
    this.contextStore = ContextStore.getInstance();
    this.currentState = this.createDefaultState();
    this.animationValues = {
      float: new Animated.Value(0),
      pulse: new Animated.Value(1),
      glow: new Animated.Value(0.3),
    };
  }

  static getInstance(): VisualPresence {
    if (!VisualPresence.instance) {
      VisualPresence.instance = new VisualPresence();
    }
    return VisualPresence.instance;
  }

  /**
   * Initialize visual presence
   */
  init(kernel: RAREKernel): void {
    this.kernel = kernel;

    // Subscribe to kernel events
    kernel.on('kernel:started', () => {
      this.updateState({ characterVisible: true, characterAnimation: 'idle' });
    });

    kernel.on('ai:response', (event) => {
      this.reactToEvent('ai:response', event.data);
    });

    kernel.on('emotion:detected', (event) => {
      this.animateEmotion(event.data);
    });

    kernel.on('intent:recognized', (event) => {
      this.reactToEvent('intent:recognized', event.data);
    });

    kernel.on('voice:wake', () => {
      this.updateState({ characterAnimation: 'listening' });
    });

    kernel.on('context:updated', (event) => {
      this.updatePresence(event.data);
    });

    // Start continuous animations
    this.startContinuousAnimations();
  }

  /**
   * Show character with state
   */
  showCharacter(state: SystemState): void {
    let animation: VisualState['characterAnimation'] = 'idle';

    switch (state.ai) {
      case 'thinking':
        animation = 'thinking';
        break;
      case 'responding':
        animation = 'speaking';
        break;
      case 'listening':
        animation = 'listening';
        break;
    }

    this.updateState({
      characterVisible: true,
      characterAnimation: animation,
      emotion: state.emotion,
    });
  }

  /**
   * Animate emotion
   */
  animateEmotion(emotion: Emotion): void {
    this.updateState({ emotion });

    // Adjust animations based on emotion
    switch (emotion.type) {
      case 'happy':
      case 'excited':
        this.animationValues.pulse.setValue(1.1);
        this.animationValues.glow.setValue(0.7);
        break;
      case 'concerned':
        this.animationValues.pulse.setValue(0.95);
        this.animationValues.glow.setValue(0.4);
        break;
      case 'focused':
        this.animationValues.pulse.setValue(1.0);
        this.animationValues.glow.setValue(0.5);
        break;
      default:
        this.animationValues.pulse.setValue(1.0);
        this.animationValues.glow.setValue(0.3);
    }
  }

  /**
   * React to kernel events
   */
  reactToEvent(eventType: string, data: any): void {
    switch (eventType) {
      case 'ai:response':
        this.updateState({ characterAnimation: 'speaking' });
        // Brief reaction animation
        Animated.sequence([
          Animated.timing(this.animationValues.pulse, {
            toValue: 1.15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(this.animationValues.pulse, {
            toValue: 1.0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'intent:recognized':
        if (data.type === 'command') {
          this.updateState({ characterAnimation: 'reacting' });
        }
        break;

      case 'voice:wake':
        this.updateState({ characterAnimation: 'listening' });
        // Listening animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(this.animationValues.glow, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(this.animationValues.glow, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
    }
  }

  /**
   * Update presence based on context
   */
  updatePresence(context: any): void {
    const emotion = context.currentEmotion || context.memory?.emotionalState?.average;
    if (emotion) {
      this.animateEmotion(emotion);
    }

    // Update based on situation
    const needs = context.ambient?.needs || [];
    if (needs.includes('quiet_mode')) {
      this.updateState({ characterAnimation: 'idle' });
      this.animationValues.glow.setValue(0.2);
    }
  }

  /**
   * Get current visual state
   */
  getState(): VisualState {
    return { ...this.currentState };
  }

  /**
   * Get animation values
   */
  getAnimationValues() {
    return this.animationValues;
  }

  /**
   * Start continuous animations
   */
  private startContinuousAnimations(): void {
    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.animationValues.float, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(this.animationValues.float, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation (subtle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.animationValues.pulse, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(this.animationValues.pulse, {
          toValue: 1.0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  /**
   * Update state
   */
  private updateState(updates: Partial<VisualState>): void {
    this.currentState = { ...this.currentState, ...updates };
  }

  /**
   * Create default state
   */
  private createDefaultState(): VisualState {
    return {
      characterVisible: false,
      characterAnimation: 'idle',
      emotion: null,
      glowIntensity: 0.3,
      motion: {
        float: 0,
        pulse: 1,
      },
    };
  }
}

