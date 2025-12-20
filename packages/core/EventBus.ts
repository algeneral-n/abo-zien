/**
 * RARE 4N - Event Bus
 * ???????? ?????????????? - Pub/Sub
 */

import { KernelEvent } from './RAREKernel';

type EventHandler = (event: KernelEvent) => void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>>;
  private eventHistory: KernelEvent[];
  private readonly MAX_HISTORY = 1000;

  private constructor() {
    this.handlers = new Map();
    this.eventHistory = [];
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Initialize event bus
   */
  init(): void {
    // Setup complete
  }

  /**
   * Emit event
   */
  emit(event: KernelEvent): void {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.shift();
    }

    // Call specific handlers
    const specificHandlers = this.handlers.get(event.type);
    if (specificHandlers) {
      specificHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }

    // Call wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in wildcard handler:`, error);
        }
      });
    }

    // Call pattern handlers (e.g., 'ai:*')
    const parts = event.type.split(':');
    if (parts.length > 1) {
      const pattern = `${parts[0]}:*`;
      const patternHandlers = this.handlers.get(pattern);
      if (patternHandlers) {
        patternHandlers.forEach(handler => {
          try {
            handler(event);
          } catch (error) {
            console.error(`Error in pattern handler for ${pattern}:`, error);
          }
        });
      }
    }
  }

  /**
   * Subscribe to events
   */
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Get event history
   */
  getHistory(filter?: (event: KernelEvent) => boolean): KernelEvent[] {
    if (filter) {
      return this.eventHistory.filter(filter);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
}


