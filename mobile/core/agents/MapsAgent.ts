/**
 * MapsAgent - ???????? ??????????????
 * ???????? Maps?? Navigation?? Routes
 */

import { BaseAgent } from './BaseAgent';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class MapsAgent extends BaseAgent {
  constructor() {
    super({
      id: 'maps',
      name: 'Maps Agent',
      description: 'Maps and Navigation',
      capabilities: [
        'get_route',
        'search_location',
        'start_navigation',
        'geocode_address',
      ],
    });
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    switch (action) {
      case 'get_route':
        return await this.getRoute(parameters);

      case 'search_location':
        return await this.searchLocation(parameters);

      case 'start_navigation':
        return await this.startNavigation(parameters);

      case 'geocode_address':
        return await this.geocodeAddress(parameters);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Get route
   */
  private async getRoute(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/maps/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: parameters.from,
        to: parameters.to,
        provider: parameters.provider || 'google',
        includeWeather: parameters.includeWeather !== false,
      }),
    });

    const json = await response.json();
    
    // Emit result to UI via Kernel
    if (json.success && json.route) {
      this.emit('agent:maps:response', { route: json.route });
      return json;
    } else {
      this.emit('agent:maps:error', { error: json.error || '?????? ???????????? ?????? ????????????' });
      throw new Error(json.error || '?????? ???????????? ?????? ????????????');
    }
  }

  /**
   * Search location
   */
  private async searchLocation(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/maps/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: parameters.query,
        location: parameters.location,
        provider: parameters.provider || 'google',
      }),
    });

    const json = await response.json();
    
    if (json.success) {
      this.emit('agent:maps:search:response', { results: json.results });
      return json;
    } else {
      this.emit('agent:maps:error', { error: json.error || '?????? ??????????' });
      throw new Error(json.error || '?????? ??????????');
    }
  }

  /**
   * Start navigation - Real implementation using Maps API
   */
  private async startNavigation(parameters: any): Promise<any> {
    try {
      // ??? Validate inputs
      if (!parameters || (!parameters.route && (!parameters.from || !parameters.to))) {
        throw new Error('Route or from/to coordinates are required');
      }

      let route = parameters.route;
      
      // ??? If route not provided, get it from API
      if (!route && parameters.from && parameters.to) {
        const routeResponse = await fetch(`${API_URL}/api/maps/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: parameters.from,
            to: parameters.to,
            provider: parameters.provider || 'google',
          }),
        });
        
        const routeData = await routeResponse.json();
        if (!routeData.success || !routeData.route) {
          throw new Error(routeData.error || 'Failed to get route');
        }
        route = routeData.route;
      }

      if (!route) {
        throw new Error('Route is required for navigation');
      }

      // ??? Emit navigation started event with real route data
      this.emit('agent:maps:navigation:started', {
        route,
        distance: route.distance,
        duration: route.duration,
        waypoints: route.waypoints || [],
        instructions: route.instructions || [],
      });

      return {
        success: true,
        route,
        message: 'Navigation started successfully',
        distance: route.distance,
        duration: route.duration,
      };
    } catch (error: any) {
      this.emit('agent:maps:error', { error: error.message || 'Navigation failed' });
      throw error;
    }
  }

  /**
   * Geocode address
   */
  private async geocodeAddress(parameters: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/maps/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: parameters.address,
        provider: parameters.provider || 'google',
      }),
    });

    const json = await response.json();
    
    if (json.success) {
      return json;
    } else {
      this.emit('agent:maps:error', { error: json.error || '?????? Geocode' });
      throw new Error(json.error || '?????? Geocode');
    }
  }
}



