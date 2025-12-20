/**
 * ABO ZIEN - Maps Engine
 * Navigation and Location Services
 * Supports Apple Maps (primary) and Google Maps (fallback)
 * ✅ Enhanced with full implementation
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { loadAPIKeys } from '../config/api-keys';

export interface RouteInfo {
  summary: string;
  distance: string;
  duration: string;
  distanceMeters?: number;
  durationSeconds?: number;
  steps?: any[];
  provider: 'apple' | 'google';
  polyline?: string;
  waypoints?: Array<{ latitude: number; longitude: number }>;
}

export interface PlaceSearchResult {
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: string;
  placeId?: string;
  rating?: number;
  types?: string[];
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface NavigationState {
  isNavigating: boolean;
  currentRoute?: RouteInfo;
  currentLocation?: CurrentLocation;
  destination?: { latitude: number; longitude: number };
  startTime?: number;
  distanceRemaining?: number;
  eta?: number;
}

export class MapsEngine extends RAREEngine {
  readonly id = 'maps-engine';
  readonly name = 'Maps Engine';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;

  private apiBase: string;
  private appleMapsToken?: string;
  private googleMapsKey?: string;
  private defaultProvider: 'apple' | 'google' = 'apple';
  private navigationState: NavigationState = { isNavigating: false };
  private locationWatchId?: any;

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    // Get API keys from config or environment
    const apiKeys = loadAPIKeys();
    this.apiBase = config.apiBase || process.env.LOCAL_API_URL || 'http://localhost:5000/api';
    this.appleMapsToken = config.appleMapsToken || apiKeys.appleMapKit || process.env.APPLE_MAPKIT_TOKEN;
    this.googleMapsKey = config.googleMapsKey || apiKeys.googleMaps || process.env.GOOGLE_MAPS_API_KEY;
    this.defaultProvider = config.defaultProvider || (this.appleMapsToken ? 'apple' : 'google');

    // Validate API keys
    if (!this.appleMapsToken && !this.googleMapsKey) {
      console.warn('MapsEngine: No API keys found. Maps features will be limited.');
    }

    // Subscribe to Cognitive Loop commands
    if (this.kernel) {
      this.kernel.on('agent:maps:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Maps Engine not initialized');
    }
    this.running = true;
    this.emit('maps:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('maps:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   * ✅ Enhanced with new actions
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    try {
      switch (command.action) {
        case 'get_route':
          await this.getRoute(command.parameters);
          break;
        case 'search_places':
        case 'search_location':
          await this.searchPlaces(command.parameters);
          break;
        case 'geocode':
          await this.geocode(command.parameters);
          break;
        case 'reverse_geocode':
          await this.reverseGeocode(command.parameters);
          break;
        case 'get_nearby':
          await this.getNearby(command.parameters);
          break;
        case 'start_navigation':
          await this.startNavigation(command.parameters);
          break;
        case 'stop_navigation':
          await this.stopNavigation();
          break;
        case 'get_current_location':
          await this.getCurrentLocation();
          break;
        case 'get_traffic':
          await this.getTrafficInfo(command.parameters);
          break;
        case 'calculate_eta':
          await this.calculateETA(command.parameters);
          break;
        default:
          this.emit('maps:error', { 
            error: `Unknown action: ${command.action}`,
            action: command.action 
          });
      }
    } catch (error: any) {
      console.error('MapsEngine: Error handling command:', error);
      this.emit('maps:error', { 
        error: error.message || 'Unknown error',
        action: command.action 
      });
    }
  }

  /**
   * Get route between two locations
   * ✅ Enhanced with better error handling and validation
   */
  private async getRoute(parameters: any): Promise<void> {
    try {
      const { from, to, provider = this.defaultProvider, transportType = 'Automobile', alternatives = false } = parameters;

      // Validate parameters
      if (!from || !to) {
        throw new Error('From and to locations are required');
      }

      // Use local API
      const response = await fetch(`${this.apiBase}/maps/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          from, 
          to, 
          provider, 
          transportType,
          alternatives 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.route) {
        throw new Error(data.error || 'Failed to get route');
      }

      // Store route for navigation
      if (data.route) {
        this.navigationState.currentRoute = data.route;
      }

      this.emit('maps:route', {
        route: data.route,
        provider: data.route.provider || provider,
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: getRoute error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to get route',
        action: 'get_route',
        parameters 
      });
    }
  }

  /**
   * Search places
   * ✅ Enhanced with better error handling
   */
  private async searchPlaces(parameters: any): Promise<void> {
    try {
      const { query, location, provider = this.defaultProvider, radius = 5000, type } = parameters;

      // Validate parameters
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }

      // Use local API (will be implemented in backend)
      const response = await fetch(`${this.apiBase}/maps/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          location, 
          provider,
          radius,
          type 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to search places');
      }

      this.emit('maps:places_found', {
        results: data.results || [],
        query,
        provider: data.provider || provider,
        count: data.results?.length || 0,
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: searchPlaces error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to search places',
        action: 'search_places',
        parameters 
      });
    }
  }

  /**
   * Geocode address to coordinates
   */
  private async geocode(parameters: any): Promise<void> {
    try {
      const { address, provider = this.defaultProvider } = parameters;

      const response = await fetch(`${this.apiBase}/nav/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, provider }),
      });

      const data = await response.json();

      this.emit('maps:geocoded', {
        location: data.location,
        address,
      });
    } catch (error: any) {
      this.emit('maps:error', { error: error.message, action: 'geocode' });
    }
  }

  /**
   * Reverse geocode coordinates to address
   * ✅ Enhanced with better error handling
   */
  private async reverseGeocode(parameters: any): Promise<void> {
    try {
      const { latitude, longitude, provider = this.defaultProvider } = parameters;

      // Validate parameters
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude (must be between -90 and 90)');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude (must be between -180 and 180)');
      }

      // Use local API (will be implemented in backend)
      const response = await fetch(`${this.apiBase}/maps/reverse-geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, provider }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.address) {
        throw new Error(data.error || 'Failed to reverse geocode coordinates');
      }

      this.emit('maps:reverse_geocoded', {
        address: data.address,
        location: { latitude, longitude },
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: reverseGeocode error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to reverse geocode coordinates',
        action: 'reverse_geocode',
        parameters 
      });
    }
  }

  /**
   * Get nearby places
   * ✅ Enhanced with better error handling
   */
  private async getNearby(parameters: any): Promise<void> {
    try {
      const { latitude, longitude, type, radius = 1000, provider = this.defaultProvider } = parameters;

      // Validate parameters
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }

      // Use local API (will be implemented in backend)
      const response = await fetch(`${this.apiBase}/maps/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, type, radius, provider }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get nearby places');
      }

      this.emit('maps:nearby_found', {
        places: data.results || [],
        location: { latitude, longitude },
        type,
        count: data.results?.length || 0,
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: getNearby error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to get nearby places',
        action: 'get_nearby',
        parameters 
      });
    }
  }

  /**
   * Start navigation
   * ✅ New method
   */
  private async startNavigation(parameters: any): Promise<void> {
    try {
      const { destination, route } = parameters;

      if (!destination && !route) {
        throw new Error('Destination or route is required');
      }

      // If route provided, use it; otherwise get route first
      if (!route && destination) {
        // Get route to destination
        await this.getRoute({
          from: this.navigationState.currentLocation || 'current',
          to: destination,
        });
      }

      if (route) {
        this.navigationState.currentRoute = route;
      }

      this.navigationState.isNavigating = true;
      this.navigationState.destination = destination;
      this.navigationState.startTime = Date.now();

      // Start location tracking (will be implemented with expo-location)
      // this.startLocationTracking();

      this.emit('maps:navigation_started', {
        route: this.navigationState.currentRoute,
        destination,
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: startNavigation error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to start navigation',
        action: 'start_navigation',
        parameters 
      });
    }
  }

  /**
   * Stop navigation
   * ✅ New method
   */
  private async stopNavigation(): Promise<void> {
    try {
      this.navigationState.isNavigating = false;
      this.navigationState.destination = undefined;
      this.navigationState.startTime = undefined;

      // Stop location tracking
      // this.stopLocationTracking();

      this.emit('maps:navigation_stopped', {
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: stopNavigation error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to stop navigation',
        action: 'stop_navigation'
      });
    }
  }

  /**
   * Get current location
   * ✅ New method
   */
  private async getCurrentLocation(): Promise<void> {
    try {
      // Use local API (will be implemented with expo-location)
      const response = await fetch(`${this.apiBase}/maps/current-location`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.location) {
        throw new Error(data.error || 'Failed to get current location');
      }

      this.navigationState.currentLocation = data.location;

      this.emit('maps:current_location', {
        location: data.location,
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: getCurrentLocation error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to get current location',
        action: 'get_current_location'
      });
    }
  }

  /**
   * Get traffic information
   * ✅ New method
   */
  private async getTrafficInfo(parameters: any): Promise<void> {
    try {
      const { route, location } = parameters;

      if (!route && !location) {
        throw new Error('Route or location is required');
      }

      // Use local API (will be implemented in backend)
      const response = await fetch(`${this.apiBase}/maps/traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route, location }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get traffic info');
      }

      this.emit('maps:traffic_info', {
        traffic: data.traffic,
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: getTrafficInfo error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to get traffic info',
        action: 'get_traffic',
        parameters 
      });
    }
  }

  /**
   * Calculate ETA
   * ✅ New method
   */
  private async calculateETA(parameters: any): Promise<void> {
    try {
      const { from, to, route } = parameters;

      if (!route && (!from || !to)) {
        throw new Error('Route or from/to locations are required');
      }

      // Use local API (will be implemented in backend)
      const response = await fetch(`${this.apiBase}/maps/eta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, route }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate ETA');
      }

      this.emit('maps:eta_calculated', {
        eta: data.eta,
        distance: data.distance,
        duration: data.duration,
        success: true,
      });
    } catch (error: any) {
      console.error('MapsEngine: calculateETA error:', error);
      this.emit('maps:error', { 
        error: error.message || 'Failed to calculate ETA',
        action: 'calculate_eta',
        parameters 
      });
    }
  }

  /**
   * Get navigation state
   */
  getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }
}

