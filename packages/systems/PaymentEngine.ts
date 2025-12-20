/**
 * ABO ZIEN - Payment Engine
 * Stripe integration for payments and subscriptions
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: string;
  currentPeriodEnd: string;
}

export class PaymentEngine extends RAREEngine {
  readonly id = 'payment-engine';
  readonly name = 'Payment Engine';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;

  private apiBase: string;

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    this.apiBase = config.apiBase || process.env.API_URL || 'http://localhost:5000/api';

    // Subscribe to Cognitive Loop commands
    if (this.kernel) {
      this.kernel.on('agent:payment:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Payment Engine not initialized');
    }
    this.running = true;
    this.emit('payment:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('payment:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'create_payment_intent':
        await this.createPaymentIntent(command.parameters);
        break;
      case 'create_subscription':
        await this.createSubscription(command.parameters);
        break;
      case 'get_subscription':
        await this.getSubscription(command.parameters);
        break;
      case 'cancel_subscription':
        await this.cancelSubscription(command.parameters);
        break;
    }
  }

  /**
   * Create payment intent
   */
  private async createPaymentIntent(parameters: any): Promise<void> {
    try {
      const { amount, currency = 'usd', description } = parameters;

      const response = await fetch(`${this.apiBase}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, description }),
      });

      const data = await response.json();

      this.emit('payment:intent_created', {
        paymentIntent: {
          id: data.paymentIntentId,
          clientSecret: data.clientSecret,
          amount: data.amount,
          currency: data.currency,
        },
      });
    } catch (error: any) {
      this.emit('payment:error', { error: error.message, action: 'create_payment_intent' });
    }
  }

  /**
   * Create subscription
   */
  private async createSubscription(parameters: any): Promise<void> {
    try {
      const { customerId, priceId } = parameters;

      const response = await fetch(`${this.apiBase}/stripe/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, priceId }),
      });

      const data = await response.json();

      this.emit('payment:subscription_created', {
        subscription: data.subscription,
      });
    } catch (error: any) {
      this.emit('payment:error', { error: error.message, action: 'create_subscription' });
    }
  }

  /**
   * Get subscription
   */
  private async getSubscription(parameters: any): Promise<void> {
    try {
      const { subscriptionId } = parameters;

      const response = await fetch(`${this.apiBase}/stripe/subscription/${subscriptionId}`);
      const data = await response.json();

      this.emit('payment:subscription', {
        subscription: data.subscription,
      });
    } catch (error: any) {
      this.emit('payment:error', { error: error.message, action: 'get_subscription' });
    }
  }

  /**
   * Cancel subscription
   */
  private async cancelSubscription(parameters: any): Promise<void> {
    try {
      const { subscriptionId } = parameters;

      const response = await fetch(`${this.apiBase}/stripe/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      this.emit('payment:subscription_cancelled', {
        result: data,
        subscriptionId,
      });
    } catch (error: any) {
      this.emit('payment:error', { error: error.message, action: 'cancel_subscription' });
    }
  }
}


