/**
 * RARE 4N - Cognitive Loop Hook
 * UI يبعث input → UI يسمع events
 * UI لا ينفذ أي منطق
 */

import { useState, useEffect, useCallback } from 'react';
import { RAREKernel } from '../../core/RAREKernel';
import { CognitiveLoop, CognitiveDecision } from '../../core/CognitiveLoop';
import { KernelEvent } from '../../core/RAREKernel';
import { Emotion, Intent } from '../../core/ContextStore';

export interface CognitiveLoopState {
  currentEmotion: Emotion | null;
  currentIntent: Intent | null;
  lastDecision: CognitiveDecision | null;
  isLoading: boolean;
  error: string | null;
}

export function useCognitiveLoop() {
  const [state, setState] = useState<CognitiveLoopState>({
    currentEmotion: null,
    currentIntent: null,
    lastDecision: null,
    isLoading: false,
    error: null,
  });

  const kernel = RAREKernel.getInstance();
  const cognitiveLoop = CognitiveLoop.getInstance();

  useEffect(() => {
    // Initialize Cognitive Loop if not already initialized
    if (!kernel || !cognitiveLoop) {
      console.warn('useCognitiveLoop: Kernel or CognitiveLoop not available');
      return;
    }

    // Subscribe to Cognitive Loop events
    const unsubscribeDecision = kernel.on('cognitive:decision', (event: KernelEvent) => {
      setState(prev => ({
        ...prev,
        lastDecision: event.data as CognitiveDecision,
        isLoading: false,
      }));
    });

    const unsubscribeError = kernel.on('cognitive:error', (event: KernelEvent) => {
      setState(prev => ({
        ...prev,
        error: event.data?.error || 'Unknown error',
        isLoading: false,
      }));
    });

    const unsubscribeEmotion = kernel.on('emotion:detected', (event: KernelEvent) => {
      setState(prev => ({
        ...prev,
        currentEmotion: event.data as Emotion,
      }));
    });

    const unsubscribeIntent = kernel.on('intent:recognized', (event: KernelEvent) => {
      setState(prev => ({
        ...prev,
        currentIntent: event.data as Intent,
      }));
    });

    // Initialize Cognitive Loop
    cognitiveLoop.init(kernel).catch((error) => {
      console.error('useCognitiveLoop: Failed to initialize CognitiveLoop:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize Cognitive Loop',
      }));
    });

    return () => {
      unsubscribeDecision();
      unsubscribeError();
      unsubscribeEmotion();
      unsubscribeIntent();
    };
  }, []);

  /**
   * Send input to Cognitive Loop
   * UI يبعث فقط - لا ينفذ
   */
  const sendInput = useCallback(async (input: { text?: string; audio?: string; type?: string }) => {
    if (!kernel || !cognitiveLoop) {
      console.warn('useCognitiveLoop: Kernel or CognitiveLoop not available');
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Send to Kernel → Cognitive Loop
      kernel.emit({
        type: 'user:input',
        data: input,
      });

      // Process via Cognitive Loop
      const decision = await cognitiveLoop.processInput(input);
      
      setState(prev => ({
        ...prev,
        lastDecision: decision,
        isLoading: false,
      }));

      return decision;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to process input',
        isLoading: false,
      }));
      return null;
    }
  }, [kernel, cognitiveLoop]);

  return {
    state,
    sendInput,
  };
}


