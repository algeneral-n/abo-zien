/**
 * ABO ZIEN - AI Routes
 * Local AI service with GPT, Gemini, Claude
 */

import express from 'express';
import { AI } from '../services/apiService.js';

const router = express.Router();

/**
 * Chat with AI
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, aiModel = 'gpt', openaiModel = null } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ✅ Use free daily usage models
    // openaiModel can be: 'gpt-4o-mini' (2.5M tokens/day free) or 'gpt-4o' (250K tokens/day free)
    const response = await AI.chat(message, aiModel, openaiModel);

    res.json({
      success: true,
      reply: response.reply,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      error: 'AI service error',
      message: error.message,
    });
  }
});

export default router;









