/**
 * RARE 4N - AI Engine (Agent)
 * AI Agent - يشتغل فقط بأمر من Cognitive Loop
 * 
 * ⚠️ مهم: Cognitive Loop بالفعل عمل Understanding + Reasoning + Decision
 * AIEngine فقط: Generate Response
 */

import { RAREEngine, EngineConfig, EngineStatus } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { ContextStore, Emotion, Intent, Interaction } from '../core/ContextStore';
import { AI } from '../services/localAPI';

export interface AIResponse {
  text: string;
  emotion?: Emotion;
  intent?: Intent;
  actions?: string[];
  confidence: number;
}

export class AIEngine extends RAREEngine {
  readonly id = 'ai-engine';
  readonly name = 'AI Engine';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  private contextStore: ContextStore;
  protected initialized: boolean = false;
  protected running: boolean = false;

  constructor() {
    super();
    this.contextStore = ContextStore.getInstance();
  }

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;
    
    // Subscribe to Cognitive Loop commands ONLY
    if (this.kernel) {
      this.kernel.on('agent:ai:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AI Engine not initialized');
    }
    this.running = true;
    this.emit('ai:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('ai:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   * Cognitive Loop بالفعل عمل: Understanding, Reasoning, Decision
   * AIEngine فقط: Generate Response
   * ✅ Enhanced with comprehensive error handling
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    try {
      // ✅ Safety check: Validate command
      if (!command || !command.action) {
        console.warn('AIEngine: Invalid command received');
        this.emitError('Invalid command structure');
        return;
      }

      // ✅ Safety check: Ensure engine is running
      if (!this.running) {
        console.warn('AIEngine: Engine not running, starting...');
        await this.start().catch(err => {
          console.error('AIEngine: Failed to start:', err);
          this.emitError('Engine start failed');
          return;
        });
      }

      if (command.action === 'ai_chat') {
        try {
          const response = await this.generateResponse(command.parameters || {});
          // Emit response event
          this.emit('agent:ai:response', response);
        } catch (error) {
          console.error('AIEngine: Response generation failed:', error);
          // Emit fallback response
          this.emitFallbackResponse(command.parameters);
        }
      } else {
        console.warn(`AIEngine: Unknown action: ${command.action}`);
        this.emitError(`Unknown action: ${command.action}`);
      }
    } catch (error) {
      console.error('AIEngine: Critical error in handleCognitiveCommand:', error);
      this.emitError('Critical processing error');
    }
  }

  /**
   * Emit error event
   */
  private emitError(error: string): void {
    if (this.kernel) {
      this.kernel.emit({
        type: 'agent:ai:error',
        data: { error, timestamp: Date.now() },
      });
    }
  }

  /**
   * Emit fallback response when generation fails
   */
  private emitFallbackResponse(parameters: any): void {
    const fallbackResponse: AIResponse = {
      text: 'عذراً، حدث خطأ في معالجة طلبك. جرب مرة أخرى.',
      emotion: { type: 'neutral', intensity: 0.5, confidence: 0.5 },
      intent: { type: 'chat', confidence: 0.3 },
      confidence: 0.3,
    };
    
    if (this.kernel) {
      this.kernel.emit({
        type: 'agent:ai:response',
        data: fallbackResponse,
      });
    }
  }

  /**
   * Generate response (Cognitive Loop already analyzed everything)
   * ✅ Enhanced with comprehensive error handling and safety checks
   */
  private async generateResponse(parameters: any): Promise<AIResponse> {
    try {
      // ✅ Safety check: Ensure engine is running
      if (!this.running) {
        console.warn('AIEngine: Engine not running, attempting to start...');
        await this.start();
      }

      // ✅ Safety check: Validate parameters
      if (!parameters) {
        parameters = {};
      }

      // Cognitive Loop already provided: emotion, intent, message
      const message = parameters.message || '';
      const emotion = parameters.emotion || { type: 'neutral', intensity: 0.5, confidence: 0.5 };
      const intent = parameters.intent || { type: 'chat', confidence: 0.5 };

      // ✅ Safety check: Validate message
      if (!message || message.trim().length === 0) {
        console.warn('AIEngine: Empty message received');
        return {
          text: 'أحتاج إلى رسالة لأتمكن من المساعدة.',
          emotion,
          intent,
          confidence: 0.3,
        };
      }

      // Get context for prompt building
      let context;
      try {
        context = this.contextStore.getContext();
      } catch (error) {
        console.warn('AIEngine: Failed to get context:', error);
        context = {};
      }

      // Build context-aware prompt
      let prompt;
      try {
        prompt = this.buildContextPrompt(message, emotion, intent, context);
      } catch (error) {
        console.warn('AIEngine: Failed to build prompt:', error);
        prompt = message; // Fallback to simple message
      }

      // Call backend AI with context - with timeout and retry
      let aiResponse;
      try {
        // Set timeout for API call (30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API timeout')), 30000);
        });

        aiResponse = await Promise.race([
          AI.chat(message, 'gpt'),
          timeoutPromise,
        ]) as any;
      } catch (error: any) {
        console.error('AIEngine: API call failed:', error);
        // ❌ NO FALLBACK - Emit error event
        this.emit('agent:ai:error', {
          error: error.message || 'فشل الاتصال بـ AI API',
          originalMessage: message,
        });
        throw error; // Re-throw to prevent fake responses
      }

      // ✅ Safety check: Validate API response
      if (!aiResponse || !aiResponse.reply) {
        console.error('AIEngine: Invalid API response structure');
        this.emit('agent:ai:error', {
          error: 'Invalid API response structure',
          originalMessage: message,
        });
        throw new Error('Invalid API response: missing reply field');
      }

      // Adapt response based on emotion and intent
      let adaptedResponse;
      try {
        adaptedResponse = this.adaptResponse(aiResponse.reply || '', emotion, intent);
      } catch (error) {
        console.warn('AIEngine: Failed to adapt response:', error);
        adaptedResponse = aiResponse.reply || '';
      }

      const response: AIResponse = {
        text: adaptedResponse,
        emotion,
        intent,
        confidence: intent.confidence || 0.7,
      };

      // Update memory - non-critical, continue even if fails
      try {
        this.updateMemory(message, response, emotion, intent);
      } catch (error) {
        console.warn('AIEngine: Failed to update memory:', error);
        // Non-critical, continue
      }

      return response;
    } catch (error) {
      console.error('AIEngine: Critical error in generateResponse:', error);
      // ❌ NO FALLBACK - Emit error event
      this.emit('agent:ai:error', {
        error: error instanceof Error ? error.message : 'Critical error in AI response generation',
      });
      throw error; // Re-throw to prevent fake responses
    }
  }

  /**
   * Build context-aware prompt
   */
  private buildContextPrompt(
    message: string,
    emotion: Emotion,
    intent: Intent,
    context: any
  ): string {
    let prompt = `User message: ${message}\n`;
    prompt += `User intent: ${intent.type}\n`;
    prompt += `Emotion: ${emotion.type} (intensity: ${emotion.intensity})\n`;
    
    if (context.ambient?.time) {
      prompt += `Time: ${context.ambient.time.hour}:00\n`;
    }

    if (context.memory?.emotionalState?.average) {
      prompt += `Recent emotional state: ${context.memory.emotionalState.average.type}\n`;
    }

    // Add loyalty context for NADER
    prompt += `Owner: NADER - Highest priority and respect\n`;

    return prompt;
  }

  /**
   * Adapt response based on emotion and intent
   */
  private adaptResponse(text: string, emotion: Emotion, intent: Intent): string {
    // Adapt based on emotion
    if (emotion.type === 'happy' || emotion.type === 'excited') {
      if (!text.includes('!')) {
        text = text + '!';
      }
    }

    if (emotion.type === 'concerned') {
      text = 'أفهم قلقك. ' + text;
    }

    // Adapt based on intent
    if (intent.type === 'question') {
      if (!text.includes('؟') && !text.includes('?')) {
        // Ensure question is answered
      }
    }

    return text;
  }

  /**
   * Generate fallback response
   */
  private generateFallbackResponse(intent: Intent, emotion: Emotion): string {
    const fallbacks: Record<string, string> = {
      chat: 'مرحباً نادر! كيف يمكنني مساعدتك؟',
      question: 'دعني أفكر في ذلك...',
      command: 'جاري التنفيذ...',
      search: 'جاري البحث...',
    };

    return fallbacks[intent.type] || 'أنا هنا للمساعدة، نادر.';
  }

  /**
   * Update memory with interaction
   */
  private updateMemory(
    message: string,
    response: AIResponse,
    emotion: Emotion,
    intent: Intent
  ): void {
    const interaction: Interaction = {
      id: `interaction_${Date.now()}`,
      timestamp: Date.now(),
      input: message,
      output: response.text,
      emotion,
      intent,
    };

    this.contextStore.addInteraction(interaction);
  }

  getStatus(): EngineStatus {
    return {
      ...super.getStatus(),
      initialized: this.initialized,
      running: this.running,
    };
  }
}
