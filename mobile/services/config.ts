/**
 * RARE 4N - Configuration
 * API URLs and Environment Variables
 */

// Get API URL from environment or default to localhost
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// WebSocket Base URL (same as API URL for now)
export const WS_BASE = API_URL;

// Other config constants
export const CONFIG = {
  apiUrl: API_URL,
  wsBase: WS_BASE,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export default {
  API_URL,
  WS_BASE,
  CONFIG,
};
