/**
 * Circuit Breaker Pattern Implementation
 * ✅ Prevents cascading failures by breaking the circuit after repeated failures
 */

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time in ms before attempting to reset
  monitoringWindow: number; // Time window for monitoring failures
}

export enum CircuitState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Circuit is open, requests fail immediately
  HALF_OPEN = 'half_open', // Testing if service recovered
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000, // 1 minute
      monitoringWindow: options.monitoringWindow || 60000, // 1 minute
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      // Check if enough time has passed to try half-open
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      // If we get enough successes, close the circuit
      if (this.successCount >= 2) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // If we fail in half-open, go back to open
      this.state = CircuitState.OPEN;
      this.successCount = 0;
    } else if (this.failures >= this.options.failureThreshold) {
      // Open the circuit
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      state: this.state,
      failures: this.failures,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}


