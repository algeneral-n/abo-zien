/**
 * RARE 4N - CarPlay Routes
 * مسارات CarPlay - دعم Apple CarPlay
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * POST /api/carplay/connect
 * Connect to CarPlay
 */
router.post('/connect', async (req, res) => {
  try {
    const { deviceId, vehicleInfo } = req.body;

    // In production, this would integrate with actual CarPlay framework
    // For now, return success with session
    res.json({
      success: true,
      sessionId: `carplay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId: deviceId || 'unknown',
      vehicleInfo: vehicleInfo || {},
      connected: true,
      message: 'CarPlay connected successfully',
    });
  } catch (error) {
    console.error('CarPlay connect error:', error);
    res.status(500).json({ error: 'Failed to connect to CarPlay' });
  }
});

/**
 * POST /api/carplay/navigate
 * Navigate with CarPlay
 */
router.post('/navigate', async (req, res) => {
  try {
    const { destination, startLocation, routeType = 'driving' } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    // Use Maps API to get route
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    // Build origin
    const origin = startLocation 
      ? `${startLocation.lat},${startLocation.lng}`
      : 'place_id:ChIJN1t_tDeuEmsRUsoyG83frY4'; // Default: Sydney

    // Build destination
    const dest = typeof destination === 'string'
      ? destination
      : `${destination.lat},${destination.lng}`;

    // Get route from Google Maps
    const mapsResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin,
          destination: dest,
          mode: routeType,
          key: GOOGLE_MAPS_API_KEY,
          language: 'ar',
          alternatives: true,
        },
      }
    );

    if (mapsResponse.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${mapsResponse.data.status}`);
    }

    const route = mapsResponse.data.routes[0];
    const leg = route.legs[0];

    res.json({
      success: true,
      route: {
        distance: {
          text: leg.distance.text,
          value: leg.distance.value,
        },
        duration: {
          text: leg.duration.text,
          value: leg.duration.value,
        },
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance.text,
          duration: step.duration.text,
          polyline: step.polyline.points,
        })),
        polyline: route.overview_polyline.points,
        startLocation: {
          lat: leg.start_location.lat,
          lng: leg.start_location.lng,
        },
        endLocation: {
          lat: leg.end_location.lat,
          lng: leg.end_location.lng,
        },
      },
    });
  } catch (error) {
    console.error('CarPlay navigate error:', error);
    res.status(500).json({ 
      error: error.response?.data?.error_message || error.message || 'Navigation failed' 
    });
  }
});

/**
 * POST /api/carplay/voice
 * Handle voice commands in CarPlay
 */
router.post('/voice', async (req, res) => {
  try {
    const { command, audio, context = 'carplay' } = req.body;

    if (!command && !audio) {
      return res.status(400).json({ error: 'Command or audio is required' });
    }

    let text = command;

    // If audio, transcribe first
    if (audio && !command) {
      const { transcribeWithWhisper } = await import('../services/whisperService.js');
      text = await transcribeWithWhisper(audio, 'ar');
    }

    // Process command with AI
    const OPENAI_KEY=REPLACE_ME

    if (!OPENAI_KEY=REPLACE_ME
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are RARE, an intelligent assistant in a car. 
Respond concisely and clearly. 
Context: ${context}.
User is driving, so keep responses short and actionable.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = aiResponse.data.choices[0].message.content;

    // Generate speech
    const { textToSpeech } = await import('../services/elevenlabsService.js');
    const audioResponse = await textToSpeech(responseText, undefined, 'ar');

    res.json({
      success: true,
      recognized: text,
      response: responseText,
      audio: audioResponse,
    });
  } catch (error) {
    console.error('CarPlay voice error:', error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || error.message || 'Voice command failed' 
    });
  }
});

/**
 * POST /api/carplay/media
 * Handle media in CarPlay
 */
router.post('/media', async (req, res) => {
  try {
    const { action, mediaType, mediaId } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Media action is required' });
    }

    // In production, this would control actual media playback
    // For now, return success
    res.json({
      success: true,
      status: action === 'play' ? 'playing' : action === 'pause' ? 'paused' : 'stopped',
      action,
      mediaType,
      mediaId,
      currentTrack: mediaId ? {
        id: mediaId,
        title: 'Current Track',
        artist: 'Artist',
        duration: 180,
      } : null,
    });
  } catch (error) {
    console.error('CarPlay media error:', error);
    res.status(500).json({ error: 'Media action failed' });
  }
});

/**
 * POST /api/carplay/maps
 * Show maps in CarPlay
 */
router.post('/maps', async (req, res) => {
  try {
    const { location, zoom = 15, mapType = 'standard' } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const lat = typeof location === 'object' ? location.lat : location.split(',')[0];
    const lng = typeof location === 'object' ? location.lng : location.split(',')[1];

    // Generate static map URL
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=800x600&maptype=${mapType}&key=${GOOGLE_MAPS_API_KEY}`;

    res.json({
      success: true,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      mapUrl,
      zoom,
      mapType,
    });
  } catch (error) {
    console.error('CarPlay maps error:', error);
    res.status(500).json({ error: 'Failed to show maps' });
  }
});

export default router;



