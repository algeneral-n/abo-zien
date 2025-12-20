/**
 * FilingAgent - وكيل الملفات
 * يدير File Management، Upload، Download، OCR
 */

import { BaseAgent } from './BaseAgent';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class FilingAgent extends BaseAgent {
  constructor() {
    super({
      id: 'filing',
      name: 'Filing Agent',
      description: 'File Management and OCR',
      capabilities: [
        'list_files',
        'upload_file',
        'download_file',
        'delete_file',
        'ocr_scan',
      ],
    });
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:onExecuteAction',message:'Action execution started',data:{action,hasParameters:!!parameters},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'FILING_ACTION_START'})}).catch(()=>{});
    }
    // #endregion
    
    try {
      // ✅ Safety check: Validate action
      if (!action || typeof action !== 'string') {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:onExecuteAction',message:'Invalid action',data:{action},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'INVALID_ACTION'})}).catch(()=>{});
        }
        // #endregion
        throw new Error('Invalid action');
      }
      
      let result: any;
      
      switch (action) {
        case 'list_files':
          result = await this.listFiles();
          break;

        case 'upload_file':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.file) {
            throw new Error('file is required');
          }
          result = await this.uploadFile(parameters.file);
          break;

        case 'download_file':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.fileId) {
            throw new Error('fileId is required');
          }
          result = await this.downloadFile(parameters.fileId);
          break;

        case 'delete_file':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.fileId) {
            throw new Error('fileId is required');
          }
          result = await this.deleteFile(parameters.fileId);
          break;

        case 'ocr_scan':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.imageUri) {
            throw new Error('imageUri is required');
          }
          result = await this.ocrScan(parameters.imageUri);
          break;

        case 'generate_image':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.prompt) {
            throw new Error('prompt is required');
          }
          result = await this.generateImage(parameters.prompt, parameters.style);
          break;

        case 'generate_video':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.prompt) {
            throw new Error('prompt is required');
          }
          result = await this.generateVideo(parameters.prompt, parameters.duration);
          break;

        case 'generate_file':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.type || !parameters.content) {
            throw new Error('type and content are required');
          }
          result = await this.generateFile(parameters.type, parameters.content, parameters.filename);
          break;

        default:
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:onExecuteAction',message:'Unknown action',data:{action},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'UNKNOWN_ACTION'})}).catch(()=>{});
          }
          // #endregion
          throw new Error(`Unknown action: ${action}`);
      }
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:onExecuteAction',message:'Action execution completed',data:{action,hasResult:!!result},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'FILING_ACTION_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
      
      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:onExecuteAction',message:'Action execution failed',data:{action,error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'FILING_ACTION_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error(`[FilingAgent] Action ${action} failed:`, error);
      throw error;
    }
  }

  /**
   * List files
   */
  private async listFiles(): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:listFiles',message:'listFiles started',data:{apiUrl:API_URL},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'LIST_FILES_START'})}).catch(()=>{});
      }
      // #endregion
      
      const response = await fetch(`${API_URL}/api/files/list`);
      
      // ✅ Safety check: Validate response
      if (!response || !response.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }
      
      const json = await response.json();
      
      // ✅ Safety check: Validate json
      if (!json || typeof json !== 'object') {
        throw new Error('Invalid response format');
      }
      
      // Emit result to UI via Kernel
      if (json.success && json.files) {
        this.emit('agent:filing:response', { files: json.files });
      } else {
        this.emit('agent:filing:error', { error: json.error || 'فشل جلب الملفات' });
      }
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:listFiles',message:'listFiles completed',data:{success:json.success,filesCount:json.files?.length || 0},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'LIST_FILES_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
      
      return json;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/FilingAgent.ts:listFiles',message:'listFiles failed',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'filing-session',runId:'run1',hypothesisId:'LIST_FILES_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('[FilingAgent] listFiles error:', error);
      this.emit('agent:filing:error', { error: error?.message || 'فشل جلب الملفات' });
      throw error;
    }
  }

  /**
   * Upload file
   */
  private async uploadFile(file: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file as any);

    const response = await fetch(`${API_URL}/api/files/upload`, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();
    
    // Emit result to UI via Kernel
    if (json.success) {
      this.emit('agent:filing:response', { file: json.file });
    } else {
      this.emit('agent:filing:error', { error: json.error || 'فشل رفع الملف' });
    }
    
    return json;
  }

  /**
   * Download file
   */
  private async downloadFile(fileId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/files/download/${fileId}`);
    return await response.blob();
  }

  /**
   * Delete file
   */
  private async deleteFile(fileId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/files/delete/${fileId}`, {
      method: 'DELETE',
    });

    return await response.json();
  }

  /**
   * OCR scan
   */
  private async ocrScan(imageUri: string): Promise<any> {
    // Handle fileId parameter (from files.tsx)
    if (imageUri && !imageUri.startsWith('file://') && !imageUri.startsWith('http')) {
      // This is a fileId, not a URI
      const response = await fetch(`${API_URL}/api/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: imageUri }),
      });
      const json = await response.json();
      
      if (json.success) {
        this.emit('agent:filing:response', { ocr: json.text });
      } else {
        this.emit('agent:filing:error', { error: json.error || 'فشل التحليل' });
      }
      
      return json;
    }
    
    // Handle image URI
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);

    const response = await fetch(`${API_URL}/api/ocr`, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();
    
    if (json.success) {
      this.emit('agent:filing:response', { ocr: json.text });
    } else {
      this.emit('agent:filing:error', { error: json.error || 'فشل التحليل' });
    }
    
    return json;
  }
}

