/**
 * RARE 4N - Portal Agent (Conscious Agent)
 * Client Portal Agent - Web-only, Link-based
 * ??? ??????????: ???? direct calls - Cognitive Loop ??????
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { Portal as PortalAPI } from '../services/api';

export interface PortalLink {
  id: string;
  type: 'preview' | 'progress' | 'payment';
  url: string;
  createdAt: number;
  expiresAt?: number;
  active: boolean;
}

export interface PortalRequest {
  id: string;
  clientId: string;
  type: 'preview' | 'progress' | 'payment';
  status: 'pending' | 'approved' | 'rejected';
  data: any;
}

export class PortalAgent extends RAREEngine {
  readonly id = 'portal-agent';
  readonly name = 'Client Portal Agent';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;
  private links: Map<string, PortalLink> = new Map();
  private requests: Map<string, PortalRequest> = new Map();

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    // Subscribe to Cognitive Loop commands ONLY
    if (this.kernel) {
      this.kernel.on('agent:portal:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Portal Agent not initialized');
    }
    this.running = true;
    this.emit('portal:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('portal:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'portal_request':
        await this.handlePortalRequest(command.parameters);
        break;
      case 'create_link':
        await this.createLink(command.parameters);
        break;
      case 'get_links':
        await this.getLinks();
        break;
      case 'get_requests':
        await this.getRequests();
        break;
    }
  }

  /**
   * Handle portal request
   */
  private async handlePortalRequest(parameters: any): Promise<void> {
    try {
      const { type, clientId, data } = parameters;

      const request: PortalRequest = {
        id: `req_${Date.now()}`,
        clientId: clientId || 'client_unknown',
        type: type || 'preview',
        status: 'pending',
        data: data || {},
      };

      this.requests.set(request.id, request);

      this.emit('portal:request_created', {
        request,
      });
    } catch (error: any) {
      this.emit('portal:error', { error: error.message });
    }
  }

  /**
   * Create portal link - REAL Backend Connection
   */
  private async createLink(parameters: any): Promise<void> {
    try {
      const {
        clientName,
        clientNameAr,
        projectTitle,
        projectTitleAr,
        description,
        descriptionAr,
        type = 'preview',
        expiresIn = 30,
        allowChat = true,
        allowDownload = false,
        theme = 'glass-aurora',
        paymentRequired = false,
        paymentAmount = 0,
        paymentCurrency = 'usd',
      } = parameters;

      // ??? Call Backend API to create portal
      const result = await PortalAPI.create({
        clientName: clientName || 'Client',
        clientNameAr: clientNameAr || clientName,
        projectTitle: projectTitle || 'Project',
        projectTitleAr: projectTitleAr || projectTitle,
        description: description || '',
        descriptionAr: descriptionAr || description,
        status: type === 'payment' ? 'payment_pending' : 'in_progress',
        expiresIn,
        allowChat,
        allowDownload,
        theme,
        paymentRequired,
        paymentAmount,
        paymentCurrency,
      });

      if (result.success && result.portal) {
        const link: PortalLink = {
          id: result.portal.id,
          type: type as 'preview' | 'progress' | 'payment',
          url: result.portal.fullUrl || result.portal.url,
          createdAt: Date.now(),
          expiresAt: result.portal.expiresAt ? new Date(result.portal.expiresAt).getTime() : undefined,
          active: true,
        };

        this.links.set(link.id, link);

        this.emit('portal:link_created', {
          link,
          accessToken: result.portal.accessToken,
        });
      } else {
        throw new Error(result.error || 'Failed to create portal');
      }
    } catch (error: any) {
      this.emit('portal:error', { error: error.message });
    }
  }

  /**
   * Get all links - REAL Backend Connection
   */
  private async getLinks(): Promise<void> {
    try {
      // ??? Call Backend API to get all portals
      const result = await PortalAPI.list();

      if (result.success && result.portals) {
        const linksArray: PortalLink[] = result.portals.map((p: any) => ({
          id: p.id,
          type: p.status === 'payment_pending' ? 'payment' : p.status === 'completed' ? 'preview' : 'progress',
          url: `https://rare4n.com/client/${p.id}`,
          createdAt: new Date(p.createdAt).getTime(),
          expiresAt: p.expiresAt ? new Date(p.expiresAt).getTime() : undefined,
          active: p.isActive,
        }));

        // Update local cache
        linksArray.forEach(link => {
          this.links.set(link.id, link);
        });

        this.emit('portal:links_listed', {
          links: linksArray,
          count: linksArray.length,
        });
      } else {
        // Fallback to local cache
        const linksArray = Array.from(this.links.values());
        this.emit('portal:links_listed', {
          links: linksArray,
          count: linksArray.length,
        });
      }
    } catch (error: any) {
      // Fallback to local cache on error
      const linksArray = Array.from(this.links.values());
      this.emit('portal:links_listed', {
        links: linksArray,
        count: linksArray.length,
      });
      this.emit('portal:error', { error: error.message });
    }
  }

  /**
   * Get all requests
   */
  private async getRequests(): Promise<void> {
    try {
      const requestsArray = Array.from(this.requests.values());

      this.emit('portal:requests_listed', {
        requests: requestsArray,
        count: requestsArray.length,
      });
    } catch (error: any) {
      this.emit('portal:error', { error: error.message });
    }
  }

  getStatus() {
    return {
      ...super.getStatus(),
      initialized: this.initialized,
      running: this.running,
      linksCount: this.links.size,
      requestsCount: this.requests.size,
    };
  }
}


