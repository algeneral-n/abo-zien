/**
 * BaseAgent - قاعدة لجميع الـ Agents
 * كل Agent يرث من هذا الـ Base
 */

import { RAREEngine, EngineConfig } from '../RAREEngine';
import { RAREKernel } from '../RAREKernel';

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export abstract class BaseAgent extends RAREEngine {
  protected config: AgentConfig;
  protected kernel: RAREKernel | null = null;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get version(): string {
    return '1.0.0';
  }

  /**
   * Initialize agent (required by RAREEngine)
   */
  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;
    await this.init();
  }

  /**
   * Initialize agent
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    console.log(`[${this.config.name}] Initializing...`);
    try {
      await this.onInit();
      this.initialized = true;
      console.log(`[${this.config.name}] Initialized ✅`);
    } catch (error) {
      console.error(`[${this.config.name}] Init error:`, error);
      // لا نرمي الخطأ - نستمر حتى لو فشل init
    }
  }

  /**
   * Start agent
   */
  async start(): Promise<void> {
    if (this.running) return;
    console.log(`[${this.config.name}] Starting...`);
    this.running = true;
    try {
      await this.onStart();
      console.log(`[${this.config.name}] Started ✅`);
    } catch (error) {
      this.running = false;
      console.error(`[${this.config.name}] Start error:`, error);
      throw error;
    }
  }

  /**
   * Stop agent
   */
  async stop(): Promise<void> {
    if (!this.running) return;
    console.log(`[${this.config.name}] Stopping...`);
    this.running = false;
    try {
      await this.onStop();
      console.log(`[${this.config.name}] Stopped ✅`);
    } catch (error) {
      console.error(`[${this.config.name}] Stop error:`, error);
      throw error;
    }
  }

  /**
   * Process event
   */
  async processEvent(event: any): Promise<any> {
    console.log(`[${this.config.name}] Processing event:`, event.type);
    return await this.onProcessEvent(event);
  }

  /**
   * Execute action
   */
  async executeAction(action: string, parameters: any): Promise<any> {
    if (!this.initialized) {
      console.warn(`[${this.config.name}] Not initialized, initializing now...`);
      await this.init();
    }
    console.log(`[${this.config.name}] Executing action: ${action}`);
    try {
      return await this.onExecuteAction(action, parameters);
    } catch (error) {
      console.error(`[${this.config.name}] Action error:`, error);
      throw error;
    }
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return this.config.capabilities;
  }

  /**
   * Hook: Initialize (override in subclass)
   */
  protected async onInit(): Promise<void> {
    // Override in subclass
  }

  /**
   * Hook: Start (override in subclass)
   */
  protected async onStart(): Promise<void> {
    // Override in subclass
  }

  /**
   * Hook: Stop (override in subclass)
   */
  protected async onStop(): Promise<void> {
    // Override in subclass
  }

  /**
   * Hook: Process event (override in subclass)
   */
  protected async onProcessEvent(event: any): Promise<any> {
    // Override in subclass
    return null;
  }

  /**
   * Hook: Execute action (override in subclass)
   */
  protected abstract onExecuteAction(action: string, parameters: any): Promise<any>;
}

