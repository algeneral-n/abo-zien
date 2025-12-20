/**
 * ABO ZIEN - Translation Engine
 * Multi-language translation with Arabic support
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export class TranslationEngine extends RAREEngine {
  readonly id = 'translation-engine';
  readonly name = 'Translation Engine';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;

  private apiBase: string;

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    this.apiBase = config.apiBase || process.env.API_URL || 'http://localhost:5000/api';

    // Subscribe to Cognitive Loop commands
    if (this.kernel) {
      this.kernel.on('agent:translation:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Translation Engine not initialized');
    }
    this.running = true;
    this.emit('translation:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('translation:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'translate':
        await this.translate(command.parameters);
        break;
      case 'detect_language':
        await this.detectLanguage(command.parameters);
        break;
      case 'batch_translate':
        await this.batchTranslate(command.parameters);
        break;
    }
  }

  /**
   * Translate text
   */
  private async translate(parameters: any): Promise<void> {
    try {
      const { text, targetLang, sourceLang } = parameters;

      const response = await fetch(`${this.apiBase}/translate/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang }),
      });

      const data = await response.json();

      this.emit('translation:translated', {
        result: {
          originalText: text,
          translatedText: data.translatedText,
          sourceLanguage: data.sourceLanguage || sourceLang || 'auto',
          targetLanguage: targetLang,
          confidence: data.confidence || 0.9,
        },
      });
    } catch (error: any) {
      this.emit('translation:error', { error: error.message, action: 'translate' });
    }
  }

  /**
   * Detect language
   */
  private async detectLanguage(parameters: any): Promise<void> {
    try {
      const { text } = parameters;

      const response = await fetch(`${this.apiBase}/translate/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      this.emit('translation:language_detected', {
        language: data.language,
        confidence: data.confidence,
        text,
      });
    } catch (error: any) {
      this.emit('translation:error', { error: error.message, action: 'detect_language' });
    }
  }

  /**
   * Batch translate multiple texts
   */
  private async batchTranslate(parameters: any): Promise<void> {
    try {
      const { texts, targetLang, sourceLang } = parameters;

      const response = await fetch(`${this.apiBase}/translate/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, targetLang, sourceLang }),
      });

      const data = await response.json();

      this.emit('translation:batch_translated', {
        results: data.results,
        count: data.results?.length || 0,
      });
    } catch (error: any) {
      this.emit('translation:error', { error: error.message, action: 'batch_translate' });
    }
  }
}

