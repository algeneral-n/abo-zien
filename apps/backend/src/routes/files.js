/**
 * ABO ZIEN - Files Routes
 * Local file management
 */

import express from 'express';
import { getDatabase, DB } from '../database/localDB.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILES_DIR = path.join(__dirname, '../../data/files');

// Ensure files directory exists
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

/**
 * Get user ID from token (middleware)
 */
function getUserId(req) {
  // In production, extract from JWT token
  return req.headers['x-user-id'] || 'default_user';
}

/**
 * List files
 * GET /api/files/list
 */
router.get('/list', (req, res) => {
  try {
    const userId = getUserId(req);
    const files = DB.files.findByUser(userId);

    res.json({
      success: true,
      files: files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        folder: file.folder,
        createdAt: file.created_at,
      })),
      count: files.length,
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

/**
 * Upload file
 * POST /api/files/upload
 * Supports: All file types (images, videos, documents, code, etc.)
 */
router.post('/upload', (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, data, type, folder } = req.body;

    if (!name || !data) {
      return res.status(400).json({ error: 'Name and data are required' });
    }

    // Detect file type from extension if not provided
    let detectedType = type;
    if (!detectedType) {
      const ext = path.extname(name).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
        '.webp': 'image/webp', '.svg': 'image/svg+xml', '.bmp': 'image/bmp',
        '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo',
        '.webm': 'video/webm', '.mkv': 'video/x-matroska',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.html': 'text/html', '.htm': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
        '.ts': 'text/typescript', '.jsx': 'text/javascript', '.tsx': 'text/typescript',
        '.json': 'application/json', '.xml': 'application/xml',
        '.zip': 'application/zip', '.rar': 'application/x-rar-compressed',
        '.txt': 'text/plain', '.md': 'text/markdown',
      };
      detectedType = mimeTypes[ext] || 'application/octet-stream';
    }

    // Save file locally
    const fileId = `file_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const filePath = path.join(FILES_DIR, fileId);
    
    // Decode base64 data
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, buffer);

    // Save to database
    DB.files.create({
      id: fileId,
      userId,
      name,
      path: filePath,
      size: buffer.length,
      type: detectedType,
      folder: folder || 'default',
    });

    res.json({
      success: true,
      file: {
        id: fileId,
        name,
        size: buffer.length,
        type: detectedType,
        folder,
      },
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * Delete file
 * DELETE /api/files/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    // Get file
    const file = DB.files.findById(id);
    if (!file || file.user_id !== userId) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    DB.files.delete(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * Download file
 * GET /api/files/:id/download
 */
router.get('/:id/download', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download validation failed',data:{error:'Invalid file ID',id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    try {
      const file = DB.files.findById(id);
      
      if (!file) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download file not found',data:{id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download unauthorized access',data:{id,userId,fileUserId:file.user_id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      if (!fs.existsSync(file.path)) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download file missing',data:{id,filePath:file.path},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_FILE_MISSING'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File missing on disk' });
      }

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download success',data:{id,name:file.name,size:file.size},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.download(file.path, file.name, (err) => {
        if (err) {
          // #region agent log
          if (process.env.NODE_ENV === 'development') {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download stream error',data:{error:err.message,id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_STREAM_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('Download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        }
      });
    } catch (downloadError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download operation failed',data:{error:downloadError.message,stack:downloadError.stack,id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Download file operation error:', downloadError);
      res.status(500).json({ error: 'Failed to download file' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:download',message:'Download route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_DOWNLOAD_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * Preview file
 * GET /api/files/:id/preview
 */
router.get('/:id/preview', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview validation failed',data:{error:'Invalid file ID',id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    try {
      const file = DB.files.findById(id);
      
      if (!file) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview file not found',data:{id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview unauthorized access',data:{id,userId,fileUserId:file.user_id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      if (!fs.existsSync(file.path)) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview file missing',data:{id,filePath:file.path},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_FILE_MISSING'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File missing on disk' });
      }

      // Read file content
      const fileBuffer = fs.readFileSync(file.path);
      const isText = file.type?.startsWith('text/') || file.type?.includes('json') || file.type?.includes('xml') || file.type?.includes('code');
      const isImage = file.type?.startsWith('image/');

      let previewData;
      if (isText) {
        previewData = fileBuffer.toString('utf8');
      } else if (isImage) {
        previewData = fileBuffer.toString('base64');
      } else {
        previewData = fileBuffer.toString('base64');
      }

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview success',data:{id,name:file.name,type:file.type,isText,isImage,previewLength:previewData.length},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        preview: {
          id: file.id,
          name: file.name,
          type: file.type,
          data: previewData,
          isText,
          isImage,
        },
      });
    } catch (previewError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview operation failed',data:{error:previewError.message,stack:previewError.stack,id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Preview file operation error:', previewError);
      res.status(500).json({ error: 'Failed to preview file' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:preview',message:'Preview route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_PREVIEW_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Preview file error:', error);
    res.status(500).json({ error: 'Failed to preview file' });
  }
});

/**
 * Get file info (backward compatibility)
 * GET /api/files/:id
 */
router.get('/:id', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:get',message:'Get file info request started',data:{id:req.params.id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_GET_START'})}).catch(()=>{});
    }
    // #endregion

    const { id } = req.params;
    const userId = getUserId(req);

    // Input validation
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:get',message:'Get file info validation failed',data:{error:'Invalid file ID',id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_GET_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    try {
      const file = DB.files.findById(id);
      
      if (!file) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:get',message:'Get file info not found',data:{id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_GET_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'File not found' });
      }

      if (file.user_id !== userId) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:get',message:'Get file info unauthorized access',data:{id,userId,fileUserId:file.user_id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_GET_UNAUTHORIZED'})}).catch(()=>{});
        }
        // #endregion
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:get',message:'Get file info success',data:{id,name:file.name,type:file.type,size:file.size},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_GET_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        file: {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder: file.folder,
          createdAt: file.created_at,
        },
      });
    } catch (getError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:get',message:'Get file info operation failed',data:{error:getError.message,stack:getError.stack,id},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_GET_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Get file info operation error:', getError);
      res.status(500).json({ error: 'Failed to get file info' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/files.js:get',message:'Get file info route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'files-session',runId:'run1',hypothesisId:'FILES_GET_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

/**
 * Generate image using DALL-E 3
 * POST /api/files/generate-image
 */
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    // Use OpenAI DALL-E 3
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY=REPLACE_ME
    });

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: style ? `${prompt}, style: ${style}` : prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = response.data[0].url;

    // Save to database
    const userId = getUserId(req);
    const fileId = crypto.randomBytes(16).toString('hex');
    const filename = `generated_image_${Date.now()}.png`;

    DB.files.create({
      id: fileId,
      user_id: userId,
      name: filename,
      type: 'image',
      size: 0, // Will be updated after download
      folder: 'generated',
      url: imageUrl,
      created_at: Date.now(),
    });

    res.json({
      success: true,
      image: {
        id: fileId,
        url: imageUrl,
        filename,
      },
    });
  } catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Generate video using OpenAI Sora (when available) or RunwayML
 * POST /api/files/generate-video
 */
router.post('/generate-video', async (req, res) => {
  try {
    const { prompt, duration = 5, style, resolution = '1024x1024' } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    // ✅ Try OpenAI Sora first (if available)
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY=REPLACE_ME
    });

    let videoUrl = null;
    let videoId = null;
    let provider = 'openai';

    try {
      // ✅ Try Sora API (when available)
      // Note: Sora API may not be publicly available yet, so we'll try and fallback
      const soraResponse = await openai.video.generations.create({
        model: 'sora',
        prompt: style ? `${prompt}, style: ${style}` : prompt,
        duration: Math.min(Math.max(duration, 1), 60), // 1-60 seconds
        resolution,
      });

      videoUrl = soraResponse.data[0].url;
      videoId = soraResponse.data[0].id;
      provider = 'openai-sora';
    } catch (soraError) {
      // ✅ Fallback to RunwayML if Sora not available
      if (process.env.RUNWAYML_API_KEY) {
        try {
          const runwayResponse = await fetch('https://api.runwayml.com/v1/generate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RUNWAYML_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: style ? `${prompt}, style: ${style}` : prompt,
              duration: Math.min(Math.max(duration, 1), 10), // RunwayML supports 1-10 seconds
              resolution,
            }),
          });

          const runwayData = await runwayResponse.json();
          if (runwayData.video_url) {
            videoUrl = runwayData.video_url;
            videoId = runwayData.id;
            provider = 'runwayml';
          } else {
            throw new Error('RunwayML video generation failed');
          }
        } catch (runwayError) {
          console.warn('RunwayML error:', runwayError.message);
          throw new Error('Video generation service unavailable. Please try again later.');
        }
      } else {
        throw new Error('Video generation service not configured. Sora API not available and RunwayML API key missing.');
      }
    }

    if (!videoUrl) {
      throw new Error('Failed to generate video');
    }

    // ✅ Save video to database
    const userId = getUserId(req);
    const fileId = crypto.randomBytes(16).toString('hex');
    const filename = `generated_video_${Date.now()}.mp4`;

    DB.files.create({
      id: fileId,
      user_id: userId,
      name: filename,
      type: 'video',
      size: 0, // Will be updated after download
      folder: 'generated',
      url: videoUrl,
      metadata: {
        provider,
        videoId,
        duration,
        resolution,
        prompt,
      },
      created_at: Date.now(),
    });

    res.json({
      success: true,
      video: {
        id: fileId,
        url: videoUrl,
        videoId,
        filename,
        provider,
        duration,
        resolution,
      },
    });
  } catch (error) {
    console.error('Generate video error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Generate file
 * POST /api/files/generate-file
 */
router.post('/generate-file', async (req, res) => {
  try {
    const { type, content, filename } = req.body;

    if (!type || !content) {
      return res.status(400).json({ success: false, error: 'Type and content are required' });
    }

    // Save file to database
    const userId = getUserId(req);
    const fileId = crypto.randomBytes(16).toString('hex');
    const finalFilename = filename || `generated_${type}_${Date.now()}.${type}`;

    DB.files.create({
      id: fileId,
      user_id: userId,
      name: finalFilename,
      type: type,
      size: content.length,
      folder: 'generated',
      content: content,
      created_at: Date.now(),
    });

    res.json({
      success: true,
      file: {
        id: fileId,
        filename: finalFilename,
        type,
        size: content.length,
      },
    });
  } catch (error) {
    console.error('Generate file error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;








