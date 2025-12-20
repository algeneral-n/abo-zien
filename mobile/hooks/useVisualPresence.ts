/**
 * RARE 4N - Visual Presence Hook
 * ???????? emotion ??? ???????? intent ??? ???????? ?????????????? ??????
 */

import { useState, useEffect, useCallback } from 'react';
import { RAREKernel } from '../../core/RAREKernel';
import { KernelEvent } from '../../core/RAREKernel';
import { Emotion } from '../../core/ContextStore';

export interface VisualPresenceState {
  emotion: Emotion | null;
  charREMOVED: 'idle' | 'thinking' | 'speaking' | 'listening' | 'reacting';
  glowIntensity: number;
}

export function useVisualPresence() {
  const [state, setState] = useState<VisualPresenceState>({
    emotion: null,
    charREMOVED: 'idle',
    glowIntensity: 0.3,
  });

  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    if (!kernel) {
      console.warn('useVisualPresence: Kernel not available');
      return;
    }

    // Subscribe to emotion events
    const unsubscribeEmotion = kernel.on('emotion:detected', (event: KernelEvent) => {
      const emotion = event.data as Emotion;
      setState(prev => ({
        ...prev,
        emotion,
        charREMOVED: getAnimationFromEmotion(emotion),
        glowIntensity: emotion.intensity,
      }));
    });

    // Subscribe to intent events
    const unsubscribeIntent = kernel.on('intent:recognized', (event: KernelEvent) => {
      const intent = event.data;
      if (intent.type === 'voice_command') {
        setState(prev => ({
          ...prev,
          charREMOVED: 'listening',
          glowIntensity: 0.8,
        }));
      } else if (intent.type === 'build_app' || intent.type === 'research_query') {
        setState(prev => ({
          ...prev,
          charREMOVED: 'thinking',
          glowIntensity: 0.6,
        }));
      }
    });

    // Subscribe to agent execution events
    const unsubscribeAgentExecute = kernel.on('agent:*:execute', (event: KernelEvent) => {
      setState(prev => ({
        ...prev,
        charREMOVED: 'reacting',
        glowIntensity: 0.7,
      }));

      // Return to idle after 2 seconds
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          charREMOVED: 'idle',
          glowIntensity: 0.3,
        }));
      }, 2000);
    });

    // Subscribe to voice events
    const unsubscribeVoice = kernel.on('voice:listening', () => {
      setState(prev => ({
        ...prev,
        charREMOVED: 'listening',
        glowIntensity: 0.9,
      }));
    });

    const unsubscribeVoiceStop = kernel.on('voice:stopped_listening', () => {
      setState(prev => ({
        ...prev,
        charREMOVED: 'idle',
        glowIntensity: 0.3,
      }));
    });

    return () => {
      unsubscribeEmotion();
      unsubscribeIntent();
      unsubscribeAgentExecute();
      unsubscribeVoice();
      unsubscribeVoiceStop();
    };
  }, []);

  /**
   * Get animation from emotion
   */
  const getAnimationFromEmotion = (emotion: Emotion): 'idle' | 'thinking' | 'speaking' | 'listening' | 'reacting' => {
    switch (emotion.type) {
      case 'happy':
      case 'excited':
        return 'reacting';
      case 'focused':
        return 'thinking';
      case 'curious':
        return 'thinking';
      case 'concerned':
        return 'reacting';
      default:
        return 'idle';
    }
  };

  return state;
}



