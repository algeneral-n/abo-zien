import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

// استيراد ملفات الربط المحدثة (تأكد من نقل ملفات ربلت لمجلد database)
import { initDatabase } from './database/localDB.js';
import { initMongoDB } from './database/mongodb.js';
import { initSupabase } from './database/supabase.js';

// ✅ SECURITY: Cognitive Debugger & Service Manager
import { CognitiveDebugger } from './core/CognitiveDebugger.js';
import { ServiceManager } from './core/ServiceManager.js';

// ✅ MONITORING: Sentry & Logger
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './utils/sentry.js';
import logger from './utils/logger.js';

// ✅ SECURITY: Output Sanitization
import { sanitizeOutput } from './middleware/outputSanitization.js';

// ✅ PERFORMANCE: Rate Limiting
import { apiLimiter } from './middleware/rateLimiter.js';

// ✅ METRICS: Health & Metrics
import { updateMetrics } from './routes/health.js';

// Load env from apps/backend/.env (PM2 runs with cwd at repo root)
const backendEnvPath = path.join(process.cwd(), 'apps', 'backend', '.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(80));
console.log('[SERVER-INIT] SERVER.JS IS BEING LOADED - FILE VERSION: 2025-12-30-V2');
console.log('='.repeat(80));

const app = express();
const httpServer = createServer(app);

// ✅ SECURITY: CORS Configuration - Whitelist only allowed origins
const allowedOrigins = [
  'https://api.zien-ai.app', // Portal is on same domain as API
  'https://portal.zien-ai.app',
  process.env.CLIENT_PORTAL_URL || 'https://portal.zien-ai.app',
  'http://localhost:5000', // Backend itself
  'exp://localhost:8081', // Expo Dev Client
  'http://localhost:19006', // Expo Web
  process.env.ALLOWED_ORIGINS?.split(',') || [],
].flat().filter(Boolean);

const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';

const corsOptions = {
  origin:
    NODE_ENV === 'production'
      ? allowedOrigins
      : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

global.io = io;

// ✅ MONITORING: Initialize Sentry (must be first)
// Note: initSentry is async but we call it without await to not block startup
initSentry().catch(err => console.warn('[Sentry] Initialization warning:', err.message));

// ✅ MONITORING: Sentry request & tracing handlers
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// Debug middleware to log ALL requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path} - ${req.url}`);
  next();
});

// ✅ Serve Client Portal static files FIRST (before CORS middleware)
// Portal is served on api.zien-ai.app (same domain as API)
const portalPath = path.join(process.cwd(), 'apps/client-portal');
const portalPathAlt = path.join(__dirname, '../../client-portal');

let actualPortalPath = null;
if (fs.existsSync(portalPath)) {
  actualPortalPath = portalPath;
} else if (fs.existsSync(portalPathAlt)) {
  actualPortalPath = portalPathAlt;
}

// Client Portal routes will be registered in startServer() after database initialization

// ✅ SECURITY: Apply CORS middleware ONLY to API routes (not static files)
// NOTE: This must be AFTER client-portal static middleware
app.use((req, res, next) => {
  // Skip CORS for static files (they're same-origin)
  if (req.path.startsWith('/client-portal')) {
    return next(); // Skip CORS for all client-portal routes
  }
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/)) {
    return next();
  }
  // Apply CORS for API routes
  cors(corsOptions)(req, res, next);
});

// ✅ SECURITY: Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // ✅ Content Security Policy - Allow eval for ElevenLabs widget and dynamic scripts
  // Note: unsafe-eval is required for some third-party widgets (ElevenLabs ConvAI)
  // Apply CSP to all requests (including HTML pages) to ensure eval is allowed
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.socket.io https://unpkg.com https://elevenlabs.io https://*.elevenlabs.io https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.zien-ai.app https://portal.zien-ai.app https://elevenlabs.io https://*.elevenlabs.io wss://elevenlabs.io wss://*.elevenlabs.io https://cdn.socket.io https://static.cloudflareinsights.com ws://localhost:* http://localhost:*",
    "frame-src 'self' https://elevenlabs.io https://*.elevenlabs.io",
    "media-src 'self' blob: https://elevenlabs.io https://*.elevenlabs.io",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ PERFORMANCE: Apply rate limiting to all API routes ONLY
app.use('/api', apiLimiter);

// ✅ SECURITY: Output sanitization (sanitize all responses)
app.use(sanitizeOutput);

// ✅ METRICS: Track request metrics
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Track response time
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    updateMetrics(req.method, req.path, res.statusCode, responseTime);
  });
  
  next();
});

// --- مسارات النظام الأساسية ---

// ✅ HEALTH: Comprehensive health check route
import healthRouter from './routes/health.js';
app.use('/api/health', healthRouter);

// Legacy health route (for compatibility)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'RARE 4N Kernel Online', 
    timestamp: new Date(),
    environment: NODE_ENV 
  });
});

// --- بدء تشغيل السيرفر والخدمات ---

async function startServer() {
  try {
    console.log('Starting RARE Kernel Boot Sequence...');

    // ✅ SECURITY: Initialize Cognitive Debugger & Service Manager
    try {
      const cognitiveDebugger = CognitiveDebugger.getInstance();
      cognitiveDebugger.init(null, io); // Initialize with io, kernel can be added later
      
      const serviceManager = ServiceManager.getInstance();
      await serviceManager.init(null, io); // Initialize with io, kernel can be added later
      
      console.log('✅ Cognitive Debugger & Service Manager initialized');
    } catch (e) {
      console.warn('⚠️ Cognitive Debugger initialization warning:', e.message);
    }

    // 1. تشغيل قواعد البيانات (الذاكرة)
    try {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Initializing SQLite',data:{step:'database_init'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'DB_INIT_START'})}).catch(()=>{});
        // #endregion
        initDatabase();
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'SQLite initialized successfully',data:{step:'database_init',status:'success'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'DB_INIT_SUCCESS'})}).catch(()=>{});
        // #endregion
        console.log('✅ Local Database (SQLite) initialized');
    } catch (e) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'SQLite init failed',data:{error:e.message,stack:e.stack},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'DB_INIT_ERROR'})}).catch(()=>{});
        // #endregion
        console.error('❌ SQLite Init Failed:', e.message);
    }

    try {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Initializing MongoDB',data:{step:'mongodb_init'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'MONGO_INIT_START'})}).catch(()=>{});
        // #endregion
      const mongoDB = await initMongoDB();
      global.mongoDB = mongoDB;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'MongoDB initialized successfully',data:{step:'mongodb_init',status:'success'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'MONGO_INIT_SUCCESS'})}).catch(()=>{});
        // #endregion
      console.log('✅ MongoDB connected successfully');
    } catch (e) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'MongoDB init failed',data:{error:e.message},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'MONGO_INIT_ERROR'})}).catch(()=>{});
        // #endregion
        console.warn('⚠️ MongoDB connection failed');
    }

    try {
      const supabase = initSupabase();
      global.supabase = supabase;
      console.log('✅ Supabase connected successfully');
    } catch (e) { console.warn('⚠️ Supabase connection failed'); }

    // 2. تسجيل المسارات (العصب والذكاء الاصطناعي)
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Registering routes',data:{step:'routes_registration'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'ROUTES_REGISTER_START'})}).catch(()=>{});
    // #endregion
    console.log('[DEBUG] About to call registerRoutes()...');
    await registerRoutes();
    console.log('[DEBUG] registerRoutes() COMPLETED!');
    console.log('[DEBUG] EXECUTION CONTINUES AFTER registerRoutes()');
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Routes registered successfully',data:{step:'routes_registration',status:'success'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'ROUTES_REGISTER_SUCCESS'})}).catch(()=>{});
    // #endregion

    // 2.5. Register Client Portal routes AFTER API routes
    // Re-check portal path inside startServer (actualPortalPath might not be defined yet)
    console.log('[DEBUG] About to register client portal routes...');
    console.log('[DEBUG] THIS LINE SHOULD APPEAR IF EXECUTION REACHES HERE!');
    const portalPath = path.join(process.cwd(), 'apps/client-portal');
    const portalPathAlt = path.join(__dirname, '../../client-portal');
    console.log(`[DEBUG] portalPath: ${portalPath}`);
    console.log(`[DEBUG] portalPath exists: ${fs.existsSync(portalPath)}`);
    let actualPortalPath = null;
    if (fs.existsSync(portalPath)) {
      actualPortalPath = portalPath;
    } else if (fs.existsSync(portalPathAlt)) {
      actualPortalPath = portalPathAlt;
    }
    console.log(`[DEBUG] actualPortalPath: ${actualPortalPath}`);
    
    if (actualPortalPath) {
      console.log(`[CLIENT-PORTAL] Path: ${actualPortalPath}`);
      
      // Custom middleware to serve static files FIRST (before express.static)
      app.use('/client-portal', (req, res, next) => {
        console.log(`[STATIC-MIDDLEWARE] ${req.method} ${req.path}`);
        // Only handle file requests (with extensions)
        if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map|webp|html)$/)) {
          const relativePath = req.path.replace(/^\/client-portal/, '') || '/index.html';
          const filePath = path.join(actualPortalPath, relativePath);
          console.log(`[STATIC-FILE] Looking for: ${filePath}`);
          console.log(`[STATIC-FILE] Exists: ${fs.existsSync(filePath)}`);
          
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.js') {
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            } else if (ext === '.css') {
              res.setHeader('Content-Type', 'text/css; charset=utf-8');
            } else if (ext === '.html') {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            console.log(`[STATIC-SERVE] Serving: ${filePath}`);
            return res.sendFile(filePath);
          }
        }
        next();
      });

      // Serve static files under /client-portal prefix (fallback)
      app.use('/client-portal', express.static(actualPortalPath, {
        maxAge: 0,
        etag: true,
        lastModified: true,
        index: false,
        fallthrough: true,
        setHeaders: (res, filePath) => {
          const lower = String(filePath).toLowerCase();
          if (lower.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          } else if (lower.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
          } else if (lower.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
          }
          if (lower.endsWith('.html') || lower.endsWith('.js') || lower.endsWith('.css') || lower.endsWith('.json')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          }
        },
      }));

      // Handle root route - redirect to client-portal
      app.get('/', (req, res) => {
        console.log(`[ROUTE-HIT] GET / - Redirecting to /client-portal`);
        res.redirect(301, '/client-portal');
      });

      // Handle /client-portal root route (exact match) - MUST be after static middleware
      app.get('/client-portal', (req, res, next) => {
        console.log(`[ROUTE-HIT] GET /client-portal HIT!`);
        const indexPath = path.join(actualPortalPath, 'index.html');
        console.log(`[ROUTE-SERVE] Serving index.html from: ${indexPath}`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error(`[ROUTE-ERROR] Error serving index.html:`, err);
            next(err);
          } else {
            console.log(`[ROUTE-SUCCESS] Successfully served index.html`);
          }
        });
      });

      // SPA fallback for client portal routes (but NOT static files - they're handled by express.static above)
      app.get('/client-portal/*', (req, res, next) => {
        // Skip if it's a static file request (should have been handled by express.static)
        // If express.static didn't find it, it will call next() and we'll serve index.html for SPA routes
        const indexPath = path.join(actualPortalPath, 'index.html');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.sendFile(indexPath, (err) => {
          if (err) next(err);
        });
      });

      console.log('[CLIENT-PORTAL] Static files served from Backend under /client-portal/');
    } else {
      console.error('[CLIENT-PORTAL-ERROR] Directory not found!');
      console.error(`   Tried: ${portalPath}`);
      console.error(`   Tried: ${portalPathAlt}`);
    }

    // 3. تفعيل Socket.IO Namespaces (الربط الفعلي)
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Initializing Socket.IO',data:{step:'socketio_init'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'SOCKETIO_INIT_START'})}).catch(()=>{});
    // #endregion
    await initializeSocketNamespaces(io);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Socket.IO initialized successfully',data:{step:'socketio_init',status:'success'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'SOCKETIO_INIT_SUCCESS'})}).catch(()=>{});
    // #endregion

    // 4. بدء الاستماع
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Starting HTTP server',data:{port:PORT,step:'http_listen'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'HTTP_LISTEN_START'})}).catch(()=>{});
    // #endregion
    // ✅ 404 Handler - MUST be last, after all routes (including client-portal)
    app.use((req, res) => {
      console.log(`[404-HANDLER] ${req.method} ${req.path} - No route handler found`);
      res.status(404).send(`Cannot ${req.method} ${req.path}`);
    });

    console.log(`[DEBUG] About to call httpServer.listen on port ${PORT}...`);
    try {
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`[DEBUG] httpServer.listen callback executed!`);
        try {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:startServer',message:'Server started successfully',data:{port:PORT,environment:NODE_ENV,status:'live'},timestamp:Date.now(),sessionId:'server-startup',runId:'run1',hypothesisId:'SERVER_START_SUCCESS'})}).catch(()=>{});
          // #endregion
          console.log(`[DEBUG] About to call httpServer.address()...`);
          const address = httpServer.address();
          console.log(`[DEBUG] httpServer.address() returned:`, address);
          console.log(`\n🚀 RARE Backend is LIVE on port: ${PORT}`);
          console.log(`🌍 Environment: ${NODE_ENV}`);
          console.log(`🔗 Local Health: http://localhost:${PORT}/health`);
          console.log(`💎 API Base: https://api.zien-ai.app/api`);
          console.log(`📡 Socket.IO ready for connections`);
          if (address) {
            console.log(`✅ Server listening on ${address.address}:${address.port}`);
          } else {
            console.error('❌ Server address is null!');
          }
          console.log(`✅ All systems operational\n`);
        } catch (callbackError) {
          console.error('❌ Error in httpServer.listen callback:', callbackError);
        }
      });
      console.log(`[DEBUG] httpServer.listen() call completed (callback may be async)`);
    } catch (listenError) {
      console.error('❌ Error calling httpServer.listen:', listenError);
    }
    
    httpServer.on('error', (error) => {
      console.error('❌ HTTP Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error.message);
      }
    });
    
    // Keep process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Fatal error starting server:', error);
    process.exit(1);
  }
}

async function registerRoutes() {
  const routes = [
    'ai', 'auth', 'boot'
  ];

  for (const route of routes) {
    try {
      const module = await import(`./routes/${route}.js`);
      const router = module.default;
      if (router) {
        app.use(`/api/${route}`, router);
      }
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:registerRoutes',message:'Route loaded successfully',data:{route,status:'success'},timestamp:Date.now(),sessionId:'server-startup',runId:'run2',hypothesisId:'ROUTE_LOAD_SUCCESS'})}).catch(()=>{});
      // #endregion
      console.log(`✅ Route loaded: /api/${route}`);
    } catch (e) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/4c242350-3788-46f7-ada6-4565774061b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:registerRoutes',message:'Route load failed',data:{route,error:e.message,stack:e.stack?.split('\n').slice(0,10).join('|'),name:e.name,fileName:e.fileName,lineNumber:e.lineNumber},timestamp:Date.now(),sessionId:'server-startup',runId:'run2',hypothesisId:'ROUTE_LOAD_ERROR'})}).catch(()=>{});
      // #endregion
      console.warn(`⚠️ Warning: Route [${route}] skipped. (Module missing or error)`);
    }
  }

  try {
    const clientPortalModule = await import('./routes/client-portal.js');
    const router = clientPortalModule.default;
    if (router) {
      app.use('/api/client-portal', router);
    }
    if (clientPortalModule.initializeClientPortal) {
      clientPortalModule.initializeClientPortal(io);
    }
    console.log('✅ Route loaded: /api/client-portal (with Socket.IO)');
  } catch (e) {
    console.warn(`⚠️ Could not load client-portal route: ${e.message}`);
  }

  try {
    const { initializeVoiceRealtime } = await import('./routes/voice-realtime.js');
    initializeVoiceRealtime(io);
    console.log('✅ Voice Realtime WebSocket initialized');
  } catch (e) {
    console.warn(`⚠️ Could not initialize voice-realtime WebSocket: ${e.message}`);
  }

  app.set('io', io);
  console.log('💎 All RARE Kernel routes linked successfully');
}

/**
 * تفعيل Socket.IO Namespaces (الربط الفعلي)
 */
async function initializeSocketNamespaces(io) {
  try {
    // Client Portal Namespace
    io.of('/client-portal').on('connection', (socket) => {
      console.log('✅ Client Portal client connected:', socket.id);
      
      socket.on('client:register', async (data) => {
        try {
          const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          socket.emit('client:registered', { success: true, clientId });
          io.of('/auto-builder').emit('client:connected', { ...data, clientId });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log('❌ Client Portal client disconnected:', socket.id);
      });
    });
    console.log('✅ Client Portal Socket.IO namespace initialized');

    console.log('💎 All Socket.IO namespaces initialized successfully');
  } catch (error) {
    console.error('🔴 Socket.IO initialization error:', error);
  }
}

startServer();
