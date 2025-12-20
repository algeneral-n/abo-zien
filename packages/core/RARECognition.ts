/**
 * RARE 4N - Cognition Engine
 * Long-term & Short-term memory with learning capabilities
 */

export interface MemoryEntry {
  timestamp: number;
  input: string;
  output: string;
  metadata?: any;
  importance?: number;
}

export interface ContextData {
  recent: string[];
  knowledge: MemoryEntry[];
  patterns: Map<string, number>;
  userPreferences: any;
}

export class RARECognition {
  private shortMemory: string[] = [];
  private longMemory: MemoryEntry[] = [];
  private patterns: Map<string, number> = new Map();
  private userPreferences: any = {};
  
  private readonly SHORT_MEMORY_SIZE = 10;
  private readonly LONG_MEMORY_SIZE = 100;

  /**
   * Absorb new input into short-term memory
   */
  absorb(input: string, context?: any) {
    this.shortMemory.push(input);
    
    // Keep only recent items
    if (this.shortMemory.length > this.SHORT_MEMORY_SIZE) {
      this.shortMemory.shift();
    }

    // Extract and store patterns
    this.extractPatterns(input);

    // Update user preferences if context provided
    if (context) {
      this.updatePreferences(context);
    }
  }

  /**
   * Learn from output and store in long-term memory
   */
  learn(output: string, metadata?: any) {
    const entry: MemoryEntry = {
      timestamp: Date.now(),
      input: this.shortMemory[this.shortMemory.length - 1] || '',
      output,
      metadata,
      importance: this.calculateImportance(output, metadata)
    };

    this.longMemory.push(entry);

    // Prune old memories, keep most important
    if (this.longMemory.length > this.LONG_MEMORY_SIZE) {
      this.longMemory.sort((a, b) => (b.importance || 0) - (a.importance || 0));
      this.longMemory = this.longMemory.slice(0, this.LONG_MEMORY_SIZE);
    }
  }

  /**
   * Get current context (short + long memory)
   */
  getContext(): ContextData {
    return {
      recent: this.shortMemory,
      knowledge: this.longMemory.slice(-20), // Last 20 important memories
      patterns: this.patterns,
      userPreferences: this.userPreferences
    };
  }

  /**
   * Search memory for relevant information
   */
  recall(query: string): MemoryEntry[] {
    const queryLower = query.toLowerCase();
    
    return this.longMemory
      .filter(entry => 
        entry.input.toLowerCase().includes(queryLower) ||
        entry.output.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }

  /**
   * Extract patterns from user input
   */
  private extractPatterns(input: string) {
    const lower = input.toLowerCase();
    
    // Common request types
    const patterns = [
      'code', 'analyze', 'translate', 'navigate', 
      'كود', 'تحليل', 'ترجمة', 'اذهب'
    ];

    patterns.forEach(pattern => {
      if (lower.includes(pattern)) {
        const count = this.patterns.get(pattern) || 0;
        this.patterns.set(pattern, count + 1);
      }
    });
  }

  /**
   * Calculate importance score for memory
   */
  private calculateImportance(output: string, metadata?: any): number {
    let score = 1.0;

    // Longer responses are often more important
    if (output.length > 500) score += 0.5;
    if (output.length > 1000) score += 0.5;

    // Code outputs are important
    if (output.includes('```')) score += 1.0;

    // High confidence responses
    if (metadata?.confidence > 0.9) score += 0.5;

    // Recent memories are more important
    score += 0.3;

    return score;
  }

  /**
   * Update user preferences based on interactions
   */
  private updatePreferences(context: any) {
    if (context.persona) {
      const persona = context.persona;
      this.userPreferences.preferredPersona = persona;
    }

    if (context.dialect) {
      this.userPreferences.preferredDialect = context.dialect;
    }

    if (context.voiceSettings) {
      this.userPreferences.voiceSettings = context.voiceSettings;
    }
  }

  /**
   * Get user's most used pattern
   */
  getMostCommonPattern(): string | null {
    if (this.patterns.size === 0) return null;

    let maxPattern = '';
    let maxCount = 0;

    this.patterns.forEach((count, pattern) => {
      if (count > maxCount) {
        maxCount = count;
        maxPattern = pattern;
      }
    });

    return maxPattern;
  }

  /**
   * Clear short-term memory
   */
  clearShortMemory() {
    this.shortMemory = [];
  }

  /**
   * Reset all memory (use with caution)
   */
  reset() {
    this.shortMemory = [];
    this.longMemory = [];
    this.patterns.clear();
    this.userPreferences = {};
  }
}
