/**
 * RARE 4N - Emotion Detection Engine
 * Detects emotions from text and audio
 */

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'confused' | 'stressed';

export interface EmotionResult {
  emotion: Emotion;
  confidence: number;
  intensity: number; // 0.0 - 1.0
  indicators: string[];
}

export class RAREEmotionEngine {
  /**
   * Detect emotion from text
   */
  detectFromText(text: string): EmotionResult {
    const lower = text.toLowerCase();
    
    // Happy indicators
    if (this.matchPattern(lower, ['😊', '😄', 'رائع', 'جميل', 'ممتاز', 'حلو', 'تمام', 'perfect', 'great', 'awesome'])) {
      return {
        emotion: 'happy',
        confidence: 0.9,
        intensity: 0.8,
        indicators: ['positive words', 'emojis']
      };
    }

    // Excited indicators
    if (this.matchPattern(lower, ['!', 'wow', 'amazing', 'يااااا', 'مذهل', 'عظيم']) || /!{2,}/.test(text)) {
      return {
        emotion: 'excited',
        confidence: 0.85,
        intensity: 0.9,
        indicators: ['exclamation marks', 'excitement words']
      };
    }

    // Sad indicators
    if (this.matchPattern(lower, ['😢', '😔', 'حزين', 'للأسف', 'مش عارف', 'sad', 'unfortunately'])) {
      return {
        emotion: 'sad',
        confidence: 0.88,
        intensity: 0.7,
        indicators: ['sadness words', 'negative sentiment']
      };
    }

    // Angry indicators
    if (this.matchPattern(lower, ['😡', 'غاضب', 'مش عاجبني', 'سيء', 'زعلان', 'angry', 'bad', 'terrible'])) {
      return {
        emotion: 'angry',
        confidence: 0.87,
        intensity: 0.75,
        indicators: ['anger words', 'negative intensity']
      };
    }

    // Confused indicators
    if (this.matchPattern(lower, ['🤔', 'ليه', 'ازاي', 'مش فاهم', 'what', 'why', 'how', '؟؟'])) {
      return {
        emotion: 'confused',
        confidence: 0.82,
        intensity: 0.6,
        indicators: ['question words', 'uncertainty']
      };
    }

    // Stressed indicators
    if (this.matchPattern(lower, ['سريع', 'عاجل', 'urgent', 'quickly', 'asap', 'help'])) {
      return {
        emotion: 'stressed',
        confidence: 0.8,
        intensity: 0.7,
        indicators: ['urgency words', 'time pressure']
      };
    }

    // Default: neutral
    return {
      emotion: 'neutral',
      confidence: 0.75,
      intensity: 0.5,
      indicators: ['no strong indicators']
    };
  }

  /**
   * Detect emotion from audio analysis
   */
  detectFromAudio(audioAnalysis: {
    pitch?: number;
    volume?: number;
    speed?: number;
    tone?: string;
  }): EmotionResult {
    const { pitch = 1.0, volume = 0.5, speed = 1.0, tone = 'neutral' } = audioAnalysis;

    // High pitch + high volume = excited or angry
    if (pitch > 1.2 && volume > 0.7) {
      if (speed > 1.3) {
        return {
          emotion: 'excited',
          confidence: 0.85,
          intensity: 0.9,
          indicators: ['high pitch', 'high volume', 'fast speech']
        };
      }
      return {
        emotion: 'angry',
        confidence: 0.82,
        intensity: 0.8,
        indicators: ['high pitch', 'high volume']
      };
    }

    // Low pitch + low volume = sad
    if (pitch < 0.8 && volume < 0.4) {
      return {
        emotion: 'sad',
        confidence: 0.8,
        intensity: 0.7,
        indicators: ['low pitch', 'low volume']
      };
    }

    // Moderate with variations = happy
    if (pitch > 1.0 && volume > 0.5 && speed < 1.2) {
      return {
        emotion: 'happy',
        confidence: 0.78,
        intensity: 0.7,
        indicators: ['warm pitch', 'good volume']
      };
    }

    // Fast speech + moderate volume = stressed
    if (speed > 1.4 && volume > 0.6) {
      return {
        emotion: 'stressed',
        confidence: 0.76,
        intensity: 0.75,
        indicators: ['fast speech', 'moderate-high volume']
      };
    }

    return {
      emotion: 'neutral',
      confidence: 0.7,
      intensity: 0.5,
      indicators: ['normal audio parameters']
    };
  }

  /**
   * Merge text and audio emotion detection
   */
  mergeEmotions(textEmotion: EmotionResult, audioEmotion: EmotionResult): EmotionResult {
    // Weighted average (text 60%, audio 40%)
    const textWeight = 0.6;
    const audioWeight = 0.4;

    // If both agree, high confidence
    if (textEmotion.emotion === audioEmotion.emotion) {
      return {
        emotion: textEmotion.emotion,
        confidence: 0.95,
        intensity: (textEmotion.intensity + audioEmotion.intensity) / 2,
        indicators: [...textEmotion.indicators, ...audioEmotion.indicators]
      };
    }

    // If disagree, use weighted confidence
    const textScore = textEmotion.confidence * textWeight;
    const audioScore = audioEmotion.confidence * audioWeight;

    if (textScore > audioScore) {
      return {
        ...textEmotion,
        confidence: textScore,
        indicators: [...textEmotion.indicators, 'text priority']
      };
    }

    return {
      ...audioEmotion,
      confidence: audioScore,
      indicators: [...audioEmotion.indicators, 'audio priority']
    };
  }

  /**
   * Get voice adjustments based on emotion
   */
  getVoiceAdjustments(emotion: Emotion, intensity: number): {
    pitch: number;
    speed: number;
    stability: number;
  } {
    const adjustments: Record<Emotion, any> = {
      happy: { pitch: 1.05, speed: 1.0, stability: 0.8 },
      excited: { pitch: 1.15, speed: 1.2, stability: 0.6 },
      sad: { pitch: 0.92, speed: 0.85, stability: 0.9 },
      angry: { pitch: 0.88, speed: 1.1, stability: 0.7 },
      confused: { pitch: 1.0, speed: 0.9, stability: 0.85 },
      stressed: { pitch: 1.08, speed: 1.3, stability: 0.65 },
      neutral: { pitch: 1.0, speed: 1.0, stability: 0.75 }
    };

    const base = adjustments[emotion];
    
    // Apply intensity scaling
    return {
      pitch: 1.0 + (base.pitch - 1.0) * intensity,
      speed: 1.0 + (base.speed - 1.0) * intensity,
      stability: base.stability
    };
  }

  /**
   * Helper: Match text against patterns
   */
  private matchPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern.toLowerCase()));
  }
}
