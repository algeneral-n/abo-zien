/**
 * RARE 4N - Client Portal Routes
 * بوابة العميل - Widget + Form + Notifications
 */

import express from 'express';
import { Server } from 'socket.io';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Store client sessions
const clientSessions = new Map();
const clientRequests = new Map();
const widgetConversations = new Map(); // Store active conversations
const buildPreviews = new Map(); // Store build previews
const revisions = new Map(); // Store revision requests

// Make clientRequests globally accessible for other routes
global.clientRequests = clientRequests;
global.buildPreviews = buildPreviews;
global.revisions = revisions;

/**
 * Initialize Client Portal Socket.IO
 */
export function initializeClientPortal(io) {
  const clientNamespace = io.of('/client-portal');

  clientNamespace.on('connection', (socket) => {
    console.log('✅ Client Portal client connected:', socket.id);

    // Client registration
    socket.on('client:register', async (data) => {
      const { clientId, clientName, phone, email } = data;
      
      clientSessions.set(socket.id, {
        clientId,
        clientName,
        phone,
        email,
        socketId: socket.id,
        connectedAt: Date.now(),
      });

      // Initialize widget conversation
      const { WidgetConversation } = await import('../services/widgetConversationService.js');
      const conversation = new WidgetConversation(clientId, clientName, phone, email);
      widgetConversations.set(clientId, conversation);

      // ✅ Update ElevenLabs Agent System Prompt with client context
      try {
        const { getWidgetSystemPromptWithContext } = await import('../services/elevenlabsWidgetPrompt.js');
        const { updateAgentSystemPrompt } = await import('../services/elevenlabsService.js');
        
        const agentId = process.env.ELEVENLABS_CONVAI_AGENT_ID || 'agent_0701kc4axybpf6fvak70xwfzpyka';
        const systemPrompt = getWidgetSystemPromptWithContext({
          clientName,
          phone,
          email,
        });
        
        // Update agent system prompt (async, don't wait)
        updateAgentSystemPrompt(agentId, systemPrompt).catch(err => {
          console.warn('Failed to update ElevenLabs agent system prompt:', err.message);
          // Don't fail registration if this fails
        });
      } catch (error) {
        console.warn('Failed to update ElevenLabs agent system prompt:', error.message);
        // Don't fail registration if this fails
      }

      socket.emit('client:registered', {
        success: true,
        clientId,
        message: 'تم التسجيل بنجاح',
      });

      // Notify Auto Builder about new client connection
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/client-portal.js:client:register',message:'Notifying Auto Builder about new client',data:{clientId,clientName},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'CLIENT_CONNECTED'})}).catch(()=>{});
      }
      // #endregion
      io.of('/auto-builder').emit('client:connected', {
        clientId,
        clientName,
        phone,
        email,
      });
    });

    // Client request from Widget
    socket.on('client:request', async (data) => {
      const session = clientSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { error: 'Client not registered' });
        return;
      }

      const request = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientId: session.clientId,
        clientName: session.clientName,
        phone: session.phone,
        email: session.email,
        type: data.type, // 'voice', 'text', 'form'
        content: data.content,
        timestamp: Date.now(),
        status: 'pending',
      };

      // Store request
      if (!clientRequests.has(session.clientId)) {
        clientRequests.set(session.clientId, []);
      }
      clientRequests.get(session.clientId).push(request);

      // Send notification to Auto Builder Terminal
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/client-portal.js:client:request',message:'Sending client request to Auto Builder',data:{requestId:request.id,type:request.type},timestamp:Date.now(),sessionId:'portal-session',runId:'run1',hypothesisId:'CLIENT_REQUEST_SENT'})}).catch(()=>{});
      }
      // #endregion
      io.of('/auto-builder').emit('client:request', request);

      socket.emit('client:request:received', {
        success: true,
        requestId: request.id,
        message: 'تم استلام طلبك',
      });

      // ✅ Send WhatsApp notification if appointment requested
      if (data.type === 'appointment' || data.content?.includes('موعد') || data.content?.includes('معاينة')) {
        try {
          const { sendAppointmentConfirmed } = await import('../services/twilioTemplatesService.js');
          // Extract appointment details from content (if available)
          const appointmentDate = data.appointmentDate || 'قريباً';
          const appointmentTime = data.appointmentTime || 'سيتم الاتصال بك';
          await sendAppointmentConfirmed(session.phone, session.clientName, appointmentDate, appointmentTime);
          console.log('✅ Appointment confirmation sent to:', session.phone);
        } catch (error) {
          console.error('Failed to send appointment confirmation:', error);
          // Don't block the request if WhatsApp fails
        }
      }
    });

    // ✅ Widget Conversation - Automatic flow
    socket.on('widget:conversation', async (data) => {
      try {
        const session = clientSessions.get(socket.id);
        if (!session) {
          socket.emit('error', { error: 'Client not registered' });
          return;
        }

        const { input, type = 'text' } = data;
        let conversation = widgetConversations.get(session.clientId);

        if (!conversation) {
          // Initialize conversation
          const { WidgetConversation } = await import('../services/widgetConversationService.js');
          conversation = new WidgetConversation(
            session.clientId,
            session.clientName,
            session.phone,
            session.email
          );
          widgetConversations.set(session.clientId, conversation);
        }

        const response = await conversation.processInput(input, type);
        socket.emit('widget:response', response);

        // Handle actions
        if (response.action === 'open_chat') {
          socket.emit('widget:open_chat', {
            selectedItem: response.selectedItem,
          });
        } else if (response.action === 'open_payment') {
          // Create payment intent
          const { createPaymentIntent } = await import('../services/paymentService.js');
          const amount = response.amount || 500; // Default amount
          const requestData = conversation.getRequestData();
          const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const paymentIntent = await createPaymentIntent(amount, 'sar', {
            clientId: session.clientId,
            requestId,
            clientName: session.clientName,
          });
          
          conversation.updateRequestData({
            invoiceId: paymentIntent.id,
            amount,
            requestId,
          });

          socket.emit('widget:payment_ready', {
            paymentIntentId: paymentIntent.id,
            amount,
            clientSecret: paymentIntent.client_secret,
          });
        } else if (response.action === 'submit_request') {
          // Submit request to Auto Builder
          const requestData = conversation.getRequestData();
          const request = {
            id: requestData.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clientId: session.clientId,
            clientName: session.clientName,
            phone: session.phone,
            email: session.email,
            type: 'widget_conversation',
            content: requestData,
            timestamp: Date.now(),
            status: 'pending_approval',
          };

          if (!clientRequests.has(session.clientId)) {
            clientRequests.set(session.clientId, []);
          }
          clientRequests.get(session.clientId).push(request);

          // Notify Auto Builder
          io.of('/auto-builder').emit('client:request', request);
        }
      } catch (error) {
        console.error('Widget conversation error:', error);
        socket.emit('error', { error: error.message });
      }
    });

    // ✅ Widget File Upload
    socket.on('widget:file_upload', async (data) => {
      try {
        const session = clientSessions.get(socket.id);
        if (!session) {
          socket.emit('error', { error: 'Client not registered' });
          return;
        }

        const { file, fileType = 'logo' } = data;
        const conversation = widgetConversations.get(session.clientId);

        if (conversation) {
          if (fileType === 'logo') {
            conversation.updateRequestData({
              logoFile: file,
              logo: file.url || file.path,
              hasLogo: true,
            });
          } else {
            const uploadedFiles = conversation.requestData.uploadedFiles || [];
            uploadedFiles.push(file);
            conversation.updateRequestData({ uploadedFiles });
          }

          socket.emit('widget:file_uploaded', {
            success: true,
            fileType,
            message: 'تم رفع الملف بنجاح',
          });
        }
      } catch (error) {
        console.error('Widget file upload error:', error);
        socket.emit('error', { error: error.message });
      }
    });

    // ✅ Preview Revision Request
    socket.on('preview:revision', async (data) => {
      try {
        const session = clientSessions.get(socket.id);
        if (!session) {
          socket.emit('error', { error: 'Client not registered' });
          return;
        }

        const { previewToken, revisionNotes } = data;

        const preview = buildPreviews.get(previewToken);
        if (!preview) {
          socket.emit('error', { error: 'Preview not found' });
          return;
        }

        // Create revision request
        const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const revision = {
          id: revisionId,
          previewToken,
          buildId: preview.buildId,
          clientId: session.clientId,
          requestId: preview.requestId,
          revisionNotes,
          status: 'pending',
          createdAt: Date.now(),
        };

        if (!revisions.has(preview.requestId)) {
          revisions.set(preview.requestId, []);
        }
        revisions.get(preview.requestId).push(revision);

        // Notify Auto Builder
        io.of('/auto-builder').emit('client:revision_requested', revision);

        socket.emit('preview:revision_submitted', {
          success: true,
          revisionId,
          message: 'تم إرسال طلب التعديل. سيتم مراجعته قريباً.',
        });
      } catch (error) {
        console.error('Preview revision error:', error);
        socket.emit('error', { error: error.message });
      }
    });

    // ✅ Voice-to-Voice interaction with clients
    socket.on('client:voice-request', async (data) => {
      try {
        const session = clientSessions.get(socket.id);
        if (!session) {
          socket.emit('error', { error: 'Client not registered' });
          return;
        }

        const { audio, language = 'ar' } = data;

        if (!audio) {
          socket.emit('error', { error: 'Missing audio data' });
          return;
        }

        // Get widget conversation
        const conversation = widgetConversations.get(session.clientId);
        if (!conversation) {
          socket.emit('error', { error: 'Conversation not found' });
          return;
        }

        // Import voice services
        const { transcribeWithWhisper } = await import('../services/whisperService.js');
        const { textToSpeech } = await import('../services/elevenlabsService.js');
        const { detectDialect, generateResponseWithDialect } = await import('../services/dialectService.js');

        // 1. Transcribe audio
        const transcription = await transcribeWithWhisper(audio, language);

        // 2. Detect dialect and language
        const dialectInfo = await detectDialect(transcription);

        // 3. Process input through widget conversation (with AI learning)
        const conversationResponse = await conversation.processInput(transcription, 'voice');

        // 4. Generate response with dialect adaptation (if conversation didn't provide one)
        let response = conversationResponse?.text || conversationResponse;
        if (!response || typeof response !== 'string') {
          response = await generateResponseWithDialect(transcription, dialectInfo);
        }

        // 5. Convert to speech with System Agent voice (RARE Character Voice)
        const SYSTEM_AGENT_ID = process.env.ELEVENLABS_SYSTEM_AGENT_ID || process.env.ELEVENLABS_VOICE_ID_1 || '9401kb2n0gf5e2wtp4sfs8chdmk1';
        const audioResponse = await textToSpeech(response, SYSTEM_AGENT_ID, language);

        // 6. Update ElevenLabs Agent System Prompt with conversation context
        try {
          const { getWidgetSystemPromptWithContext } = await import('../services/elevenlabsWidgetPrompt.js');
          const { updateAgentSystemPrompt } = await import('../services/elevenlabsService.js');
          
          const agentId = process.env.ELEVENLABS_CONVAI_AGENT_ID || 'agent_0701kc4axybpf6fvak70xwfzpyka';
          const requestData = conversation.getRequestData();
          const systemPrompt = getWidgetSystemPromptWithContext({
            clientName: session.clientName,
            phone: session.phone,
            email: session.email,
            selectedItem: requestData.selectedItem,
            conversationState: requestData.state,
          });
          
          // Update agent system prompt (async, don't wait)
          updateAgentSystemPrompt(agentId, systemPrompt).catch(err => {
            console.warn('Failed to update ElevenLabs agent system prompt:', err.message);
          });
        } catch (error) {
          console.warn('Failed to update ElevenLabs agent system prompt:', error.message);
        }

        // 7. Send response to client
        socket.emit('client:voice-response', {
          transcription,
          response,
          audio: audioResponse,
          dialect: dialectInfo.dialect,
          language: dialectInfo.language,
        });

        // 8. Notify Auto Builder
        io.of('/auto-builder').emit('client:voice-interaction', {
          clientId: session.clientId,
          clientName: session.clientName,
          transcription,
          response,
          dialect: dialectInfo.dialect,
        });
      } catch (error) {
        console.error('Client voice interaction error:', error);
        socket.emit('error', { error: error.message });
      }
    });

    // ✅ Contact Information
    socket.on('client:contact-info', () => {
      socket.emit('client:contact-info', {
        phone: '+971529211077',
        email: 'GM@ZIEN-AI.APP',
        message: '📞 للتواصل المباشر:\n\n📱 الهاتف: +971529211077\n📧 البريد: GM@ZIEN-AI.APP\n\nيمكنك التواصل معنا في أي وقت!',
      });
    });

    // ✅ Preview request (Templates, Systems, Themes)
    socket.on('client:preview-libraries', async (data) => {
      try {
        const session = clientSessions.get(socket.id);
        if (!session) {
          socket.emit('error', { error: 'Client not registered' });
          return;
        }

        const { type } = data; // 'templates', 'systems', 'themes', 'all'

        // Import libraries
        const { APP_TEMPLATES } = await import('../libraries/appTemplatesLibrary.js');
        const { SYSTEMS_LIBRARY } = await import('../libraries/systemsLibrary.js');
        const { THEMES_LIBRARY } = await import('../libraries/themesLibrary.js');

        let preview = {};

        if (type === 'templates' || type === 'all') {
          preview.templates = APP_TEMPLATES;
        }

        if (type === 'systems' || type === 'all') {
          preview.systems = SYSTEMS_LIBRARY;
        }

        if (type === 'themes' || type === 'all') {
          preview.themes = THEMES_LIBRARY;
        }

        socket.emit('client:preview-data', {
          success: true,
          preview,
        });

        // Notify Auto Builder
        io.of('/auto-builder').emit('client:preview-request', {
          clientId: session.clientId,
          clientName: session.clientName,
          type,
        });
      } catch (error) {
        console.error('Client preview libraries error:', error);
        socket.emit('error', { error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client Portal client disconnected:', socket.id);
    });
  });
}

/**
 * GET /api/client-portal/preview/:token
 * Get build preview
 */
router.get('/preview/:token', (req, res) => {
  const { token } = req.params;
  const preview = buildPreviews.get(token);

  if (!preview) {
    return res.status(404).json({ error: 'Preview not found' });
  }

  res.json({
    success: true,
    preview: {
      buildId: preview.buildId,
      projectName: preview.projectName,
      builds: preview.builds,
      createdAt: preview.createdAt,
    },
  });
});

/**
 * POST /api/client-portal/form-submit
 * Submit form request from client portal
 */
router.post('/form-submit', (req, res) => {
  const { clientId, clientName, phone, email, requestType, requestDetails, themePreview, fileIds } = req.body;

  const request = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clientId,
    clientName,
    phone,
    email,
    type: 'form',
    content: {
      requestType,
      requestDetails,
      themePreview,
      fileIds: fileIds || [],
    },
    timestamp: Date.now(),
    status: 'pending',
  };

  // Store request
  if (!clientRequests.has(clientId)) {
    clientRequests.set(clientId, []);
  }
  clientRequests.get(clientId).push(request);

  // Send notification to Auto Builder
  const io = req.app.get('io');
  if (io) {
    io.of('/auto-builder').emit('client:request', request);
  }

  res.json({
    success: true,
    requestId: request.id,
    message: 'تم استلام طلبك بنجاح',
  });
});

/**
 * GET /api/client-portal/requests/:clientId
 * Get all requests for a client
 */
router.get('/requests/:clientId', (req, res) => {
  const { clientId } = req.params;
  const requests = clientRequests.get(clientId) || [];
  
  res.json({
    success: true,
    requests,
    count: requests.length,
  });
});

/**
 * POST /api/client-portal/update-request
 * Update request status (from Auto Builder)
 */
router.post('/update-request', async (req, res) => {
  const { requestId, status, response, invoiceId, amount } = req.body;

  // Find and update request
  for (const [clientId, requests] of clientRequests.entries()) {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      request.status = status;
      request.response = response;
      request.updatedAt = Date.now();
      
      // If status is 'agreed' and amount provided, create invoice and payment link
      if (status === 'agreed' && amount) {
        request.invoiceId = invoiceId;
        request.amount = amount;
        request.paymentStatus = 'pending';

        // ✅ Send WhatsApp notification - Payment Required
        try {
          const { sendPaymentReminder } = await import('../services/twilioTemplatesService.js');
          const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          await sendPaymentReminder(
            request.phone,
            request.clientName,
            invoiceId || 'N/A',
            `${amount} ${request.currency || 'SAR'}`,
            dueDate
          );
          console.log('✅ Payment reminder sent to:', request.phone);
        } catch (error) {
          console.error('Failed to send payment reminder:', error);
        }
      }

      // Notify client
      const io = req.app.get('io') || global.io;
      if (io) {
        io.of('/client-portal').emit('client:request:updated', {
          requestId,
          status,
          response,
          invoiceId,
          amount,
          paymentRequired: status === 'agreed' && amount,
        });
      }

      return res.json({
        success: true,
        message: 'تم تحديث حالة الطلب',
        invoiceId: request.invoiceId,
        amount: request.amount,
        paymentRequired: status === 'agreed' && amount,
      });
    }
  }

  res.status(404).json({ error: 'Request not found' });
});

export { router, initializeClientPortal };
