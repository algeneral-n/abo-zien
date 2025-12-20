/**
 * RARE 4N - Core Kernel
 * نواة النظام - يدير كل شيء
 */

import { RAREEngine } from './RAREEngine';
import { ContextStore } from './ContextStore';
import { EventBus } from './EventBus';

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
  private audioSessionActive: boolean = false;

  private constructor() {
    this.state = {
      initialized: false,
      running: false,
      paused: false,
      engines: new Map(),
      agentLifecycles: new Map(),
    };
    this.contextStore = ContextStore.getInstance();
    this.eventBus = EventBus.getInstance();
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

    // Initialize context store
    await this.contextStore.init();

    // Initialize event bus
    this.eventBus.init();

    // Setup event listeners
    this.setupEventListeners();

    this.state.initialized = true;
    this.emit({ type: 'kernel:initialized', data: {} });
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
    
    // Initialize engine if kernel is already initialized
    if (this.state.initialized) {
      engine.initialize({ kernel: this }).catch(err => {
        console.error(`Engine ${engine.id} initialization failed:`, err);
      });
    }

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
      // ✅ Safety check: Validate event
      if (!event || !event.type) {
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
}

