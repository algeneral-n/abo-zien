/**
 * RARE 4N - Production-Ready Backend Server
 * Backend ?????? ???????? - ???????? ??????????????
 * ??? Security Headers
 * ??? Rate Limiting
 * ??? Compression
 * ??? Error Handling
 * ??? CORS ??????????
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase, getDatabase, closeDatabase } from './database/localDB.js';
import { initMongoDB, closeMongoDB } from './database/mongodb.js';
import { initSupabase } from './database/supabase.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Make io available globally for services
global.io = io;

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ??? Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ??? CORS ?????????? (???????? ?????????????? + ngrok + localhost)
const allowedOrigins = [
  'http://localhost:8081', // Expo Dev
  'http://localhost:19006', // Expo Web
  'exp://localhost:8081', // Expo
  ...(process.env.API_DOMAIN ? [`https://${process.env.API_DOMAIN.replace(/^https?:\/\//, '')}`] : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
];

// ?????? ngrok ?? Cloudflare Tunnel
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow ngrok domains
    if (origin.includes('.ngrok.io') || origin.includes('.ngrok-free.app')) {
      return callback(null, true);
    }
    
    // Allow Cloudflare Tunnel domains
    if (origin.includes('.cfargotunnel.com')) {
      return callback(null, true);
    }
    
    // Allow custom domain
    if (process.env.API_DOMAIN && origin.includes(process.env.API_DOMAIN)) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

app.use(cors(corsOptions));

// ??? Body Parser (???? limits ????????????)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize databases
let localDB = null;
let mongoDB = null;
let supabase_KEY=REPLACE_ME

/**
 * Start server
 */
async function startServer() {
  try {
    // #region debug log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:107',message:'Starting server',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Initialize Local Database (SQLite)
    localDB = initDatabase();
    console.log('??? Local Database (SQLite) initialized');
    
    // #region debug log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:111',message:'Local DB initialized',data:{hasLocalDB:!!localDB},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Initialize MongoDB
    try {
      mongoDB = await initMongoDB();
      console.log('??? MongoDB initialized');
    } catch (error) {
      console.warn('?????? MongoDB connection failed, continuing with local DB only:', error.message);
    }

    // Initialize Supabase
    try {
      supabase_KEY=REPLACE_ME
      console.log('??? Supabase initialized');
    } catch (error) {
      console.warn('?????? Supabase connection failed, continuing without real-time features:', error.message);
    }

    // ??? Health check ??????????
    app.get('/health', async (req, res) => {
      try {
        const memoryUsage = process.memoryUsage();
        
        // Check Cloudflare Tunnel status
        let cloudflare_KEY=REPLACE_ME
        try {
          const { exec } = await import('child_process');
          const { promisify } = await import('util');
          const execAsync = promisify(exec);
          const { stdout } = await execAsync('cloudflared tunnel list').catch(() => ({ stdout: '' }));
          cloudflare_KEY=REPLACE_ME
        } catch (error) {
          cloudflare_KEY=REPLACE_ME
        }
        
        res.json({
          status: 'online',
          databases: {
            local: localDB ? 'connected' : 'disconnected',
            mongodb: mongoDB ? 'connected' : 'disconnected',
            supabase: supabase ? 'connected' : 'disconnected',
          },
          services: {
            backend: 'running',
            cloudflare: cloudflareStatus,
            widget: 'active', // Widget is part of Client Portal
          },
          uptime: Math.floor(process.uptime()),
          memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          },
          environment: NODE_ENV,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error.message,
        });
      }
    });

    // Register routes
    await registerRoutes();
    
    // Initialize WebSocket namespaces
    await initializeWebSockets();

    // ??? Error Handling Middleware (?????? ???? ???????? ???? ??????????????)
    app.use((err, req, res, next) => {
      console.error('??? Error:', err);
      
      res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(NODE_ENV === 'development' && { stack: err.stack }),
      });
    });

    // ??? 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
      });
    });

    // Make io available to routes
    app.set('io', io);

    // Socket.IO Real-time connection
    io.on('connection', (socket) => {
      console.log(`??? Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`??? Client disconnected: ${socket.id}`);
      });

      // Real-time events from Cognitive Loop
      socket.on('cognitive:event', (data) => {
        socket.broadcast.emit('cognitive:response', data);
      });
    });

    // Start server
    // #region debug log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:191',message:'About to start HTTP server',data:{port:PORT},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`???? RARE 4N Backend running on http://0.0.0.0:${PORT}`);
      console.log(`???? Databases: Local ??? | MongoDB ${mongoDB ? '???' : '???'} | Supabase ${supabase ? '???' : '???'}`);
      console.log(`???? Mode: Offline/Online Intelligent`);
      console.log(`???? Environment: ${NODE_ENV}`);
      console.log(`??? CORS: Enabled for ${allowedOrigins.length} origins`);
      console.log(`???? Security Headers: Enabled`);
      console.log(`??? Socket.IO: Enabled for real-time features`);
      
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:199',message:'HTTP server started successfully',data:{port:PORT,url:`http://localhost:${PORT}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    });

    // ??? Graceful shutdown
    const grREMOVED = (signal) => {
      console.log(`\n???? Received ${signal}, shutting down gracefully...`);
      httpServer.close(() => {
        console.log('??? HTTP server closed');
        closeDatabase();
        if (mongoDB) {
          closeMongoDB().catch(console.error);
        }
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('??? Forcing shutdown...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => grREMOVED('SIGTERM'));
    process.on('SIGINT', () => grREMOVED('SIGINT'));

  } catch (error) {
    console.error('??? Server startup failed:', error);
    
    // #region debug log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:224',message:'Server startup error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    process.exit(1);
  }
}

/**
 * Register all routes
 */
async function registerRoutes() {
  // Import routes
  const aiRoutes = (await import('./routes/ai.js')).default;
  const authRoutes = (await import('./routes/auth.js')).default;
  const bootRoutes = (await import('./routes/boot.js')).default;
  const filesRoutes = (await import('./routes/files.js')).default;
  const financialRoutes = (await import('./routes/financial.js')).default;
  const mapsRoutes = (await import('./routes/maps.js')).default;
  const weatherRoutes = (await import('./routes/weather.js')).default;
  const cognitiveRoutes = (await import('./routes/cognitive.js')).default;
  const librariesRoutes = (await import('./routes/libraries.js')).default;
  const clientPortalRoutes = (await import('./routes/client-portal.js')).default;
  const autoBuilderRoutes = (await import('./routes/auto-builder.js')).default;
  const codegenRoutes = (await import('./routes/codegen.js')).default;
  const ocrRoutes = (await import('./routes/ocr.js')).default;
  const vaultRoutes = (await import('./routes/vault.js')).default;
  const councilRoutes = (await import('./routes/council.js')).default;
  const sosRoutes = (await import('./routes/sos.js')).default;
  const securityRoutes = (await import('./routes/security.js')).default;
  const settingsRoutes = (await import('./routes/settings.js')).default;
  const communicationRoutes = (await import('./routes/communication.js')).default;
  const carplayRoutes = (await import('./routes/carplay.js')).default;
  const elevenlabs_KEY=REPLACE_ME
  const visionRoutes = (await import('./routes/vision.js')).default;
  const stripe_KEY=REPLACE_ME
  const servicesRoutes = (await import('./routes/services.js')).default;
  const terminalIntegrationRoutes = (await import('./routes/terminal-integration.js')).default;

  // Register routes
  app.use('/api/ai', aiRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/boot', bootRoutes);
  app.use('/api/files', filesRoutes);
  app.use('/api/financial', financialRoutes);
  app.use('/api/maps', mapsRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/cognitive', cognitiveRoutes);
  app.use('/api/libraries', librariesRoutes);
  app.use('/api/client-portal', clientPortalRoutes);
  app.use('/api/auto-builder', autoBuilderRoutes);
  app.use('/api/codegen', codegenRoutes);
  app.use('/api/ocr', ocrRoutes);
  app.use('/api/vision', visionRoutes);
  app.use('/api/vault', vaultRoutes);
  app.use('/api/council', councilRoutes);
  app.use('/api/sos', sosRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/communication', communicationRoutes);
  app.use('/api/carplay', carplayRoutes);
  app.use('/api/elevenlabs', elevenlabsRoutes);
  app.use('/api/stripe', stripeWebhookRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/terminal-integration', terminalIntegrationRoutes);

  // Payment routes (for ElevenLabs Agent)
  app.use('/api/payment', financialRoutes);

  console.log('??? Routes registered (22 total)');
}

/**
 * Initialize WebSocket namespaces
 */
async function initializeWebSockets() {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'Initializing WebSocket namespaces',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'WEBSOCKET_INIT_START'})}).catch(()=>{});
    }
    // #endregion
    
    // Initialize GPT Streaming
    try {
      const { initializeGPTStreaming } = await import('./routes/gpt-stream.js');
      initializeGPTStreaming(io);
      console.log('??? GPT Streaming WebSocket initialized');
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'GPT Streaming initialized',data:{},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'GPT_STREAMING_INIT'})}).catch(()=>{});
      }
      // #endregion
    } catch (error) {
      console.error('??? GPT Streaming init error:', error);
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'GPT Streaming init error',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'GPT_STREAMING_ERROR'})}).catch(()=>{});
      }
      // #endregion
    }

    // Initialize Voice Realtime
    try {
      const { initializeVoiceRealtime } = await import('./routes/voice-realtime.js');
      initializeVoiceRealtime(io);
      console.log('??? Voice Realtime WebSocket initialized');
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'Voice Realtime initialized',data:{},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'VOICE_REALTIME_INIT'})}).catch(()=>{});
      }
      // #endregion
    } catch (error) {
      console.error('??? Voice Realtime init error:', error);
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'Voice Realtime init error',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'VOICE_REALTIME_ERROR'})}).catch(()=>{});
      }
      // #endregion
    }

    // Initialize Client Portal
    try {
      const { initializeClientPortal } = await import('./routes/client-portal.js');
      initializeClientPortal(io);
      console.log('??? Client Portal WebSocket initialized');
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'Client Portal initialized',data:{},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'CLIENT_PORTAL_INIT'})}).catch(()=>{});
      }
      // #endregion
    } catch (error) {
      console.error('??? Client Portal init error:', error);
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'Client Portal init error',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'CLIENT_PORTAL_ERROR'})}).catch(()=>{});
      }
      // #endregion
    }

    // Initialize Auto Builder
    try {
      const { initializeAutoBuilder } = await import('./routes/auto-builder.js');
      initializeAutoBuilder(io);
      console.log('??? Auto Builder WebSocket initialized');
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'Auto Builder initialized',data:{},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'AUTO_BUILDER_INIT'})}).catch(()=>{});
      }
      // #endregion
    } catch (error) {
      console.error('??? Auto Builder init error:', error);
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'Auto Builder init error',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'AUTO_BUILDER_ERROR'})}).catch(()=>{});
      }
      // #endregion
    }
    
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'WebSocket namespaces initialized',data:{},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'WEBSOCKET_INIT_SUCCESS'})}).catch(()=>{});
    }
    // #endregion
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.js:initializeWebSockets',message:'WebSocket initialization error',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'server-session',runId:'run1',hypothesisId:'WEBSOCKET_INIT_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('??? WebSocket initialization error:', error);
  }
}

// Global exports for routes (available after initialization)
let dbExpo_KEY=REPLACE_ME

// Start server
startServer().then(() => {
  // Set global exports after initialization
  dbExpo_KEY=REPLACE_ME
  global.io = io;
  global.mongoDB = mongoDB;
  global.supabase_KEY=REPLACE_ME
  global.localDB = localDB;
});


