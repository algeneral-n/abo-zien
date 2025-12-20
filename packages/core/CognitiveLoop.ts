/**
 * RARE 4N - Cognitive Loop (العقل)
 * Cognitive Continuum Kernel - The Brain
 * 
 * القاعدة الذهبية: مفيش Agent يشتغل بدون قرار من Cognitive Loop
 */

import { RAREKernel } from './RAREKernel';
import { ContextStore, Emotion, Intent, Interaction } from './ContextStore';
import { EventBus } from './EventBus';

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
  private initialized: boolean = false;

  // Learning data
  private decisionHistory: CognitiveDecision[] = [];
  private improvementPatterns: Map<string, number> = new Map();

  private constructor() {
    this.contextStore = ContextStore.getInstance();
    this.eventBus = EventBus.getInstance();
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
    kernel.on('user:input', (event) => {
      this.processInput(event.data);
    });

    kernel.on('system:event', (event) => {
      this.processSystemEvent(event.data);
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
      // ✅ Safety check: Validate input
      if (!input || (!input.text && !input.audio)) {
        console.warn('CognitiveLoop: Invalid input received');
        return this.createFallbackDecision('Invalid input');
      }

      // ✅ Safety check: Ensure kernel is available
      if (!this.kernel) {
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

      // Step 1: Understanding (Context Awareness) - with error handling
      let understanding: Understanding;
      try {
        understanding = await this.understand(input);
      } catch (error) {
        console.error('CognitiveLoop: Understanding failed:', error);
        understanding = this.createFallbackUnderstanding(input);
      }

      // Step 2: Reasoning (Emotion + Intent Analysis) - with error handling
      let reasoning: any;
      try {
        reasoning = await this.reason(understanding);
      } catch (error) {
        console.error('CognitiveLoop: Reasoning failed:', error);
        reasoning = { urgency: 'medium', complexity: 'low' };
      }

      // Step 3: Decision Making - with error handling
      let decision: CognitiveDecision;
      try {
        decision = await this.makeDecision(understanding, reasoning);
      } catch (error) {
        console.error('CognitiveLoop: Decision making failed:', error);
        decision = this.createFallbackDecision('Decision making error');
      }

      // Step 4: Execute (via Kernel to Agent) - with error handling
      try {
        await this.execute(decision);
      } catch (error) {
        console.error('CognitiveLoop: Execution failed:', error);
        // Emit error event
        if (this.kernel) {
          this.kernel.emit({
            type: 'cognitive:error',
            data: { error: String(error), decision },
          });
        }
      }

      // Step 5: Learn (Continuous Improvement) - with error handling
      try {
        await this.learn(understanding, decision);
      } catch (error) {
        console.error('CognitiveLoop: Learning failed:', error);
        // Non-critical, continue
      }

      return decision;
    } catch (error) {
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
   */
  private async understand(input: any): Promise<Understanding> {
    const context = this.contextStore.getContext();

    // Get emotion
    const emotion = this.analyzeEmotion(input, context);

    // Get intent
    const intent = this.recognizeIntent(input, context);

    // Get situation
    const situation = this.assessSituation(context);

    // Anticipate needs
    const needs = this.anticipateNeeds(context, emotion, intent);

    return {
      context,
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
        decision = {
          action: 'file_operation',
          agent: 'filing',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants file operation',
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

      case 'carplay_connect':
        decision = {
          action: 'connect',
          agent: 'carplay',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants to connect CarPlay',
          priority: 'high',
        };
        break;

      case 'carplay_navigate':
        decision = {
          action: 'navigate',
          agent: 'carplay',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants CarPlay navigation',
          priority: 'high',
        };
        break;

      case 'carplay_voice':
        decision = {
          action: 'voice_command',
          agent: 'carplay',
          parameters: intent.parameters || {},
          confidence: intent.confidence,
          reasoning: 'User wants CarPlay voice command',
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

    // Store decision
    this.decisionHistory.push(decision);
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory.shift();
    }

    return decision;
  }

  /**
   * Step 4: Execute (via Kernel to Agent)
   * ✅ Enhanced with validation and error handling
   * ✅ Enhanced with Agent Lifecycle Management
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

      // ✅ Safety check: Verify agent exists
      const agent = this.kernel.getEngine(decision.agent);
      if (!agent) {
        console.warn(`CognitiveLoop: Agent ${decision.agent} not found, using fallback`);
        // Fallback to AI agent
        decision.agent = 'ai';
        decision.action = 'ai_chat';
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

      // Kernel routes to appropriate agent
      try {
        this.kernel.emit({
          type: `agent:${decision.agent}:execute`,
          data: {
            action: decision.action,
            parameters: decision.parameters || {},
            priority: decision.priority || 'medium',
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        console.error(`CognitiveLoop: Failed to emit agent:${decision.agent}:execute:`, error);
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

      // Track decision patterns
      try {
        const pattern = `${decision.agent}:${decision.action}`;
        const count = this.improvementPatterns.get(pattern) || 0;
        this.improvementPatterns.set(pattern, count + 1);
      } catch (error) {
        console.warn('CognitiveLoop: Failed to track pattern:', error);
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
      voice_command: [/^رير|^نادر|^rare|^nader/i, /^استمع|^listen/i],
      build_app: [/^بني|^build|^generate|^create.*app/i, /^app.*builder/i],
      file_operation: [/^ملف|^file|^document|^scan|^ocr|^رفع|^تحميل/i],
      vault_access: [/^خزنة|^vault|^secure|^مشفر|^black.*vault/i],
      portal_request: [/^portal|^client|^preview|^بوابة|^لينك/i],
      loyalty_check: [/^loyalty|^نقاط|^points|^مستوى|^ولاء|^مكافآت/i],
      research_query: [/^research|^بحث|^تحليل|^تحسين|^تطوير/i],
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

