/**
 * RARE 4N - Communication Routes
 * ???????????? ?????????????? - Ultimate Assistant
 * Phone Calls, Email, WhatsApp, SMS
 */

import express from 'express';
import {
  makePhoneCall,
  sendWhatsAppMessage,
  sendSMS,
  sendEmail,
  ultimateAssistantCommunication,
} from '../services/communicationService.js';

const router = express.Router();

/**
 * POST /api/communication/call
 * Make phone call
 */
router.post('/call', async (req, res) => {
  try {
    const { to, from, message } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Phone number (to) is required' });
    }

    const result = await makePhoneCall(to, from, message);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Phone call error:', error);
    res.status(500).json({ error: error.message || 'Failed to make phone call' });
  }
});

/**
 * POST /api/communication/whatsapp
 * Send WhatsApp message
 * ??? Supports Content Templates (ContentSid + ContentVariables)
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const { to, message, mediaUrl, contentSid, contentVariables } = req.body;

    // ??? Content Template (Business-Initiated) - doesn't need message
    if (contentSid) {
      if (!to) {
        return res.status(400).json({ error: 'Phone number (to) and ContentSid are required' });
      }
    } else {
      // Regular message - needs message
      if (!to || !message) {
        return res.status(400).json({ error: 'Phone number (to) and message are required' });
      }
    }

    const result = await sendWhatsAppMessage(to, message, mediaUrl, {
      contentSid,
      contentVariables,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ error: error.message || 'Failed to send WhatsApp message' });
  }
});

/**
 * POST /api/communication/sms
 * Send SMS
 */
router.post('/sms', async (req, res) => {
  try {
    const { to, message, from } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Phone number (to) and message are required' });
    }

    const result = await sendSMS(to, message, from);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ error: error.message || 'Failed to send SMS' });
  }
});

/**
 * POST /api/communication/email
 * Send email
 */
router.post('/email', async (req, res) => {
  try {
    const { to, subject, text, html, attachments } = req.body;

    if (!to || (!text && !html)) {
      return res.status(400).json({ error: 'Email (to) and content (text or html) are required' });
    }

    const result = await sendEmail(to, subject, text, html, attachments);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
});

/**
 * POST /api/communication/ultimate
 * Ultimate Assistant - All-in-one communication
 */
router.post('/ultimate', async (req, res) => {
  try {
    const { action, type, to, message, subject, html, attachments, mediaUrl, from } = req.body;

    if (!type || !to) {
      return res.status(400).json({ error: 'Type and recipient (to) are required' });
    }

    const result = await ultimateAssistantCommunication(action, {
      type,
      to,
      message,
      subject,
      html,
      attachments,
      mediaUrl,
      from,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Ultimate Assistant error:', error);
    res.status(500).json({ error: error.message || 'Failed to communicate' });
  }
});

/**
 * POST /api/communication/twilio/webhook
 * Twilio WhatsApp Webhook - Receive incoming messages
 * ??? Handles incoming WhatsApp messages from Twilio Sandbox
 */
router.post('/TWILIO_KEY=REPLACE_ME
  try {
    // Twilio sends data as form-urlencoded
    const {
      MessageSid,
      AccountSid,
      From, // whatsapp:+12264444054
      To, // whatsapp:+14155238886
      Body,
      NumMedia,
      MediaUrl0,
      MediREMOVED,
    } = req.body;

    console.log('???? Twilio WhatsApp Webhook received:', {
      MessageSid,
      From,
      To,
      Body,
      NumMedia,
    });

    // Extract phone number (remove whatsapp: prefix)
    const fromNumber = From?.replace('whatsapp:', '') || From;
    const toNumber = To?.replace('whatsapp:', '') || To;

    // Process incoming message
    const messageData = {
      messageSid: MessageSid,
      accountSid: AccountSid,
      from: fromNumber,
      to: toNumber,
      body: Body,
      media: NumMedia > 0 ? {
        url: MediaUrl0,
        contentType: MediREMOVED,
      } : null,
      timestamp: new Date().toISOString(),
    };

    // ??? Emit to Socket.IO for real-time processing
    const io = req.app.get('io');
    if (io) {
      io.emit('whatsapp:incoming', messageData);
      console.log('??? WhatsApp message emitted to Socket.IO');
    }

    // ??? Process with Cognitive Loop (if available)
    // In production, this would go through RAREKernel ??? CognitiveLoop ??? CommunicationAgent

    // ??? Auto-reply (optional - can be disabled)
    // You can add auto-reply logic here if needed

    // Twilio expects TwiML response or 200 OK
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('??? Twilio webhook error:', error);
    // Twilio expects a response, so return 200 even on error
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

/**
 * POST /api/communication/twilio/status
 * Twilio Status Callback - Track message status
 */
router.post('/TWILIO_KEY=REPLACE_ME
  try {
    const {
      MessageSid,
      MessageStatus, // queued, sent, delivered, read, failed
      ErrorCode,
      ErrorMessage,
    } = req.body;

    console.log('???? Twilio Status Callback:', {
      MessageSid,
      MessageStatus,
      ErrorCode,
      ErrorMessage,
    });

    // ??? Emit status to Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('whatsapp:status', {
        messageSid: MessageSid,
        status: MessageStatus,
        errorCode: ErrorCode,
        errorMessage: ErrorMessage,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('??? Twilio status callback error:', error);
    res.status(200).send('OK');
  }
});

export default router;




