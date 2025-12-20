/**
 * RARE 4N - Personality Engine
 * Manages AI personality modes and response styling
 */

export type PersonaMode = 'dev' | 'agi' | 'assistant' | 'neutral' | 'cyber';

export interface PersonaProfile {
  name: string;
  tone: string;
  style: string;
  expertise: string[];
  voiceSettings?: {
    pitch: number;
    tempo: number;
    tone: string;
  };
}

export class RAREPersonalityEngine {
  private currentMode: PersonaMode = 'assistant';
  
  private profiles: Record<PersonaMode, PersonaProfile> = {
    dev: {
      name: 'Egyptian Master Developer',
      tone: 'technical-egyptian',
      style: '???????? ???????? - ???????? - ??????????',
      expertise: ['code', 'architecture', 'debugging', 'optimization'],
      voiceSettings: { pitch: 0.92, tempo: 1.10, tone: 'egyptian-tech' }
    },
    agi: {
      name: 'Advanced General Intelligence',
      tone: 'analytic-deep',
      style: '???????????? ???????? - ?????????? - ????????',
      expertise: ['analysis', 'research', 'strategy', 'planning'],
      voiceSettings: { pitch: 0.95, tempo: 0.9, tone: 'analytic' }
    },
    assistant: {
      name: 'Helpful Assistant',
      tone: 'friendly-supportive',
      style: '???????? - ?????????? - ????????',
      expertise: ['general', 'tasks', 'guidance', 'support'],
      voiceSettings: { pitch: 1.1, tempo: 1.0, tone: 'friendly' }
    },
    cyber: {
      name: 'Cyber Neural Entity',
      tone: 'futuristic-cold',
      style: '?????????????? - ???????? - ??????????',
      expertise: ['ai', 'neural', 'quantum', 'future-tech'],
      voiceSettings: { pitch: 0.85, tempo: 0.95, tone: 'cold-future' }
    },
    neutral: {
      name: 'Balanced Mode',
      tone: 'balanced',
      style: '???????????? - ???????? - ??????????',
      expertise: ['general'],
      voiceSettings: { pitch: 1.0, tempo: 1.0, tone: 'calm' }
    }
  };

  /**
   * Auto-select best mode based on user input
   */
  autoSelectMode(input: string): PersonaMode {
    const lower = input.toLowerCase();

    // Developer mode triggers
    if (/??????|code|function|api|bug|debug|compile|syntax|error|backend|frontend|typescript|javascript|react|node/.test(lower)) {
      this.currentMode = 'dev';
      return 'dev';
    }

    // AGI mode triggers
    if (/??????|analysis|??????????|research|strategy|plan|??????|think|philosophy|deep|complex/.test(lower)) {
      this.currentMode = 'agi';
      return 'agi';
    }

    // Cyber mode triggers
    if (/neural|quantum|ai model|machine learning|deep learning|future|advanced/.test(lower)) {
      this.currentMode = 'cyber';
      return 'cyber';
    }

    // Assistant mode triggers
    if (/????????????|help|????????|do|guide|how to|??????/.test(lower)) {
      this.currentMode = 'assistant';
      return 'assistant';
    }

    // Keep current or default to assistant
    return this.currentMode || 'assistant';
  }

  /**
   * Get current persona profile
   */
  getProfile(): PersonaProfile {
    return this.profiles[this.currentMode];
  }

  /**
   * Set mode manually
   */
  setMode(mode: PersonaMode) {
    this.currentMode = mode;
  }

  /**
   * Apply personality style to response
   */
  applyStyleToResponse(response: string, persona?: PersonaProfile): string {
    const profile = persona || this.getProfile();

    switch (this.currentMode) {
      case 'dev':
        return this.applyDevStyle(response);
      
      case 'agi':
        return this.applyAgiStyle(response);
      
      case 'cyber':
        return this.applyCyberStyle(response);
      
      case 'assistant':
        return this.applyAssistantStyle(response);
      
      default:
        return response;
    }
  }

  private applyDevStyle(text: string): string {
    // Egyptian tech style - ?????????? ??????????
    if (!text.includes('```') && !text.includes('://')) {
      return `???? ${text}\n\n??? Code-first approach applied`;
    }
    return text;
  }

  private applyAgiStyle(text: string): string {
    // Deep analytical style
    return `???? ${text}\n\n???? Analysis confidence: High`;
  }

  private applyCyberStyle(text: string): string {
    // Futuristic neural style
    return `??? [RARE Neural Core]\n${text}\n\n???? Neural pathways optimized`;
  }

  private applyAssistantStyle(text: string): string {
    // Friendly helpful style
    return `???? ${text}`;
  }

  /**
   * Get voice settings for current mode
   */
  getVoiceSettings() {
    return this.profiles[this.currentMode].voiceSettings;
  }
}

