/**
 * RARE 4N - Vault Routes
 * ???????????? ???????????? ????????????????
 * ??? Debug Logging ????????
 * ??? Error Handling ????????
 * ??? Input Validation ????????
 * ??? ?????????????? ???? ????????????????
 */

import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { getDatabase, DB } from '../database/localDB.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_DIR = path.join(__dirname, '../../data/vault');
const TEMP_DIR = path.join(__dirname, '../../data/temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  try {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create temp directory:', error);
  }
}

// Configure multer for file uploads
const upload = multer({
  dest: TEMP_DIR,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for vault
    cb(null, true);
  },
});

// Ensure vault directory exists
if (!fs.existsSync(VAULT_DIR)) {
  try {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:init',message:'Vault directory created',data:{path:VAULT_DIR},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_INIT'})}).catch(()=>{});
    }
    // #endregion
  } catch (error) {
    console.error('Failed to create vault directory:', error);
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:init',message:'Vault directory creation failed',data:{error:error.message,path:VAULT_DIR},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_INIT_ERROR'})}).catch(()=>{});
    }
    // #endregion
  }
}

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const MASTER_KEY = process.env.RARE_MASTER_KEY || crypto.randomBytes(32).toString('hex');
const SALT = process.env.RARE_ENCRYPTION_SALT || crypto.randomBytes(16).toString('hex');

// #region agent log
if (process.env.NODE_ENV === 'development') {
  fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:config',message:'Vault encryption config loaded',data:{algorithm:ENCRYPTION_ALGORITHM,hasMasterKey:!!process.env.RARE_MASTER_KEY,hasSalt:!!process.env.RARE_ENCRYPTION_SALT},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_CONFIG'})}).catch(()=>{});
}
// #endregion

/**
 * Derive encryption key from master key
 */
function deriveKey(masterKey, salt) {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');
}

/**
 * Encrypt data
 */
function encryptData(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt data
 */
function decryptData(encryptedData, iv, authTag, key) {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Get user ID from token (middleware)
 */
function getUserId(req) {
  return req.headers['x-user-id'] || 'default_user';
}

/**
 * POST /api/vault/encrypt
 * Encrypt data
 */
router.post('/encrypt', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:encrypt',message:'Encrypt request started',data:{hasData:!!req.body.data,dataLength:req.body.data?.length || 0},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_START'})}).catch(()=>{});
    }
    // #endregion

    const { data } = req.body;

    // Input validation
    if (!data) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:encrypt',message:'Encrypt validation failed',data:{error:'Data is required'},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Data is required' });
    }

    if (typeof data !== 'string' && typeof data !== 'object') {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:encrypt',message:'Encrypt validation failed - invalid type',data:{error:'Data must be string or object',dataType:typeof data},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_VALIDATION_TYPE'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Data must be string or object' });
    }

    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const key = deriveKey(MASTER_KEY, SALT);
      const encrypted = encryptData(dataString, key);

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:encrypt',message:'Encrypt success',data:{dataLength:dataString.length,encryptedLength:encrypted.encrypted.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        encrypted: JSON.stringify(encrypted),
      });
    } catch (encryptError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:encrypt',message:'Encrypt operation failed',data:{error:encryptError.message,stack:encryptError.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Encryption operation error:', encryptError);
      res.status(500).json({ error: 'Failed to encrypt data' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:encrypt',message:'Encrypt route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_ENCRYPT_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Encryption error:', error);
    res.status(500).json({ error: 'Failed to encrypt data' });
  }
});

/**
 * POST /api/vault/decrypt
 * Decrypt data
 */
router.post('/decrypt', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt request started',data:{hasEncryptedData:!!req.body.encryptedData},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_START'})}).catch(()=>{});
    }
    // #endregion

    const { encryptedData } = req.body;

    // Input validation
    if (!encryptedData) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt validation failed',data:{error:'Encrypted data is required'},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Encrypted data is required' });
    }

    if (typeof encryptedData !== 'string') {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt validation failed - invalid type',data:{error:'Encrypted data must be string',dataType:typeof encryptedData},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_VALIDATION_TYPE'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Encrypted data must be string' });
    }

    try {
      const encrypted = JSON.parse(encryptedData);
      
      // Validate encrypted structure
      if (!encrypted.encrypted || !encrypted.iv || !encrypted.authTag) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt validation failed - invalid structure',data:{error:'Invalid encrypted data structure',hasEncrypted:!!encrypted.encrypted,hasIv:!!encrypted.iv,hasAuthTag:!!encrypted.authTag},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_VALIDATION_STRUCTURE'})}).catch(()=>{});
        }
        // #endregion
        return res.status(400).json({ error: 'Invalid encrypted data structure' });
      }

      const key = deriveKey(MASTER_KEY, SALT);
      const decrypted = decryptData(encrypted.encrypted, encrypted.iv, encrypted.authTag, key);

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt success',data:{decryptedLength:decrypted.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        decrypted,
      });
    } catch (parseError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt parse error',data:{error:parseError.message,isJsonError:parseError instanceof SyntaxError},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_PARSE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Decryption parse error:', parseError);
      res.status(400).json({ error: 'Invalid encrypted data format' });
    } catch (decryptError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt operation failed',data:{error:decryptError.message,stack:decryptError.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Decryption operation error:', decryptError);
      res.status(500).json({ error: 'Failed to decrypt data' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:decrypt',message:'Decrypt route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DECRYPT_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Decryption error:', error);
    res.status(500).json({ error: 'Failed to decrypt data' });
  }
});

/**
 * POST /api/vault/store
 * Store encrypted file in vault
 */
router.post('/store', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:store',message:'Store request started',data:{hasName:!!req.body.name,hasData:!!req.body.data,hasType:!!req.body.type},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_STORE_START'})}).catch(()=>{});
    }
    // #endregion

    const userId = getUserId(req);
    const { name, data, type } = req.body;

    // Input validation
    if (!name || !data) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:store',message:'Store validation failed',data:{error:'Name and data are required',hasName:!!name,hasData:!!data},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_STORE_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Name and data are required' });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:store',message:'Store validation failed - invalid name',data:{error:'Name must be non-empty string',nameType:typeof name},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_STORE_VALIDATION_NAME'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Name must be non-empty string' });
    }

    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Encrypt data
      const key = deriveKey(MASTER_KEY, SALT);
      const encrypted = encryptData(dataString, key);

      // Save encrypted file
      const fileId = `vault_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      const filePath = path.join(VAULT_DIR, fileId);
      
      fs.writeFileSync(filePath, JSON.stringify(encrypted));

      // Save to database
      DB.vault.create({
        id: fileId,
        userId,
        name: name.trim(),
        path: filePath,
        type: type || 'text/plain',
        encrypted: true,
      });

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:store',message:'Store success',data:{fileId,name,type:type || 'text/plain',dataLength:dataString.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_STORE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        file: {
          id: fileId,
          name: name.trim(),
          type: type || 'text/plain',
          encrypted: true,
        },
      });
    } catch (storeError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:store',message:'Store operation failed',data:{error:storeError.message,stack:storeError.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_STORE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault store operation error:', storeError);
      res.status(500).json({ error: 'Failed to store file in vault' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:store',message:'Store route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_STORE_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault store error:', error);
    res.status(500).json({ error: 'Failed to store file in vault' });
  }
});

/**
 * GET /api/vault/list
 * List vault items
 */
router.get('/list', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:list',message:'List request started',data:{},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_LIST_START'})}).catch(()=>{});
    }
    // #endregion

    const userId = getUserId(req);
    
    try {
      const items = DB.vault.findByUser(userId);

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:list',message:'List success',data:{userId,itemCount:items.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_LIST_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          encrypted: item.encrypted,
          createdAt: item.created_at,
        })),
        count: items.length,
      });
    } catch (dbError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:list',message:'List database error',data:{error:dbError.message,stack:dbError.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_LIST_DB_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault list database error:', dbError);
      res.status(500).json({ error: 'Failed to list vault items' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:list',message:'List route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_LIST_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault list error:', error);
    res.status(500).json({ error: 'Failed to list vault items' });
  }
});

/**
 * GET /api/vault/:id
 * Retrieve and decrypt vault item
 */
router.get('/:id', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get validation failed',data:{error:'Invalid item ID',id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    try {
      const item = DB.vault.findById(id);
      
      if (!item) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get item not found',data:{id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'Vault item not found' });
      }

      if (item.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get unauthorized access',data:{id,userId,itemUserId:item.user_id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      if (!fs.existsSync(item.path)) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get file missing',data:{id,filePath:item.path},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_FILE_MISSING'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File missing on disk' });
      }

      // Read and decrypt
      const encrypted = JSON.parse(fs.readFileSync(item.path, 'utf8'));
      
      // Validate encrypted structure
      if (!encrypted.encrypted || !encrypted.iv || !encrypted.authTag) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get invalid encrypted structure',data:{id,hasEncrypted:!!encrypted.encrypted,hasIv:!!encrypted.iv,hasAuthTag:!!encrypted.authTag},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_INVALID_STRUCTURE'})}).catch(()=>{});
        }
        // #endregion
        return res.status(500).json({ error: 'Invalid encrypted file structure' });
      }

      const key = deriveKey(MASTER_KEY, SALT);
      const decrypted = decryptData(encrypted.encrypted, encrypted.iv, encrypted.authTag, key);

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get success',data:{id,name:item.name,decryptedLength:decrypted.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        item: {
          id: item.id,
          name: item.name,
          type: item.type,
          data: decrypted,
        },
      });
    } catch (readError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get operation failed',data:{error:readError.message,stack:readError.stack,id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault retrieve operation error:', readError);
      res.status(500).json({ error: 'Failed to retrieve vault item' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:get',message:'Get route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_GET_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault retrieve error:', error);
    res.status(500).json({ error: 'Failed to retrieve vault item' });
  }
});

/**
 * DELETE /api/vault/:id
 * Delete vault item
 */
router.delete('/:id', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete validation failed',data:{error:'Invalid item ID',id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    try {
      const item = DB.vault.findById(id);
      
      if (!item) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete item not found',data:{id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'Vault item not found' });
      }

      if (item.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete unauthorized access',data:{id,userId,itemUserId:item.user_id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Delete file
      if (fs.existsSync(item.path)) {
        try {
          fs.unlinkSync(item.path);
        } catch (unlinkError) {
          // #region agent log
          if (process.env.NODE_ENV === 'development') {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete file unlink error',data:{error:unlinkError.message,filePath:item.path},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_UNLINK_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('Failed to delete file:', unlinkError);
          // Continue with database deletion even if file deletion fails
        }
      }

      // Delete from database
      DB.vault.delete(id);

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete success',data:{id,name:item.name},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({ success: true });
    } catch (deleteError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete operation failed',data:{error:deleteError.message,stack:deleteError.stack,id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault delete operation error:', deleteError);
      res.status(500).json({ error: 'Failed to delete vault item' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:delete',message:'Delete route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DELETE_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault delete error:', error);
    res.status(500).json({ error: 'Failed to delete vault item' });
  }
});

/**
 * POST /api/vault/upload
 * Upload file to vault (with encryption)
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:upload',message:'Upload request started',data:{hasFile:!!req.file,hasName:!!req.body.name},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_START'})}).catch(()=>{});
    }
    // #endregion

    const userId = getUserId(req);
    const { name } = req.body;
    const file = req.file;

    // Input validation
    if (!file) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:upload',message:'Upload validation failed - no file',data:{error:'File is required'},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_VALIDATION_FILE'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'File is required' });
    }

    const fileName = name || file.originalname || `vault_file_${Date.now()}`;
    const fileType = file.mimetype || 'application/octet-stream';

    try {
      // Read file buffer
      const fileBuffer = fs.readFileSync(file.path);
      
      // Encrypt file data
      const key = deriveKey(MASTER_KEY, SALT);
      const encrypted = encryptData(fileBuffer.toString('base64'), key);

      // Save encrypted file
      const fileId = `vault_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      const filePath = path.join(VAULT_DIR, fileId);
      
      fs.writeFileSync(filePath, JSON.stringify(encrypted));

      // Delete temporary file
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        // Ignore unlink errors for temp files
      }

      // Save to database
      DB.vault.create({
        id: fileId,
        userId,
        name: fileName,
        path: filePath,
        type: fileType,
        encrypted: true,
      });

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:upload',message:'Upload success',data:{fileId,name:fileName,type:fileType,size:fileBuffer.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        file: {
          id: fileId,
          name: fileName,
          type: fileType,
          size: fileBuffer.length,
          encrypted: true,
        },
      });
    } catch (uploadError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:upload',message:'Upload operation failed',data:{error:uploadError.message,stack:uploadError.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault upload operation error:', uploadError);
      res.status(500).json({ error: 'Failed to upload file to vault' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:upload',message:'Upload route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_UPLOAD_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to vault' });
  }
});

/**
 * GET /api/vault/:id/download
 * Download vault item (decrypted)
 */
router.get('/:id/download', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download validation failed',data:{error:'Invalid item ID',id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    try {
      const item = DB.vault.findById(id);
      
      if (!item) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download item not found',data:{id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'Vault item not found' });
      }

      if (item.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download unauthorized access',data:{id,userId,itemUserId:item.user_id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      if (!fs.existsSync(item.path)) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download file missing',data:{id,filePath:item.path},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_FILE_MISSING'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File missing on disk' });
      }

      // Read and decrypt
      const encrypted = JSON.parse(fs.readFileSync(item.path, 'utf8'));
      
      if (!encrypted.encrypted || !encrypted.iv || !encrypted.authTag) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download invalid encrypted structure',data:{id,hasEncrypted:!!encrypted.encrypted,hasIv:!!encrypted.iv,hasAuthTag:!!encrypted.authTag},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_INVALID_STRUCTURE'})}).catch(()=>{});
        }
        // #endregion
        return res.status(500).json({ error: 'Invalid encrypted file structure' });
      }

      const key = deriveKey(MASTER_KEY, SALT);
      const decryptedBase64 = decryptData(encrypted.encrypted, encrypted.iv, encrypted.authTag, key);
      const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download success',data:{id,name:item.name,size:decryptedBuffer.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.setHeader('Content-Type', item.type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${item.name}"`);
      res.send(decryptedBuffer);
    } catch (downloadError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download operation failed',data:{error:downloadError.message,stack:downloadError.stack,id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault download operation error:', downloadError);
      res.status(500).json({ error: 'Failed to download vault item' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:download',message:'Download route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_DOWNLOAD_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault download error:', error);
    res.status(500).json({ error: 'Failed to download vault item' });
  }
});

/**
 * GET /api/vault/:id/preview
 * Preview vault item (decrypted, for text/images)
 */
router.get('/:id/preview', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview validation failed',data:{error:'Invalid item ID',id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    try {
      const item = DB.vault.findById(id);
      
      if (!item) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview item not found',data:{id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'Vault item not found' });
      }

      if (item.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview unauthorized access',data:{id,userId,itemUserId:item.user_id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      if (!fs.existsSync(item.path)) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview file missing',data:{id,filePath:item.path},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_FILE_MISSING'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File missing on disk' });
      }

      // Read and decrypt
      const encrypted = JSON.parse(fs.readFileSync(item.path, 'utf8'));
      
      if (!encrypted.encrypted || !encrypted.iv || !encrypted.authTag) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview invalid encrypted structure',data:{id,hasEncrypted:!!encrypted.encrypted,hasIv:!!encrypted.iv,hasAuthTag:!!encrypted.authTag},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_INVALID_STRUCTURE'})}).catch(()=>{});
        }
        // #endregion
        return res.status(500).json({ error: 'Invalid encrypted file structure' });
      }

      const key = deriveKey(MASTER_KEY, SALT);
      const decrypted = decryptData(encrypted.encrypted, encrypted.iv, encrypted.authTag, key);

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview success',data:{id,name:item.name,type:item.type,decryptedLength:decrypted.length},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        preview: {
          id: item.id,
          name: item.name,
          type: item.type,
          data: decrypted,
          isText: item.type?.startsWith('text/') || item.type?.includes('json') || item.type?.includes('xml'),
          isImage: item.type?.startsWith('image/'),
        },
      });
    } catch (previewError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview operation failed',data:{error:previewError.message,stack:previewError.stack,id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault preview operation error:', previewError);
      res.status(500).json({ error: 'Failed to preview vault item' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:preview',message:'Preview route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_PREVIEW_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault preview error:', error);
    res.status(500).json({ error: 'Failed to preview vault item' });
  }
});

/**
 * POST /api/vault/:id/scan
 * Scan vault item (OCR for images, analysis for documents)
 */
router.post('/:id/scan', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan validation failed',data:{error:'Invalid item ID',id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    try {
      const item = DB.vault.findById(id);
      
      if (!item) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan item not found',data:{id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'Vault item not found' });
      }

      if (item.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan unauthorized access',data:{id,userId,itemUserId:item.user_id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      if (!fs.existsSync(item.path)) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan file missing',data:{id,filePath:item.path},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_FILE_MISSING'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File missing on disk' });
      }

      // Read and decrypt
      const encrypted = JSON.parse(fs.readFileSync(item.path, 'utf8'));
      
      if (!encrypted.encrypted || !encrypted.iv || !encrypted.authTag) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan invalid encrypted structure',data:{id,hasEncrypted:!!encrypted.encrypted,hasIv:!!encrypted.iv,hasAuthTag:!!encrypted.authTag},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_INVALID_STRUCTURE'})}).catch(()=>{});
        }
        // #endregion
        return res.status(500).json({ error: 'Invalid encrypted file structure' });
      }

      const key = deriveKey(MASTER_KEY, SALT);
      const decryptedBase64 = decryptData(encrypted.encrypted, encrypted.iv, encrypted.authTag, key);
      const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');

      // Import OCR service
      const { extrREMOVED } = await import('../services/ocrService.js');
      
      // Scan based on file type
      let scanResult;
      if (item.type?.startsWith('image/')) {
        // OCR for images - save to temp file first
        const tempImagePath = path.join(TEMP_DIR, `scan_${id}_${Date.now()}.tmp`);
        try {
          fs.writeFileSync(tempImagePath, decryptedBuffer);
          const ocrResult = await extrREMOVED(tempImagePath, 'ar', true);
          scanResult = {
            text: ocrResult.text || '',
            type: 'image',
            confidence: ocrResult.confidence || 0,
            language: ocrResult.language || 'ar',
          };
          // Clean up temp file
          try {
            fs.unlinkSync(tempImagePath);
          } catch (unlinkError) {
            // Ignore cleanup errors
          }
        } catch (ocrError) {
          // #region agent log
          if (process.env.NODE_ENV === 'development') {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan OCR error',data:{error:ocrError.message,id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_OCR_ERROR'})}).catch(()=>{});
          }
          // #endregion
          // Fallback to empty result
          scanResult = {
            text: '',
            type: 'image',
            error: 'OCR failed',
          };
        }
      } else {
        // Text analysis for documents
        const text = decryptedBuffer.toString('utf8');
        scanResult = {
          text,
          type: 'text',
          length: text.length,
        };
      }

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan success',data:{id,name:item.name,type:item.type,scanType:scanResult.type},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        scan: scanResult,
      });
    } catch (scanError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan operation failed',data:{error:scanError.message,stack:scanError.stack,id},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault scan operation error:', scanError);
      res.status(500).json({ error: 'Failed to scan vault item' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/vault.js:scan',message:'Scan route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-session',runId:'run1',hypothesisId:'VAULT_SCAN_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Vault scan error:', error);
    res.status(500).json({ error: 'Failed to scan vault item' });
  }
});

export default router;

