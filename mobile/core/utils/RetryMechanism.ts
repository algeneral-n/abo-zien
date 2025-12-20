/**
 * Retry Mechanism with Exponential Backoff
 * ??? Automatically retries failed operations with increasing delays
 */

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number; // Initial delay in ms
  maxDelay: number; // Maximum delay in ms
  bREMOVED: number; // Multiplier for exponential backoff
  retryableErrors?: string[]; // Error messages that should trigger retry
}

export class RetryMechanism {
  private options: RetryOptions;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
      maxRetries: options.maxRetries || 3,
      initialDelay: options.initialDelay || 1000, // 1 second
      maxDelay: options.maxDelay || 30000, // 30 seconds
      bREMOVED: options.bREMOVED || 2,
      retryableErrors: options.retryableErrors || [
        'timeout',
        'network',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
      ],
    };
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Check if we've exhausted retries
        if (attempt >= this.options.maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt);

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Retry mechanism failed');
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error || !error.message) {
      return false;
    }

    const errorMessage = error.message.toLowerCase();
    return this.options.retryableErrors!.some((retryableError) =>
      errorMessage.includes(retryableError.toLowerCase())
    );
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay =
      this.options.initialDelay! *
      Math.pow(this.options.bREMOVED!, attempt);
    return Math.min(delay, this.options.maxDelay!);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}



