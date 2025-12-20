/**
 * ABO ZIEN - Cognitive Routes
 * Cognitive Loop interactions and learning
 */

import express from 'express';
import { getDatabase, DB } from '../database/localDB.js';

const router = express.Router();

/**
 * Get user ID from token (middleware)
 */
function getUserId(req) {
  return req.headers['x-user-id'] || 'default_user';
}

/**
 * Save cognitive interaction (for learning)
 * POST /api/cognitive/interaction
 */
router.post('/interaction', (req, res) => {
  try {
    const userId = getUserId(req);
    const { input, decision, response, confidence } = req.body;

    if (!input || !decision) {
      return res.status(400).json({ error: 'Input and decision are required' });
    }

    const interactionId = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    DB.cognitive.create({
      id: interactionId,
      userId,
      input,
      decision,
      response: response || '',
      confidence: confidence || 0.7,
    });

    res.json({
      success: true,
      interactionId,
    });
  } catch (error) {
    console.error('Save interaction error:', error);
    res.status(500).json({ error: 'Failed to save interaction' });
  }
});

/**
 * Get cognitive history
 * GET /api/cognitive/history
 */
router.get('/history', (req, res) => {
  try {
    const userId = getUserId(req);
    const { limit = 100 } = req.query;

    const interactions = DB.cognitive.findByUser(userId, parseInt(limit));

    res.json({
      success: true,
      interactions: interactions.map(interaction => ({
        ...interaction,
        decision: JSON.parse(interaction.decision),
      })),
      count: interactions.length,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

/**
 * Update context
 * POST /api/cognitive/context
 */
router.post('/context', (req, res) => {
  try {
    const userId = getUserId(req);
    const { contextData } = req.body;

    if (!contextData) {
      return res.status(400).json({ error: 'Context data is required' });
    }

    DB.context.upsert(userId, contextData);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Update context error:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

/**
 * Get context
 * GET /api/cognitive/context
 */
router.get('/context', (req, res) => {
  try {
    const userId = getUserId(req);
    const context = DB.context.findByUser(userId);

    res.json({
      success: true,
      context: context ? context.context_data : null,
    });
  } catch (error) {
    console.error('Get context error:', error);
    res.status(500).json({ error: 'Failed to get context' });
  }
});

export default router;









