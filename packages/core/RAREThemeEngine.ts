/**
 * RARE 4N - Theme Engine
 * Manages themes, colors, and visual styling integrated with personality & emotion
 */

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  personality?: string; // Which persona uses this theme
  emotion?: string;     // Which emotion this theme represents
}

export class RAREThemeEngine {
  private currentTheme: string = 'cyber-cyan';
  
  // ?????????????? ????????????????
  private themes: Record<string, ThemeConfig> = {
    // Main RARE theme (?????????? ??????????????)
    'cyber-cyan': {
      id: 'cyber-cyan',
      name: 'Cyber Cyan',
      colors: {
        primary: '#00eaff',
        secondary: '#0ff',
        background: '#000408',
        text: '#ffffff',
        accent: '#00d4e6'
      },
      personality: 'cyber',
      emotion: 'neutral'
    },
    
    // Developer theme (??????????????????)
    'dev-matrix': {
      id: 'dev-matrix',
      name: 'Developer Matrix',
      colors: {
        primary: '#00ff41',
        secondary: '#39ff14',
        background: '#0d0d0d',
        text: '#c0c0c0',
        accent: '#00cc33'
      },
      personality: 'dev',
      emotion: 'neutral'
    },
    
    // AGI theme (??????????????)
    'agi-purple': {
      id: 'agi-purple',
      name: 'AGI Intelligence',
      colors: {
        primary: '#9f00ff',
        secondary: '#c56cff',
        background: '#0a000f',
        text: '#f0e6ff',
        accent: '#8000d9'
      },
      personality: 'agi',
      emotion: 'neutral'
    },
    
    // Happy theme (?????????? ??????????)
    'happy-gold': {
      id: 'happy-gold',
      name: 'Happy Gold',
      colors: {
        primary: '#ffd700',
        secondary: '#ffed4e',
        background: '#1a1400',
        text: '#fff9e6',
        accent: '#e6c200'
      },
      emotion: 'happy'
    },
    
    // Angry theme (??????)
    'angry-red': {
      id: 'angry-red',
      name: 'Angry Red',
      colors: {
        primary: '#ff0040',
        secondary: '#ff3366',
        background: '#1a0005',
        text: '#ffe6ec',
        accent: '#cc0033'
      },
      emotion: 'angry'
    },
    
    // Sad theme (??????)
    'sad-blue': {
      id: 'sad-blue',
      name: 'Sad Blue',
      colors: {
        primary: '#4169e1',
        secondary: '#6495ed',
        background: '#000a1a',
        text: '#e6f0ff',
        accent: '#2e4d8f'
      },
      emotion: 'sad'
    },
    
    // Excited theme (??????????)
    'excited-orange': {
      id: 'excited-orange',
      name: 'Excited Orange',
      colors: {
        primary: '#ff6600',
        secondary: '#ff8533',
        background: '#1a0800',
        text: '#fff2e6',
        accent: '#cc5200'
      },
      emotion: 'excited'
    },
    
    // Assistant theme (??????????)
    'assistant-green': {
      id: 'assistant-green',
      name: 'Assistant Green',
      colors: {
        primary: '#00ff88',
        secondary: '#33ffaa',
        background: '#001a0d',
        text: '#e6fff2',
        accent: '#00cc6e'
      },
      personality: 'assistant',
      emotion: 'neutral'
    },
    
    // Dark mode (?????? ????????)
    'pure-dark': {
      id: 'pure-dark',
      name: 'Pure Dark',
      colors: {
        primary: '#ffffff',
        secondary: '#cccccc',
        background: '#000000',
        text: '#ffffff',
        accent: '#808080'
      }
    },
    
    // Light mode (?????? ????????)
    'pure-light': {
      id: 'pure-light',
      name: 'Pure Light',
      colors: {
        primary: '#000000',
        secondary: '#333333',
        background: '#ffffff',
        text: '#000000',
        accent: '#666666'
      }
    }
  };

  /**
   * Get current theme
   */
  getTheme(): ThemeConfig {
    return this.themes[this.currentTheme];
  }

  /**
   * Set theme by ID
   */
  setTheme(themeId: string): boolean {
    if (this.themes[themeId]) {
      this.currentTheme = themeId;
      return true;
    }
    return false;
  }

  /**
   * Get theme for personality
   */
  getThemeForPersonality(personality: string): ThemeConfig {
    const theme = Object.values(this.themes).find(t => t.personality === personality);
    return theme || this.themes['cyber-cyan'];
  }

  /**
   * Get theme for emotion
   */
  getThemeForEmotion(emotion: string): ThemeConfig {
    const theme = Object.values(this.themes).find(t => t.emotion === emotion);
    return theme || this.getTheme();
  }

  /**
   * Auto-select theme based on personality + emotion
   */
  autoSelectTheme(personality?: string, emotion?: string): ThemeConfig {
    // Priority: emotion > personality > current
    if (emotion && emotion !== 'neutral') {
      const emotionTheme = this.getThemeForEmotion(emotion);
      if (emotionTheme) {
        this.currentTheme = emotionTheme.id;
        return emotionTheme;
      }
    }

    if (personality) {
      const personalityTheme = this.getThemeForPersonality(personality);
      if (personalityTheme) {
        this.currentTheme = personalityTheme.id;
        return personalityTheme;
      }
    }

    return this.getTheme();
  }

  /**
   * Get all available themes
   */
  getAllThemes(): ThemeConfig[] {
    return Object.values(this.themes);
  }

  /**
   * Create custom theme
   */
  createCustomTheme(config: ThemeConfig): boolean {
    if (this.themes[config.id]) {
      return false; // Theme already exists
    }
    this.themes[config.id] = config;
    return true;
  }

  /**
   * Get CSS variables for current theme
   */
  getCSSVariables(): Record<string, string> {
    const theme = this.getTheme();
    return {
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-background': theme.colors.background,
      '--color-text': theme.colors.text,
      '--color-accent': theme.colors.accent
    };
  }

  /**
   * Generate theme-aware gradient
   */
  getGradient(direction: string = 'to bottom'): string {
    const theme = this.getTheme();
    return `linear-gradient(${direction}, ${theme.colors.background}, ${theme.colors.primary}15)`;
  }

  /**
   * Get glow effect color
   */
  getGlowColor(intensity: number = 1.0): string {
    const theme = this.getTheme();
    const alpha = Math.min(intensity, 1.0);
    
    // Convert hex to rgba
    const hex = theme.colors.primary.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

