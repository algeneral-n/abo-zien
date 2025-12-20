/**
 * ABO ZIEN - SOS Emergency Engine
 * Complete Emergency Response System
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  priority: number;
  notifyOnSOS: boolean;
  shareLocation: boolean;
}

export interface SOSAlert {
  id: string;
  userId: string;
  trigger: string;
  status: 'active' | 'deactivated' | 'resolved';
  activatedAt: string;
  deactivatedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  contactsNotified: string[];
}

export class SOSEngine extends RAREEngine {
  readonly id = 'sos-engine';
  readonly name = 'SOS Emergency Engine';
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
      this.kernel.on('agent:sos:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('SOS Engine not initialized');
    }
    this.running = true;
    this.emit('sos:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('sos:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'activate':
        await this.activateSOS(command.parameters);
        break;
      case 'deactivate':
        await this.deactivateSOS(command.parameters);
        break;
      case 'add_contact':
        await this.addEmergencyContact(command.parameters);
        break;
      case 'get_contacts':
        await this.getEmergencyContacts(command.parameters);
        break;
      case 'start_safety_timer':
        await this.startSafetyTimer(command.parameters);
        break;
      case 'check_in':
        await this.checkInSafetyTimer(command.parameters);
        break;
    }
  }

  /**
   * Activate SOS alert
   */
  private async activateSOS(parameters: any): Promise<void> {
    try {
      const { userId, trigger = 'button_press', location } = parameters;

      const response = await fetch(`${this.apiBase}/sos/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, trigger, location }),
      });

      const data = await response.json();

      this.emit('sos:activated', {
        alert: data.alert,
        deactivationCode: data.deactivationCode,
      });
    } catch (error: any) {
      this.emit('sos:error', { error: error.message, action: 'activate' });
    }
  }

  /**
   * Deactivate SOS alert
   */
  private async deactivateSOS(parameters: any): Promise<void> {
    try {
      const { alertId, deactivationCode } = parameters;

      const response = await fetch(`${this.apiBase}/sos/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, deactivationCode }),
      });

      const data = await response.json();

      this.emit('sos:deactivated', {
        result: data,
        alertId,
      });
    } catch (error: any) {
      this.emit('sos:error', { error: error.message, action: 'deactivate' });
    }
  }

  /**
   * Add emergency contact
   */
  private async addEmergencyContact(parameters: any): Promise<void> {
    try {
      const { userId, name, phone, relationship, priority = 1, notifyOnSOS = true, shareLocation = true } = parameters;

      const response = await fetch(`${this.apiBase}/sos/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, phone, relationship, priority, notifyOnSOS, shareLocation }),
      });

      const data = await response.json();

      this.emit('sos:contact_added', {
        contact: data.contact,
      });
    } catch (error: any) {
      this.emit('sos:error', { error: error.message, action: 'add_contact' });
    }
  }

  /**
   * Get emergency contacts
   */
  private async getEmergencyContacts(parameters: any): Promise<void> {
    try {
      const { userId } = parameters;

      const response = await fetch(`${this.apiBase}/sos/contacts?userId=${userId}`);
      const data = await response.json();

      this.emit('sos:contacts_listed', {
        contacts: data.contacts,
        count: data.count,
      });
    } catch (error: any) {
      this.emit('sos:error', { error: error.message, action: 'get_contacts' });
    }
  }

  /**
   * Start safety timer
   */
  private async startSafetyTimer(parameters: any): Promise<void> {
    try {
      const { userId, durationMinutes = 30, destination, checkInRequired = true } = parameters;

      const response = await fetch(`${this.apiBase}/sos/safety-timer/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, durationMinutes, destination, checkInRequired }),
      });

      const data = await response.json();

      this.emit('sos:safety_timer_started', {
        timer: data.timer,
      });
    } catch (error: any) {
      this.emit('sos:error', { error: error.message, action: 'start_safety_timer' });
    }
  }

  /**
   * Check in safety timer
   */
  private async checkInSafetyTimer(parameters: any): Promise<void> {
    try {
      const { timerId, location } = parameters;

      const response = await fetch(`${this.apiBase}/sos/safety-timer/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timerId, location }),
      });

      const data = await response.json();

      this.emit('sos:safety_timer_checked_in', {
        result: data,
        timerId,
      });
    } catch (error: any) {
      this.emit('sos:error', { error: error.message, action: 'check_in' });
    }
  }
}

