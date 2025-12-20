/**
 * RARE 4N - Core Kernel
 * نواة النظام - يدير كل شيء
 * ✅ Integrated with PolicyEngine & MemoryEngine
 */

import { RAREEngine } from './RAREEngine';
import { ContextStore } from './ContextStore';
import { EventBus } from './EventBus';
import { PolicyEngine } from './PolicyEngine';
import { MemoryEngine } from './MemoryEngine';
import { HealthMonitor } from './utils/HealthMonitor';

// Import all agents
import {
  BuilderAgent,
  VoiceAgent,
  FilingAgent,
  VaultAgent,
  PortalAgent,
  LoyaltyAgent,
  MapsAgent,
  CommunicationAgent,
  CouncilAgent,
  UltimateAssistant,
  CarPlayAgent,
  ServiceAgent,
} from './agents';

export interface KernelEvent {
  type: string;
  data: any;
  timestamp: number;
  source?: string;
}

export interface AgentLifecycle {
  engineId: string;
  shouldStart: boolean;
  shouldStop: boolean;
  shouldPause: boolean;
  shouldResume: boolean;
  needsNotification: boolean;
  notificationPriority: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: number;
  reason?: string;
}

export interface KernelState {
  initialized: boolean;
  running: boolean;
  paused: boolean;
  engines: Map<string, RAREEngine>;
  agentLifecycles: Map<string, AgentLifecycle>;
}

export class RAREKernel {
  private static instance: RAREKernel;
  private state: KernelState;
  private contextStore: ContextStore;
  private eventBus: EventBus;
  private policyEngine: PolicyEngine;
  private memoryEngine: MemoryEngine;
  private audioSessionActive: boolean = false;
  
  // ✅ Health Monitor
  private healthMonitor: HealthMonitor;

  // Agents
  private builderAgent: BuilderAgent;
  private voiceAgent: VoiceAgent;
  private filingAgent: FilingAgent;
  private vaultAgent: VaultAgent;
  private portalAgent: PortalAgent;
  private loyaltyAgent: LoyaltyAgent;
  private mapsAgent: MapsAgent;
  private communicationAgent: CommunicationAgent;
  private councilAgent: CouncilAgent;
  private ultimateAssistant: UltimateAssistant;
  private carPlayAgent: CarPlayAgent;
  private serviceAgent: ServiceAgent;

  private constructor() {
    try {
      this.state = {
        initialized: false,
        running: false,
        paused: false,
        engines: new Map(),
        agentLifecycles: new Map(),
      };
      this.contextStore = ContextStore.getInstance();
      this.eventBus = EventBus.getInstance();
      this.policyEngine = PolicyEngine.getInstance();
      this.memoryEngine = MemoryEngine.getInstance();
      
      // ✅ Initialize Health Monitor
      this.healthMonitor = new HealthMonitor();

      // Initialize agents (with error handling for each)
      try {
        this.builderAgent = new BuilderAgent();
      } catch (error) {
        console.error('❌ Failed to create BuilderAgent:', error);
      }
      
      try {
        this.voiceAgent = new VoiceAgent();
      } catch (error) {
        console.error('❌ Failed to create VoiceAgent:', error);
      }
      
      try {
        this.filingAgent = new FilingAgent();
      } catch (error) {
        console.error('❌ Failed to create FilingAgent:', error);
      }
      
      try {
        this.vaultAgent = new VaultAgent();
      } catch (error) {
        console.error('❌ Failed to create VaultAgent:', error);
      }
      
      try {
        this.portalAgent = new PortalAgent();
      } catch (error) {
        console.error('❌ Failed to create PortalAgent:', error);
      }
      
      try {
        this.loyaltyAgent = new LoyaltyAgent();
      } catch (error) {
        console.error('❌ Failed to create LoyaltyAgent:', error);
      }
      
      try {
        this.mapsAgent = new MapsAgent();
      } catch (error) {
        console.error('❌ Failed to create MapsAgent:', error);
      }
      
      try {
        this.communicationAgent = new CommunicationAgent();
      } catch (error) {
        console.error('❌ Failed to create CommunicationAgent:', error);
      }
      
      try {
        this.councilAgent = new CouncilAgent();
      } catch (error) {
        console.error('❌ Failed to create CouncilAgent:', error);
      }
      
      try {
        this.ultimateAssistant = new UltimateAssistant();
      } catch (error) {
        console.error('❌ Failed to create UltimateAssistant:', error);
      }
      
      try {
        this.carPlayAgent = new CarPlayAgent();
      } catch (error) {
        console.error('❌ Failed to create CarPlayAgent:', error);
      }
    } catch (error) {
      console.error('❌ RAREKernel constructor error:', error);
      // Continue with minimal state
      this.state = {
        initialized: false,
        running: false,
        paused: false,
        engines: new Map(),
        agentLifecycles: new Map(),
      };
    }
  }

  static getInstance(): RAREKernel {
    if (!RAREKernel.instance) {
      RAREKernel.instance = new RAREKernel();
    }
    return RAREKernel.instance;
  }

  /**
   * Initialize kernel
   */
  async init(): Promise<void> {
    if (this.state.initialized) {
      return;
    }

    try {
      // Initialize context store (with error handling)
      try {
        await this.contextStore.init();
      } catch (error) {
        console.error('❌ ContextStore init error:', error);
        // Continue anyway
      }

      // Initialize event bus (synchronous, should not fail)
      try {
        this.eventBus.init();
      } catch (error) {
        console.error('❌ EventBus init error:', error);
        // Continue anyway
      }

      // Initialize Policy Engine (with error handling)
      try {
        await this.policyEngine.init();
      } catch (error) {
        console.error('❌ PolicyEngine init error:', error);
        // Continue anyway
      }

      // Initialize Memory Engine (with error handling)
      try {
        await this.memoryEngine.init();
      } catch (error) {
        console.error('❌ MemoryEngine init error:', error);
        // Continue anyway
      }

      // Register all agents as engines (with error handling)
      try {
        this.registerEngine(this.serviceAgent);
        this.registerEngine(this.builderAgent);
        this.registerEngine(this.voiceAgent);
        this.registerEngine(this.filingAgent);
        this.registerEngine(this.vaultAgent);
        this.registerEngine(this.portalAgent);
        this.registerEngine(this.loyaltyAgent);
        this.registerEngine(this.mapsAgent);
        this.registerEngine(this.communicationAgent);
        this.registerEngine(this.councilAgent);
        this.registerEngine(this.ultimateAssistant);
        this.registerEngine(this.carPlayAgent);
      } catch (error) {
        console.error('❌ Register engines error:', error);
        // Continue anyway
      }

      // Initialize all agents (with error handling for each)
      const agents = [
        this.serviceAgent,
        this.builderAgent,
        this.voiceAgent,
        this.filingAgent,
        this.vaultAgent,
        this.portalAgent,
        this.loyaltyAgent,
        this.mapsAgent,
        this.communicationAgent,
        this.councilAgent,
        this.ultimateAssistant,
        this.carPlayAgent,
      ];

      for (const agent of agents) {
        try {
          await agent.init();
        } catch (error) {
          console.error(`❌ Agent ${agent.id} init error:`, error);
          // Continue with other agents
        }
      }

      // Setup event listeners (with error handling)
      try {
        this.setupEventListeners();
      } catch (error) {
        console.error('❌ Setup event listeners error:', error);
        // Continue anyway
      }

      this.state.initialized = true;
      this.emit({ type: 'kernel:initialized', data: {} });
    } catch (error) {
      console.error('❌ Critical Kernel init error:', error);
      // Mark as initialized anyway to prevent infinite loops
      this.state.initialized = true;
    }
  }

  /**
   * Start kernel and all engines
   */
  async start(): Promise<void> {
    if (!this.state.initialized) {
      await this.init();
    }

    if (this.state.running) {
      return;
    }

    // Start all registered engines
    const startPromises = Array.from(this.state.engines.values()).map(engine => 
      engine.start().catch(err => {
        console.error(`Engine ${engine.id} failed to start:`, err);
      })
    );

    await Promise.all(startPromises);

    this.state.running = true;
    
    // ✅ Start Health Monitoring
    this.healthMonitor.start(this.state.engines);
    
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/RAREKernel.ts:305',message:'Kernel started successfully',data:{enginesCount:this.state.engines.size,running:this.state.running},timestamp:Date.now(),sessionId:'kernel-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    }
    // #endregion
    
    this.emit({ type: 'kernel:started', data: {} });
  }

  /**
   * Stop kernel and all engines
   */
  async stop(): Promise<void> {
    if (!this.state.running) {
      return;
    }

    // Stop all engines
    const stopPromises = Array.from(this.state.engines.values()).map(engine =>
      engine.stop().catch(err => {
        console.error(`Engine ${engine.id} failed to stop:`, err);
      })
    );

    await Promise.all(stopPromises);

    this.state.running = false;
    this.emit({ type: 'kernel:stopped', data: {} });
  }

  /**
   * Pause kernel (app backgrounded)
   */
  async pause(): Promise<void> {
    if (!this.state.running || this.state.paused) {
      return;
    }

    // Pause all engines
    for (const engine of this.state.engines.values()) {
      if (engine.pause) {
        await engine.pause();
      }
    }

    this.state.paused = true;
    this.emit({ type: 'kernel:paused', data: {} });
  }

  /**
   * Resume kernel (app foregrounded)
   */
  async resume(): Promise<void> {
    if (!this.state.paused) {
      return;
    }

    // Resume all engines
    for (const engine of this.state.engines.values()) {
      if (engine.resume) {
        await engine.resume();
      }
    }

    this.state.paused = false;
    this.emit({ type: 'kernel:resumed', data: {} });
  }

  /**
   * Register an engine
   */
  registerEngine(engine: RAREEngine): void {
    if (this.state.engines.has(engine.id)) {
      console.warn(`Engine ${engine.id} already registered`);
      return;
    }

      this.state.engines.set(engine.id, engine);
      
      // Initialize lifecycle management
      this.state.agentLifecycles.set(engine.id, {
        engineId: engine.id,
        shouldStart: false,
        shouldStop: false,
        shouldPause: false,
        shouldResume: false,
        needsNotification: false,
        notificationPriority: 'low',
        lastActivity: Date.now(),
      });
      
      // ✅ Register engine with Health Monitor
      this.healthMonitor.registerEngine(engine.id);
    
    // Initialize engine if kernel is already initialized
    if (this.state.initialized) {
      engine.initialize({ kernel: this }).catch(err => {
        console.error(`Engine ${engine.id} initialization failed:`, err);
      });
    }

    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/RAREKernel.ts:411',message:'Engine registered',data:{engineId:engine.id,totalEngines:this.state.engines.size},timestamp:Date.now(),sessionId:'kernel-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    }
    // #endregion

    this.emit({ type: 'engine:registered', data: { engineId: engine.id } });
  }

  /**
   * Unregister an engine
   */
  unregisterEngine(engineId: string): void {
    const engine = this.state.engines.get(engineId);
    if (engine) {
      engine.stop().catch(console.error);
      this.state.engines.delete(engineId);
      
      // ✅ Unregister from Health Monitor
      this.healthMonitor.unregisterEngine(engineId);
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/RAREKernel.ts:426',message:'Engine unregistered',data:{engineId,totalEngines:this.state.engines.size},timestamp:Date.now(),sessionId:'kernel-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      }
      // #endregion
      
      this.emit({ type: 'engine:unregistered', data: { engineId } });
    }
  }

  /**
   * Get engine by ID
   */
  getEngine(engineId: string): RAREEngine | undefined {
    return this.state.engines.get(engineId);
  }

  /**
   * Emit event
   * ✅ Enhanced with error handling
   */
  emit(event: Omit<KernelEvent, 'timestamp'>): void {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/RAREKernel.ts:emit',message:'emit called',data:{eventType:event?.type,hasData:!!event?.data,source:event?.source},timestamp:Date.now(),sessionId:'kernel-session',runId:'run1',hypothesisId:'EMIT_START'})}).catch(()=>{});
      }
      // #endregion
      
      // ✅ Safety check: Validate event
      if (!event || !event.type) {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/RAREKernel.ts:emit',message:'Invalid event structure',data:{event},timestamp:Date.now(),sessionId:'kernel-session',runId:'run1',hypothesisId:'INVALID_EVENT'})}).catch(()=>{});
        }
        // #endregion
        console.warn('RAREKernel: Invalid event structure');
        return;
      }

      const fullEvent: KernelEvent = {
        ...event,
        timestamp: Date.now(),
        data: event.data || {},
      };

      try {
        this.eventBus.emit(fullEvent);
      } catch (error) {
        console.error('RAREKernel: EventBus emit failed:', error);
        // Non-critical, continue
      }
    } catch (error) {
      console.error('RAREKernel: Critical error in emit:', error);
    }
  }

  /**
   * Subscribe to events
   */
  on(eventType: string, handler: (event: KernelEvent) => void): () => void {
    return this.eventBus.on(eventType, handler);
  }

  /**
   * Get context
   */
  getContext() {
    return this.contextStore.getContext();
  }

  /**
   * Get Memory Engine
   */
  getMemoryEngine() {
    return this.memoryEngine;
  }

  /**
   * Get Policy Engine
   */
  getPolicyEngine() {
    return this.policyEngine;
  }

  /**
   * Update context
   */
  updateContext(updates: any): void {
    this.contextStore.updateContext(updates);
    this.emit({ type: 'context:updated', data: updates });
  }

  /**
   * Get kernel state
   */
  getState(): KernelState {
    return { ...this.state };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen to engine events
    this.eventBus.on('engine:*', (event) => {
      // Route engine events
      this.handleEngineEvent(event);
    });

    // Listen to context updates
    this.eventBus.on('context:updated', (event) => {
      // Update visual presence based on context
      this.emit({ type: 'visual:update', data: event.data });
    });
  }

  /**
   * Handle engine events
   */
  private handleEngineEvent(event: KernelEvent): void {
    // Route to appropriate handlers
    switch (event.type) {
      case 'ai:response':
        this.updateContext({ lastAIResponse: event.data });
        break;
      case 'emotion:detected':
        this.updateContext({ currentEmotion: event.data });
        break;
      case 'intent:recognized':
        this.updateContext({ currentIntent: event.data });
        break;
      // Add more handlers as needed
    }
  }

  /**
   * Agent Lifecycle Management
   * ✅ نظام إداري مركزي - يدير متى يفتح/يغلق كل Agent
   */
  
  /**
   * Update agent lifecycle based on Cognitive Loop decision
   */
  updateAgentLifecycle(engineId: string, lifecycle: Partial<AgentLifecycle>): void {
    const current = this.state.agentLifecycles.get(engineId);
    if (!current) {
      console.warn(`Agent lifecycle not found for ${engineId}`);
      return;
    }

    const updated: AgentLifecycle = {
      ...current,
      ...lifecycle,
      lastActivity: Date.now(),
    };

    this.state.agentLifecycles.set(engineId, updated);

    // Execute lifecycle actions
    this.executeLifecycleActions(engineId, updated);
  }

  /**
   * Execute lifecycle actions based on Cognitive Loop decision
   */
  private async executeLifecycleActions(engineId: string, lifecycle: AgentLifecycle): Promise<void> {
    const engine = this.state.engines.get(engineId);
    if (!engine) {
      console.warn(`Engine ${engineId} not found`);
      return;
    }

    try {
      // Start agent if needed
      if (lifecycle.shouldStart && !engine.getStatus().running) {
        await engine.start();
        this.emit({ 
          type: 'agent:started', 
          data: { engineId, reason: lifecycle.reason } 
        });
      }

      // Stop agent if needed
      if (lifecycle.shouldStop && engine.getStatus().running) {
        await engine.stop();
        this.emit({ 
          type: 'agent:stopped', 
          data: { engineId, reason: lifecycle.reason } 
        });
      }

      // Pause agent if needed
      if (lifecycle.shouldPause && engine.getStatus().running && engine.pause) {
        await engine.pause();
        this.emit({ 
          type: 'agent:paused', 
          data: { engineId, reason: lifecycle.reason } 
        });
      }

      // Resume agent if needed
      if (lifecycle.shouldResume && engine.getStatus().running && engine.resume) {
        await engine.resume();
        this.emit({ 
          type: 'agent:resumed', 
          data: { engineId, reason: lifecycle.reason } 
        });
      }

      // Handle notifications
      if (lifecycle.needsNotification) {
        this.emit({ 
          type: 'agent:notification', 
          data: { 
            engineId, 
            priority: lifecycle.notificationPriority,
            reason: lifecycle.reason 
          } 
        });
      }
    } catch (error: any) {
      console.error(`Failed to execute lifecycle actions for ${engineId}:`, error);
      this.emit({ 
        type: 'agent:lifecycle_error', 
        data: { engineId, error: error.message } 
      });
    }
  }

  /**
   * Get agent lifecycle status
   */
  getAgentLifecycle(engineId: string): AgentLifecycle | undefined {
    return this.state.agentLifecycles.get(engineId);
  }

  /**
   * Get all agent lifecycles
   */
  getAllAgentLifecycles(): Map<string, AgentLifecycle> {
    return new Map(this.state.agentLifecycles);
  }

  /**
   * Get Policy Engine
   */
  getPolicyEngine(): PolicyEngine {
    return this.policyEngine;
  }

  /**
   * Get Memory Engine
   */
  getMemoryEngine(): MemoryEngine {
    return this.memoryEngine;
  }

  /**
   * ✅ Get Health Monitor
   */
  getHealthMonitor(): HealthMonitor {
    return this.healthMonitor;
  }

  /**
   * ✅ Get agent health status
   */
  getAgentHealth(engineId: string) {
    return this.healthMonitor.getHealth(engineId);
  }

  /**
   * ✅ Get all agent health statuses
   */
  getAllAgentHealth() {
    return this.healthMonitor.getAllHealth();
  }

  /**
   * Get agent by ID
   * ✅ Optimized: Uses Map lookup instead of switch statement
   */
  getAgent(agentId: string): any {
    // Use engine map for O(1) lookup
    const engine = this.state.engines.get(agentId);
    if (engine) {
      return engine;
    }
    
    // Fallback to direct agent references (for backward compatibility)
    const agentMap: Record<string, any> = {
      builder: this.builderAgent,
      voice: this.voiceAgent,
      filing: this.filingAgent,
      vault: this.vaultAgent,
      carplay: this.carPlayAgent,
      portal: this.portalAgent,
      loyalty: this.loyaltyAgent,
      maps: this.mapsAgent,
      communication: this.communicationAgent,
      council: this.councilAgent,
      ultimate: this.ultimateAssistant,
    };
    
    return agentMap[agentId] || null;
  }
}
