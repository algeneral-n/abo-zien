/**
 * Health Monitor for Agents
 * ✅ Monitors agent health and triggers recovery
 */

export interface AgentHealth {
  engineId: string;
  isHealthy: boolean;
  lastCheck: number;
  consecutiveFailures: number;
  lastError?: string;
  uptime: number;
  responseTime: number;
}

export class HealthMonitor {
  private healthStatus: Map<string, AgentHealth> = new Map();
  private checkInterval: number = 30000; // 30 seconds
  private maxFailures: number = 3;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start health monitoring
   */
  start(engines: Map<string, any>): void {
    if (this.intervalId) {
      return; // Already started
    }

    // Initialize health status for all engines
    engines.forEach((engine, engineId) => {
      this.healthStatus.set(engineId, {
        engineId,
        isHealthy: true,
        lastCheck: Date.now(),
        consecutiveFailures: 0,
        uptime: 0,
        responseTime: 0,
      });
    });

    // Start periodic health checks
    this.intervalId = setInterval(() => {
      this.performHealthChecks(engines);
    }, this.checkInterval);
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Perform health checks on all engines
   */
  private async performHealthChecks(engines: Map<string, any>): Promise<void> {
    const checkPromises = Array.from(engines.entries()).map(async ([engineId, engine]) => {
      const startTime = Date.now();
      let isHealthy = false;
      let error: string | undefined;

      try {
        // Check if engine is running
        const status = engine.getStatus();
        isHealthy = status.running && !status.error;

        // If engine has error, mark as unhealthy
        if (status.error) {
          error = status.error;
        }

        const responseTime = Date.now() - startTime;
        const health = this.healthStatus.get(engineId);

        if (health) {
          health.lastCheck = Date.now();
          health.responseTime = responseTime;

          if (!isHealthy) {
            health.consecutiveFailures++;
            health.lastError = error;
            
            if (health.consecutiveFailures >= this.maxFailures) {
              health.isHealthy = false;
              // Trigger recovery
              this.triggerRecovery(engineId, engine);
            }
          } else {
            // Reset failure count on success
            health.consecutiveFailures = 0;
            health.isHealthy = true;
            health.lastError = undefined;
            health.uptime = Date.now() - (health.lastCheck - health.uptime);
          }
        }
      } catch (err: any) {
        const health = this.healthStatus.get(engineId);
        if (health) {
          health.consecutiveFailures++;
          health.lastError = err.message || 'Health check failed';
          health.isHealthy = false;

          if (health.consecutiveFailures >= this.maxFailures) {
            this.triggerRecovery(engineId, engine);
          }
        }
      }
    });

    await Promise.all(checkPromises);
  }

  /**
   * Trigger recovery for unhealthy agent
   */
  private async triggerRecovery(engineId: string, engine: any): Promise<void> {
    try {
      console.log(`🔄 Attempting recovery for ${engineId}...`);

      // Stop the engine
      try {
        await engine.stop();
      } catch (err) {
        console.warn(`Failed to stop ${engineId} during recovery:`, err);
      }

      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Restart the engine
      try {
        await engine.start();
        console.log(`✅ Recovery successful for ${engineId}`);
        
        const health = this.healthStatus.get(engineId);
        if (health) {
          health.consecutiveFailures = 0;
          health.isHealthy = true;
          health.lastError = undefined;
        }
      } catch (err) {
        console.error(`❌ Recovery failed for ${engineId}:`, err);
        const health = this.healthStatus.get(engineId);
        if (health) {
          health.lastError = `Recovery failed: ${err}`;
        }
      }
    } catch (error) {
      console.error(`❌ Recovery process error for ${engineId}:`, error);
    }
  }

  /**
   * Get health status for an agent
   */
  getHealth(engineId: string): AgentHealth | undefined {
    return this.healthStatus.get(engineId);
  }

  /**
   * Get all health statuses
   */
  getAllHealth(): Map<string, AgentHealth> {
    return new Map(this.healthStatus);
  }

  /**
   * Mark agent as healthy (manual override)
   */
  markHealthy(engineId: string): void {
    const health = this.healthStatus.get(engineId);
    if (health) {
      health.isHealthy = true;
      health.consecutiveFailures = 0;
      health.lastError = undefined;
    }
  }

  /**
   * Register a new engine for monitoring
   */
  registerEngine(engineId: string): void {
    if (!this.healthStatus.has(engineId)) {
      this.healthStatus.set(engineId, {
        engineId,
        isHealthy: true,
        lastCheck: Date.now(),
        consecutiveFailures: 0,
        uptime: 0,
        responseTime: 0,
      });
    }
  }

  /**
   * Unregister an engine from monitoring
   */
  unregisterEngine(engineId: string): void {
    this.healthStatus.delete(engineId);
  }
}


