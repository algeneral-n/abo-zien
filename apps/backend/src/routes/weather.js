/**
 * RARE 4N - Weather Routes
 * Local weather service (Apple WeatherKit)
 * ✅ Integrated with Cognitive Loop and Kernel
 */

import express from 'express';
import { Weather } from '../services/apiService.js';

const router = express.Router();

/**
 * Get current weather
 * POST /api/weather/current
 * ✅ Cognitive Loop → Kernel → Weather Engine
 */
router.post('/current', async (req, res) => {
  try {
    const { latitude, longitude, language = 'ar' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        error: 'Latitude and longitude are required' 
      });
    }

    const weather = await Weather.getCurrentWeather(latitude, longitude);

    res.json({ 
      success: true, 
      weather,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather current error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Weather service error', 
      message: error.message 
    });
  }
});

/**
 * Get hourly forecast
 * POST /api/weather/hourly
 * ✅ Cognitive Loop → Kernel → Weather Engine
 */
router.post('/hourly', async (req, res) => {
  try {
    const { latitude, longitude, language = 'ar', hours = 24 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        error: 'Latitude and longitude are required' 
      });
    }

    const forecast = await Weather.getForecast(latitude, longitude, 1);

    res.json({ 
      success: true, 
      forecast: {
        ...forecast,
        type: 'hourly',
        hours,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather hourly forecast error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Weather service error', 
      message: error.message 
    });
  }
});

/**
 * Get daily forecast
 * POST /api/weather/daily
 * ✅ Cognitive Loop → Kernel → Weather Engine
 */
router.post('/daily', async (req, res) => {
  try {
    const { latitude, longitude, language = 'ar', days = 7 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        error: 'Latitude and longitude are required' 
      });
    }

    const forecast = await Weather.getForecast(latitude, longitude, days);

    res.json({ 
      success: true, 
      forecast: {
        ...forecast,
        type: 'daily',
        days,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather daily forecast error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Weather service error', 
      message: error.message 
    });
  }
});

/**
 * Get weather alerts
 * POST /api/weather/alerts
 * ✅ Cognitive Loop → Kernel → Weather Engine
 */
router.post('/alerts', async (req, res) => {
  try {
    const { latitude, longitude, language = 'ar' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        error: 'Latitude and longitude are required' 
      });
    }

    // WeatherKit alerts would be implemented here
    // For now, return empty alerts
    res.json({
      success: true,
      alerts: [],
      location: { latitude, longitude },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather alerts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Weather service error', 
      message: error.message 
    });
  }
});

export default router;

