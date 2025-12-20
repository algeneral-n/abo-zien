/**
 * RARE 4N - Context Store
 * ???????? ???????????? - ?????????????? ?????????????? ????????????????
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface Emotion {
  type: 'happy' | 'neutral' | 'focused' | 'curious' | 'concerned' | 'excited';
  intensity: number; // 0-1
  confidence: number; // 0-1
}

export interface Intent {
  type: string;
  confidence: number;
  parameters?: Record<string, any>;
}

export interface Interaction {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  emotion?: Emotion;
  intent?: Intent;
  context?: any;
}

export interface UserPreferences {
  language: string;
  voice: string;
  theme: string;
  autoVoice: boolean;
  [key: string]: any;
}

export interface BehavioralPattern {
  pattern: string;
  frequency: number;
  lastSeen: number;
}

export interface RAREContext {
  session: {
    id: string;
    startTime: number;
    interactions: Interaction[];
    currentEmotion: Emotion | null;
    currentIntent: Intent | null;
    situation: {
      time: string;
      location?: string;
      activity?: string;
    };
  };
  memory: {
    preferences: UserPreferences;
    patterns: BehavioralPattern[];
    history: Interaction[];
    emotionalState: {
      recent: Emotion[];
      average: Emotion;
    };
  };
  ambient: {
    time: {
      hour: number;
      dayOfWeek: number;
      isWeekend: boolean;
    };
    location?: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    activity?: string;
    needs: string[];
  };
}

export class ContextStore {
  private static instance: ContextStore;
  private context: RAREContext;
  private readonly CONTEXT_KEY = 'rare_context';
  private readonly MEMORY_KEY = 'rare_memory';

  private constructor() {
    this.context = this.createDefaultContext();
  }

  static getInstance(): ContextStore {
    if (!ContextStore.instance) {
      ContextStore.instance = new ContextStore();
    }
    return ContextStore.instance;
  }

  /**
   * Initialize context store
   */
  async init(): Promise<void> {
    // Load persisted context
    await this.loadContext();
    
    // Initialize session
    this.context.session.id = `session_${Date.now()}`;
    this.context.session.startTime = Date.now();
    
    // Update ambient awareness
    this.updateAmbientAwareness();
  }

  /**
   * Get current context
   */
  getContext(): RAREContext {
    return { ...this.context };
  }

  /**
   * Update context
   */
  updateContext(updates: Partial<RAREContext>): void {
    if (updates.session) {
      this.context.session = { ...this.context.session, ...updates.session };
    }
    if (updates.memory) {
      this.context.memory = { ...this.context.memory, ...updates.memory };
    }
    if (updates.ambient) {
      this.context.ambient = { ...this.context.ambient, ...updates.ambient };
    }

    // Persist changes
    this.persistContext();
  }

  /**
   * Add interaction
   */
  addInteraction(interaction: Interaction): void {
    this.context.session.interactions.push(interaction);
    
    // Update memory history (keep last 100)
    this.context.memory.history.push(interaction);
    if (this.context.memory.history.length > 100) {
      this.context.memory.history.shift();
    }

    // Update emotional state
    if (interaction.emotion) {
      this.context.memory.emotionalState.recent.push(interaction.emotion);
      if (this.context.memory.emotionalState.recent.length > 20) {
        this.context.memory.emotionalState.recent.shift();
      }
      this.updateAverageEmotion();
    }

    // Update patterns
    this.updatePatterns(interaction);

    this.persistContext();
  }

  /**
   * Update ambient awareness
   */
  updateAmbientAwareness(): void {
    const now = new Date();
    this.context.ambient.time = {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
    };

    // Anticipate needs based on time and context
    this.anticipateNeeds();
  }

  /**
   * Anticipate user needs
   */
  private anticipateNeeds(): void {
    const needs: string[] = [];
    const hour = this.context.ambient.time.hour;

    if (hour >= 6 && hour < 9) {
      needs.push('morning_greeting');
      needs.push('daily_summary');
    } else if (hour >= 12 && hour < 14) {
      needs.push('lunch_reminder');
    } else if (hour >= 18 && hour < 20) {
      needs.push('evening_summary');
    } else if (hour >= 22 || hour < 6) {
      needs.push('quiet_mode');
    }

    this.context.ambient.needs = needs;
  }

  /**
   * Update average emotion
   */
  private updateAverageEmotion(): void {
    const recent = this.context.memory.emotionalState.recent;
    if (recent.length === 0) return;

    const emotionCounts: Record<string, number> = {};
    let totalIntensity = 0;
    let totalConfidence = 0;

    recent.forEach(emotion => {
      emotionCounts[emotion.type] = (emotionCounts[emotion.type] || 0) + 1;
      totalIntensity += emotion.intensity;
      totalConfidence += emotion.confidence;
    });

    const mostCommon = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    this.context.memory.emotionalState.average = {
      type: mostCommon as Emotion['type'],
      intensity: totalIntensity / recent.length,
      confidence: totalConfidence / recent.length,
    };
  }

  /**
   * Update behavioral patterns
   */
  private updatePatterns(interaction: Interaction): void {
    // Simple pattern detection (can be enhanced)
    const pattern = `${interaction.intent?.type || 'unknown'}_${interaction.emotion?.type || 'neutral'}`;
    
    const existing = this.context.memory.patterns.find(p => p.pattern === pattern);
    if (existing) {
      existing.frequency++;
      existing.lastSeen = interaction.timestamp;
    } else {
      this.context.memory.patterns.push({
        pattern,
        frequency: 1,
        lastSeen: interaction.timestamp,
      });
    }

    // Keep top 20 patterns
    this.context.memory.patterns.sort((a, b) => b.frequency - a.frequency);
    this.context.memory.patterns = this.context.memory.patterns.slice(0, 20);
  }

  /**
   * Create default context
   */
  private createDefaultContext(): RAREContext {
    return {
      session: {
        id: '',
        startTime: Date.now(),
        interactions: [],
        currentEmotion: null,
        currentIntent: null,
        situation: {
          time: new Date().toISOString(),
        },
      },
      memory: {
        preferences: {
          language: 'ar',
          voice: 'rachel',
          theme: 'dark',
          autoVoice: true,
        },
        patterns: [],
        history: [],
        emotionalState: {
          recent: [],
          average: {
            type: 'neutral',
            intensity: 0.5,
            confidence: 0.5,
          },
        },
      },
      ambient: {
        time: {
          hour: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          isWeekend: false,
        },
        needs: [],
      },
    };
  }

  /**
   * Load context from storage
   */
  private async loadContext(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.CONTEXT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.context.memory = { ...this.context.memory, ...parsed.memory };
        this.context.memory.preferences = { ...this.context.memory.preferences, ...parsed.preferences };
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  }

  /**
   * Persist context to storage
   */
  private async persistContext(): Promise<void> {
    try {
      const toStore = {
        memory: this.context.memory,
        preferences: this.context.memory.preferences,
      };
      await AsyncStorage.setItem(this.CONTEXT_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to persist context:', error);
    }
  }
}


