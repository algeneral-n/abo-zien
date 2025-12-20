/**
 * RARE 4N - Voice Agent (Conscious Agent)
 * 🎙️ Voice Agent - أكل العيش
 * Context-aware, Emotion-aware, Hands-free
 * يشتغل فقط بأمر من Cognitive Loop
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { ContextStore, Emotion } from '../core/ContextStore';
import { Voice } from '../services/api';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export class VoiceAgent extends RAREEngine {
  readonly id = 'voice-agent';
  readonly name = 'Voice Agent';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  private contextStore: ContextStore;
  protected initialized: boolean = false;
  protected running: boolean = false;
  private isListening: boolean = false;
  private wakeWords: string[] = ['رير', 'نادر', 'rare', 'nader'];
  private currentEmotion: Emotion | null = null;

  constructor() {
    super();
    this.contextStore = ContextStore.getInstance();
  }

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    // Subscribe to Cognitive Loop commands ONLY
    if (this.kernel) {
      this.kernel.on('agent:voice:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });

      // Listen to emotion changes for tone adaptation
      this.kernel.on('emotion:detected', (event) => {
        this.currentEmotion = event.data;
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Voice Agent not initialized');
    }
    this.running = true;
    this.startWakeWordDetection();
    this.emit('voice:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.stopWakeWordDetection();
    this.emit('voice:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'execute_voice':
        await this.executeVoiceCommand(command.parameters);
        break;
      case 'start_listening':
        await this.startListening();
        break;
      case 'stop_listening':
        await this.stopListening();
        break;
      case 'speak':
        await this.speak(command.parameters.text, command.parameters.language, command.parameters.emotion);
        break;
    }
  }

  /**
   * Execute voice command (from Cognitive Loop)
   */
  private async executeVoiceCommand(parameters: any): Promise<void> {
    const command = parameters.command;
    
    // Process command via Cognitive Loop
    if (this.kernel) {
      this.kernel.emit({
        type: 'user:input',
        data: {
          text: command,
          type: 'voice',
          timestamp: Date.now(),
        },
      });
    }
  }

  /**
   * Start listening (from Cognitive Loop)
   */
  private async startListening(): Promise<void> {
    this.isListening = true;
    this.emit('voice:listening', {});
  }

  /**
   * Stop listening (from Cognitive Loop)
   */
  private async stopListening(): Promise<void> {
    this.isListening = false;
    this.emit('voice:stopped_listening', {});
  }

  /**
   * Speak (from Cognitive Loop)
   * Context-aware + Emotion-aware tone
   */
  private async speak(
    text: string,
    language: string = 'ar',
    emotion?: Emotion
  ): Promise<void> {
    try {
      // Use emotion for tone adaptation
      const effectiveEmotion = emotion || this.currentEmotion;
      
      // Adapt text based on emotion
      let adaptedText = text;
      if (effectiveEmotion) {
        if (effectiveEmotion.type === 'happy' || effectiveEmotion.type === 'excited') {
          // More enthusiastic tone
        } else if (effectiveEmotion.type === 'concerned') {
          // Calmer, supportive tone
          adaptedText = 'أفهم. ' + adaptedText;
        }
      }

      // Try API first
      try {
        const response = await Voice.speak(adaptedText, language);
        // Play audio if provided
        this.emit('voice:speaking', { text: adaptedText });
      } catch (apiError) {
        // Fallback to local TTS
        Speech.speak(adaptedText, {
          language: language === 'ar' ? 'ar-SA' : 'en-US',
          pitch: effectiveEmotion?.type === 'excited' ? 1.2 : 1.0,
          rate: 0.9,
        });
        this.emit('voice:speaking', { text: adaptedText });
      }
    } catch (error) {
      console.error('Voice speak error:', error);
      this.emit('voice:error', { error });
    }
  }

  /**
   * Start wake word detection
   */
  private startWakeWordDetection(): void {
    // Wake word detection logic
    // When detected, notify Cognitive Loop
    if (this.kernel) {
      this.kernel.emit({
        type: 'voice:wake',
        data: { wakeWord: 'detected' },
      });
    }
  }

  /**
   * Stop wake word detection
   */
  private stopWakeWordDetection(): void {
    // Stop detection
  }

  /**
   * Transcribe audio (called by Cognitive Loop)
   */
  async transcribe(audioUri: string): Promise<string> {
    try {
      const response = await Voice.transcribe(audioUri);
      return response.transcript || '';
    } catch (error) {
      console.error('Transcription error:', error);
      return '';
    }
  }

  getStatus() {
    return {
      ...super.getStatus(),
      initialized: this.initialized,
      running: this.running,
      isListening: this.isListening,
    };
  }
}
