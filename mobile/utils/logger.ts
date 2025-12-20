/**
 * Logger Utility
 * Logging system that works only in development mode
 */

const isDev = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but format them better
    if (isDev) {
      console.error(...args);
    } else {
      // In production, you might want to send to error tracking service
      // For now, we'll just suppress non-critical errors
    }
  },
  
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};




