/**
 * RARE 4N - Memory Engine
 * نظام الذاكرة الذكية
 * 
 * يدير: الذاكرة القصيرة، الطويلة، التعلم، السياق
 */

export interface Memory {
  id: string;
  type: 'interaction' | 'preference' | 'context' | 'learning';
  content: any;
  timestamp: number;
  importance: number; // 0-1
  associations: string[]; // IDs of related memories
  metadata?: Record<string, any>;
}

export interface MemoryQuery {
  type?: string;
  keywords?: string[];
  timeRange?: { start: number; end: number };
  minImportance?: number;
  limit?: number;
}

export class MemoryEngine {
  private static instance: MemoryEngine;
  private shortTermMemory: Map<string, Memory> = new Map(); // Last hour
  private longTermMemory: Map<string, Memory> = new Map(); // Persistent
  private workingMemory: Map<string, any> = new Map(); // Current session
  private initialized: boolean = false;

  // Configuration
  private readonly SHORT_TERM_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly MAX_SHORT_TERM_SIZE = 100;
  private readonly MAX_WORKING_MEMORY_SIZE = 50;

  private constructor() {}

  static getInstance(): MemoryEngine {
    if (!MemoryEngine.instance) {
      MemoryEngine.instance = new MemoryEngine();
    }
    return MemoryEngine.instance;
  }

  /**
   * Initialize Memory Engine
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load long-term memory from storage if needed (with error handling)
      try {
        // await this.loadLongTermMemory();
      } catch (error) {
        console.error('❌ Load long-term memory error:', error);
        // Continue anyway
      }

      // Start cleanup intervals (with error handling)
      try {
        this.startCleanupIntervals();
      } catch (error) {
        console.error('❌ Start cleanup intervals error:', error);
        // Continue anyway
      }

      this.initialized = true;
      console.log('✅ MemoryEngine initialized');
    } catch (error) {
      console.error('❌ MemoryEngine init error:', error);
      // Mark as initialized anyway to prevent infinite loops
      this.initialized = true;
    }
  }

  /**
   * Store interaction in memory
   */
  async storeInteraction(interaction: {
    userId?: string;
    action: string;
    context: any;
    result?: any;
    emotion?: string;
  }): Promise<string> {
    const memory: Memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'interaction',
      content: interaction,
      timestamp: Date.now(),
      importance: this.calculateImportance(interaction),
      associations: [],
      metadata: {
        action: interaction.action,
        emotion: interaction.emotion,
      },
    };

    // Store in short-term memory
    this.shortTermMemory.set(memory.id, memory);

    // If important enough, store in long-term memory
    if (memory.importance >= 0.7) {
      this.longTermMemory.set(memory.id, memory);
    }

    // Cleanup if needed
    this.cleanupShortTermMemory();

    return memory.id;
  }

  /**
   * Store preference
   */
  async storePreference(key: string, value: any): Promise<void> {
    const memory: Memory = {
      id: `pref_${key}_${Date.now()}`,
      type: 'preference',
      content: { key, value },
      timestamp: Date.now(),
      importance: 0.8, // Preferences are important
      associations: [],
      metadata: { key },
    };

    this.longTermMemory.set(memory.id, memory);
  }

  /**
   * Store learning
   */
  async storeLearning(learning: {
    topic: string;
    content: any;
    confidence: number;
  }): Promise<void> {
    const memory: Memory = {
      id: `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'learning',
      content: learning,
      timestamp: Date.now(),
      importance: learning.confidence,
      associations: [],
      metadata: { topic: learning.topic },
    };

    this.longTermMemory.set(memory.id, memory);
  }

  /**
   * Get relevant context for current situation
   */
  getRelevantContext(query: {
    action?: string;
    keywords?: string[];
    emotion?: string;
    limit?: number;
  }): Memory[] {
    const limit = query.limit || 10;
    const allMemories = [
      ...Array.from(this.shortTermMemory.values()),
      ...Array.from(this.longTermMemory.values()),
    ];

    // Filter and score memories
    const scoredMemories = allMemories
      .map((memory) => ({
        memory,
        score: this.calculateRelevanceScore(memory, query),
      }))
      .filter((item) => item.score > 0.3); // Minimum relevance threshold

    // Sort by score and recency
    scoredMemories.sort((a, b) => {
      const scoreWeight = 0.7;
      const recencyWeight = 0.3;
      const aScore =
        a.score * scoreWeight +
        (1 - (Date.now() - a.memory.timestamp) / this.SHORT_TERM_DURATION) *
          recencyWeight;
      const bScore =
        b.score * scoreWeight +
        (1 - (Date.now() - b.memory.timestamp) / this.SHORT_TERM_DURATION) *
          recencyWeight;
      return bScore - aScore;
    });

    return scoredMemories.slice(0, limit).map((item) => item.memory);
  }

  /**
   * Get memory by ID
   */
  getMemory(memoryId: string): Memory | undefined {
    return (
      this.shortTermMemory.get(memoryId) || this.longTermMemory.get(memoryId)
    );
  }

  /**
   * Query memories
   */
  query(query: MemoryQuery): Memory[] {
    const allMemories = [
      ...Array.from(this.shortTermMemory.values()),
      ...Array.from(this.longTermMemory.values()),
    ];

    let filtered = allMemories;

    // Filter by type
    if (query.type) {
      filtered = filtered.filter((m) => m.type === query.type);
    }

    // Filter by importance
    if (query.minImportance !== undefined) {
      filtered = filtered.filter((m) => m.importance >= query.minImportance);
    }

    // Filter by time range
    if (query.timeRange) {
      filtered = filtered.filter(
        (m) =>
          m.timestamp >= query.timeRange!.start &&
          m.timestamp <= query.timeRange!.end
      );
    }

    // Filter by keywords
    if (query.keywords && query.keywords.length > 0) {
      filtered = filtered.filter((m) => {
        const contentStr = JSON.stringify(m.content).toLowerCase();
        return query.keywords!.some((keyword) =>
          contentStr.includes(keyword.toLowerCase())
        );
      });
    }

    // Sort by timestamp (most recent first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (query.limit) {
      filtered = filtered.slice(0, query.limit);
    }

    return filtered;
  }

  /**
   * Set working memory (current session context)
   */
  setWorkingMemory(key: string, value: any): void {
    this.workingMemory.set(key, value);

    // Cleanup if too large
    if (this.workingMemory.size > this.MAX_WORKING_MEMORY_SIZE) {
      const firstKey = this.workingMemory.keys().next().value;
      this.workingMemory.delete(firstKey);
    }
  }

  /**
   * Get working memory
   */
  getWorkingMemory(key: string): any {
    return this.workingMemory.get(key);
  }

  /**
   * Clear working memory
   */
  clearWorkingMemory(): void {
    this.workingMemory.clear();
  }

  /**
   * Calculate importance of interaction
   */
  private calculateImportance(interaction: {
    action: string;
    context?: any;
    emotion?: string;
  }): number {
    let importance = 0.5; // Base importance

    // Increase for certain actions
    if (
      interaction.action.includes('error') ||
      interaction.action.includes('fail')
    ) {
      importance += 0.2;
    }

    if (
      interaction.action.includes('success') ||
      interaction.action.includes('complete')
    ) {
      importance += 0.1;
    }

    // Increase for strong emotions
    if (
      interaction.emotion === 'frustrated' ||
      interaction.emotion === 'delighted'
    ) {
      importance += 0.2;
    }

    return Math.min(importance, 1.0);
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevanceScore(
    memory: Memory,
    query: {
      action?: string;
      keywords?: string[];
      emotion?: string;
    }
  ): number {
    let score = 0;

    // Match action
    if (query.action && memory.metadata?.action) {
      if (memory.metadata.action.includes(query.action)) {
        score += 0.4;
      }
    }

    // Match keywords
    if (query.keywords && query.keywords.length > 0) {
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      const matches = query.keywords.filter((keyword) =>
        contentStr.includes(keyword.toLowerCase())
      ).length;
      score += (matches / query.keywords.length) * 0.4;
    }

    // Match emotion
    if (query.emotion && memory.metadata?.emotion === query.emotion) {
      score += 0.2;
    }

    // Factor in importance
    score *= memory.importance;

    return score;
  }

  /**
   * Cleanup short-term memory
   */
  private cleanupShortTermMemory(): void {
    const now = Date.now();
    const cutoff = now - this.SHORT_TERM_DURATION;

    // Remove old memories
    for (const [id, memory] of this.shortTermMemory.entries()) {
      if (memory.timestamp < cutoff) {
        this.shortTermMemory.delete(id);
      }
    }

    // Enforce size limit
    if (this.shortTermMemory.size > this.MAX_SHORT_TERM_SIZE) {
      const sorted = Array.from(this.shortTermMemory.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const toRemove = sorted.slice(
        0,
        this.shortTermMemory.size - this.MAX_SHORT_TERM_SIZE
      );
      toRemove.forEach(([id]) => this.shortTermMemory.delete(id));
    }
  }

  /**
   * Start cleanup intervals
   */
  private startCleanupIntervals(): void {
    // Cleanup every 5 minutes
    setInterval(() => {
      this.cleanupShortTermMemory();
    }, 5 * 60 * 1000);
  }

  /**
   * Get statistics
   */
  getStats(): {
    shortTermSize: number;
    longTermSize: number;
    workingMemorySize: number;
  } {
    return {
      shortTermSize: this.shortTermMemory.size,
      longTermSize: this.longTermMemory.size,
      workingMemorySize: this.workingMemory.size,
    };
  }
}
