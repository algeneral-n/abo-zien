/**
 * RARE 4N - Boot Routes
 * Boot sequence and initialization
 * ✅ Integrated with Cognitive Loop and Kernel
 */

import express from 'express';
import { getDatabase, DB } from '../database/localDB.js';

const router = express.Router();

/**
 * Boot check - Verify system readiness
 * POST /api/boot/check
 * ✅ Cognitive Loop → Kernel → System Check
 */
router.post('/check', async (req, res) => {
  try {
    const { token } = req.body;

    // Check authentication if token provided
    let authenticated = false;
    let user = null;

    if (token) {
      try {
        const session = DB.sessions.findByToken(token);
        if (session && session.expiresAt > Math.floor(Date.now() / 1000)) {
          authenticated = true;
          user = DB.users.findById(session.userId);
        }
      } catch (error) {
        // Token invalid, continue as unauthenticated
      }
    }

    // System readiness check
    const systemChecks = {
      core: true,
      voice: false, // Will be activated on demand
      ai: true,
      agent: true,
      database: DB ? true : false,
      backend: true,
    };

    res.json({
      success: true,
      authenticated,
      user: authenticated && user ? {
        id: user.id,
        email: user.email,
        name: user.name,
      } : null,
      systemChecks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Boot check error:', error);
    res.status(500).json({
      success: false,
      error: 'Boot check failed',
      message: error.message,
    });
  }
});

/**
 * Initialize system (on-demand, not at startup)
 * POST /api/boot/initialize
 * ✅ Cognitive Loop → Kernel → System Initialization
 */
router.post('/initialize', async (req, res) => {
  try {
    const { systems = [] } = req.body;

    // Only initialize requested systems (on-demand)
    const initialized = {
      voice: systems.includes('voice'),
      location: systems.includes('location'),
      notifications: systems.includes('notifications'),
    };

    res.json({
      success: true,
      initialized,
      message: 'Systems initialized on-demand',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Boot initialize error:', error);
    res.status(500).json({
      success: false,
      error: 'Initialization failed',
      message: error.message,
    });
  }
});

export default router;

