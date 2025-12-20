/**
 * RARE 4N - Voice Operating System
 * Advanced voice interaction with emotion, dialect, and auto-learning
 */

import { RAREEmotionEngine, Emotion, EmotionResult } from './RAREEmotionEngine';
import { RAREDialectEngine, Dialect } from './RAREDialectEngine';

export interface VoiceInput {
  text: string;
  audioAnalysis?: {
    pitch?: number;
    volume?: number;
    speed?: number;
    tone?: string;
  };
  context?: any;
}

export interface VoiceOutput {
  text: string;
  voiceSettings: {
    voice: string;
    pitch: number;
    speed: number;
    stability: number;
  };
  emotion: Emotion;
  dialect: Dialect;
  metadata: {
    emotionConfidence: number;
    dialectDetected: Dialect;
    adjustmentsApplied: string[];
  };
}

export class RAREVoiceOS {
  private emotionEngine: RAREEmotionEngine;
  private dialectEngine: RAREDialectEngine;
  
  // Voice memory
  private voiceMemory = {
    preferredPitch: 1.0,
    preferredSpeed: 1.0,
    preferredDialect: 'egy-tech' as Dialect,
    preferredVoice: 'Rachel'
  };

  constructor() {
    this.emotionEngine = new RAREEmotionEngine();
    this.dialectEngine = new RAREDialectEngine();
  }

  /**
   * Main voice processing pipeline
   */
  async process(input: VoiceInput, personaSettings?: any): Promise<VoiceOutput> {
    // 1. Detect emotion from text and audio
    const textEmotion = this.emotionEngine.detectFromText(input.text);
    const audioEmotion = input.audioAnalysis 
      ? this.emotionEngine.detectFromAudio(input.audioAnalysis)
      : textEmotion;
    
    const finalEmotion = this.emotionEngine.mergeEmotions(textEmotion, audioEmotion);

    // 2. Detect dialect
    const detectedDialect = this.dialectEngine.detect(input.text);
    this.dialectEngine.setDialect(detectedDialect);

    // 3. Get voice adjustments based on emotion
    const emotionAdjustments = this.emotionEngine.getVoiceAdjustments(
      finalEmotion.emotion,
      finalEmotion.intensity
    );

    // 4. Combine with persona settings
    const baseSettings = personaSettings?.voiceSettings || {
      pitch: 1.0,
      speed: 1.0,
      stability: 0.75
    };

    // 5. Apply memory (learned preferences)
    const finalSettings = {
      voice: this.voiceMemory.preferredVoice,
      pitch: this.blend(
        baseSettings.pitch,
        emotionAdjustments.pitch,
        this.voiceMemory.preferredPitch
      ),
      speed: this.blend(
        baseSettings.speed,
        emotionAdjustments.speed,
        this.voiceMemory.preferredSpeed
      ),
      stability: emotionAdjustments.stability
    };

    // 6. Prepare output
    const output: VoiceOutput = {
      text: input.text, // Will be styled by personality later
      voiceSettings: finalSettings,
      emotion: finalEmotion.emotion,
      dialect: detectedDialect,
      metadata: {
        emotionConfidence: finalEmotion.confidence,
        dialectDetected: detectedDialect,
        adjustmentsApplied: [
          `Emotion: ${finalEmotion.emotion} (${(finalEmotion.intensity * 100).toFixed(0)}%)`,
          `Dialect: ${this.dialectEngine.getDialectName()}`,
          `Pitch: ${finalSettings.pitch.toFixed(2)}`,
          `Speed: ${finalSettings.speed.toFixed(2)}`
        ]
      }
    };

    return output;
  }

  /**
   * Learn from user interaction
   */
  learn(feedback: {
    liked?: boolean;
    voiceSettings?: any;
    dialect?: Dialect;
  }) {
    if (feedback.voiceSettings) {
      // Adjust memory towards user preferences
      if (feedback.liked) {
        this.voiceMemory.preferredPitch = this.smoothUpdate(
          this.voiceMemory.preferredPitch,
          feedback.voiceSettings.pitch,
          0.1
        );
        this.voiceMemory.preferredSpeed = this.smoothUpdate(
          this.voiceMemory.preferredSpeed,
          feedback.voiceSettings.speed,
          0.1
        );
      }
    }

    if (feedback.dialect) {
      this.voiceMemory.preferredDialect = feedback.dialect;
    }
  }

  /**
   * Detect mood from conversation patterns
   */
  detectMood(recentInputs: VoiceInput[]): {
    mood: 'stressed' | 'low-energy' | 'tired' | 'high-energy' | 'alert';
    confidence: number;
  } {
    if (recentInputs.length === 0) {
      return { mood: 'alert', confidence: 0.5 };
    }

    // Analyze recent emotions
    const emotions = recentInputs.map(input => 
      this.emotionEngine.detectFromText(input.text)
    );

    const avgSpeed = recentInputs.reduce((sum, input) => 
      sum + (input.audioAnalysis?.speed || 1.0), 0
    ) / recentInputs.length;

    const avgVolume = recentInputs.reduce((sum, input) => 
      sum + (input.audioAnalysis?.volume || 0.5), 0
    ) / recentInputs.length;

    // Stressed: multiple urgent emotions, high speed
    const stressedCount = emotions.filter(e => e.emotion === 'stressed').length;
    if (stressedCount > recentInputs.length / 2 || avgSpeed > 1.3) {
      return { mood: 'stressed', confidence: 0.85 };
    }

    // Tired: low energy, slow speech
    if (avgSpeed < 0.8 && avgVolume < 0.4) {
      return { mood: 'tired', confidence: 0.8 };
    }

    // High energy: excited, fast
    const excitedCount = emotions.filter(e => e.emotion === 'excited').length;
    if (excitedCount > 1 && avgSpeed > 1.1) {
      return { mood: 'high-energy', confidence: 0.82 };
    }

    // Low energy: sad emotions, slow
    const sadCount = emotions.filter(e => e.emotion === 'sad').length;
    if (sadCount > 1 || avgSpeed < 0.9) {
      return { mood: 'low-energy', confidence: 0.75 };
    }

    // Default: alert
    return { mood: 'alert', confidence: 0.7 };
  }

  /**
   * Get adaptive response based on mood
   */
  getAdaptiveResponse(mood: string): {
    energyLevel: number;
    supportiveness: number;
    briefness: number;
  } {
    const responses: Record<string, any> = {
      stressed: { energyLevel: 0.7, supportiveness: 0.9, briefness: 0.8 },
      tired: { energyLevel: 0.5, supportiveness: 0.8, briefness: 0.9 },
      'low-energy': { energyLevel: 0.6, supportiveness: 0.7, briefness: 0.7 },
      'high-energy': { energyLevel: 1.0, supportiveness: 0.6, briefness: 0.5 },
      alert: { energyLevel: 0.8, supportiveness: 0.7, briefness: 0.6 }
    };

    return responses[mood] || responses.alert;
  }

  /**
   * Blend three values with weights
   */
  private blend(base: number, emotion: number, memory: number): number {
    return base * 0.5 + emotion * 0.3 + memory * 0.2;
  }

  /**
   * Smooth update for learning
   */
  private smoothUpdate(current: number, target: number, alpha: number): number {
    return current * (1 - alpha) + target * alpha;
  }

  /**
   * Get voice memory (for debugging/monitoring)
   */
  getVoiceMemory() {
    return { ...this.voiceMemory };
  }

  /**
   * Reset voice memory
   */
  resetMemory() {
    this.voiceMemory = {
      preferredPitch: 1.0,
      preferredSpeed: 1.0,
      preferredDialect: 'egy-tech',
      preferredVoice: 'Rachel'
    };
  }
}

