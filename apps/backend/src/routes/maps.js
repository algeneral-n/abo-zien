/**
 * ABO ZIEN - Maps Routes
 * Local maps service (Apple Maps / Google Maps)
 * ✅ Enhanced with WeatherKit integration
 */

import express from 'express';
import { Maps } from '../services/apiService.js';
import { Weather } from '../services/apiService.js';

const router = express.Router();

/**
 * Get route
 * POST /api/maps/route
 */
router.post('/route', async (req, res) => {
  try {
    const { from, to, provider = 'apple', includeWeather = true } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'From and to are required' });
    }

    const route = await Maps.getRoute(from, to, provider);

    // ✅ Include weather along the route if requested
    let weatherData = null;
    if (includeWeather && route) {
      try {
        // Get weather for destination
        // Extract coordinates from route
        let destLat, destLng;
        
        if (typeof to === 'string') {
          // If 'to' is an address, we need to geocode it first
          // For now, try to extract from route if available
          if (route.destination) {
            destLat = route.destination.latitude;
            destLng = route.destination.longitude;
          } else if (route.waypoints && route.waypoints.length > 0) {
            const lastWaypoint = route.waypoints[route.waypoints.length - 1];
            destLat = lastWaypoint.latitude;
            destLng = lastWaypoint.longitude;
          }
        } else if (typeof to === 'object' && to.latitude && to.longitude) {
          destLat = to.latitude;
          destLng = to.longitude;
        }

        if (destLat && destLng) {
          weatherData = await Weather.getCurrentWeather(destLat, destLng);
        }
      } catch (weatherError) {
        console.warn('Weather data unavailable:', weatherError.message);
        // Non-critical, continue without weather
      }
    }

    res.json({
      success: true,
      route: {
        ...route,
        weather: weatherData,
      },
    });
  } catch (error) {
    console.error('Maps route error:', error);
    res.status(500).json({
      error: 'Maps service error',
      message: error.message,
    });
  }
});

/**
 * Search locations
 * POST /api/maps/search
 */
router.post('/search', async (req, res) => {
  try {
    const { query, location, provider = 'apple', radius = 5000, type } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await Maps.searchLocation(query, location, provider, radius, type);

    res.json({
      success: true,
      results: results.places || [],
      query,
      provider: results.provider || provider,
      count: results.places?.length || 0,
    });
  } catch (error) {
    console.error('Maps search error:', error);
    res.status(500).json({
      error: 'Maps search error',
      message: error.message,
    });
  }
});

/**
 * Geocode address to coordinates
 * POST /api/maps/geocode
 */
router.post('/geocode', async (req, res) => {
  try {
    const { address, provider = 'apple' } = req.body;

    if (!address || address.trim().length === 0) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const location = await Maps.geocodeAddress(address, provider);

    res.json({
      success: true,
      location,
      address,
    });
  } catch (error) {
    console.error('Maps geocode error:', error);
    res.status(500).json({
      error: 'Maps geocode error',
      message: error.message,
    });
  }
});

/**
 * Reverse geocode coordinates to address
 * POST /api/maps/reverse-geocode
 */
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { latitude, longitude, provider = 'apple' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: 'Invalid latitude (must be between -90 and 90)' });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid longitude (must be between -180 and 180)' });
    }

    const address = await Maps.reverseGeocode(latitude, longitude, provider);

    res.json({
      success: true,
      address,
      location: { latitude, longitude },
    });
  } catch (error) {
    console.error('Maps reverse-geocode error:', error);
    res.status(500).json({
      error: 'Maps reverse-geocode error',
      message: error.message,
    });
  }
});

/**
 * Get nearby places
 * POST /api/maps/nearby
 */
router.post('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, type, radius = 1000, provider = 'apple' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const results = await Maps.getNearby(latitude, longitude, type, radius, provider);

    res.json({
      success: true,
      results: results.places || [],
      location: { latitude, longitude },
      type,
      count: results.places?.length || 0,
    });
  } catch (error) {
    console.error('Maps nearby error:', error);
    res.status(500).json({
      error: 'Maps nearby error',
      message: error.message,
    });
  }
});

/**
 * Get traffic information
 * POST /api/maps/traffic
 */
router.post('/traffic', async (req, res) => {
  try {
    const { route, location } = req.body;

    if (!route && !location) {
      return res.status(400).json({ error: 'Route or location is required' });
    }

    const trafficInfo = await Maps.getTrafficInfo(route, location);

    res.json({
      success: true,
      traffic: trafficInfo,
    });
  } catch (error) {
    console.error('Maps traffic error:', error);
    res.status(500).json({
      error: 'Maps traffic error',
      message: error.message,
    });
  }
});

/**
 * Calculate ETA
 * POST /api/maps/eta
 */
router.post('/eta', async (req, res) => {
  try {
    const { from, to, route } = req.body;

    if (!route && (!from || !to)) {
      return res.status(400).json({ error: 'Route or from/to locations are required' });
    }

    const etaData = await Maps.calculateETA(from, to, route);

    res.json({
      success: true,
      eta: etaData.eta,
      distance: etaData.distance,
      duration: etaData.duration,
    });
  } catch (error) {
    console.error('Maps ETA error:', error);
    res.status(500).json({
      error: 'Maps ETA error',
      message: error.message,
    });
  }
});

/**
 * Get current location
 * GET /api/maps/current-location
 */
router.get('/current-location', async (req, res) => {
  try {
    // This will be implemented with expo-location on mobile
    // For now, return a placeholder
    res.json({
      success: true,
      location: {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        timestamp: Date.now(),
      },
      message: 'Location will be provided by mobile app',
    });
  } catch (error) {
    console.error('Maps current-location error:', error);
    res.status(500).json({
      error: 'Maps current-location error',
      message: error.message,
    });
  }
});

export default router;

