/**
 * RARE 4N - CarPlay Agent
 * وكيل CarPlay - دعم Apple CarPlay
 * ✅ Cognitive Loop → Kernel → CarPlay Agent
 */

import { BaseAgent } from './BaseAgent';
import { API_URL } from '../../services/config';

export class CarPlayAgent extends BaseAgent {
  private socket: any = null;

  constructor() {
    super({
      id: 'carplay',
      name: 'CarPlay Agent',
      description: 'CarPlay integration for navigation, voice, and media',
      capabilities: [
        'carplay_connect',
        'carplay_navigate',
        'carplay_voice',
        'carplay_media',
        'carplay_maps',
      ],
    });
  }

  async init(): Promise<void> {
    await super.init();
    console.log('[CarPlayAgent] Initialized ✅');
  }

  async execute(action: string, parameters: any): Promise<any> {
    try {
      switch (action) {
        case 'carplay_connect':
          return await this.connect(parameters);

        case 'carplay_navigate':
          return await this.navigate(parameters);

        case 'carplay_voice':
          return await this.handleVoice(parameters);

        case 'carplay_media':
          return await this.handleMedia(parameters);

        case 'carplay_maps':
          return await this.showMaps(parameters);

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      this.emit('agent:carplay:error', { error: error.message || 'CarPlay error' });
      throw error;
    }
  }

  /**
   * Connect to CarPlay
   */
  private async connect(parameters: any): Promise<any> {
    try {
      // Check if CarPlay is available (iOS only)
      const isCarPlayAvailable = await this.checkCarPlayAvailability();

      if (!isCarPlayAvailable) {
        throw new Error('CarPlay is not available on this device');
      }

      // Initialize CarPlay connection
      const response = await fetch(`${API_URL}/api/carplay/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: parameters.deviceId,
          vehicleInfo: parameters.vehicleInfo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.emit('agent:carplay:response', {
          connected: true,
          sessionId: data.sessionId,
        });
        return data;
      } else {
        throw new Error(data.error || 'Failed to connect to CarPlay');
      }
    } catch (error: any) {
      this.emit('agent:carplay:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Navigate with CarPlay
   */
  private async navigate(parameters: any): Promise<any> {
    try {
      const { destination, startLocation, routeType } = parameters;

      if (!destination) {
        throw new Error('Destination is required');
      }

      const response = await fetch(`${API_URL}/api/carplay/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startLocation,
          routeType: routeType || 'driving',
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.emit('agent:carplay:response', {
          navigation: {
            route: data.route,
            distance: data.distance,
            duration: data.duration,
            steps: data.steps,
          },
        });
        return data;
      } else {
        throw new Error(data.error || 'Navigation failed');
      }
    } catch (error: any) {
      this.emit('agent:carplay:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle voice commands in CarPlay
   */
  private async handleVoice(parameters: any): Promise<any> {
    try {
      const { command, audio } = parameters;

      if (!command && !audio) {
        throw new Error('Command or audio is required');
      }

      // If audio, transcribe first
      let text = command;
      if (audio) {
        const transcription = await this.transcribeAudio(audio);
        text = transcription;
      }

      // Process voice command
      const response = await fetch(`${API_URL}/api/carplay/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: text,
          context: 'carplay',
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.emit('agent:carplay:response', {
          voice: {
            recognized: text,
            response: data.response,
            audio: data.audio,
          },
        });
        return data;
      } else {
        throw new Error(data.error || 'Voice command failed');
      }
    } catch (error: any) {
      this.emit('agent:carplay:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle media in CarPlay
   */
  private async handleMedia(parameters: any): Promise<any> {
    try {
      const { action, mediaType, mediaId } = parameters;

      if (!action) {
        throw new Error('Media action is required');
      }

      const response = await fetch(`${API_URL}/api/carplay/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action, // play, pause, next, previous, volume
          mediaType,
          mediaId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.emit('agent:carplay:response', {
          media: {
            action,
            status: data.status,
            currentTrack: data.currentTrack,
          },
        });
        return data;
      } else {
        throw new Error(data.error || 'Media action failed');
      }
    } catch (error: any) {
      this.emit('agent:carplay:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Show maps in CarPlay
   */
  private async showMaps(parameters: any): Promise<any> {
    try {
      const { location, zoom, mapType } = parameters;

      const response = await fetch(`${API_URL}/api/carplay/maps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          zoom: zoom || 15,
          mapType: mapType || 'standard',
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.emit('agent:carplay:response', {
          maps: {
            location,
            mapUrl: data.mapUrl,
          },
        });
        return data;
      } else {
        throw new Error(data.error || 'Failed to show maps');
      }
    } catch (error: any) {
      this.emit('agent:carplay:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if CarPlay is available
   */
  private async checkCarPlayAvailability(): Promise<boolean> {
    try {
      // ✅ Check if running on iOS
      const { Platform } = require('react-native');
      if (Platform.OS !== 'ios') {
        return false;
      }

      // ✅ Check if CarPlay is available using native module
      // In production, this would use @react-native-carplay/carplay or similar
      // For now, check if device supports CarPlay (iOS 12+)
      const { NativeModules } = require('react-native');
      
      // Try to access CarPlay native module
      if (NativeModules.CarPlayModule) {
        const isAvailable = await NativeModules.CarPlayModule.isCarPlayAvailable();
        return isAvailable === true;
      }

      // ✅ Fallback: Check iOS version (CarPlay requires iOS 12+)
      const { getSystemVersion } = require('react-native').Platform;
      const iosVersion = parseFloat(getSystemVersion());
      return iosVersion >= 12.0;
    } catch (error) {
      // ✅ Safe fallback: return false if any error
      console.warn('[CarPlayAgent] CarPlay availability check failed:', error);
      return false;
    }
  }

  /**
   * Transcribe audio
   */
  private async transcribeAudio(audio: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/api/whisper/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio }),
      });

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      throw new Error('Failed to transcribe audio');
    }
  }

  async start(): Promise<void> {
    console.log('[CarPlayAgent] Started ✅');
  }

  async stop(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    console.log('[CarPlayAgent] Stopped ✅');
  }
}



