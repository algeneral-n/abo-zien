/**
 * PortalAgent - ???????? ??????????????
 * ???????? Client Portal?? Requests?? Forms?? Notifications
 */

import { BaseAgent } from './BaseAgent';
import io from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class PortalAgent extends BaseAgent {
  private socket: any;

  constructor() {
    super({
      id: 'portal',
      name: 'Portal Agent',
      description: 'Client Portal Management',
      capabilities: [
        'handle_request',
        'update_request',
        'create_invoice',
        'send_form',
        'get_notifications',
        'voice_interaction',
        'send_widget_notification',
      ],
    });
  }

  protected async onInit(): Promise<void> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onInit',message:'onInit started',data:{apiUrl:API_URL},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'PORTAL_INIT_START'})}).catch(()=>{});
      }
      // #endregion
      
      // Connect to client-portal namespace
      this.socket = io(`${API_URL}/client-portal`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onInit',message:'Socket connected',data:{socketId:this.socket?.id},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'PORTAL_SOCKET_CONNECTED'})}).catch(()=>{});
        }
        // #endregion
        console.log('[PortalAgent] Connected to backend ???');
      });

      this.socket.on('client:request', (data: any) => {
        try {
          // ??? Safety check: Validate data
          if (!data || typeof data !== 'object') {
            console.warn('[PortalAgent] Invalid client request data');
            return;
          }
          this.emit({ type: 'portal:request', data });
        } catch (error: any) {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:client:request',message:'Error handling client request',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'CLIENT_REQUEST_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('[PortalAgent] Error handling client request:', error);
        }
      });

      this.socket.on('client:form:response', (data: any) => {
        try {
          // ??? Safety check: Validate data
          if (!data || typeof data !== 'object') {
            console.warn('[PortalAgent] Invalid form response data');
            return;
          }
          this.emit({ type: 'portal:form:response', data });
        } catch (error: any) {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:client:form:response',message:'Error handling form response',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'FORM_RESPONSE_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('[PortalAgent] Error handling form response:', error);
        }
      });

      this.socket.on('notification', (data: any) => {
        try {
          // ??? Safety check: Validate data
          if (!data || typeof data !== 'object') {
            console.warn('[PortalAgent] Invalid notification data');
            return;
          }
          this.emit({ type: 'portal:notification', data });
        } catch (error: any) {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:notification',message:'Error handling notification',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'NOTIFICATION_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('[PortalAgent] Error handling notification:', error);
        }
      });

      this.socket.on('error', (error: any) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:socket:error',message:'Socket error',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'SOCKET_ERROR'})}).catch(()=>{});
        }
        // #endregion
        console.error('[PortalAgent] Error:', error);
        this.emit({ type: 'portal:error', data: error });
      });
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onInit',message:'onInit completed',data:{},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'PORTAL_INIT_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onInit',message:'onInit failed',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'PORTAL_INIT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('[PortalAgent] Init error:', error);
      throw error;
    }
  }

  protected async onStart(): Promise<void> {
    // Agent is ready
  }

  protected async onStop(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onExecuteAction',message:'Action execution started',data:{action,hasParameters:!!parameters},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'PORTAL_ACTION_START'})}).catch(()=>{});
    }
    // #endregion

    try {
      // ??? Safety check: Validate action
      if (!action || typeof action !== 'string') {
        throw new Error('Invalid action');
      }

      let result: any;

      switch (action) {
        case 'send_widget_notification':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.clientId || !parameters.message) {
            throw new Error('clientId and message are required');
          }
          result = await this.sendWidgetNotification(parameters.clientId, parameters.message, parameters.data);
          break;

        case 'update_request':
          // Existing action
          result = await this.updateRequest(parameters);
          break;

        case 'create_invoice':
          // Existing action
          result = await this.createInvoice(parameters);
          break;

        case 'handle_request':
          // ??? Safety check: Validate parameters
          if (!parameters || typeof parameters !== 'object') {
            throw new Error('parameters object is required');
          }
          result = await this.handleRequest(parameters);
          break;

        case 'send_form':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.formId) {
            throw new Error('formId is required');
          }
          result = await this.sendForm(parameters);
          break;

        case 'get_notifications':
          result = await this.getNotifications();
          break;

        case 'voice_interaction':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.audioUri) {
            throw new Error('audioUri is required');
          }
          result = await this.voiceInteraction(parameters);
          break;

        default:
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onExecuteAction',message:'Unknown action',data:{action},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'UNKNOWN_ACTION'})}).catch(()=>{});
          }
          // #endregion
          throw new Error(`Unknown action: ${action}`);
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onExecuteAction',message:'Action execution completed',data:{action,hasResult:!!result},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'PORTAL_ACTION_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:onExecuteAction',message:'Action execution failed',data:{action,error:error.message},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'PORTAL_ACTION_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error(`[PortalAgent] Action ${action} failed:`, error);
      throw error;
    }
  }

  /**
   * Send widget notification
   */
  private async sendWidgetNotification(clientId: string, message: string, data?: any): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:sendWidgetNotification',message:'Send widget notification started',data:{clientId,hasMessage:!!message},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'WIDGET_NOTIFY_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/terminal-integration/widget/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, message, data }),
      });

      const result = await response.json();

      if (result.success) {
        this.emit({ type: 'portal:widget:notification:sent', data: { clientId, message } });
      } else {
        this.emit({ type: 'portal:error', data: { error: result.error || '?????? ?????????? ??????????????' } });
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:sendWidgetNotification',message:'Widget notification sent',data:{clientId,success:result.success},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'WIDGET_NOTIFY_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/PortalAgent.ts:sendWidgetNotification',message:'Widget notification error',data:{error:error.message,clientId},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'WIDGET_NOTIFY_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('[PortalAgent] Send widget notification error:', error);
      this.emit({ type: 'portal:error', data: { error: error.message || '?????? ?????????? ??????????????' } });
      throw error;
    }
  }

  /**
   * Update request (existing method - keep as is)
   */
  private async updateRequest(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/client-portal/update-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });

    return await response.json();
  }

  /**
   * Handle client request
   */
  private async handleRequest(parameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('client:request:handle', parameters);

      this.socket.once('client:request:handled', (data: any) => {
        resolve(data);
      });

      this.socket.once('error', (error: any) => {
        reject(error);
      });
    });
  }

  /**
   * Update request status
   */
  private async updateRequest(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/client-portal/update-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });

    return await response.json();
  }

  /**
   * Create invoice
   */
  private async createInvoice(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/client-portal/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });

    return await response.json();
  }

  /**
   * Send form
   */
  private async sendForm(parameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('client:form:send', parameters);

      this.socket.once('client:form:sent', (data: any) => {
        resolve(data);
      });

      this.socket.once('error', (error: any) => {
        reject(error);
      });
    });
  }

  /**
   * Get notifications
   */
  private async getNotifications(): Promise<any> {
    const response = await fetch(`${API_URL}/api/client-portal/notifications`);
    return await response.json();
  }

  /**
   * Voice interaction (Voice-to-Voice with client)
   */
  private async voiceInteraction(parameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('client:voice:interact', parameters);

      this.socket.once('client:voice:response', (data: any) => {
        resolve(data);
      });

      this.socket.once('error', (error: any) => {
        reject(error);
      });
    });
  }
}



