/**
 * RARE 4N - Login Tracker
 * تتبع تسجيلات الدخول
 * ✅ يتابع جميع محاولات الدخول، النجاح، الفشل، الأوقات
 */

export interface LoginAttempt {
  id: string;
  timestamp: number;
  method: 'password' | 'faceid' | 'google' | 'apple';
  success: boolean;
  userId?: string;
  error?: string;
  ipAddress?: string;
  deviceInfo?: {
    platform: string;
    model: string;
    osVersion: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface LoginSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  loginMethod: string;
  deviceInfo: any;
  location?: any;
}

export class LoginTracker {
  private static instance: LoginTracker;
  private loginAttempts: LoginAttempt[] = [];
  private activeSessions: Map<string, LoginSession> = new Map();
  private maxAttemptsHistory = 1000;

  private constructor() {
    // Load from storage if available
    this.loadHistory();
  }

  static getInstance(): LoginTracker {
    if (!LoginTracker.instance) {
      LoginTracker.instance = new LoginTracker();
    }
    return LoginTracker.instance;
  }

  /**
   * Track login attempt
   */
  async trackLoginAttempt(
    method: LoginAttempt['method'],
    success: boolean,
    userId?: string,
    error?: string
  ): Promise<string> {
    const attempt: LoginAttempt = {
      id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      method,
      success,
      userId,
      error,
      deviceInfo: await this.getDeviceInfo(),
      location: await this.getLocation(),
    };

    this.loginAttempts.push(attempt);

    // Keep only last N attempts
    if (this.loginAttempts.length > this.maxAttemptsHistory) {
      this.loginAttempts.shift();
    }

    // Save to storage
    await this.saveHistory();

    // Emit event
    if (success && userId) {
      await this.startSession(userId, method, attempt.deviceInfo, attempt.location);
    }

    return attempt.id;
  }

  /**
   * Start login session
   */
  private async startSession(
    userId: string,
    method: string,
    deviceInfo?: any,
    location?: any
  ): Promise<void> {
    const session: LoginSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: Date.now(),
      loginMethod: method,
      deviceInfo,
      location,
    };

    this.activeSessions.set(session.id, session);
    await this.saveSessions();
  }

  /**
   * End login session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      this.activeSessions.delete(sessionId);
      await this.saveSessions();
    }
  }

  /**
   * Get device info
   */
  private async getDeviceInfo(): Promise<LoginAttempt['deviceInfo']> {
    // In React Native, use Platform and DeviceInfo
    return {
      platform: 'ios', // Platform.OS
      model: 'iPhone', // DeviceInfo.getModel()
      osVersion: '17.0', // Platform.Version
    };
  }

  /**
   * Get location
   */
  private async getLocation(): Promise<LoginAttempt['location']> {
    // In React Native, use expo-location
    // For now, return null
    return undefined;
  }

  /**
   * Get login attempts
   */
  getLoginAttempts(limit: number = 100): LoginAttempt[] {
    return this.loginAttempts.slice(-limit);
  }

  /**
   * Get login statistics
   */
  getLoginStatistics(): {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    successRate: number;
    attemptsByMethod: Record<string, number>;
    recentAttempts: LoginAttempt[];
  } {
    const totalAttempts = this.loginAttempts.length;
    const successfulAttempts = this.loginAttempts.filter(a => a.success).length;
    const failedAttempts = totalAttempts - successfulAttempts;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    const attemptsByMethod: Record<string, number> = {};
    this.loginAttempts.forEach(attempt => {
      attemptsByMethod[attempt.method] = (attemptsByMethod[attempt.method] || 0) + 1;
    });

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      successRate,
      attemptsByMethod,
      recentAttempts: this.loginAttempts.slice(-10),
    };
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): LoginSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Save history to storage
   */
  private async saveHistory(): Promise<void> {
    // In React Native, use AsyncStorage
    // await AsyncStorage.setItem('loginAttempts', JSON.stringify(this.loginAttempts));
  }

  /**
   * Load history from storage
   */
  private async loadHistory(): Promise<void> {
    // In React Native, use AsyncStorage
    // const stored = await AsyncStorage.getItem('loginAttempts');
    // if (stored) {
    //   this.loginAttempts = JSON.parse(stored);
    // }
  }

  /**
   * Save sessions to storage
   */
  private async saveSessions(): Promise<void> {
    // In React Native, use AsyncStorage
    // await AsyncStorage.setItem('activeSessions', JSON.stringify(Array.from(this.activeSessions.values())));
  }
}


