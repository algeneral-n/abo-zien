/**
 * BuilderAgent - ???????? ???????????? ????????????????
 * ???????? Auto Builder?? Templates?? Themes?? Systems
 */

import { BaseAgent } from './BaseAgent';
import io from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class BuilderAgent extends BaseAgent {
  private socket: any;

  constructor() {
    super({
      id: 'builder',
      name: 'Builder Agent',
      description: 'Auto Builder and App Generation',
      capabilities: [
        'build_app',
        'get_templates',
        'get_themes',
        'get_systems',
        'execute_command',
        'upload_files',
        'list_builds',
        'generate_code',
        'generate_image',
        'generate_video',
        'generate_presentation',
        'generate_html',
      ],
    });
  }

  protected async onInit(): Promise<void> {
    // Connect to auto-builder namespace
    this.socket = io(`${API_URL}/auto-builder`, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('[BuilderAgent] Connected to backend ???');
    });

    this.socket.on('terminal:output', (data: any) => {
      // Emit to UI
      this.emit({ type: 'builder:terminal:output', data });
    });

    this.socket.on('build:complete', (data: any) => {
      this.emit({ type: 'builder:build:complete', data });
    });

    this.socket.on('error', (error: any) => {
      console.error('[BuilderAgent] Error:', error);
      this.emit({ type: 'builder:error', data: error });
    });
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
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:onExecuteAction',message:'Action execution started',data:{action,hasParameters:!!parameters},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_ACTION_START'})}).catch(()=>{});
    }
    // #endregion
    
    try {
      // ??? Safety check: Validate action
      if (!action || typeof action !== 'string') {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:onExecuteAction',message:'Invalid action',data:{action},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'INVALID_ACTION'})}).catch(()=>{});
        }
        // #endregion
        throw new Error('Invalid action');
      }
      
      let result: any;
      
      switch (action) {
        case 'build_app':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.projectName) {
            throw new Error('projectName is required');
          }
          result = await this.buildApp(parameters);
          break;

        case 'get_templates':
          result = await this.getTemplates();
          break;

        case 'get_themes':
          result = await this.getThemes();
          break;

        case 'get_systems':
          result = await this.getSystems();
          break;

        case 'execute_command':
          // ??? Safety check: Validate command
          if (!parameters || !parameters.command || typeof parameters.command !== 'string') {
            throw new Error('command is required');
          }
          result = await this.executeCommand(parameters.command);
          break;

        case 'upload_files':
          // ??? Safety check: Validate files
          if (!parameters || !parameters.files || !Array.isArray(parameters.files)) {
            throw new Error('files array is required');
          }
          result = await this.uploadFiles(parameters.files);
          break;

        case 'list_builds':
          result = await this.listBuilds();
          break;

        case 'download_build':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.downloadUrl) {
            throw new Error('downloadUrl is required');
          }
          result = await this.downloadBuild(parameters);
          break;

        case 'generate_code':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.prompt) {
            throw new Error('prompt is required');
          }
          result = await this.generateCode(parameters);
          break;

        case 'generate_image':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.prompt) {
            throw new Error('prompt is required');
          }
          result = await this.generateImage(parameters);
          break;

        case 'generate_video':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.prompt) {
            throw new Error('prompt is required');
          }
          result = await this.generateVideo(parameters);
          break;

        case 'generate_presentation':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.prompt) {
            throw new Error('prompt is required');
          }
          result = await this.generatePresentation(parameters);
          break;

        case 'generate_html':
          // ??? Safety check: Validate parameters
          if (!parameters || !parameters.prompt) {
            throw new Error('prompt is required');
          }
          result = await this.generateHTML(parameters);
          break;

        default:
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:onExecuteAction',message:'Unknown action',data:{action},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'UNKNOWN_ACTION'})}).catch(()=>{});
          }
          // #endregion
          throw new Error(`Unknown action: ${action}`);
      }
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:onExecuteAction',message:'Action execution completed',data:{action,hasResult:!!result},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_ACTION_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
      
      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:onExecuteAction',message:'Action execution failed',data:{action,error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_ACTION_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error(`[BuilderAgent] Action ${action} failed:`, error);
      throw error;
    }
  }

  /**
   * Build app
   */
  private async buildApp(parameters: any): Promise<any> {
    // Support both Socket.IO and HTTP POST
    if (parameters.useSocket && this.socket) {
      return new Promise((resolve, reject) => {
        this.socket.emit('build:start', parameters);
        
        this.socket.once('build:complete', (data: any) => {
          resolve(data);
        });

        this.socket.once('error', (error: any) => {
          reject(error);
        });
      });
    }

    // HTTP POST with FormData
    const formData = new FormData();
    if (parameters.projectName) formData.append('projectName', parameters.projectName);
    if (parameters.email) formData.append('email', parameters.email);
    if (parameters.phone) formData.append('phone', parameters.phone);
    if (parameters.platforms) formData.append('platforms', parameters.platforms);
    if (parameters.projectType) formData.append('projectType', parameters.projectType);
    if (parameters.clientId) formData.append('clientId', parameters.clientId);
    if (parameters.clientEmail) formData.append('clientEmail', parameters.clientEmail);
    if (parameters.requestId) formData.append('requestId', parameters.requestId);
    if (parameters.paymentStatus) formData.append('paymentStatus', parameters.paymentStatus);
    
    if (parameters.files && Array.isArray(parameters.files)) {
      parameters.files.forEach((file: any) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type || 'application/octet-stream',
        } as any);
      });
    }

    try {
      const response = await fetch(`${API_URL}/api/auto-builder/build`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // ??? ?????????? ?????????? ???????? ???????????? ?????? ???????? ????????????
        if (data.clientId && data.clientEmail && data.clientPhone) {
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:buildApp',message:'Sending comprehensive notification to client',data:{clientId:data.clientId,projectName:data.projectName},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILD_NOTIFY_CLIENT'})}).catch(()=>{});
          }
          
          // ?????????? ?????? TerminalIntegrationService
          const { TerminalIntegrationService } = await import('../services/TerminalIntegrationService');
          const integrationService = new TerminalIntegrationService();
          
          const buildLink = data.downloadUrl || data.previewUrl || '';
          const message = `???? ?????????? ???????? ?????????? ${data.projectName || '??????????????'} ??????????!`;
          
          integrationService.notifyClientComprehensive(
            data.clientId,
            data.clientPhone,
            data.clientEmail,
            message,
            buildLink
          ).catch((error: any) => {
            console.error('[BuilderAgent] Notification error:', error);
          });
        }
        
        this.emit('agent:builder:response', { build: data });
        return data;
      } else {
        this.emit('agent:builder:error', { error: data.error || '?????? ????????????' });
        throw new Error(data.error || '?????? ????????????');
      }
    } catch (error: any) {
      this.emit('agent:builder:error', { error: error.message || '?????? ????????????' });
      throw error;
    }
  }

  /**
   * Get templates
   */
  private async getTemplates(): Promise<any> {
    const response = await fetch(`${API_URL}/api/libraries/templates`);
    return await response.json();
  }

  /**
   * Get themes
   */
  private async getThemes(): Promise<any> {
    const response = await fetch(`${API_URL}/api/libraries/themes`);
    return await response.json();
  }

  /**
   * Get systems
   */
  private async getSystems(): Promise<any> {
    const response = await fetch(`${API_URL}/api/libraries/systems`);
    return await response.json();
  }

  /**
   * Execute command
   */
  private async executeCommand(command: string): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:executeCommand',message:'Execute command started',data:{command},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_EXECUTE_COMMAND_START'})}).catch(()=>{});
      }
      // #endregion

      if (!this.socket || !this.socket.connected) {
        throw new Error('Socket not connected');
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:executeCommand',message:'Command execution timeout',data:{command},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_TIMEOUT'})}).catch(()=>{});
          }
          // #endregion
          reject(new Error('Command execution timeout'));
        }, 300000); // 5 minutes timeout

        // Listen for terminal output
        const outputHandler = (data: any) => {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:executeCommand',message:'Command output received',data:{command,outputType:data.type,hasOutput:!!data.output},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_OUTPUT'})}).catch(()=>{});
          }
          // #endregion

          if (data.command === command || data.type === 'command') {
            clearTimeout(timeout);
            this.socket.off('terminal:output', outputHandler);
            this.socket.off('error', errorHandler);
            
            if (data.error) {
              reject(new Error(data.error));
            } else {
              // ??? ?????????? ???????? Loyalty ?????? ???????? ??????????
              if (this.kernel) {
                if (__DEV__) {
                  fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:executeCommand',message:'Adding loyalty points for successful command',data:{command},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'LOYALTY_POINTS_ADD'})}).catch(()=>{});
                }
                this.kernel.emit({
                  type: 'agent:loyalty:execute',
                  data: {
                    action: 'add_points',
                    parameters: {
                      points: 5,
                      reason: 'terminal_command',
                      command: command,
                    },
                  },
                });
              }
              resolve(data);
            }
          }
        };

        const errorHandler = (error: any) => {
          clearTimeout(timeout);
          this.socket.off('terminal:output', outputHandler);
          this.socket.off('error', errorHandler);
          reject(error);
        };

        this.socket.on('terminal:output', outputHandler);
        this.socket.on('error', errorHandler);

        // Emit command
        this.socket.emit('terminal:command', { command });

        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:executeCommand',message:'Command emitted to socket',data:{command},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_EMITTED'})}).catch(()=>{});
        }
        // #endregion
      });
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/BuilderAgent.ts:executeCommand',message:'Command execution error',data:{error:error.message,command},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('[BuilderAgent] Execute command error:', error);
      throw error;
    }
  }

  /**
   * Upload files
   */
  private async uploadFiles(files: any[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file as any);
    });

    const response = await fetch(`${API_URL}/api/auto-builder/upload`, {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  }

  /**
   * List builds
   */
  private async listBuilds(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/api/auto-builder/builds`);
      const data = await response.json();
      
      if (data.success) {
        this.emit('agent:builder:response', { builds: data.builds });
        return data;
      } else {
        this.emit('agent:builder:error', { error: data.error || '?????? ?????????? ????????????????' });
        throw new Error(data.error || '?????? ?????????? ????????????????');
      }
    } catch (error: any) {
      this.emit('agent:builder:error', { error: error.message || '?????? ?????????? ????????????????' });
      throw error;
    }
  }

  /**
   * Download build
   */
  private async downloadBuild(parameters: { downloadUrl: string; filename: string }): Promise<any> {
    try {
      const fullUrl = `${API_URL}${parameters.downloadUrl}`;
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error('?????? ??????????????');
      }

      // In React Native, you'd use a library like expo-file-system
      // For now, just return success
      this.emit('agent:builder:response', { download: { success: true, filename: parameters.filename } });
      return { success: true, filename: parameters.filename };
    } catch (error: any) {
      this.emit('agent:builder:error', { error: error.message || '?????? ??????????????' });
      throw error;
    }
  }

  /**
   * Generate code
   */
  private async generateCode(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/codegen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: parameters.prompt,
        extension: parameters.extension,
        language: parameters.language,
      }),
    });

    const json = await response.json();
    
    // Emit result to UI via Kernel
    if (json.success && json.code) {
      this.emit('agent:builder:response', { code: json.code });
      return json;
    } else {
      this.emit('agent:builder:error', { error: json.error || '?????? ??????????????' });
      throw new Error(json.error || '?????? ??????????????');
    }
  }

  /**
   * Generate image
   */
  private async generateImage(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/codegen/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: parameters.prompt,
        size: parameters.size || '1024x1024',
        quality: parameters.quality || 'standard',
      }),
    });

    const json = await response.json();
    
    if (json.success && json.images) {
      this.emit('agent:builder:response', { images: json.images });
      return json;
    } else {
      this.emit('agent:builder:error', { error: json.error || '?????? ?????????? ????????????' });
      throw new Error(json.error || '?????? ?????????? ????????????');
    }
  }

  /**
   * Generate video
   */
  private async generateVideo(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/codegen/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: parameters.prompt,
        duration: parameters.duration || 5,
      }),
    });

    const json = await response.json();
    
    if (json.success) {
      this.emit('agent:builder:response', { video: json });
      return json;
    } else {
      this.emit('agent:builder:error', { error: json.error || '?????? ?????????? ??????????????' });
      throw new Error(json.error || '?????? ?????????? ??????????????');
    }
  }

  /**
   * Generate presentation (PowerPoint)
   */
  private async generatePresentation(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/codegen/presentation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: parameters.topic,
        slides: parameters.slides || 10,
        format: parameters.format || 'pptx',
      }),
    });

    const json = await response.json();
    
    if (json.success) {
      this.emit('agent:builder:response', { presentation: json.presentation });
      return json;
    } else {
      this.emit('agent:builder:error', { error: json.error || '?????? ?????????? ??????????' });
      throw new Error(json.error || '?????? ?????????? ??????????');
    }
  }

  /**
   * Generate HTML
   */
  private async generateHTML(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/codegen/html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: parameters.prompt,
        includeCSS: parameters.includeCSS !== false,
        includeJS: parameters.includeJS || false,
      }),
    });

    const json = await response.json();
    
    if (json.success && json.html) {
      this.emit('agent:builder:response', { html: json.html });
      return json;
    } else {
      this.emit('agent:builder:error', { error: json.error || '?????? ?????????? HTML' });
      throw new Error(json.error || '?????? ?????????? HTML');
    }
  }
}


