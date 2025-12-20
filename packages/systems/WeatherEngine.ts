/**
 * ABO ZIEN - Weather Engine
 * Apple WeatherKit integration with Arabic support
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

export interface WeatherForecast {
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
  }>;
}

export class WeatherEngine extends RAREEngine {
  readonly id = 'weather-engine';
  readonly name = 'Weather Engine';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;

  private apiBase: string;

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    this.apiBase = config.apiBase || process.env.API_URL || 'http://localhost:5000/api';

    // Subscribe to Cognitive Loop commands
    if (this.kernel) {
      this.kernel.on('agent:weather:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Weather Engine not initialized');
    }
    this.running = true;
    this.emit('weather:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('weather:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'get_current':
        await this.getCurrentWeather(command.parameters);
        break;
      case 'get_hourly':
        await this.getHourlyForecast(command.parameters);
        break;
      case 'get_daily':
        await this.getDailyForecast(command.parameters);
        break;
      case 'get_alerts':
        await this.getWeatherAlerts(command.parameters);
        break;
    }
  }

  /**
   * Get current weather
   */
  private async getCurrentWeather(parameters: any): Promise<void> {
    try {
      const { latitude, longitude, language = 'ar' } = parameters;

      const response = await fetch(`${this.apiBase}/weather/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, language }),
      });

      const data = await response.json();

      this.emit('weather:current', {
        weather: data.weather,
        location: { latitude, longitude },
      });
    } catch (error: any) {
      this.emit('weather:error', { error: error.message, action: 'get_current' });
    }
  }

  /**
   * Get hourly forecast
   */
  private async getHourlyForecast(parameters: any): Promise<void> {
    try {
      const { latitude, longitude, language = 'ar' } = parameters;

      const response = await fetch(`${this.apiBase}/weather/hourly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, language }),
      });

      const data = await response.json();

      this.emit('weather:hourly_forecast', {
        forecast: data.forecast,
        location: { latitude, longitude },
      });
    } catch (error: any) {
      this.emit('weather:error', { error: error.message, action: 'get_hourly' });
    }
  }

  /**
   * Get daily forecast
   */
  private async getDailyForecast(parameters: any): Promise<void> {
    try {
      const { latitude, longitude, language = 'ar' } = parameters;

      const response = await fetch(`${this.apiBase}/weather/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, language }),
      });

      const data = await response.json();

      this.emit('weather:daily_forecast', {
        forecast: data.forecast,
        location: { latitude, longitude },
      });
    } catch (error: any) {
      this.emit('weather:error', { error: error.message, action: 'get_daily' });
    }
  }

  /**
   * Get weather alerts
   */
  private async getWeatherAlerts(parameters: any): Promise<void> {
    try {
      const { latitude, longitude, language = 'ar' } = parameters;

      const response = await fetch(`${this.apiBase}/weather/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, language }),
      });

      const data = await response.json();

      this.emit('weather:alerts', {
        alerts: data.alerts || [],
        location: { latitude, longitude },
      });
    } catch (error: any) {
      this.emit('weather:error', { error: error.message, action: 'get_alerts' });
    }
  }
}


