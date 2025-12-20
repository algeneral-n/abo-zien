/**
 * MemoryEngine - ???????? ??????????????
 * ???????? ?????????????? ???????????????? ????????????????????
 */

export interface Memory {
  id: string;
  type: 'interaction' | 'fact' | 'preference' | 'pattern';
  content: any;
  context: any;
  timestamp: number;
  importance: number; // 0-1
  accessed: number; // Access count
  lastAccessed: number; // Last access timestamp
  tags: string[];
  embedding?: number[]; // For semantic search (future)
}

export interface MemoryQuery {
  type?: string;
  tags?: string[];
  minImportance?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'importance' | 'accessed';
}

export class MemoryEngine {
  private static instance: MemoryEngine;
  private memories: Map<string, Memory> = new Map();
  private maxMemories: number = 10000; // Limit memories
  private decayFactor: number = 0.99; // Importance decay over time

  private constructor() {}

  static getInstance(): MemoryEngine {
    if (!MemoryEngine.instance) {
      MemoryEngine.instance = new MemoryEngine();
    }
    return MemoryEngine.instance;
  }

  async init(): Promise<void> {
    console.log('[MemoryEngine] Initialized ???');
    
    // Load memories from storage (future: AsyncStorage/SQLite)
    // await this.loadMemoriesFromStorage();
  }

  /**
   * Store a memory
   */
  async store(memory: Memory): Promise<void> {
    // Check memory limit
    if (this.memories.size >= this.maxMemories) {
      this.pruneMemories();
    }

    this.memories.set(memory.id, memory);
    console.log(`[MemoryEngine] Stored memory: ${memory.id} (type: ${memory.type})`);
  }

  /**
   * Store an interaction
   */
  async storeInteraction(interaction: {
    id: string;
    type: string;
    input: string;
    output: any;
    context: any;
    timestamp: number;
    sentiment: string;
    success: boolean;
  }): Promise<void> {
    const memory: Memory = {
      id: interaction.id,
      type: 'interaction',
      content: {
        type: interaction.type,
        input: interaction.input,
        output: interaction.output,
        sentiment: interaction.sentiment,
        success: interaction.success,
      },
      context: interaction.context,
      timestamp: interaction.timestamp,
      importance: this.calculateImportance(interaction),
      accessed: 0,
      lastAccessed: interaction.timestamp,
      tags: this.extractTags(interaction),
    };

    await this.store(memory);
  }

  /**
   * Store a preference
   */
  async storePreference(preference: {
    id: string;
    key: string;
    value: any;
    category?: string;
    context?: any;
    timestamp?: number;
  }): Promise<void> {
    const memory: Memory = {
      id: preference.id || `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'preference',
      content: {
        key: preference.key,
        value: preference.value,
        category: preference.category,
      },
      context: preference.context || {},
      timestamp: preference.timestamp || Date.now(),
      importance: 0.8, // Preferences are important
      accessed: 0,
      lastAccessed: preference.timestamp || Date.now(),
      tags: ['preference', preference.key, preference.category].filter(Boolean),
    };

    await this.store(memory);
  }

  /**
   * Store learning/goal
   */
  async storeLearning(learning: {
    id: string;
    type: string;
    category: string;
    content: any;
    importance?: number;
    tags?: string[];
  }): Promise<void> {
    const memory: Memory = {
      id: learning.id || `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'pattern',
      content: learning.content,
      context: {
        category: learning.category,
        type: learning.type,
      },
      timestamp: Date.now(),
      importance: learning.importance || 0.9, // Learning/goals are very important
      accessed: 0,
      lastAccessed: Date.now(),
      tags: learning.tags || ['learning', learning.category, learning.type],
    };

    await this.store(memory);
  }

  /**
   * Retrieve a memory by ID
   */
  retrieve(memoryId: string): Memory | undefined {
    const memory = this.memories.get(memoryId);
    if (memory) {
      memory.accessed++;
      memory.lastAccessed = Date.now();
    }
    return memory;
  }

  /**
   * Query memories
   */
  query(query: MemoryQuery): Memory[] {
    let results = Array.from(this.memories.values());

    // Filter by type
    if (query.type) {
      results = results.filter(m => m.type === query.type);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(m => 
        query.tags!.some(tag => m.tags.includes(tag))
      );
    }

    // Filter by importance
    if (query.minImportance !== undefined) {
      results = results.filter(m => m.importance >= query.minImportance!);
    }

    // Sort
    const sortBy = query.sortBy || 'timestamp';
    results.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return b.timestamp - a.timestamp;
      } else if (sortBy === 'importance') {
        return b.importance - a.importance;
      } else if (sortBy === 'accessed') {
        return b.accessed - a.accessed;
      }
      return 0;
    });

    // Limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get relevant context based on input
   */
  getRelevantContext(input: string, limit: number = 5): Memory[] {
    // Simple keyword matching (future: semantic search with embeddings)
    const keywords = input.toLowerCase().split(' ').filter(w => w.length > 3);
    
    const relevantMemories = Array.from(this.memories.values())
      .filter(memory => {
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        return keywords.some(keyword => contentStr.includes(keyword));
      })
      .sort((a, b) => {
        // Score based on importance and recency
        const scoreA = a.importance * 0.7 + (a.lastAccessed / Date.now()) * 0.3;
        const scoreB = b.importance * 0.7 + (b.lastAccessed / Date.now()) * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    // Update access count
    relevantMemories.forEach(m => {
      m.accessed++;
      m.lastAccessed = Date.now();
    });

    return relevantMemories;
  }

  /**
   * Delete a memory
   */
  delete(memoryId: string): void {
    this.memories.delete(memoryId);
    console.log(`[MemoryEngine] Deleted memory: ${memoryId}`);
  }

  /**
   * Clear all memories
   */
  clear(): void {
    this.memories.clear();
    console.log('[MemoryEngine] Cleared all memories');
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    avgImportance: number;
  } {
    const stats = {
      total: this.memories.size,
      byType: {} as Record<string, number>,
      avgImportance: 0,
    };

    let totalImportance = 0;
    
    this.memories.forEach(memory => {
      // Count by type
      stats.byType[memory.type] = (stats.byType[memory.type] || 0) + 1;
      totalImportance += memory.importance;
    });

    stats.avgImportance = stats.total > 0 ? totalImportance / stats.total : 0;

    return stats;
  }

  /**
   * Prune old/unimportant memories
   */
  private pruneMemories(): void {
    const memories = Array.from(this.memories.values());
    
    // Sort by importance (ascending)
    memories.sort((a, b) => a.importance - b.importance);

    // Remove 10% least important
    const toRemove = Math.floor(memories.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.memories.delete(memories[i].id);
    }

    console.log(`[MemoryEngine] Pruned ${toRemove} memories`);
  }

  /**
   * Calculate importance of an interaction
   */
  private calculateImportance(interaction: any): number {
    let importance = 0.5; // Base importance

    // Success increases importance
    if (interaction.success) {
      importance += 0.2;
    }

    // Critical actions are more important
    const criticalTypes = ['vault_access', 'sos', 'error'];
    if (criticalTypes.includes(interaction.type)) {
      importance += 0.3;
    }

    // Strong sentiment increases importance
    const strongSentiments = ['very_positive', 'very_negative', 'urgent'];
    if (strongSentiments.includes(interaction.sentiment)) {
      importance += 0.2;
    }

    return Math.min(importance, 1.0);
  }

  /**
   * Extract tags from interaction
   */
  private extractTags(interaction: any): string[] {
    const tags: string[] = [];

    // Add type as tag
    tags.push(interaction.type);

    // Add sentiment as tag
    if (interaction.sentiment) {
      tags.push(interaction.sentiment);
    }

    // Add success/failure tag
    tags.push(interaction.success ? 'success' : 'failure');

    // Extract keywords from input (simple)
    if (interaction.input) {
      const keywords = interaction.input
        .toLowerCase()
        .split(' ')
        .filter((w: string) => w.length > 4);
      tags.push(...keywords.slice(0, 3)); // Max 3 keywords
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Apply decay to memories over time
   */
  applyDecay(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    this.memories.forEach(memory => {
      const daysSinceAccess = (now - memory.lastAccessed) / oneDay;
      if (daysSinceAccess > 1) {
        memory.importance *= Math.pow(this.decayFactor, daysSinceAccess);
      }
    });

    console.log('[MemoryEngine] Applied decay to memories');
  }
}

