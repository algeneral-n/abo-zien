/**
 * RARE 4N - API Configuration
 * إعدادات API - يدعم Development و Production
 */

const isDev = __DEV__;
const isProduction = !isDev;

/**
 * Development API (Local Network)
 * استخدم IP address للابتوب بدلاً من localhost
 * 
 * للحصول على IP address:
 * Windows: ipconfig (ابحث عن IPv4 Address)
 * Mac/Linux: ifconfig (ابحث عن inet)
 * 
 * مثال: 'http://192.168.1.100:5000/api'
 */
const DEV_API_LOCAL = 'http://192.168.1.100:5000/api'; // ⚠️ غيّر هذا إلى IP address للابتوب

/**
 * Development API (ngrok)
 * استخدم ngrok للحصول على رابط HTTPS
 * 
 * 1. تثبيت ngrok: npm install -g ngrok
 * 2. تشغيل: ngrok http 5000
 * 3. نسخ الرابط (مثل: https://abc123.ngrok.io)
 * 4. لصقه هنا
 */
const DEV_API_NGROK = 'https://abc123.ngrok.io/api'; // ⚠️ غيّر هذا إلى رابط ngrok

/**
 * Production API (Custom Domain)
 * استخدم دومينك الخاص
 * 
 * الدومين: zien-ai.app
 * Subdomain للباك اند: api.zien-ai.app
 */
const PROD_API = 'https://api.zien-ai.app/api'; // ✅ الدومين الجديد

/**
 * API Base URL
 * 
 * Development: يستخدم ngrok (أو local network)
 * Production: يستخدم custom domain
 */
export const API_BASE = isProduction 
  ? PROD_API 
  : (process.env.EXPO_PUBLIC_USE_NGROK === 'true' ? DEV_API_NGROK : DEV_API_LOCAL);

/**
 * API Timeout (milliseconds)
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * API Retry Configuration
 */
export const API_RETRY = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Helper: Get API URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE}/${cleanEndpoint}`;
}

/**
 * Helper: Check if API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('API Health Check failed:', error);
    return false;
  }
}

/**
 * Log current API configuration (Development only)
 */
if (isDev) {
  console.log('🌐 API Configuration:');
  console.log(`   Base URL: ${API_BASE}`);
  console.log(`   Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`   Timeout: ${API_TIMEOUT}ms`);
}

