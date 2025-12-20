/**
 * ABO ZIEN - Theme Engine (Enhanced)
 * Manages themes, colors, and visual styling
 * Integrated with personality & emotion
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { RAREThemeEngine } from '../core/RAREThemeEngine';

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
  personality?: string;
  emotion?: string;
}

export class ThemeEngine extends RAREEngine {
  readonly id = 'theme-engine';
  readonly name = 'Theme Engine';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;

  private backendThemeEngine: RAREThemeEngine;
  private apiBase: string;

  constructor() {
    super();
    this.backendThemeEngine = new RAREThemeEngine();
  }

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    this.apiBase = config.apiBase || process.env.API_URL || 'http://localhost:5000/api';

    // Subscribe to Cognitive Loop commands
    if (this.kernel) {
      this.kernel.on('agent:theme:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Theme Engine not initialized');
    }
    this.running = true;
    this.emit('theme:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('theme:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'set_theme':
        await this.setTheme(command.parameters);
        break;
      case 'get_theme':
        await this.getTheme(command.parameters);
        break;
      case 'get_all_themes':
        await this.getAllThemes();
        break;
      case 'auto_select_theme':
        await this.autoSelectTheme(command.parameters);
        break;
      case 'get_theme_for_personality':
        await this.getThemeForPersonality(command.parameters);
        break;
      case 'get_theme_for_emotion':
        await this.getThemeForEmotion(command.parameters);
        break;
    }
  }

  /**
   * Set theme by ID
   */
  private async setTheme(parameters: any): Promise<void> {
    try {
      const { themeId } = parameters;

      // Use backend theme engine
      const success = this.backendThemeEngine.setTheme(themeId);

      if (success) {
        const theme = this.backendThemeEngine.getTheme();

        this.emit('theme:changed', {
          theme,
          themeId,
        });
      } else {
        this.emit('theme:error', { error: 'Theme not found', themeId });
      }
    } catch (error: any) {
      this.emit('theme:error', { error: error.message, action: 'set_theme' });
    }
  }

  /**
   * Get current theme
   */
  private async getTheme(parameters: any): Promise<void> {
    try {
      const theme = this.backendThemeEngine.getTheme();

      this.emit('theme:current', {
        theme,
      });
    } catch (error: any) {
      this.emit('theme:error', { error: error.message, action: 'get_theme' });
    }
  }

  /**
   * Get all available themes
   */
  private async getAllThemes(): Promise<void> {
    try {
      const themes = this.backendThemeEngine.getAllThemes();

      this.emit('theme:all_themes', {
        themes,
        count: themes.length,
      });
    } catch (error: any) {
      this.emit('theme:error', { error: error.message, action: 'get_all_themes' });
    }
  }

  /**
   * Auto-select theme based on personality + emotion
   */
  private async autoSelectTheme(parameters: any): Promise<void> {
    try {
      const { personality, emotion } = parameters || {};

      const theme = this.backendThemeEngine.autoSelectTheme(personality, emotion);

      this.emit('theme:auto_selected', {
        theme,
        personality,
        emotion,
      });
    } catch (error: any) {
      this.emit('theme:error', { error: error.message, action: 'auto_select_theme' });
    }
  }

  /**
   * Get theme for personality
   */
  private async getThemeForPersonality(parameters: any): Promise<void> {
    try {
      const { personality } = parameters;

      const theme = this.backendThemeEngine.getThemeForPersonality(personality);

      this.emit('theme:for_personality', {
        theme,
        personality,
      });
    } catch (error: any) {
      this.emit('theme:error', { error: error.message, action: 'get_theme_for_personality' });
    }
  }

  /**
   * Get theme for emotion
   */
  private async getThemeForEmotion(parameters: any): Promise<void> {
    try {
      const { emotion } = parameters;

      const theme = this.backendThemeEngine.getThemeForEmotion(emotion);

      this.emit('theme:for_emotion', {
        theme,
        emotion,
      });
    } catch (error: any) {
      this.emit('theme:error', { error: error.message, action: 'get_theme_for_emotion' });
    }
  }

  /**
   * Get CSS variables for current theme
   */
  getCSSVariables(): Record<string, string> {
    return this.backendThemeEngine.getCSSVariables();
  }

  /**
   * Get gradient for current theme
   */
  getGradient(direction: string = 'to bottom'): string {
    return this.backendThemeEngine.getGradient(direction);
  }

  /**
   * Get glow color for current theme
   */
  getGlowColor(intensity: number = 1.0): string {
    return this.backendThemeEngine.getGlowColor(intensity);
  }
}

