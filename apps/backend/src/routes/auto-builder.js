/**
 * RARE 4N - Auto Builder Routes
 * Auto Builder Terminal + Client Portal Integration + Build System
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { buildAllPlatforms } from '../services/buildService.js';
import { sendBuildFiles, sendSMS } from '../services/emailService.js';
import expoService from '../services/expoService.js';
import githubService from '../services/githubService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Access clientRequests from global (set by client-portal)
const getClientRequests = () => {
  return global.clientRequests || new Map();
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/**
 * Initialize Auto Builder Socket.IO
 */
export function initializeAutoBuilder(io) {
  const builderNamespace = io.of('/auto-builder');

  builderNamespace.on('connection', (socket) => {
    console.log('✅ Auto Builder client connected:', socket.id);

    // Listen for client requests
    socket.on('client:request', (request) => {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auto-builder.js:client:request',message:'Received client request in Auto Builder',data:{requestId:request?.id,type:request?.type},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'CLIENT_REQUEST_RECEIVED'})}).catch(()=>{});
      }
      // #endregion
      
      // ✅ Safety check: Validate request
      if (!request || typeof request !== 'object' || !request.id) {
        console.warn('[Auto Builder] Invalid client request:', request);
        return;
      }
      
      // Forward to all connected Auto Builder terminals
      socket.broadcast.emit('client:request', request);
      
      // Also emit to the sender to show in their terminal
      socket.emit('client:request', request);
    });

    // ✅ Listen for client file uploads
    socket.on('client:files-uploaded', (data) => {
      socket.broadcast.emit('client:files-uploaded', data);
      socket.emit('client:files-uploaded', data);
    });

    // ✅ Listen for payment completion
    socket.on('payment:completed', (data) => {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auto-builder.js:payment:completed',message:'Payment completed, ready to build',data:{clientId:data?.clientId,requestId:data?.requestId},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'PAYMENT_COMPLETED'})}).catch(()=>{});
      }
      // #endregion
      
      // ✅ Safety check: Validate data
      if (!data || typeof data !== 'object') {
        console.warn('[Auto Builder] Invalid payment data:', data);
        return;
      }
      
      socket.broadcast.emit('payment:completed', data);
      socket.emit('payment:completed', data);
      console.log('✅ Payment completed, ready to build:', data);
      
      // Notify Client Portal about payment completion
      if (data.clientId) {
        io.of('/client-portal').emit('payment:completed', {
          clientId: data.clientId,
          requestId: data.requestId,
          status: 'completed',
        });
      }
    });

    // Terminal command execution
    socket.on('terminal:command', async (data) => {
      const { command, clientId, requestId } = data;
      
      try {
        // Validate command
        if (!command || typeof command !== 'string') {
          socket.emit('terminal:output', {
            type: 'error',
            command: command || 'unknown',
            output: 'Error: Invalid command',
            timestamp: Date.now(),
          });
          return;
        }

        // Security: Block dangerous commands
        const dangerousCommands = ['rm -rf', 'format', 'del /f', 'shutdown', 'reboot', 'sudo'];
        const lowerCommand = command.toLowerCase();
        if (dangerousCommands.some(cmd => lowerCommand.includes(cmd))) {
          socket.emit('terminal:output', {
            type: 'error',
            command,
            output: 'Error: Dangerous command blocked for security',
            timestamp: Date.now(),
          });
          return;
        }

        // Execute command (this would be handled by the builder agent)
        // Support for Expo, GitHub, npm, etc.
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        let output = '';
        let error = null;

        // Determine working directory safely
        let cwd = undefined;
        if (requestId) {
          const projectPath = path.join(__dirname, '../../projects', `project_${requestId}`);
          if (fs.existsSync(projectPath)) {
            cwd = projectPath;
          }
        }

        try {
          const result = await Promise.race([
            execAsync(command, { cwd, timeout: 300000 }), // 5 minutes timeout
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Command timeout')), 300000)
            ),
          ]);
          output = result.stdout;
        } catch (err) {
          error = err.message;
          output = err.stdout || err.stderr || '';
        }

        socket.emit('terminal:output', {
          type: 'command',
          command,
          output: output || error || `Executing: ${command}`,
          error: error || null,
          timestamp: Date.now(),
        });

        // If command is related to a client request, notify client
        if (clientId) {
          io.of('/client-portal').emit('client:request:processing', {
            clientId,
            command,
            output,
          });
        }
      } catch (err) {
        socket.emit('terminal:output', {
          type: 'error',
          command,
          output: `Error: ${err.message}`,
          timestamp: Date.now(),
        });
      }
    });

    // ✅ Listen for revision requests
    socket.on('client:revision_requested', (revision) => {
      socket.broadcast.emit('client:revision_requested', revision);
      socket.emit('client:revision_requested', revision);
      console.log('✅ Revision requested:', revision.id);
    });

    // Send response to client
    socket.on('client:response', async (data) => {
      const { clientId, requestId, response, deliveryDate, deliveryTime, projectName } = data;
      
      io.of('/client-portal').emit('client:request:updated', {
        requestId,
        status: 'completed',
        response,
      });

      // ✅ Send WhatsApp notification - Delivery Confirmed (if delivery date provided)
      if (deliveryDate && deliveryTime && projectName) {
        try {
          const { sendDeliveryConfirmed } = await import('../services/twilioTemplatesService.js');
          // Get client phone from clientRequests
          const clientRequests = getClientRequests();
          const clientRequest = clientRequests.get(clientId)?.[0];
          if (clientRequest?.phone) {
            await sendDeliveryConfirmed(
              clientRequest.phone,
              clientRequest.clientName || 'عميلنا العزيز',
              projectName,
              deliveryDate,
              deliveryTime
            );
            console.log('✅ Delivery confirmed notification sent to:', clientRequest.phone);
          }
        } catch (error) {
          console.error('Failed to send delivery confirmed notification:', error);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Auto Builder client disconnected:', socket.id);
    });
  });
}

/**
 * POST /api/auto-builder/execute
 * Execute command from terminal
 */
router.post('/execute', async (req, res) => {
  try {
    const { command, clientId } = req.body;

    // Validate input
    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Command is required and must be a string',
      });
    }

    // Security: Block dangerous commands
    const dangerousCommands = ['rm -rf', 'format', 'del /f', 'shutdown', 'reboot'];
    const lowerCommand = command.toLowerCase();
    if (dangerousCommands.some(cmd => lowerCommand.includes(cmd))) {
      return res.status(403).json({
        success: false,
        error: 'Dangerous command blocked',
      });
    }

    // This would be handled by the builder agent
    // For now, just acknowledge
    res.json({
      success: true,
      command,
      output: `Command executed: ${command}`,
    });
  } catch (error) {
    console.error('Execute command error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute command',
    });
  }
});

/**
 * POST /api/auto-builder/build
 * Build project and send files to email
 * ✅ البناء يتم بموافقة المستخدم فقط
 * ✅ الملفات ترسل لإيميل المستخدم دائماً (GM@ZIEN-AI.APP)
 * ✅ الملفات ترسل للعميل فقط إذا دفع
 */
router.post('/build', upload.array('files'), async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auto-builder.js:POST /build',message:'Build request received',data:{projectName:req.body?.projectName,platforms:req.body?.platforms,hasFiles:!!req.files?.length},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'BUILD_REQUEST_START'})}).catch(()=>{});
    }
    // #endregion
    
    const { projectName, platforms, email, phone, projectType, clientId, clientEmail, requestId, paymentStatus } = req.body;

    // ✅ Safety check: Validate inputs
    if (!projectName || typeof projectName !== 'string') {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auto-builder.js:POST /build',message:'Invalid project name',data:{projectName},timestamp:Date.now(),sessionId:'builder-session',runId:'run1',hypothesisId:'INVALID_PROJECT_NAME'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({
        success: false,
        error: 'Project name is required and must be a string',
      });
    }

    // Validate project name format
    if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
      return res.status(400).json({
        success: false,
        error: 'Project name can only contain letters, numbers, underscores, and hyphens',
      });
    }

    // Validate platforms
    const validPlatforms = ['ios', 'android', 'web', 'hybrid'];
    const platformsArray = platforms ? platforms.split(',').map(p => p.trim()) : ['ios', 'android', 'web'];
    const invalidPlatforms = platformsArray.filter(p => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid platforms: ${invalidPlatforms.join(', ')}. Valid platforms: ${validPlatforms.join(', ')}`,
      });
    }

    // ✅ Owner email (always send to owner) - Fallback to GOOGLE_WORKSPACE_EMAIL
    const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.GOOGLE_WORKSPACE_EMAIL || 'GM@ZIEN-AI.APP';

    // Get project path (from uploaded files or existing project)
    let projectPath;
    if (req.files && req.files.length > 0) {
      // Create project directory from uploaded files
      const projectDir = path.join(__dirname, '../../projects', projectName);
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }
      
      // Move uploaded files to project directory
      req.files.forEach(file => {
        try {
          // Sanitize filename
          const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          const destPath = path.join(projectDir, sanitizedName);
          fs.renameSync(file.path, destPath);
        } catch (fileError) {
          console.error('Failed to move file:', fileError);
          // Continue with other files
        }
      });
      
      projectPath = projectDir;
    } else {
      projectPath = path.join(__dirname, '../../projects', projectName);
      if (!fs.existsSync(projectPath)) {
        return res.status(404).json({
          success: false,
          error: 'Project not found',
        });
      }
    }

    // Build all platforms (already validated above)
    const buildResult = await buildAllPlatforms(
      projectPath,
      projectName,
      OWNER_EMAIL, // Always send to owner
      phone,
      {
        platforms: platformsArray,
        projectType: projectType || 'react-native',
        // Also send to client if payment is completed
        clientEmail: (paymentStatus === 'paid' && clientEmail) ? clientEmail : null,
        clientId,
        requestId,
      }
    );

    // Store build info for download
    const buildInfo = {
      buildId: `build_${Date.now()}`,
      projectName,
      ownerEmail: OWNER_EMAIL,
      clientEmail: (paymentStatus === 'paid' && clientEmail) ? clientEmail : null,
      phone,
      builds: buildResult.builds,
      createdAt: Date.now(),
      paymentStatus,
    };

    // Store in memory (in production, use database)
    if (!global.buildHistory) {
      global.buildHistory = new Map();
    }
    global.buildHistory.set(buildInfo.buildId, buildInfo);

    // Notify via Socket.IO
    const io = req.app.get('io') || global.io;
    if (io) {
      io.of('/auto-builder').emit('build:completed', {
        buildId: buildInfo.buildId,
        projectName,
        ownerEmail: OWNER_EMAIL,
        clientEmail: buildInfo.clientEmail,
        builds: buildResult.builds.map(b => ({
          filename: b.filename,
          size: b.size,
        })),
      });

      // Notify client if payment completed
      if (paymentStatus === 'paid' && clientId) {
        io.of('/client-portal').emit('client:build:completed', {
          requestId,
          buildId: buildInfo.buildId,
          projectName,
          builds: buildResult.builds.map(b => ({
            filename: b.filename,
            size: b.size,
            downloadUrl: `/api/auto-builder/download/${buildInfo.buildId}/${encodeURIComponent(b.filename)}`,
          })),
        });

        // ✅ Send WhatsApp notification - Build Complete
        try {
          const { sendBuildComplete } = await import('../services/twilioTemplatesService.js');
          // Get client phone from request (stored when client registered)
          const clientRequests = getClientRequests();
          const clientRequest = clientRequests.get(clientId)?.[0];
          if (clientRequest?.phone) {
            await sendBuildComplete(clientRequest.phone, clientRequest.clientName || 'عميلنا العزيز', projectName);
            console.log('✅ Build complete notification sent to:', clientRequest.phone);
          }
        } catch (error) {
          console.error('Failed to send build complete notification:', error);
        }

        // ✅ Create Preview Link
        const previewToken = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const previewLink = `${process.env.CLIENT_PORTAL_URL || 'http://localhost:3000'}/preview/${previewToken}`;
        
        // Store preview
        if (!global.buildPreviews) {
          global.buildPreviews = new Map();
        }
        global.buildPreviews.set(previewToken, {
          buildId: buildInfo.buildId,
          projectName,
          clientId,
          requestId,
          builds: buildResult.builds,
          createdAt: Date.now(),
        });

        // Send preview link to client
        io.of('/client-portal').emit('client:preview_ready', {
          requestId,
          buildId: buildInfo.buildId,
          previewLink,
          projectName,
        });

        // ✅ Save to Library based on request type
        try {
          const clientRequests = getClientRequests();
          const clientRequest = clientRequests.get(clientId)?.[0];
          if (clientRequest?.content?.selectedType) {
            const { selectedType, selectedItem } = clientRequest.content;
            
            // Import libraries
            const { APP_TEMPLATES } = await import('../libraries/appTemplatesLibrary.js');
            const { SYSTEMS_LIBRARY } = await import('../libraries/systemsLibrary.js');
            const { THEMES_LIBRARY } = await import('../libraries/themesLibrary.js');

            const libraryItem = {
              id: `${selectedItem?.id || projectName}_${Date.now()}`,
              name: projectName,
              nameEn: selectedItem?.nameEn || projectName,
              category: selectedItem?.category || 'custom',
              description: `Built for ${clientRequest.clientName} - ${new Date().toLocaleDateString('ar-SA')}`,
              buildId: buildInfo.buildId,
              builds: buildResult.builds.map(b => ({
                filename: b.filename,
                size: b.size,
                downloadUrl: `/api/auto-builder/download/${buildInfo.buildId}/${encodeURIComponent(b.filename)}`,
              })),
              createdAt: Date.now(),
              clientId,
              requestId,
            };

            // Save to appropriate library (Note: This modifies the exported array, in production use a database)
            if (selectedType === 'template' && APP_TEMPLATES) {
              APP_TEMPLATES.push(libraryItem);
              console.log('✅ Saved to APP_TEMPLATES library');
            } else if (selectedType === 'system' && SYSTEMS_LIBRARY) {
              SYSTEMS_LIBRARY.push(libraryItem);
              console.log('✅ Saved to SYSTEMS_LIBRARY');
            } else if (selectedType === 'theme' && THEMES_LIBRARY) {
              THEMES_LIBRARY.push(libraryItem);
              console.log('✅ Saved to THEMES_LIBRARY');
            }
          }
        } catch (error) {
          console.error('Failed to save to library:', error);
          // Don't fail the build if library save fails
        }
      }
    }

    res.json({
      success: buildResult.success,
      buildId: buildInfo.buildId,
      builds: buildResult.builds.map(b => ({
        filename: b.filename,
        size: b.size,
        downloadUrl: `/api/auto-builder/download/${buildInfo.buildId}/${encodeURIComponent(b.filename)}`,
      })),
      errors: buildResult.errors,
      message: `تم البناء بنجاح. تم إرسال الملفات إلى ${OWNER_EMAIL}${buildInfo.clientEmail ? ` وإلى ${buildInfo.clientEmail}` : ''}.`,
    });
  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Build failed',
    });
  }
});

/**
 * GET /api/auto-builder/builds
 * Get all builds for a user
 */
router.get('/builds', (req, res) => {
  try {
    const { email } = req.query;

    // Validate email format if provided
    if (email && typeof email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    if (!global.buildHistory) {
      return res.json({
        success: true,
        builds: [],
      });
    }

    const builds = Array.from(global.buildHistory.values())
      .filter(build => {
        if (!email) return true;
        return build.ownerEmail === email || build.clientEmail === email;
      })
      .map(build => ({
        buildId: build.buildId,
        projectName: build.projectName,
        builds: build.builds.map(b => ({
          filename: b.filename,
          size: b.size,
          downloadUrl: `/api/auto-builder/download/${build.buildId}/${encodeURIComponent(b.filename)}`,
        })),
        createdAt: build.createdAt,
      }));

    res.json({
      success: true,
      builds,
      count: builds.length,
    });
  } catch (error) {
    console.error('Get builds error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auto-builder/expo/init
 * Initialize Expo project
 */
router.post('/expo/init', async (req, res) => {
  try {
    const { projectName, projectType = 'blank' } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required',
      });
    }

    const result = await expoService.initExpoProject(projectName, projectType);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Expo init error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auto-builder/expo/build
 * Build with EAS
 */
router.post('/expo/build', async (req, res) => {
  try {
    const { projectName, platform = 'all', profile = 'production' } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required',
      });
    }

    const result = await expoService.buildWithEAS(projectName, platform, profile);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('EAS build error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auto-builder/expo/status/:buildId
 * Get EAS build status
 */
router.get('/expo/status/:buildId', async (req, res) => {
  try {
    const { buildId } = req.params;

    const result = await expoService.getEASBuildStatus(buildId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('EAS build status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auto-builder/expo/builds/:projectName
 * List EAS builds
 */
router.get('/expo/builds/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    const { limit = 10 } = req.query;

    const result = await expoService.listEASBuilds(projectName, parseInt(limit));

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('EAS build list error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auto-builder/github/create
 * Create GitHub repository
 */
router.post('/github/create', async (req, res) => {
  try {
    const { projectName, projectPath, description = '', isPrivate = false } = req.body;

    if (!projectName || !projectPath) {
      return res.status(400).json({
        success: false,
        error: 'Project name and path are required',
      });
    }

    const result = await githubService.createAndPushProject(projectName, projectPath, description, isPrivate);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('GitHub create error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auto-builder/github/push
 * Push to GitHub
 */
router.post('/github/push', async (req, res) => {
  try {
    const { projectPath, repoUrl, branch = 'main' } = req.body;

    if (!projectPath || !repoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Project path and repo URL are required',
      });
    }

    const result = await githubService.pushToGitHub(projectPath, repoUrl, branch);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('GitHub push error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auto-builder/github/repo/:repoName
 * Get repository info
 */
router.get('/github/repo/:repoName', async (req, res) => {
  try {
    const { repoName } = req.params;

    const result = await githubService.getRepoInfo(repoName);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('GitHub repo info error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auto-builder/preview/:token
 * Get preview link data
 */
router.get('/preview/:token', (req, res) => {
  try {
    const { token } = req.params;

    if (!global.buildPreviews) {
      return res.status(404).json({
        success: false,
        error: 'Preview not found',
      });
    }

    const preview = global.buildPreviews.get(token);
    if (!preview) {
      return res.status(404).json({
        success: false,
        error: 'Preview not found',
      });
    }

    res.json({
      success: true,
      preview: {
        buildId: preview.buildId,
        projectName: preview.projectName,
        builds: preview.builds.map(b => ({
          filename: b.filename,
          size: b.size,
          downloadUrl: `/api/auto-builder/download/${preview.buildId}/${encodeURIComponent(b.filename)}`,
        })),
        createdAt: preview.createdAt,
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auto-builder/download/:buildId/:filename
 * Download build file
 */
router.get('/download/:buildId/:filename', (req, res) => {
  try {
    const { buildId, filename } = req.params;
    
    // Validate inputs
    if (!buildId || !filename) {
      return res.status(400).json({
        success: false,
        error: 'Build ID and filename are required',
      });
    }

    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(403).json({
        success: false,
        error: 'Invalid filename',
      });
    }

    const decodedFilename = decodeURIComponent(filename);

    if (!global.buildHistory) {
      return res.status(404).json({
        success: false,
        error: 'Build not found',
      });
    }

    const buildInfo = global.buildHistory.get(buildId);
    if (!buildInfo) {
      return res.status(404).json({
        success: false,
        error: 'Build not found',
      });
    }

    const buildFile = buildInfo.builds.find(b => b.filename === decodedFilename);
    if (!buildFile || !fs.existsSync(buildFile.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    res.download(buildFile.filePath, decodedFilename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Download failed',
          });
        }
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

