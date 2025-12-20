/**
 * RARE 4N - Cognitive Loop (العقل)
 * Cognitive Continuum Kernel - The Brain
 * 
 * القاعدة الذهبية: مفيش Agent يشتغل بدون قرار من Cognitive Loop
 * ✅ Integrated with PolicyEngine & MemoryEngine
 */

import { RAREKernel } from './RAREKernel';
import { ContextStore, Emotion, Intent } from './ContextStore';
import { EventBus } from './EventBus';
import { PolicyEngine } from './PolicyEngine';
import { MemoryEngine } from './MemoryEngine';
import { PermissionManager } from './services/PermissionManager';
import { CircuitBreaker } from './utils/CircuitBreaker';
import { RetryMechanism } from './utils/RetryMechanism';

export interface CognitiveDecision {
  action: string;
  agent: string;
  parameters: Record<string, any>;
  confidence: number;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Understanding {
  context: any;
  emotion: Emotion;
  intent: Intent;
  situation: any;
  needs: string[];
}

export class CognitiveLoop {
  private static instance: CognitiveLoop;
  private kernel: RAREKernel | null = null;
  private contextStore: ContextStore;
  private eventBus: EventBus;
  private policyEngine: PolicyEngine;
  private memoryEngine: MemoryEngine;
  private permissionManager: PermissionManager;
  private initialized: boolean = false;

  // Learning data
  private decisionHistory: CognitiveDecision[] = [];
  private improvementPatterns: Map<string, number> = new Map();

  // ✅ Circuit Breakers for each agent
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  
  // ✅ Retry Mechanism
  private retryMechanism: RetryMechanism;

  private constructor() {
    try {
      this.contextStore = ContextStore.getInstance();
      this.eventBus = EventBus.getInstance();
      this.policyEngine = PolicyEngine.getInstance();
      this.memoryEngine = MemoryEngine.getInstance();
      this.permissionManager = PermissionManager.getInstance();
      
      // ✅ Initialize Retry Mechanism
      this.retryMechanism = new RetryMechanism({
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
      });
    } catch (error) {
      console.error('❌ CognitiveLoop constructor error:', error);
    }
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  static getInstance(): CognitiveLoop {
    if (!CognitiveLoop.instance) {
      CognitiveLoop.instance = new CognitiveLoop();
    }
    return CognitiveLoop.instance;
  }

  /**
   * Initialize Cognitive Loop
   */
  async init(kernel: RAREKernel): Promise<void> {
    if (this.initialized) return;

    this.kernel = kernel;

    // Subscribe to Kernel events (NOT EventBus directly)
    // ✅ Wrap in try-catch to prevent stopping on errors
    kernel.on('user:input', (event) => {
      this.processInput(event.data).catch((error) => {
        console.error('CognitiveLoop: processInput error (non-blocking):', error);
        // Continue listening - don't stop
      });
    });

    kernel.on('system:event', (event) => {
      this.processSystemEvent(event.data).catch((error) => {
        console.error('CognitiveLoop: processSystemEvent error (non-blocking):', error);
        // Continue listening - don't stop
      });
    });

    this.initialized = true;
    this.emit('cognitive:initialized', {});
  }

  /**
   * Main processing function - The Brain
   * ✅ Enhanced with comprehensive error handling and safety checks
   */
  async processInput(input: any): Promise<CognitiveDecision> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:processInput',message:'processInput started',data:{hasInput:!!input,hasText:!!input?.text,hasAudio:!!input?.audio,hasKernel:!!this.kernel},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'PROCESS_INPUT_START'})}).catch(()=>{});
      }
      // #endregion
      
      // ✅ Safety check: Validate input
      if (!input || (!input.text && !input.audio)) {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:processInput',message:'Invalid input detected',data:{input},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'INVALID_INPUT'})}).catch(()=>{});
        }
        // #endregion
        console.warn('CognitiveLoop: Invalid input received');
        return this.createFallbackDecision('Invalid input');
      }

      // ✅ Safety check: Ensure kernel is available
      if (!this.kernel) {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:processInput',message:'Kernel not available',data:{},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'NO_KERNEL'})}).catch(()=>{});
        }
        // #endregion
        console.error('CognitiveLoop: Kernel not available');
        return this.createFallbackDecision('System not ready');
      }

      // Store last input in context
      const context = this.contextStore.getContext();
      if (!context || !context.session) {
        console.warn('CognitiveLoop: Context not available, initializing...');
        // Initialize context if missing
        this.contextStore.updateContext({
          session: {
            id: `session_${Date.now()}`,
            startTime: Date.now(),
            interactions: [],
            currentEmotion: null,
            lastInput: input.text || input.audio || '',
          },
        });
      } else {
        this.contextStore.updateContext({
          session: {
            ...context.session,
            lastInput: input.text || input.audio || '',
          },
        });
      }

      // Step 1: Understanding (Context Awareness) - with Circuit Breaker & Retry
      let understanding: Understanding;
      try {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:158',message:'Starting understanding phase',data:{hasInput:!!input,hasText:!!input?.text,hasAudio:!!input?.audio},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        
        // Get or create circuit breaker for understanding
        if (!this.circuitBreakers.has('understanding')) {
          this.circuitBreakers.set('understanding', new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            name: 'understanding',
          }));
        }
        const understandingBreaker = this.circuitBreakers.get('understanding')!;
        
        understanding = await this.retryMechanism.execute(() => 
          understandingBreaker.execute(() => this.understand(input))
        );
        
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:175',message:'Understanding completed',data:{emotion:understanding.emotion.type,intent:understanding.intent.type,needsCount:understanding.needs.length},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
      } catch (error) {
        console.error('CognitiveLoop: Understanding failed:', error);
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:182',message:'Understanding failed, using fallback',data:{error:error?.toString()},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        understanding = this.createFallbackUnderstanding(input);
      }

      // Step 2: Reasoning (Emotion + Intent Analysis) - with Circuit Breaker & Retry
      let reasoning: any;
      try {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:192',message:'Starting reasoning phase',data:{emotion:understanding.emotion.type,intent:understanding.intent.type},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
        
        if (!this.circuitBreakers.has('reasoning')) {
          this.circuitBreakers.set('reasoning', new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            name: 'reasoning',
          }));
        }
        const reasoningBreaker = this.circuitBreakers.get('reasoning')!;
        
        reasoning = await this.retryMechanism.execute(() => 
          reasoningBreaker.execute(() => this.reason(understanding))
        );
        
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:209',message:'Reasoning completed',data:{urgency:reasoning.urgency,complexity:reasoning.complexity},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
      } catch (error) {
        console.error('CognitiveLoop: Reasoning failed:', error);
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:216',message:'Reasoning failed, using fallback',data:{error:error?.toString()},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
        reasoning = { urgency: 'medium', complexity: 'low' };
      }

      // Step 3: Decision Making - with Circuit Breaker & Retry
      let decision: CognitiveDecision;
      try {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:225',message:'Starting decision making',data:{urgency:reasoning.urgency,complexity:reasoning.complexity},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
        
        if (!this.circuitBreakers.has('decision')) {
          this.circuitBreakers.set('decision', new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            name: 'decision',
          }));
        }
        const decisionBreaker = this.circuitBreakers.get('decision')!;
        
        decision = await this.retryMechanism.execute(() => 
          decisionBreaker.execute(() => this.makeDecision(understanding, reasoning))
        );
        
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:242',message:'Decision made',data:{action:decision.action,agent:decision.agent,confidence:decision.confidence,priority:decision.priority},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
      } catch (error) {
        console.error('CognitiveLoop: Decision making failed:', error);
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:249',message:'Decision making failed, using fallback',data:{error:error?.toString()},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
        decision = this.createFallbackDecision('Decision making error');
      }

      // Step 4: Execute (via Kernel to Agent) - with Circuit Breaker & Retry
      try {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:260',message:'Starting execution',data:{action:decision.action,agent:decision.agent},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion
        
        if (!this.circuitBreakers.has('execution')) {
          this.circuitBreakers.set('execution', new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            name: 'execution',
          }));
        }
        const executionBreaker = this.circuitBreakers.get('execution')!;
        
        await this.retryMechanism.execute(() => 
          executionBreaker.execute(() => this.execute(decision))
        );
        
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:277',message:'Execution completed',data:{action:decision.action,agent:decision.agent},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion
      } catch (error) {
        console.error('CognitiveLoop: Execution failed:', error);
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:284',message:'Execution failed',data:{error:error?.toString(),action:decision.action,agent:decision.agent},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion
        // Emit error event
        if (this.kernel) {
          this.kernel.emit({
            type: 'cognitive:error',
            data: { error: String(error), decision },
          });
        }
      }

      // Step 5: Learn (Continuous Improvement) - with Circuit Breaker & Retry
      try {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:297',message:'Starting learning phase',data:{action:decision.action,confidence:decision.confidence},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        }
        // #endregion
        
        if (!this.circuitBreakers.has('learning')) {
          this.circuitBreakers.set('learning', new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            name: 'learning',
          }));
        }
        const learningBreaker = this.circuitBreakers.get('learning')!;
        
        await this.retryMechanism.execute(() => 
          learningBreaker.execute(() => this.learn(understanding, decision))
        );
        
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:314',message:'Learning completed',data:{action:decision.action},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        }
        // #endregion
      } catch (error) {
        console.error('CognitiveLoop: Learning failed:', error);
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:321',message:'Learning failed (non-critical)',data:{error:error?.toString()},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        }
        // #endregion
        // Non-critical, continue
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:processInput',message:'processInput completed successfully',data:{action:decision.action,agent:decision.agent,confidence:decision.confidence},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'PROCESS_INPUT_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
      
      return decision;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/CognitiveLoop.ts:processInput',message:'Critical error in processInput',data:{error:error?.message || error?.toString(),stack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'cognitive-session',runId:'run1',hypothesisId:'PROCESS_INPUT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('CognitiveLoop: Critical error in processInput:', error);
      return this.createFallbackDecision('Critical processing error');
    }
  }

  /**
   * Create fallback decision when processing fails
   */
  private createFallbackDecision(reason: string): CognitiveDecision {
    return {
      action: 'ai_chat',
      agent: 'ai',
      parameters: { 
        message: 'عذراً، حدث خطأ في معالجة طلبك. جرب مرة أخرى.',
        fallback: true,
        reason,
      },
      confidence: 0.3,
      reasoning: `Fallback: ${reason}`,
      priority: 'low',
    };
  }

  /**
   * Create fallback understanding when analysis fails
   */
  private createFallbackUnderstanding(input: any): Understanding {
    return {
      context: this.contextStore.getContext(),
      emotion: { type: 'neutral', intensity: 0.5, confidence: 0.5 },
      intent: { type: 'chat', confidence: 0.5 },
      situation: {},
      needs: [],
    };
  }

  /**
   * Step 1: Understanding (Context Awareness Engine)
   * ✅ Enhanced with Memory Retrieval
   */
  private async understand(input: any): Promise<Understanding> {
    const context = this.contextStore.getContext();

    // ✅ Retrieve relevant memories
    const relevantMemories = this.memoryEngine.getRelevantContext(
      input.text || input.audio || '',
      5
    );

    // Enrich context with long-term memory
    const enrichedContext = {
      ...context,
      relevantMemories,
    };

    // Get emotion
    const emotion = this.analyzeEmotion(input, enrichedContext);

    // Get intent
    const intent = this.recognizeIntent(input, enrichedContext);

    // Get situation
    const situation = this.assessSituation(enrichedContext);

    // Anticipate needs
    const needs = this.anticipateNeeds(enrichedContext, emotion, intent);

    return {
      context: enrichedContext,
      emotion,
      intent,
      situation,
      needs,
    };
  }

  /**
   * Step 2: Reasoning (Emotion + Intent Analysis)
   */
  private async reason(understanding: Understanding): Promise<any> {
    // Combine emotion + intent + situation
    const reasoning = {
      emotionalState: understanding.emotion,
      userIntent: understanding.intent,
      situation: understanding.situation,
      needs: understanding.needs,
      urgency: this.calculateUrgency(understanding),
      complexity: this.calculateComplexity(understanding),
    };

    return reasoning;
  }

  /**
   * Step 3: Decision Making (Decision Engine)
   */
  private async makeDecision(
    understanding: Understanding,
    reasoning: any
  ): Promise<CognitiveDecision> {
    const intent = understanding.intent;
    const emotion = understanding.emotion;
    const needs = understanding.needs;

    let decision: CognitiveDecision;

    // Decision logic based on intent
    switch (intent.type) {
      case 'voice_command':
        decision = {
          action: 'execute_voice',
          agent: 'voice',
          parameters: { command: intent.parameters?.command },
          confidence: intent.confidence,
          reasoning: 'User wants voice interaction',
          priority: 'high',
        };
        break;

      case 'enable_voice':
        decision = {
          action: 'enable_voice',
          agent: 'voice',
          parameters: { enabled: true },
          confidence: intent.confidence,
          reasoning: 'User wants to enable voice',
          priority: 'high',
        };
        break;

      case 'disable_voice':
        decision = {
          action: 'disable_voice',
          agent: 'voice',
          parameters: { enabled: false },
          confidence: intent.confidence,
          reasoning: 'User wants to disable voice',
          priority: 'high',
        };
        break;

      case 'build_app':
        decision = {
          action: 'build_app',
          agent: 'builder',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to build an app',
          priority: 'high',
        };
        break;

      case 'get_templates':
        decision = {
          action: 'get_templates',
          agent: 'builder',
          parameters: {},
          confidence: 0.9,
          reasoning: 'User wants to see templates',
          priority: 'medium',
        };
        break;

      case 'get_systems':
        decision = {
          action: 'get_systems',
          agent: 'builder',
          parameters: {},
          confidence: 0.9,
          reasoning: 'User wants to see systems',
          priority: 'medium',
        };
        break;

      case 'get_themes':
        decision = {
          action: 'get_themes',
          agent: 'builder',
          parameters: {},
          confidence: 0.9,
          reasoning: 'User wants to see themes',
          priority: 'medium',
        };
        break;

      case 'file_operation':
        // Map file operations to specific actions
        const fileAction = intent.parameters?.action || 'list_files';
        decision = {
          action: fileAction, // list_files, upload_file, ocr_scan, etc.
          agent: 'filing',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: `User wants file operation: ${fileAction}`,
          priority: 'medium',
        };
        break;

      case 'generate_image':
        decision = {
          action: 'generate_image',
          agent: 'filing',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to generate an image',
          priority: 'medium',
        };
        break;

      case 'generate_video':
        decision = {
          action: 'generate_video',
          agent: 'filing',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to generate a video',
          priority: 'medium',
        };
        break;

      case 'generate_file':
        decision = {
          action: 'generate_file',
          agent: 'filing',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to generate a file',
          priority: 'medium',
        };
        break;

      case 'vault_access':
        decision = {
          action: 'vault_access',
          agent: 'vault',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants vault access',
          priority: 'critical',
        };
        break;

      case 'portal_request':
        decision = {
          action: 'portal_request',
          agent: 'portal',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants portal operation',
          priority: 'medium',
        };
        break;

      case 'loyalty_check':
        decision = {
          action: 'loyalty_check',
          agent: 'loyalty',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants loyalty status',
          priority: 'low',
        };
        break;

      case 'research_query':
        decision = {
          action: 'research_query',
          agent: 'research',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants research assistance',
          priority: 'medium',
        };
        break;

      case 'maps_search':
        decision = {
          action: 'search_location',
          agent: 'maps',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to search for a location',
          priority: 'medium',
        };
        break;

      case 'maps_route':
        decision = {
          action: 'get_route',
          agent: 'maps',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants route directions',
          priority: 'high',
        };
        break;

      case 'maps_navigate':
        decision = {
          action: 'start_navigation',
          agent: 'maps',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to start navigation',
          priority: 'high',
        };
        break;

      case 'weather_current':
        decision = {
          action: 'get_current',
          agent: 'weather',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants current weather',
          priority: 'medium',
        };
        break;

      case 'weather_forecast':
        decision = {
          action: 'get_daily',
          agent: 'weather',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants weather forecast',
          priority: 'low',
        };
        break;

      case 'phone_call':
        decision = {
          action: 'make_phone_call',
          agent: 'communication',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to make a phone call',
          priority: 'high',
        };
        break;

      case 'send_email':
        decision = {
          action: 'send_email',
          agent: 'communication',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to send email',
          priority: 'medium',
        };
        break;

      case 'send_whatsapp':
        decision = {
          action: 'send_whatsapp',
          agent: 'communication',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to send WhatsApp message',
          priority: 'high',
        };
        break;

      case 'contact_family':
        decision = {
          action: 'contact_family_member',
          agent: 'communication',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to contact family member',
          priority: 'high',
        };
        break;

      case 'ultimate_assistant':
        decision = {
          action: 'ultimate_assistant',
          agent: 'communication',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'Ultimate Assistant communication',
          priority: 'high',
        };
        break;

      case 'council_debate':
      case 'get_advice':
      case 'get_recommendation':
        decision = {
          action: intent.type === 'council_debate' ? 'start_debate' : 'get_recommendation',
          agent: 'council',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants council advice or recommendation',
          priority: 'high',
        };
        break;

      case 'client_greeting':
        decision = {
          action: 'client_greeting',
          agent: 'council',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to know how to greet a client',
          priority: 'medium',
        };
        break;

      case 'client_action':
        decision = {
          action: 'client_action',
          agent: 'council',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to know what action to take for a client',
          priority: 'medium',
        };
        break;

      case 'owner_command':
        // ✅ نظام أوامر المستخدم للتحكم في الاجنتس
        decision = {
          action: intent.parameters?.action || 'execute_command',
          agent: intent.parameters?.agent || 'ai',
          parameters: intent.parameters || {},
          confidence: 1.0,
          reasoning: 'Owner direct command - highest priority',
          priority: 'critical',
        };
        break;

      case 'carplay_connect':
        decision = {
          action: 'carplay_connect',
          agent: 'carplay',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to connect CarPlay',
        };
        break;

      case 'carplay_navigate':
        decision = {
          action: 'carplay_navigate',
          agent: 'carplay',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants CarPlay navigation',
        };
        break;

      case 'carplay_voice':
        decision = {
          action: 'carplay_voice',
          agent: 'carplay',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants CarPlay voice command',
        };
        break;

      case 'service_control':
        decision = {
          action: intent.parameters?.action || 'check_service_status',
          agent: 'service',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to control service',
          priority: 'high',
        };
        break;

      default:
        // Default: AI chat
        decision = {
          action: 'ai_chat',
          agent: 'ai',
          parameters: { message: understanding.context?.lastInput },
          confidence: 0.7,
          reasoning: 'General conversation',
          priority: 'medium',
        };
    }

    // Adjust based on emotion
    if (emotion.type === 'concerned' || emotion.type === 'urgent') {
      decision.priority = 'high';
    }

    // Adjust based on needs
    if (needs.includes('quiet_mode')) {
      decision.priority = 'low';
      decision.reasoning += ' (quiet mode active)';
    }

    // Store decision (with limit to prevent memory issues)
    this.decisionHistory.push(decision);
    const MAX_DECISION_HISTORY = 1000;
    if (this.decisionHistory.length > MAX_DECISION_HISTORY) {
      this.decisionHistory.shift();
    }

    return decision;
  }

  /**
   * Step 4: Execute (via Kernel to Agent)
   * ✅ Enhanced with validation and error handling
   * ✅ Enhanced with Agent Lifecycle Management
   * ✅ Enhanced with Policy Evaluation
   */
  private async execute(decision: CognitiveDecision): Promise<void> {
    try {
      // ✅ Safety check: Validate decision
      if (!decision || !decision.agent || !decision.action) {
        console.error('CognitiveLoop: Invalid decision structure');
        return;
      }

      // ✅ Safety check: Ensure kernel is available
      if (!this.kernel) {
        console.error('CognitiveLoop: Kernel not available for execution');
        return;
      }

      // ✅ POLICY EVALUATION - Validate decision against policies
      const context = this.contextStore.getContext();
      const policyDecision = this.policyEngine.evaluate(
        {
          action: decision.action,
          agent: decision.agent,
          data: decision.parameters,
          context,
          timestamp: Date.now(),
        },
        context
      );

      // If policy denies, don't execute
      if (!policyDecision.allowed) {
        console.warn(`CognitiveLoop: Policy denied decision - ${policyDecision.reason}`);
        
        // Emit policy denied event
        this.emit('cognitive:policy_denied', {
          decision,
          policy: policyDecision.policy?.name,
          reason: policyDecision.reason,
        });

        // If requires approval, request it
        if (policyDecision.requiresApproval) {
          this.emit('cognitive:approval_required', {
            decision,
            policy: policyDecision.policy?.name,
            reason: policyDecision.reason,
          });
        }

        return;
      }

      // ✅ Safety check: Verify agent exists
      const agent = this.kernel.getAgent(decision.agent);
      if (!agent) {
        console.warn(`CognitiveLoop: Agent ${decision.agent} not found`);
        this.emit('cognitive:agent_not_found', { agentId: decision.agent });
        return;
      }

      // ✅ Agent Lifecycle Management - Decide when to start/stop/pause/resume
      await this.manageAgentLifecycle(decision);

      // ✅ Notification Decision - Decide when agent needs notification
      await this.decideNotifications(decision);

      // Emit decision event
      try {
        this.emit('cognitive:decision', decision);
      } catch (error) {
        console.error('CognitiveLoop: Failed to emit decision event:', error);
      }

      // ✅ Get or create Circuit Breaker for this agent
      if (!this.circuitBreakers.has(decision.agent)) {
        this.circuitBreakers.set(
          decision.agent,
          new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 60000, // 1 minute
            monitoringWindow: 60000,
          })
        );
      }
      const circuitBreaker = this.circuitBreakers.get(decision.agent)!;

      // ✅ Execute action via agent with Circuit Breaker and Retry Mechanism
      try {
        if (__DEV__) {
          console.log(`[CognitiveLoop] Executing ${decision.action} via ${decision.agent}`);
        }
        
        const result = await circuitBreaker.execute(async () => {
          return await this.retryMechanism.execute(
            async () => {
              return await agent.executeAction(decision.action, decision.parameters || {});
            },
            (attempt, error) => {
              if (__DEV__) {
                console.log(`[CognitiveLoop] Retry attempt ${attempt} for ${decision.agent}:`, error.message);
              }
            }
          );
        });

        // Emit success event
        this.kernel.emit({
          type: 'cognitive:execution_success',
          data: { 
            decision,
            result,
            agent: decision.agent,
            timestamp: Date.now(),
          },
        });

        // Emit result to UI
        this.emit('cognitive:result', { decision, result });

      } catch (error) {
        console.error(`CognitiveLoop: Failed to execute via agent ${decision.agent}:`, error);
        
        // Emit error event
        this.kernel.emit({
          type: 'cognitive:execution_error',
          data: { 
            error: String(error), 
            decision,
            agent: decision.agent,
          },
        });
      }
    } catch (error) {
      console.error('CognitiveLoop: Critical error in execute:', error);
      // Emit critical error
      if (this.kernel) {
        this.kernel.emit({
          type: 'cognitive:critical_error',
          data: { error: String(error), stage: 'execute' },
        });
      }
    }
  }

  /**
   * Agent Lifecycle Management
   * ✅ يقرر متى يفتح/يغلق/يوقف/يستأنف كل Agent
   */
  private async manageAgentLifecycle(decision: CognitiveDecision): Promise<void> {
    if (!this.kernel) return;

    const agent = this.kernel.getEngine(decision.agent);
    if (!agent) return;

    const agentStatus = agent.getStatus();
    const lifecycle = this.kernel.getAgentLifecycle(decision.agent);
    if (!lifecycle) return;

    // Determine lifecycle actions based on decision priority and context
    const context = this.contextStore.getContext();
    const needs = this.anticipateNeeds(context, { type: 'neutral', intensity: 0.5 }, { type: decision.action, confidence: decision.confidence });

    const lifecycleUpdate: Partial<import('./RAREKernel').AgentLifecycle> = {
      shouldStart: false,
      shouldStop: false,
      shouldPause: false,
      shouldResume: false,
    };

    // High priority actions require agent to be running
    if (decision.priority === 'high' || decision.priority === 'critical') {
      if (!agentStatus.running) {
        lifecycleUpdate.shouldStart = true;
        lifecycleUpdate.reason = `High priority action: ${decision.action}`;
      }
    }

    // Low priority actions can pause agent if not needed
    if (decision.priority === 'low' && agentStatus.running) {
      if (needs.includes('quiet_mode') || needs.includes('battery_save')) {
        lifecycleUpdate.shouldPause = true;
        lifecycleUpdate.reason = 'Low priority + quiet mode';
      }
    }

    // App backgrounded - pause agent
    if (context?.appState === 'background' && agentStatus.running) {
      lifecycleUpdate.shouldPause = true;
      lifecycleUpdate.reason = 'App backgrounded';
    }

    // App foregrounded - resume agent if needed
    if (context?.appState === 'foreground' && !agentStatus.running && decision.priority !== 'low') {
      lifecycleUpdate.shouldResume = true;
      lifecycleUpdate.reason = 'App foregrounded + action needed';
    }

    // Update lifecycle
    if (lifecycleUpdate.shouldStart || lifecycleUpdate.shouldStop || lifecycleUpdate.shouldPause || lifecycleUpdate.shouldResume) {
      this.kernel.updateAgentLifecycle(decision.agent, lifecycleUpdate);
    }
  }

  /**
   * Notification Decision System
   * ✅ يقرر متى يحتاج Agent للإشعارات
   */
  private async decideNotifications(decision: CognitiveDecision): Promise<void> {
    if (!this.kernel) return;

    const lifecycle = this.kernel.getAgentLifecycle(decision.agent);
    if (!lifecycle) return;

    const context = this.contextStore.getContext();
    const needs = this.anticipateNeeds(context, { type: 'neutral', intensity: 0.5 }, { type: decision.action, confidence: decision.confidence });

    const notificationUpdate: Partial<import('./RAREKernel').AgentLifecycle> = {
      needsNotification: false,
      notificationPriority: 'low' as const,
    };

    // Critical actions always need notification
    if (decision.priority === 'critical') {
      notificationUpdate.needsNotification = true;
      notificationUpdate.notificationPriority = 'critical';
      notificationUpdate.reason = `Critical action: ${decision.action}`;
    }

    // High priority actions need notification if user is not actively using the app
    if (decision.priority === 'high' && context?.appState !== 'foreground') {
      notificationUpdate.needsNotification = true;
      notificationUpdate.notificationPriority = 'high';
      notificationUpdate.reason = `High priority action while app backgrounded: ${decision.action}`;
    }

    // Urgent needs require notification
    if (needs.includes('urgent_attention') || needs.includes('sos')) {
      notificationUpdate.needsNotification = true;
      notificationUpdate.notificationPriority = 'critical';
      notificationUpdate.reason = 'Urgent need detected';
    }

    // Quiet mode - no notifications
    if (needs.includes('quiet_mode') || needs.includes('do_not_disturb')) {
      notificationUpdate.needsNotification = false;
      notificationUpdate.reason = 'Quiet mode active';
    }

    // Update lifecycle with notification decision
    if (notificationUpdate.needsNotification !== lifecycle.needsNotification || 
        notificationUpdate.notificationPriority !== lifecycle.notificationPriority) {
      this.kernel.updateAgentLifecycle(decision.agent, notificationUpdate);
    }
  }

  /**
   * Step 5: Learn (Continuous Learning Layer)
   * ✅ Enhanced with error handling
   * ✅ Enhanced with Memory Storage
   */
  private async learn(
    understanding: Understanding,
    decision: CognitiveDecision
  ): Promise<void> {
    try {
      // ✅ Safety check: Validate inputs
      if (!decision || !decision.agent || !decision.action) {
        console.warn('CognitiveLoop: Invalid decision for learning');
        return;
      }

      // Track decision patterns (with limit to prevent memory issues)
      try {
        const pattern = `${decision.agent}:${decision.action}`;
        const count = this.improvementPatterns.get(pattern) || 0;
        this.improvementPatterns.set(pattern, count + 1);
        
        // Limit map size to prevent memory issues
        const MAX_PATTERNS = 500;
        if (this.improvementPatterns.size > MAX_PATTERNS) {
          // Remove oldest entries (simple strategy: remove first entry)
          const firstKey = this.improvementPatterns.keys().next().value;
          if (firstKey) {
            this.improvementPatterns.delete(firstKey);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('CognitiveLoop: Failed to track pattern:', error);
        }
        // Non-critical, continue
      }

      // Update context with interaction
      try {
        const interaction: Interaction = {
          id: `interaction_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          input: understanding.context?.session?.lastInput || '',
          output: decision.action,
          emotion: understanding.emotion,
          intent: understanding.intent,
        };

        this.contextStore.addInteraction(interaction);

        // ✅ STORE IN MEMORY ENGINE
        await this.memoryEngine.storeInteraction({
          id: interaction.id,
          type: decision.action,
          input: interaction.input,
          output: interaction.output,
          context: understanding.context,
          timestamp: interaction.timestamp,
          sentiment: this.mapEmotionToSentiment(understanding.emotion),
          success: true, // Assume success unless error
        });
      } catch (error) {
        console.warn('CognitiveLoop: Failed to add interaction:', error);
        // Non-critical, continue
      }

      // Emit learning event
      try {
        const pattern = `${decision.agent}:${decision.action}`;
        const count = this.improvementPatterns.get(pattern) || 0;
        this.emit('cognitive:learned', {
          pattern,
          frequency: count + 1,
        });
      } catch (error) {
        console.warn('CognitiveLoop: Failed to emit learning event:', error);
        // Non-critical, continue
      }
    } catch (error) {
      console.error('CognitiveLoop: Error in learn:', error);
      // Non-critical, don't throw
    }
  }

  /**
   * Map Emotion to Sentiment
   */
  private mapEmotionToSentiment(emotion: Emotion): 'positive' | 'negative' | 'neutral' {
    const positiveEmotions = ['happy', 'excited', 'curious', 'focused'];
    const negativeEmotions = ['concerned', 'urgent'];
    
    if (positiveEmotions.includes(emotion.type)) {
      return 'positive';
    } else if (negativeEmotions.includes(emotion.type)) {
      return 'negative';
    }
    return 'neutral';
  }

  /**
   * Analyze Emotion (Emotion Analysis Engine)
   */
  private analyzeEmotion(input: any, context: any): Emotion {
    const text = (input.text || '').toLowerCase();
    
    // Enhanced emotion detection
    const emotionKeywords: Record<string, string[]> = {
      happy: ['سعيد', 'فرح', 'رائع', 'ممتاز', 'جميل', 'happy', 'great', 'awesome'],
      excited: ['متحمس', 'مشوق', 'excited', 'thrilled'],
      focused: ['ركز', 'انتبه', 'focus', 'concentrate'],
      curious: ['كيف', 'لماذا', 'ماذا', 'how', 'why', 'what'],
      concerned: ['مشكلة', 'خطأ', 'فشل', 'problem', 'error', 'failed'],
      urgent: ['عاجل', 'سريع', 'urgent', 'quick', 'fast'],
      neutral: [],
    };

    for (const [emotionType, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return {
          type: emotionType as Emotion['type'],
          intensity: 0.8,
          confidence: 0.9,
        };
      }
    }

    // Check context
    const recentEmotions = context.memory?.emotionalState?.recent || [];
    if (recentEmotions.length > 0) {
      const lastEmotion = recentEmotions[recentEmotions.length - 1];
      return {
        type: lastEmotion.type,
        intensity: lastEmotion.intensity * 0.8,
        confidence: 0.7,
      };
    }

    return {
      type: 'neutral',
      intensity: 0.5,
      confidence: 0.5,
    };
  }

  /**
   * Recognize Intent (Intent Recognition Engine)
   */
  private recognizeIntent(input: any, context: any): Intent {
    const text = (input.text || '').toLowerCase();

    // Enhanced intent patterns
    const intentPatterns: Record<string, RegExp[]> = {
      // ✅ Owner commands (أوامر المستخدم)
      owner_command: [
        /^(أمر|command|order|أريد|أطلب|نادر|nader).*(الاجنت|agent|العميل|client|المجلس|council)/i,
        /^(كيف|how).*(أرحب|greet|أتعامل|deal).*(عميل|client)/i,
        /^(ماذا|what).*(أعمل|do|أفعل|should).*(عميل|client)/i,
      ],
      
      // ✅ Council intents
      council_debate: [
        /^(مجلس| council|نصيحة|advice|رأي|opinion|توصية|recommendation)/i,
        /^(ماذا|what).*(توصي|recommend|تنصح|advise)/i,
        /^(أريد|want).*(رأي|opinion|نصيحة|advice)/i,
      ],
      
      get_advice: [
        /^(نصيحة|advice|رأي|opinion|توصية|recommendation)/i,
        /^(ماذا|what).*(توصي|recommend)/i,
      ],
      
      get_recommendation: [
        /^(توصية|recommendation|اقتراح|suggestion)/i,
        /^(ماذا|what).*(توصي|recommend)/i,
      ],
      
      // ✅ Client interaction intents
      client_greeting: [
        /^(كيف|how).*(أرحب|greet|أستقبل|welcome).*(عميل|client)/i,
        /^(طريقة|way).*(الترحيب|greeting)/i,
        /^(greet|welcome).*(client|عميل)/i,
      ],
      
      client_action: [
        /^(ماذا|what).*(أعمل|do|أفعل|should).*(عميل|client)/i,
        /^(كيف|how).*(أتعامل|deal|handle).*(طلب|request).*(عميل|client)/i,
        /^(action|action).*(client|عميل)/i,
      ],
      
      voice_command: [/^رير|^نادر|^rare|^nader/i, /^استمع|^listen/i],
      enable_voice: [/^enable.*voice|^فعّل.*صوت|^تشغيل.*صوت|^start.*voice/i, /^تفعيل.*صوت/i],
      disable_voice: [/^disable.*voice|^أوقف.*صوت|^إيقاف.*صوت|^stop.*voice/i, /^إيقاف.*صوت/i],
      build_app: [/^بني|^build|^generate|^create.*app/i, /^app.*builder/i],
      file_operation: [/^ملف|^file|^document|^scan|^ocr|^رفع|^تحميل/i],
      vault_access: [/^خزنة|^vault|^secure|^مشفر|^black.*vault/i],
      portal_request: [/^portal|^client|^preview|^بوابة|^لينك/i],
      loyalty_check: [/^loyalty|^نقاط|^points|^مستوى|^ولاء|^مكافآت/i],
      service_control: [/^service|^backend|^cloudflare|^widget|^خدمة|^باك اند|^كلاودفلير|^ويدجت|^تشغيل|^إيقاف|^إعادة.*تشغيل|^حالة.*خدمة/i, /^start|^stop|^restart|^status/i],
      research_query: [/^research|^بحث|^تحليل|^تحسين|^تطوير/i],
      phone_call: [/^اتصل|^اتصلي|^كلم|^كلمي|^call|^phone/i, /^مكالمة|^تليفون/i],
      send_email: [/^ارسل.*ايميل|^send.*email|^بريد|^email/i],
      send_whatsapp: [/^واتساب|^whatsapp|^wa|^ارسل.*واتس/i],
      contact_family: [/^اتصل.*عائلة|^كلم.*عائلة|^contact.*family|^نادر|^أمي|^ناريمان|^ندى|^زيان|^تمارا|^عمر|^كيان|^nader|^omy|^nariman|^nada|^zien|^tamara|^omar|^kayan/i],
      ultimate_assistant: [/^ultimate|^assistant|^مساعد|^رير.*اتصل|^رير.*كلم/i],
      chat: [/^مرحبا|^hello|^hi|^أهلا/i],
      question: [/^كيف|^لماذا|^ماذا|^what|^how|^why/i, /\?/],
    };

    for (const [intentType, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => pattern.test(text))) {
        return {
          type: intentType,
          confidence: 0.9,
          parameters: this.extractParameters(text, intentType),
        };
      }
    }

    return {
      type: 'chat',
      confidence: 0.5,
    };
  }

  /**
   * Assess Situation
   */
  private assessSituation(context: any): any {
    return {
      time: context.ambient?.time || {},
      location: context.ambient?.location,
      activity: context.ambient?.activity,
      recentInteractions: context.session?.interactions?.slice(-5) || [],
    };
  }

  /**
   * Anticipate Needs
   */
  private anticipateNeeds(
    context: any,
    emotion: Emotion,
    intent: Intent
  ): string[] {
    const needs: string[] = [];

    // Time-based
    const hour = context.ambient?.time?.hour || new Date().getHours();
    if (hour >= 22 || hour < 6) {
      needs.push('quiet_mode');
    }

    // Emotion-based
    if (emotion.type === 'focused') {
      needs.push('minimize_interruption');
    }

    // Intent-based
    if (intent.type === 'vault_access') {
      needs.push('security_priority');
    }

    return needs;
  }

  /**
   * Calculate Urgency
   */
  private calculateUrgency(understanding: Understanding): 'low' | 'medium' | 'high' {
    if (understanding.emotion.type === 'urgent' || understanding.emotion.type === 'concerned') {
      return 'high';
    }
    if (understanding.intent.type === 'vault_access' || understanding.intent.type === 'voice_command') {
      return 'high';
    }
    return 'medium';
  }

  /**
   * Calculate Complexity
   */
  private calculateComplexity(understanding: Understanding): 'simple' | 'medium' | 'complex' {
    if (understanding.intent.type === 'build_app') {
      return 'complex';
    }
    if (understanding.intent.type === 'file_operation') {
      return 'medium';
    }
    return 'simple';
  }

  /**
   * Extract Parameters
   */
  private extractParameters(text: string, intentType: string): Record<string, any> {
    const params: Record<string, any> = {};

    if (intentType === 'build_app') {
      const appMatch = text.match(/(?:build|create|generate).*?(?:app|application)\s+(.+)/i);
      if (appMatch) {
        params.appName = appMatch[1].trim();
      }
    }

    if (intentType === 'file_operation') {
      const fileMatch = text.match(/(?:scan|ocr|file|document)\s+(.+)/i);
      if (fileMatch) {
        params.fileName = fileMatch[1].trim();
      }
    }

    return params;
  }

  /**
   * Process System Event
   */
  private async processSystemEvent(event: any): Promise<void> {
    // Handle system-level events
    if (event.type === 'agent:completed') {
      // Learn from agent completion
      await this.learnFromAgentCompletion(event.data);
    }
  }

  /**
   * Learn from Agent Completion
   */
  private async learnFromAgentCompletion(data: any): Promise<void> {
    // Track successful operations
    const pattern = `${data.agent}:${data.action}:success`;
    const count = this.improvementPatterns.get(pattern) || 0;
    this.improvementPatterns.set(pattern, count + 1);
  }

  /**
   * Emit event via Kernel
   * ✅ Enhanced with error handling
   */
  private emit(type: string, data: any): void {
    try {
      // ✅ Safety check: Validate inputs
      if (!type || typeof type !== 'string') {
        console.warn('CognitiveLoop: Invalid event type');
        return;
      }

      if (this.kernel) {
        try {
          this.kernel.emit({
            type,
            data: data || {},
          });
        } catch (error) {
          console.error('CognitiveLoop: Failed to emit via kernel:', error);
          // Fallback to EventBus
          this.fallbackEmit(type, data);
        }
      } else {
        // Fallback to EventBus if kernel not available
        this.fallbackEmit(type, data);
      }
    } catch (error) {
      console.error('CognitiveLoop: Critical error in emit:', error);
      // Last resort: try EventBus directly
      try {
        this.eventBus.emit({
          type,
          data: data || {},
          timestamp: Date.now(),
        });
      } catch (fallbackError) {
        console.error('CognitiveLoop: EventBus fallback also failed:', fallbackError);
      }
    }
  }

  /**
   * Fallback emit via EventBus
   */
  private fallbackEmit(type: string, data: any): void {
    try {
      this.eventBus.emit({
        type,
        data: data || {},
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('CognitiveLoop: EventBus emit failed:', error);
    }
  }

  /**
   * Get Decision History
   */
  getDecisionHistory(): CognitiveDecision[] {
    return [...this.decisionHistory];
  }

  /**
   * Get Improvement Patterns
   */
  getImprovementPatterns(): Map<string, number> {
    return new Map(this.improvementPatterns);
  }
}
