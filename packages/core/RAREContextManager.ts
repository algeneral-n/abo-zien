/**
 * RARE 4N - Context Manager
 * Unified context sharing across all systems
 * ?????? ???????? ?????? ?????????????? (AI, Voice, Storage, Auth, Translation, etc)
 */

export interface UserContext {
  userId?: string;
  userName?: string;
  email?: string;
  isAuthenticated: boolean;
  authMethod?: 'jwt' | 'biometric' | 'voice' | 'face';
}

export interface SessionContext {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  requestCount: number;
}

export interface AIContext {
  persona?: string;
  emotion?: string;
  dialect?: string;
  voiceSettings?: any;
  memory?: any;
}

export interface PreferencesContext {
  theme?: string;
  language?: string;
  voiceName?: string;
  aiModel?: 'gpt' | 'gemini' | 'claude';
  autoVoice?: boolean;
}

export interface StorageContext {
  files?: string[];
  quota?: number;
  used?: number;
}

export interface PaymentContext {
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  credits?: number;
  billingCycle?: string;
}

export interface UnifiedContext {
  user: UserContext;
  session: SessionContext;
  ai: AIContext;
  preferences: PreferencesContext;
  storage: StorageContext;
  payment: PaymentContext;
  metadata: Record<string, any>;
}

export class RAREContextManager {
  private static instance: RAREContextManager;
  private contexts: Map<string, UnifiedContext> = new Map();

  private constructor() {}

  static getInstance(): RAREContextManager {
    if (!RAREContextManager.instance) {
      RAREContextManager.instance = new RAREContextManager();
    }
    return RAREContextManager.instance;
  }

  /**
   * Create new context for user/session
   */
  createContext(sessionId: string): UnifiedContext {
    const context: UnifiedContext = {
      user: {
        isAuthenticated: false
      },
      session: {
        sessionId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        requestCount: 0
      },
      ai: {},
      preferences: {
        theme: 'cyber-cyan',
        language: 'ar',
        voiceName: 'Rachel',
        aiModel: 'gpt',
        autoVoice: true
      },
      storage: {
        files: [],
        quota: 1024 * 1024 * 1024, // 1GB
        used: 0
      },
      payment: {
        subscriptionTier: 'free',
        credits: 100
      },
      metadata: {}
    };

    this.contexts.set(sessionId, context);
    return context;
  }

  /**
   * Get context by session ID
   */
  getContext(sessionId: string): UnifiedContext | null {
    return this.contexts.get(sessionId) || null;
  }

  /**
   * Update context
   */
  updateContext(sessionId: string, updates: Partial<UnifiedContext>): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    // Deep merge
    Object.keys(updates).forEach(key => {
      if (typeof updates[key as keyof UnifiedContext] === 'object') {
        context[key as keyof UnifiedContext] = {
          ...context[key as keyof UnifiedContext],
          ...updates[key as keyof UnifiedContext]
        } as any;
      } else {
        (context as any)[key] = updates[key as keyof UnifiedContext];
      }
    });

    // Update last activity
    context.session.lastActivity = Date.now();
    context.session.requestCount++;

    this.contexts.set(sessionId, context);
    return true;
  }

  /**
   * Update user info
   */
  updateUser(sessionId: string, userInfo: Partial<UserContext>): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    context.user = { ...context.user, ...userInfo };
    return this.updateContext(sessionId, { user: context.user });
  }

  /**
   * Update AI context
   */
  updateAI(sessionId: string, aiInfo: Partial<AIContext>): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    context.ai = { ...context.ai, ...aiInfo };
    return this.updateContext(sessionId, { ai: context.ai });
  }

  /**
   * Update preferences
   */
  updatePreferences(sessionId: string, prefs: Partial<PreferencesContext>): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    context.preferences = { ...context.preferences, ...prefs };
    return this.updateContext(sessionId, { preferences: context.preferences });
  }

  /**
   * Update storage info
   */
  updateStorage(sessionId: string, storageInfo: Partial<StorageContext>): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    context.storage = { ...context.storage, ...storageInfo };
    return this.updateContext(sessionId, { storage: context.storage });
  }

  /**
   * Update payment info
   */
  updatePayment(sessionId: string, paymentInfo: Partial<PaymentContext>): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    context.payment = { ...context.payment, ...paymentInfo };
    return this.updateContext(sessionId, { payment: context.payment });
  }

  /**
   * Check if user has permission
   */
  hasPermission(sessionId: string, permission: string): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    // Free tier limitations
    if (context.payment.subscriptionTier === 'free') {
      const freeLimitations = ['bulk-translation', 'advanced-analysis', 'unlimited-storage'];
      if (freeLimitations.includes(permission)) return false;
    }

    return context.user.isAuthenticated;
  }

  /**
   * Clean up old sessions
   */
  cleanupSessions(maxAge: number = 3600000): number {
    const now = Date.now();
    let cleaned = 0;

    this.contexts.forEach((context, sessionId) => {
      if (now - context.session.lastActivity > maxAge) {
        this.contexts.delete(sessionId);
        cleaned++;
      }
    });

    return cleaned;
  }

  /**
   * Get all active sessions
   */
  getREMOVED(): number {
    return this.contexts.size;
  }

  /**
   * Export context (for debugging)
   */
  exportContext(sessionId: string): string {
    const context = this.contexts.get(sessionId);
    return JSON.stringify(context, null, 2);
  }

  /**
   * Destroy context
   */
  destroyContext(sessionId: string): boolean {
    return this.contexts.delete(sessionId);
  }
}

