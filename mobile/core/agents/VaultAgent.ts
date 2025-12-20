/**
 * VaultAgent - ???????? ????????????
 * ???????? Vault?? Secure Storage?? Encryption
 * ??? Debug Logging ????????
 * ??? Error Handling ????????
 * ??? Input Validation ????????
 * ??? ?????????????? ???? ????????????????
 */

import { BaseAgent } from './BaseAgent';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class VaultAgent extends BaseAgent {
  constructor() {
    super({
      id: 'vault',
      name: 'Vault Agent',
      description: 'Secure Storage and Encryption',
      capabilities: [
        'store_secure',
        'retrieve_secure',
        'delete_secure',
        'list_vault_items',
        'encrypt_data',
        'decrypt_data',
        'upload_file',
        'download_file',
        'preview_file',
        'scan_file',
      ],
    });
  }

  protected async onInit(): Promise<void> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:onInit',message:'VaultAgent initialized',data:{apiUrl:API_URL},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_AGENT_INIT'})}).catch(()=>{});
      }
      // #endregion
      await super.onInit();
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:onInit',message:'VaultAgent init error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_AGENT_INIT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('VaultAgent init error:', error);
      throw error;
    }
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:onExecuteAction',message:'VaultAgent action started',data:{action,hasParameters:!!parameters},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_AGENT_ACTION_START'})}).catch(()=>{});
      }
      // #endregion

      // Input validation
      if (!action || typeof action !== 'string') {
        throw new Error('Action is required and must be a string');
      }

      let result;
      switch (action) {
        case 'store_secure':
          if (!parameters?.key || !parameters?.value) {
            throw new Error('Key and value are required for store_secure');
          }
          result = await this.storeSecure(parameters.key, parameters.value);
          break;

        case 'retrieve_secure':
          if (!parameters?.key) {
            throw new Error('Key is required for retrieve_secure');
          }
          result = await this.retrieveSecure(parameters.key);
          break;

        case 'delete_secure':
          if (!parameters?.key) {
            throw new Error('Key is required for delete_secure');
          }
          result = await this.deleteSecure(parameters.key);
          break;

        case 'list_vault_items':
          result = await this.listVaultItems();
          break;

        case 'encrypt_data':
          if (!parameters?.data) {
            throw new Error('Data is required for encrypt_data');
          }
          result = await this.encryptData(parameters.data);
          break;

        case 'decrypt_data':
          if (!parameters?.encryptedData) {
            throw new Error('EncryptedData is required for decrypt_data');
          }
          result = await this.decryptData(parameters.encryptedData);
          break;

        case 'upload_file':
          if (!parameters?.fileUri || !parameters?.name) {
            throw new Error('FileUri and name are required for upload_file');
          }
          result = await this.uploadFile(parameters.fileUri, parameters.name, parameters.type);
          break;

        case 'download_file':
          if (!parameters?.fileId) {
            throw new Error('FileId is required for download_file');
          }
          result = await this.downloadFile(parameters.fileId);
          break;

        case 'preview_file':
          if (!parameters?.fileId) {
            throw new Error('FileId is required for preview_file');
          }
          result = await this.previewFile(parameters.fileId);
          break;

        case 'scan_file':
          if (!parameters?.fileId) {
            throw new Error('FileId is required for scan_file');
          }
          result = await this.scanFile(parameters.fileId);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:onExecuteAction',message:'VaultAgent action success',data:{action,hasResult:!!result},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_AGENT_ACTION_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:onExecuteAction',message:'VaultAgent action error',data:{action,error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_AGENT_ACTION_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error(`VaultAgent action error (${action}):`, error);
      throw error;
    }
  }

  /**
   * Store secure (local)
   */
  private async storeSecure(key: string, value: string): Promise<void> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:storeSecure',message:'Store secure started',data:{key,valueLength:value.length},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_STORE_SECURE_START'})}).catch(()=>{});
      }
      // #endregion

      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }
      if (value === undefined || value === null) {
        throw new Error('Value cannot be undefined or null');
      }

      await SecureStore.setItemAsync(key, String(value));
      this.emit({ type: 'vault:stored', data: { key } });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:storeSecure',message:'Store secure success',data:{key},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_STORE_SECURE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:storeSecure',message:'Store secure error',data:{error:error.message,key},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_STORE_SECURE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Store secure error:', error);
      throw error;
    }
  }

  /**
   * Retrieve secure (local)
   */
  private async retrieveSecure(key: string): Promise<string | null> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:retrieveSecure',message:'Retrieve secure started',data:{key},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_RETRIEVE_SECURE_START'})}).catch(()=>{});
      }
      // #endregion

      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      const value = await SecureStore.getItemAsync(key);

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:retrieveSecure',message:'Retrieve secure success',data:{key,hasValue:!!value},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_RETRIEVE_SECURE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return value;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:retrieveSecure',message:'Retrieve secure error',data:{error:error.message,key},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_RETRIEVE_SECURE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Retrieve secure error:', error);
      throw error;
    }
  }

  /**
   * Delete secure (local)
   */
  private async deleteSecure(key: string): Promise<void> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:deleteSecure',message:'Delete secure started',data:{key},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DELETE_SECURE_START'})}).catch(()=>{});
      }
      // #endregion

      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      await SecureStore.deleteItemAsync(key);
      this.emit({ type: 'vault:deleted', data: { key } });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:deleteSecure',message:'Delete secure success',data:{key},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DELETE_SECURE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:deleteSecure',message:'Delete secure error',data:{error:error.message,key},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DELETE_SECURE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Delete secure error:', error);
      throw error;
    }
  }

  /**
   * List vault items (backend)
   */
  private async listVaultItems(): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:listVaultItems',message:'List vault items started',data:{apiUrl:API_URL},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_LIST_ITEMS_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/vault/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:listVaultItems',message:'List vault items success',data:{itemCount:result.items?.length || 0,success:result.success},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_LIST_ITEMS_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:listVaultItems',message:'List vault items error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_LIST_ITEMS_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('List vault items error:', error);
      throw error;
    }
  }

  /**
   * Encrypt data (backend)
   */
  private async encryptData(data: string): Promise<string> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:encryptData',message:'Encrypt data started',data:{dataLength:data?.length || 0},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_DATA_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/vault/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.encrypted) {
        throw new Error('Encryption failed');
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:encryptData',message:'Encrypt data success',data:{encryptedLength:result.encrypted.length},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_DATA_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return result.encrypted;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:encryptData',message:'Encrypt data error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_DATA_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Encrypt data error:', error);
      throw error;
    }
  }

  /**
   * Decrypt data (backend)
   */
  private async decryptData(encryptedData: string): Promise<string> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:decryptData',message:'Decrypt data started',data:{encryptedDataLength:encryptedData?.length || 0},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_DATA_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/vault/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encryptedData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || result.decrypted === undefined) {
        throw new Error('Decryption failed');
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:decryptData',message:'Decrypt data success',data:{decryptedLength:result.decrypted?.length || 0},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_DATA_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return result.decrypted;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:decryptData',message:'Decrypt data error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_DATA_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Decrypt data error:', error);
      throw error;
    }
  }

  /**
   * Upload file to vault (backend)
   */
  private async uploadFile(fileUri: string, name: string, type?: string): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:uploadFile',message:'Upload file started',data:{fileUri,name,type},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_FILE_START'})}).catch(()=>{});
      }
      // #endregion

      // Read file as base64 and send to backend
      // Note: In React Native, we'll use fetch with FormData or send base64 directly
      // For now, we'll use the store endpoint with base64 data
      const response = await fetch(`${API_URL}/api/vault/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          data: fileUri, // For now, send URI - backend will handle reading
          type: type || 'application/octet-stream',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('Upload failed');
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:uploadFile',message:'Upload file success',data:{fileId:result.file?.id,name},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_FILE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      this.emit({ type: 'vault:uploaded', data: { fileId: result.file.id, name } });
      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:uploadFile',message:'Upload file error',data:{error:error.message,stack:error.stack,fileUri,name},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_FILE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Upload file error:', error);
      throw error;
    }
  }

  /**
   * Download file from vault (backend)
   */
  private async downloadFile(fileId: string): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:downloadFile',message:'Download file started',data:{fileId},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_FILE_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/vault/${fileId}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:downloadFile',message:'Download file success',data:{fileId,size:blob.size},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_FILE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      this.emit({ type: 'vault:downloaded', data: { fileId } });
      return { blob, fileId };
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:downloadFile',message:'Download file error',data:{error:error.message,stack:error.stack,fileId},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_FILE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Download file error:', error);
      throw error;
    }
  }

  /**
   * Preview file from vault (backend)
   */
  private async previewFile(fileId: string): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:previewFile',message:'Preview file started',data:{fileId},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_FILE_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/vault/${fileId}/preview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('Preview failed');
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:previewFile',message:'Preview file success',data:{fileId,previewType:result.preview?.type},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_FILE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      return result.preview;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:previewFile',message:'Preview file error',data:{error:error.message,stack:error.stack,fileId},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_FILE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Preview file error:', error);
      throw error;
    }
  }

  /**
   * Scan file from vault (backend)
   */
  private async scanFile(fileId: string): Promise<any> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:scanFile',message:'Scan file started',data:{fileId},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_SCAN_FILE_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/vault/${fileId}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('Scan failed');
      }

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:scanFile',message:'Scan file success',data:{fileId,scanType:result.scan?.type},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_SCAN_FILE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      this.emit({ type: 'vault:scanned', data: { fileId, scan: result.scan } });
      return result.scan;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VaultAgent.ts:scanFile',message:'Scan file error',data:{error:error.message,stack:error.stack,fileId},timestamp:Date.now(),sessionId:'vault-agent-session',runId:'run1',hypothesisId:'VAULT_SCAN_FILE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Scan file error:', error);
      throw error;
    }
  }
}



