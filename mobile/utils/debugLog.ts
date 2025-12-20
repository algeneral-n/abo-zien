/**
 * Debug Logging Utility
 * يعمل فقط في Development Mode
 */

const DEBUG_ENABLED = __DEV__;
const DEBUG_SERVER = 'http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d';

export function debugLog(location: string, message: string, data: any = {}, hypothesisId?: string) {
  if (!DEBUG_ENABLED) return;
  
  try {
    fetch(DEBUG_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: hypothesisId || 'unknown',
      }),
    }).catch(() => {
      // Silently fail - don't break the app
    });
  } catch (error) {
    // Silently fail - don't break the app
  }
}



