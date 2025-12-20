/**
 * RARE 4N - Libraries Routes
 * Routes للمكتبات (Systems, Templates, Themes)
 */

import express from 'express';
import { SYSTEMS_LIBRARY } from '../libraries/systemsLibrary.js';
import { APP_TEMPLATES } from '../libraries/appTemplatesLibrary.js';
import { THEMES_LIBRARY } from '../libraries/themesLibrary.js';

const router = express.Router();

/**
 * GET /api/libraries/systems
 * Get all systems
 */
router.get('/systems', (req, res) => {
  try {
    res.json({
      success: true,
      count: SYSTEMS_LIBRARY.length,
      systems: SYSTEMS_LIBRARY,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/libraries/templates
 * Get all app templates
 */
router.get('/templates', (req, res) => {
  try {
    res.json({
      success: true,
      count: APP_TEMPLATES.length,
      templates: APP_TEMPLATES,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/libraries/themes
 * Get all themes
 */
router.get('/themes', (req, res) => {
  try {
    res.json({
      success: true,
      count: THEMES_LIBRARY.length,
      themes: THEMES_LIBRARY,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/libraries/search?q=query
 * Search in all libraries
 */
router.get('/search', (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase();
    
    if (!query) {
      return res.json({
        success: true,
        systems: [],
        templates: [],
        themes: [],
      });
    }

    const systems = SYSTEMS_LIBRARY.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.nameEn.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    );

    const templates = APP_TEMPLATES.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.nameEn.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );

    const themes = THEMES_LIBRARY.filter(th => 
      th.name.toLowerCase().includes(query) || 
      th.nameEn.toLowerCase().includes(query)
    );

    res.json({
      success: true,
      query,
      systems: {
        count: systems.length,
        results: systems,
      },
      templates: {
        count: templates.length,
        results: templates,
      },
      themes: {
        count: themes.length,
        results: themes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;








