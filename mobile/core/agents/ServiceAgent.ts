/**
 * ServiceAgent - وكيل التحكم في الخدمات
 * يدير Backend، Cloudflare، Widget
 */

import { BaseAgent } from './BaseAgent';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class ServiceAgent extends BaseAgent {
  constructor() {
    super({
      id: 'service',
      name: 'Service Agent',
      description: 'Service Control (Backend, Cloudflare, Widget)',
      capabilities: [
        'control_backend',
        'control_cloudflare',
        'control_widget',
        'check_service_status',
      ],
    });
  }

  protected async onInit(): Promise<void> {
    // Agent initialized
  }

  protected async onStart(): Promise<void> {
    // Agent is ready
  }

  protected async onStop(): Promise<void> {
    // Agent stopped
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:onExecuteAction',message:'Action execution started',data:{action,hasParameters:!!parameters},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_ACTION_START'})}).catch(()=>{});
    }
    // #endregion

    try {
      if (!action || typeof action !== 'string') {
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:onExecuteAction',message:'Invalid action',data:{action},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'INVALID_ACTION'})}).catch(()=>{});
        }
        throw new Error('Invalid action');
      }

      let result: any;

      switch (action) {
        case 'control_backend':
          if (!parameters || !parameters.command) {
            throw new Error('command is required');
          }
          result = await this.controlBackend(parameters.command);
          break;

        case 'control_cloudflare':
          if (!parameters || !parameters.command) {
            throw new Error('command is required');
          }
          result = await this.controlCloudflare(parameters.command);
          break;

        case 'control_widget':
          if (!parameters || !parameters.command) {
            throw new Error('command is required');
          }
          result = await this.controlWidget(parameters.command);
          break;

        case 'check_service_status':
          if (!parameters || !parameters.service) {
            throw new Error('service is required');
          }
          result = await this.checkServiceStatus(parameters.service);
          break;

        default:
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:onExecuteAction',message:'Unknown action',data:{action},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'UNKNOWN_ACTION'})}).catch(()=>{});
          }
          throw new Error(`Unknown action: ${action}`);
      }

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:onExecuteAction',message:'Action execution completed',data:{action,hasResult:!!result},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_ACTION_SUCCESS'})}).catch(()=>{});
      }

      return result;
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:onExecuteAction',message:'Action execution failed',data:{action,error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_ACTION_ERROR'})}).catch(()=>{});
      }
      console.error(`[ServiceAgent] Action ${action} failed:`, error);
      throw error;
    }
  }

  private async controlBackend(command: 'start' | 'stop' | 'restart'): Promise<any> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlBackend',message:'Controlling backend',data:{command},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_BACKEND_CONTROL'})}).catch(()=>{});
      }

      const response = await fetch(`${API_URL}/api/services/backend/${command}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlBackend',message:'Backend control success',data:{command,success:data.success},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_BACKEND_SUCCESS'})}).catch(()=>{});
      }

      this.emit('agent:service:response', { backend: data });
      return data;
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlBackend',message:'Backend control error',data:{command,error:error.message},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_BACKEND_ERROR'})}).catch(()=>{});
      }
      this.emit('agent:service:error', { error: error.message || 'فشل التحكم في Backend' });
      throw error;
    }
  }

  private async controlCloudflare(command: 'start' | 'stop' | 'restart'): Promise<any> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlCloudflare',message:'Controlling Cloudflare',data:{command},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_CLOUDFLARE_CONTROL'})}).catch(()=>{});
      }

      const response = await fetch(`${API_URL}/api/services/cloudflare/${command}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlCloudflare',message:'Cloudflare control success',data:{command,success:data.success},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_CLOUDFLARE_SUCCESS'})}).catch(()=>{});
      }

      this.emit('agent:service:response', { cloudflare: data });
      return data;
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlCloudflare',message:'Cloudflare control error',data:{command,error:error.message},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_CLOUDFLARE_ERROR'})}).catch(()=>{});
      }
      this.emit('agent:service:error', { error: error.message || 'فشل التحكم في Cloudflare' });
      throw error;
    }
  }

  private async controlWidget(command: 'start' | 'stop' | 'restart'): Promise<any> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlWidget',message:'Controlling Widget',data:{command},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_WIDGET_CONTROL'})}).catch(()=>{});
      }

      const response = await fetch(`${API_URL}/api/services/widget/${command}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlWidget',message:'Widget control success',data:{command,success:data.success},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_WIDGET_SUCCESS'})}).catch(()=>{});
      }

      this.emit('agent:service:response', { widget: data });
      return data;
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:controlWidget',message:'Widget control error',data:{command,error:error.message},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_WIDGET_ERROR'})}).catch(()=>{});
      }
      this.emit('agent:service:error', { error: error.message || 'فشل التحكم في Widget' });
      throw error;
    }
  }

  private async checkServiceStatus(service: 'backend' | 'cloudflare' | 'widget'): Promise<any> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:checkServiceStatus',message:'Checking service status',data:{service},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_STATUS_CHECK'})}).catch(()=>{});
      }

      const response = await fetch(`${API_URL}/api/services/${service}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:checkServiceStatus',message:'Service status check success',data:{service,status:data.status},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_STATUS_SUCCESS'})}).catch(()=>{});
      }

      this.emit('agent:service:response', { status: data });
      return data;
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/ServiceAgent.ts:checkServiceStatus',message:'Service status check error',data:{service,error:error.message},timestamp:Date.now(),sessionId:'service-session',runId:'run1',hypothesisId:'SERVICE_STATUS_ERROR'})}).catch(()=>{});
      }
      this.emit('agent:service:error', { error: error.message || 'فشل فحص حالة الخدمة' });
      throw error;
    }
  }
}


