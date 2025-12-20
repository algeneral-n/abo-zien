/**
 * RARE 4N - Ambient Awareness System
 * نظام الوعي البيئي - النظام يعرف المستخدم فين ومحتاج إيه
 */

import { RAREKernel } from './RAREKernel';
import { ContextStore } from './ContextStore';
import * as Location from 'expo-location';

export interface TimeContext {
  hour: number;
  dayOfWeek: number;
  isWeekend: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface LocationContext {
  latitude: number;
  longitude: number;
  name?: string;
  accuracy?: number;
}

export interface ActivityContext {
  type: 'idle' | 'active' | 'focused' | 'moving';
  confidence: number;
}

export interface AnticipatedNeeds {
  needs: string[];
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}

export class AmbientAwareness {
  private static instance: AmbientAwareness;
  private kernel: RAREKernel | null = null;
  private contextStore: ContextStore;
  private locationPermission: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.contextStore = ContextStore.getInstance();
  }

  static getInstance(): AmbientAwareness {
    if (!AmbientAwareness.instance) {
      AmbientAwareness.instance = new AmbientAwareness();
    }
    return AmbientAwareness.instance;
  }

  /**
   * Initialize ambient awareness
   * ⚠️ لا نطلب Location permission هنا - فقط عند الحاجة
   */
  async init(kernel: RAREKernel): Promise<void> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:56',message:'AmbientAwareness.init started',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    this.kernel = kernel;

    // ❌ لا نطلب Location permission عند البدء - فقط عند الحاجة
    // await this.requestLocationPermission();

    // Start continuous updates (بدون location)
    this.startContinuousUpdates();

    // Initial update (بدون location)
    await this.update();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:68',message:'AmbientAwareness.init completed',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  }

  /**
   * Request location permission
   */
  private async requestLocationPermission(): Promise<void> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermission = status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
      this.locationPermission = false;
    }
  }

  /**
   * Start continuous updates
   */
  private startContinuousUpdates(): void {
    // Update every 5 minutes
    this.updateInterval = setInterval(() => {
      this.update();
    }, 5 * 60 * 1000);
  }

  /**
   * Update ambient awareness
   */
  async update(): Promise<void> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:104',message:'update() started',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    try {
      const timeContext = this.getTimeContext();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:110',message:'getTimeContext completed',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      const locationContext = await this.getLocationContext();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:116',message:'getLocationContext completed',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      const activityContext = this.getActivityContext();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:122',message:'getActivityContext completed',data:{activityContext},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      const needs = this.anticipateNeeds(timeContext, locationContext, activityContext);

      // Update context store
      this.contextStore.updateContext({
        ambient: {
          time: timeContext,
          location: locationContext,
          activity: activityContext.type,
          needs: needs.needs,
        },
      });

      // Emit event
      if (this.kernel) {
        this.kernel.emit({
          type: 'ambient:updated',
          data: {
            time: timeContext,
            location: locationContext,
            activity: activityContext,
            needs,
          },
        });
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:145',message:'update() completed successfully',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:148',message:'update() ERROR',data:{error:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      console.error('AmbientAwareness.update() error:', error);
    }
  }

  /**
   * Get time context
   */
  private getTimeContext(): TimeContext {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: TimeContext['timeOfDay'];
    if (hour >= 6 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'afternoon';
    } else if (hour >= 18 && hour < 22) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    return {
      hour,
      dayOfWeek: now.getDay(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      timeOfDay,
    };
  }

  /**
   * Get location context
   */
  private async getLocationContext(): Promise<LocationContext | undefined> {
    if (!this.locationPermission) {
      return undefined;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Location error:', error);
      return undefined;
    }
  }

  /**
   * Get activity context (simplified - can be enhanced with sensors)
   */
  private getActivityContext(): ActivityContext {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:187',message:'getActivityContext started',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    try {
      // For now, infer from time and context
      const context = this.contextStore.getContext();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:195',message:'contextStore.getContext() completed',data:{hasSession:!!context.session,hasInteractions:!!context.session?.interactions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion

      // ⚠️ Safety check: ensure session and interactions exist
      if (!context.session || !context.session.interactions) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:200',message:'context.session missing - returning idle',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        return { type: 'idle', confidence: 0.5 };
      }

      const recentInteractions = context.session.interactions.slice(-5);

      if (recentInteractions.length === 0) {
        return { type: 'idle', confidence: 0.5 };
      }

      // If many interactions recently, user is active
      const recentCount = recentInteractions.filter(
        i => Date.now() - i.timestamp < 5 * 60 * 1000
      ).length;

      if (recentCount > 3) {
        return { type: 'active', confidence: 0.7 };
      }

      // Check for focused intent
      const focusedIntents = recentInteractions.filter(
        i => i.intent?.type === 'command' || i.intent?.type === 'search'
      );

      if (focusedIntents.length > 0) {
        return { type: 'focused', confidence: 0.8 };
      }

      return { type: 'idle', confidence: 0.6 };
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cc257fab-64a0-4da7-8b40-e077c5789e2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AmbientAwareness.ts:230',message:'getActivityContext ERROR',data:{error:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      console.error('getActivityContext() error:', error);
      return { type: 'idle', confidence: 0.5 };
    }
  }

  /**
   * Anticipate user needs
   */
  private anticipateNeeds(
    time: TimeContext,
    location: LocationContext | undefined,
    activity: ActivityContext
  ): AnticipatedNeeds {
    const needs: string[] = [];
    let priority: AnticipatedNeeds['priority'] = 'low';
    let reasoning = '';

    // Time-based needs
    if (time.timeOfDay === 'morning' && time.hour >= 6 && time.hour < 9) {
      needs.push('morning_greeting');
      needs.push('daily_summary');
      priority = 'medium';
      reasoning = 'Morning routine - user likely wants daily summary';
    }

    if (time.timeOfDay === 'afternoon' && time.hour >= 12 && time.hour < 14) {
      needs.push('lunch_reminder');
      priority = 'low';
      reasoning = 'Lunch time - gentle reminder';
    }

    if (time.timeOfDay === 'evening' && time.hour >= 18 && time.hour < 20) {
      needs.push('evening_summary');
      priority = 'medium';
      reasoning = 'Evening - user may want summary of day';
    }

    if (time.timeOfDay === 'night' || (time.hour >= 22 || time.hour < 6)) {
      needs.push('quiet_mode');
      priority = 'high';
      reasoning = 'Night time - minimize interruptions';
    }

    // Activity-based needs
    if (activity.type === 'focused') {
      needs.push('minimize_interruption');
      priority = 'high';
      reasoning = 'User is focused - avoid distractions';
    }

    if (activity.type === 'idle' && needs.length === 0) {
      needs.push('proactive_suggestions');
      priority = 'low';
      reasoning = 'User idle - can suggest activities';
    }

    return {
      needs,
      priority,
      reasoning,
    };
  }

  /**
   * Stop ambient awareness
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

