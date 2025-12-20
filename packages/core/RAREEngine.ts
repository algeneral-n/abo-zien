/**
 * RARE 4N - Base Engine Interface
 * ?????????? ???????????? ?????? Engines
 */

import { RAREKernel } from './RAREKernel';

export interface EngineConfig {
  kernel: RAREKernel;
  [key: string]: any;
}

export interface EngineStatus {
  id: string;
  name: string;
  version: string;
  initialized: boolean;
  running: boolean;
  error?: string;
}

export abstract class RAREEngine {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;

  /**
   * Initialize engine
   */
  abstract initialize(config: EngineConfig): Promise<void>;

  /**
   * Start engine
   */
  abstract start(): Promise<void>;

  /**
   * Stop engine
   */
  abstract stop(): Promise<void>;

  /**
   * Pause engine (optional)
   */
  pause?(): Promise<void>;

  /**
   * Resume engine (optional)
   */
  resume?(): Promise<void>;

  /**
   * Get engine status
   */
  getStatus(): EngineStatus {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      running: this.running,
    };
  }

  /**
   * Handle kernel events (optional)
   */
  onEvent?(event: any): void;

  /**
   * Emit event to kernel
   */
  protected emit(type: string, data: any): void {
    if (this.kernel) {
      this.kernel.emit({ type, data, source: this.id });
    }
  }
}


